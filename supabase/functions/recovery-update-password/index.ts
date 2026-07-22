// Allows a user authenticated via a password recovery link (AAL1) to set a new
// password even when MFA is enabled. Supabase normally requires AAL2 for
// password updates when MFA is active, which blocks the recovery flow because
// recovery sessions cannot complete an MFA challenge without the old password.
//
// Security:
// - Caller must present a valid Supabase access token in the Authorization header.
// - We only update the password of the same user (auth.uid()), never another.
// - New password must be at least 8 chars.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  try {
    const auth = req.headers.get("Authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });
    const { data: userData, error: uErr } = await userClient.auth.getUser();
    if (uErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const body = await req.json().catch(() => ({}));
    const password: string = body?.password || "";
    if (typeof password !== "string" || password.length < 8) {
      return new Response(JSON.stringify({ error: "Fjalëkalimi duhet të ketë së paku 8 karaktere." }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    const admin = createClient(url, service);
    const { error: updErr } = await admin.auth.admin.updateUserById(userData.user.id, { password });
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }

    // Sign the user out globally so they re-login with the new password.
    await admin.auth.admin.signOut(token).catch(() => {});

    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
