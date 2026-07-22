// Shared server-side Cloudflare Turnstile verification for Edge Functions.
// Resolves the secret in the same order as the verify-turnstile function:
//   1. TURNSTILE_SECRET_KEY env var
//   2. admin_secrets table (key = 'turnstile_secret_key')
//   3. Cloudflare always-passes test secret (dev fallback)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const TEST_SECRET = "1x0000000000000000000000000000000AA";

let cachedDbSecret: string | null = null;
let cachedAt = 0;

async function getDbSecret(): Promise<string | null> {
  if (cachedDbSecret && Date.now() - cachedAt < 60_000) return cachedDbSecret;
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);
    const { data } = await sb
      .from("admin_secrets")
      .select("value")
      .eq("key", "turnstile_secret_key")
      .maybeSingle();
    cachedDbSecret = (data?.value || "").trim() || null;
    cachedAt = Date.now();
    return cachedDbSecret;
  } catch {
    return null;
  }
}

/**
 * Verifies a Turnstile token server-side. Returns true only when Cloudflare
 * confirms the token is valid. An empty/missing token always returns false.
 */
export async function verifyTurnstile(token: unknown, remoteip?: string | null): Promise<boolean> {
  if (typeof token !== "string" || token.length === 0) return false;
  try {
    const envSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    const dbSecret = !envSecret ? await getDbSecret() : null;
    const secret = envSecret || dbSecret || TEST_SECRET;

    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (remoteip) form.append("remoteip", remoteip);

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    return !!json.success;
  } catch {
    return false;
  }
}
