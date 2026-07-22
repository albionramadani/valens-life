// MFA recovery: generates 60s-valid 6-digit code, emails it to admin, validates it.
// SECURITY (F-02): a valid Turnstile token is verified server-side before issuing a code.
// SECURITY (F-03): responses to "request" are uniform (always success) so the endpoint
//   cannot be used to enumerate which e-mails are registered/admin. The "verify" action is
//   rate-limited (max attempts per code) to defeat brute-forcing the 6-digit space.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { verifyTurnstile } from "../_shared/turnstile.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_VERIFY_ATTEMPTS = 5;

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { action, email, code, turnstileToken } = await req.json();
    if (!email || typeof email !== "string") return json({ error: "email required" }, 400);

    // --- F-02: enforce anti-automation server-side on the code-request surface.
    // (The "verify" step is protected by the per-code attempts cap below, and runs
    //  right after "request" where a single-use Turnstile token would already be spent.)
    const remoteip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "";
    if (action === "request") {
      const captchaOk = await verifyTurnstile(turnstileToken, remoteip);
      if (!captchaOk) return json({ error: "Verifikimi CAPTCHA dështoi." }, 403);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Resolve the target admin (without leaking the result to the caller).
    const { data: userList } = await supabase.auth.admin.listUsers();
    const target = userList?.users.find((u: any) => (u.email || "").toLowerCase() === email.toLowerCase());
    let isAdmin = false;
    if (target) {
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", target.id)
        .eq("role", "admin")
        .maybeSingle();
      isAdmin = !!roleRow;
    }

    if (action === "request") {
      // F-03: uniform response. Only actually send when the account is a valid admin.
      if (target && isAdmin) {
        const c = String(Math.floor(100000 + Math.random() * 900000));
        const expires = new Date(Date.now() + 60 * 1000).toISOString();
        await supabase.from("mfa_recovery_codes").insert({ email: email.toLowerCase(), code: c, expires_at: expires });

        const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0"><tr><td align="center">
            <table width="480" style="background:#fff;border-radius:14px;padding:32px;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
              <tr><td><h1 style="margin:0 0 8px;font-size:22px;font-weight:600">Kodi i rikuperimit MFA</h1>
                <p style="color:#6e6e73;font-size:14px;margin:0 0 24px">Përdoreni këtë kod për të rivendosur MFA. Kodi është i vlefshëm për <strong>60 sekonda</strong>.</p>
                <div style="background:#fafafa;border-radius:10px;padding:24px;text-align:center;font-size:32px;letter-spacing:8px;font-weight:700">${esc(c)}</div>
                <p style="color:#86868b;font-size:12px;margin:24px 0 0">Nëse nuk e keni kërkuar ju këtë kod, injoroni këtë email.</p>
              </td></tr>
            </table>
          </td></tr></table>
        </body></html>`;

        try {
          await supabase.functions.invoke("send-smtp-email", {
            body: { to: email, subject: "Kodi i rikuperimit MFA (60 sekonda)", html },
          });
        } catch (e) {
          console.error("mfa-recovery email send failed:", e);
        }
      }
      // Same response regardless of whether the account exists / is admin.
      return json({ success: true, expires_in: 60 });
    }

    if (action === "verify") {
      if (!code) return json({ error: "code required" }, 400);

      // Only real admins can ever pass; respond uniformly otherwise.
      if (!target || !isAdmin) return json({ error: "Kod i pasaktë" }, 400);

      const { data: row } = await supabase
        .from("mfa_recovery_codes")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("used", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!row) return json({ error: "Kod i pasaktë" }, 400);

      // F-03: brute-force protection — invalidate the code after too many attempts.
      if ((row.attempts ?? 0) >= MAX_VERIFY_ATTEMPTS) {
        await supabase.from("mfa_recovery_codes").update({ used: true }).eq("id", row.id);
        return json({ error: "Shumë përpjekje. Kërkoni një kod të ri." }, 429);
      }

      if (new Date(row.expires_at).getTime() < Date.now()) {
        return json({ error: "Kodi ka skaduar" }, 400);
      }

      if (String(row.code) !== String(code)) {
        await supabase.from("mfa_recovery_codes").update({ attempts: (row.attempts ?? 0) + 1 }).eq("id", row.id);
        return json({ error: "Kod i pasaktë" }, 400);
      }

      await supabase.from("mfa_recovery_codes").update({ used: true }).eq("id", row.id);

      // unenroll all factors for the user
      const { data: factors } = await supabase.auth.admin.mfa.listFactors({ userId: target.id });
      for (const f of factors?.factors || []) {
        await supabase.auth.admin.mfa.deleteFactor({ userId: target.id, id: f.id });
      }

      return json({ success: true });
    }

    return json({ error: "Invalid action" }, 400);
  } catch (err) {
    console.error("mfa-recovery error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
