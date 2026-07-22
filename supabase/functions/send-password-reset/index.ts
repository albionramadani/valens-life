// Custom-branded password reset using SMTP. Sends a 60-min reset link via Supabase recovery.
// SECURITY (F-02): a valid Turnstile token is verified server-side before doing anything.
// SECURITY (F-03): the response is always uniform ("success") so attackers cannot enumerate accounts.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyTurnstile } from "../_shared/turnstile.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { email, redirect_to, turnstileToken } = await req.json();
    if (!email) return json({ error: "email required" }, 400);

    // --- F-02: enforce anti-automation server-side ---
    const remoteip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";
    const captchaOk = await verifyTurnstile(turnstileToken, remoteip);
    if (!captchaOk) return json({ error: "Verifikimi CAPTCHA dështoi." }, 403);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: link, error: linkErr } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo: redirect_to || undefined },
    });

    // Always respond success to avoid email enumeration; only send if link generated
    if (linkErr || !link?.properties?.action_link) {
      return json({ success: true });
    }

    const url = link.properties.action_link;
    const { data: cfg } = await supabase.from("smtp_settings").select("from_name").maybeSingle();
    const storeName = cfg?.from_name || "Valens";

    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f">
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0"><tr><td align="center">
        <table width="480" style="background:#fff;border-radius:14px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
          <tr><td>
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:600">Rivendos fjalëkalimin</h1>
            <p style="color:#6e6e73;font-size:14px;margin:0 0 24px">Kërkuat të rivendosni fjalëkalimin për llogarinë tuaj në ${esc(storeName)}. Klikoni butonin më poshtë për të vazhduar.</p>
            <a href="${esc(url)}" style="display:inline-block;background:#1d1d1f;color:#fff;text-decoration:none;padding:12px 24px;border-radius:980px;font-weight:500;font-size:14px">Rivendos fjalëkalimin</a>
            <p style="color:#86868b;font-size:12px;margin:24px 0 0">Nëse nuk e keni kërkuar ju, injoroni këtë email. Lidhja skadon brenda 1 ore.</p>
          </td></tr>
        </table>
      </td></tr></table>
    </body></html>`;

    await supabase.functions.invoke("send-smtp-email", {
      body: { to: email, subject: "Rivendos fjalëkalimin", html },
    });

    return json({ success: true });
  } catch (err) {
    console.error("send-password-reset error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
