// SMTP email sender using nodemailer (works with Office365 STARTTLS on 587)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import nodemailer from "npm:nodemailer@6.9.14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Payload {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as Payload;
    if (!body?.to || !body?.subject || !body?.html) {
      return new Response(JSON.stringify({ error: "Missing to/subject/html" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: cfg, error: cfgErr } = await supabase
      .from("smtp_settings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cfgErr || !cfg) {
      return new Response(JSON.stringify({ error: "SMTP not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!cfg.host || !cfg.username || !cfg.password || !cfg.from_email) {
      return new Response(JSON.stringify({ error: "SMTP credentials incomplete" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const port = cfg.port || 587;
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port,
      secure: !!cfg.secure, // true for 465, false for 587 (STARTTLS)
      requireTLS: port === 587 && !cfg.secure,
      auth: { user: cfg.username, pass: cfg.password },
      tls: { ciphers: "TLSv1.2", minVersion: "TLSv1.2" },
    });

    const recipients = Array.isArray(body.to) ? body.to.join(",") : body.to;

    const info = await transporter.sendMail({
      from: `"${cfg.from_name || "Valens"}" <${cfg.from_email}>`,
      to: recipients,
      replyTo: body.replyTo || cfg.from_email,
      subject: body.subject,
      text: body.text || body.html.replace(/<[^>]+>/g, " "),
      html: body.html,
    });

    return new Response(JSON.stringify({ success: true, messageId: info.messageId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-smtp-email error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
