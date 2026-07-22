// Sends order confirmation to the customer + notification to admin
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { order_id } = await req.json();
    if (!order_id) {
      return new Response(JSON.stringify({ error: "order_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("*, customers(name,email,phone), order_items(product_name, variant_name, quantity, unit_price, total)")
      .eq("id", order_id)
      .maybeSingle();

    if (oErr || !order) throw new Error("Order not found");

    const { data: cfg } = await supabase.from("smtp_settings").select("admin_notification_email, from_name").maybeSingle();
    const storeName = cfg?.from_name || "Valens";
    const adminEmail = cfg?.admin_notification_email;

    const itemsHtml = (order.order_items || []).map((it: any) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee">${esc(it.product_name)}${it.variant_name ? " — " + esc(it.variant_name) : ""}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${esc(it.quantity)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${Number(it.unit_price).toFixed(2)} €</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${Number(it.total).toFixed(2)} €</td>
      </tr>`).join("");

    const buildBody = (heading: string, intro: string) => `
<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1d1d1f">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <tr><td style="padding:32px 32px 8px"><h1 style="margin:0;font-size:22px;font-weight:600">${esc(heading)}</h1></td></tr>
        <tr><td style="padding:8px 32px 16px;color:#6e6e73;font-size:14px">${esc(intro)}</td></tr>
        <tr><td style="padding:0 32px"><div style="background:#fafafa;border-radius:10px;padding:16px">
          <div style="font-size:12px;color:#6e6e73">Numri i porosisë</div>
          <div style="font-size:16px;font-weight:600">${esc(order.order_number)}</div>
        </div></td></tr>
        <tr><td style="padding:24px 32px">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
            <thead><tr style="background:#fafafa">
              <th style="padding:8px;text-align:left">Produkti</th>
              <th style="padding:8px;text-align:center">Sasi</th>
              <th style="padding:8px;text-align:right">Çmimi</th>
              <th style="padding:8px;text-align:right">Totali</th>
            </tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top:16px;text-align:right;font-size:14px;color:#6e6e73">
            <div>Nëntotali: ${Number(order.subtotal).toFixed(2)} €</div>
            <div>Transporti: ${Number(order.shipping_cost || 0).toFixed(2)} €</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;color:#1d1d1f">Totali: ${Number(order.total).toFixed(2)} €</div>
          </div>
        </td></tr>
        ${order.shipping_address ? `<tr><td style="padding:0 32px 24px;font-size:13px;color:#6e6e73"><strong style="color:#1d1d1f">Adresa:</strong> ${esc(order.shipping_address)}</td></tr>` : ""}
        <tr><td style="padding:24px 32px;background:#fafafa;color:#86868b;font-size:12px;text-align:center">© ${new Date().getFullYear()} ${esc(storeName)}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    const customerHtml = buildBody("Faleminderit për porosinë!", `Përshëndetje ${order.customers?.name || ""}, kemi pranuar porosinë tuaj dhe po e procesojmë.`);
    const adminHtml = buildBody("Porosi e re", `Klient: ${order.customers?.name || ""} (${order.customers?.email || ""}) — Tel: ${order.customers?.phone || "-"}`);

    const sendOne = (to: string, subject: string, html: string) =>
      supabase.functions.invoke("send-smtp-email", { body: { to, subject, html } });

    const results: any = {};
    if (order.customers?.email) {
      const r = await sendOne(order.customers.email, `Porosia ${order.order_number} u konfirmua`, customerHtml);
      results.customer = r.error ? r.error.message : "ok";
    }
    if (adminEmail) {
      const r = await sendOne(adminEmail, `[ADMIN] Porosi e re ${order.order_number}`, adminHtml);
      results.admin = r.error ? r.error.message : "ok";
    }

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-order-emails error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
