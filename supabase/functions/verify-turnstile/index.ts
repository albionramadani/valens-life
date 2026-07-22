// Edge function: verify-turnstile
// Verifies a Cloudflare Turnstile token server-side.
// Secret resolution order:
//   1. TURNSTILE_SECRET_KEY env var (backend secret)
//   2. admin_secrets table, key = 'turnstile_secret_key' (managed in /admin/settings → Siguria)
//   3. Cloudflare always-passes test secret
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TEST_SECRET = "1x0000000000000000000000000000000AA";

let cachedDbSecret: string | null = null;
let cachedAt = 0;
async function getDbSecret(): Promise<string | null> {
  if (cachedDbSecret && Date.now() - cachedAt < 60_000) return cachedDbSecret;
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(url, key);
    const { data } = await sb.from("admin_secrets").select("value").eq("key", "turnstile_secret_key").maybeSingle();
    cachedDbSecret = (data?.value || "").trim() || null;
    cachedAt = Date.now();
    return cachedDbSecret;
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body?.token === "string" ? body.token : "";
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "missing_token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const envSecret = Deno.env.get("TURNSTILE_SECRET_KEY");
    const dbSecret = !envSecret ? await getDbSecret() : null;
    const secret = envSecret || dbSecret || TEST_SECRET;
    const remoteip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";

    const form = new FormData();
    form.append("secret", secret);
    form.append("response", token);
    if (remoteip) form.append("remoteip", remoteip);

    const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST", body: form,
    });
    const cfJson = await cfRes.json();

    return new Response(
      JSON.stringify({ success: !!cfJson.success, errors: cfJson["error-codes"] || [] }),
      { status: cfJson.success ? 200 : 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: "internal_error", message: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
