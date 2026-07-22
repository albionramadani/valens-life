import { createClient } from "@supabase/supabase-js";

type CreateAdminUserInput = {
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "moderator" | "user";
};

function createBackendFetch(apiKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (apiKey.startsWith("sb_") && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", apiKey);

    return fetch(input, { ...init, headers });
  };
}

function getPrivateBackendConfig() {
  const url = process.env.NEW_SUPABASE_URL || process.env.SUPABASE_URL;
  const publishableKey =
    process.env.NEW_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey =
    process.env.NEW_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !publishableKey || !serviceRoleKey) {
    throw new Error("Konfigurimi i databazës private mungon në server");
  }

  return { url, publishableKey, serviceRoleKey };
}

export async function createUserAsAdmin(
  authorization: string | null,
  input: CreateAdminUserInput,
) {
  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Sesioni ka skaduar. Kyçu përsëri dhe provo sërish");
  }

  const accessToken = authorization.slice("Bearer ".length);
  const { url, publishableKey, serviceRoleKey } = getPrivateBackendConfig();

  const callerClient = createClient(url, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
      fetch: createBackendFetch(publishableKey),
    },
  });

  const { data: identity, error: identityError } = await callerClient.auth.getUser(accessToken);
  if (identityError || !identity.user) {
    throw new Error("Sesioni nuk është valid. Kyçu përsëri dhe provo sërish");
  }

  const { data: isAdmin, error: roleError } = await callerClient.rpc("has_role", {
    _user_id: identity.user.id,
    _role: "admin",
  });
  if (roleError) throw new Error(`Kontrolli i rolit dështoi: ${roleError.message}`);
  if (!isAdmin) throw new Error("Vetëm administratori mund të krijojë përdorues");

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: createBackendFetch(serviceRoleKey) },
  });

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });
  if (createError || !created.user) {
    if (createError?.message.toLowerCase().includes("already")) {
      throw new Error("Ekziston tashmë një përdorues me këtë email");
    }
    throw new Error(createError?.message || "Përdoruesi nuk u krijua");
  }

  const userId = created.user.id;
  const { error: profileError } = await adminClient.from("profiles").upsert(
    { id: userId, email: input.email, full_name: input.full_name },
    { onConflict: "id" },
  );
  if (profileError) {
    await adminClient.auth.admin.deleteUser(userId);
    throw new Error(`Profili nuk u krijua: ${profileError.message}`);
  }

  const { error: roleInsertError } = await adminClient
    .from("user_roles")
    .upsert({ user_id: userId, role: input.role }, { onConflict: "user_id,role" });
  if (roleInsertError) {
    await adminClient.auth.admin.deleteUser(userId);
    throw new Error(`Roli nuk u caktua: ${roleInsertError.message}`);
  }

  return { ok: true, user_id: userId };
}