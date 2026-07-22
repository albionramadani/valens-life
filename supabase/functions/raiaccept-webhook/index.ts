// RaiAccept (Raiffeisen Bank) — payment notification webhook.
// Public endpoint (RaiAccept posts here). We NEVER trust the webhook body alone:
// the final status is always re-verified against the RaiAccept API before we
// mark an order paid and deduct stock.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { getAuthToken, getOrder } from "../_shared/raiaccept.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const orderIdentification: string | undefined =
    body?.order?.orderIdentification || body?.orderIdentification;
  const merchantRef: string | undefined =
    body?.order?.merchantOrderReference || body?.merchantOrderReference;

  // Acknowledge receipt immediately; process below.
  const ack = () =>
    new Response(JSON.stringify({ message: "OK" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!orderIdentification && !merchantRef) {
    console.error("raiaccept-webhook: missing identifiers", JSON.stringify(body));
    return ack();
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Locate our payment/order: prefer RaiAccept id stored in payments.reference,
    // fall back to our order_number (merchantOrderReference).
    let payment: { id: string; order_id: string; status: string } | null = null;

    if (orderIdentification) {
      const { data } = await supabase
        .from("payments")
        .select("id, order_id, status")
        .eq("reference", orderIdentification)
        .maybeSingle();
      if (data) payment = data;
    }
    if (!payment && merchantRef) {
      const { data: ord } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", merchantRef)
        .maybeSingle();
      if (ord) {
        const { data } = await supabase
          .from("payments")
          .select("id, order_id, status")
          .eq("order_id", ord.id)
          .maybeSingle();
        if (data) payment = data;
      }
    }

    if (!payment) {
      console.error(`raiaccept-webhook: no payment for raiId=${orderIdentification} ref=${merchantRef}`);
      return ack();
    }

    if (payment.status === "paid") {
      return ack(); // idempotent
    }

    // Authoritative verification against RaiAccept API
    const idToken = await getAuthToken();
    const verifyId = orderIdentification ?? merchantRef!;
    const { status } = await getOrder(idToken, verifyId);

    if (status === "PAID") {
      await supabase.from("payments").update({
        status: "paid",
        notes: "RaiAccept: pagesa e konfirmuar",
      }).eq("id", payment.id);

      await supabase.from("orders").update({
        payment_status: "paid",
        status: "confirmed",
      }).eq("id", payment.order_id);

      // Deduct stock once, on confirmed payment
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", payment.order_id);
      for (const item of orderItems ?? []) {
        if (item.variant_id) {
          const { data: variant } = await supabase
            .from("product_variants")
            .select("stock")
            .eq("id", item.variant_id)
            .single();
          if (variant) {
            const newStock = Math.max(0, (variant.stock ?? 0) - item.quantity);
            await supabase.from("product_variants").update({ stock: newStock }).eq("id", item.variant_id);
          }
        }
      }
      console.log(`raiaccept-webhook: order ${payment.order_id} PAID`);
    } else if (["FAILED", "CANCELED", "ABANDONED"].includes(status)) {
      const mapped = status === "CANCELED" ? "canceled" : "failed";
      await supabase.from("payments").update({
        status: mapped,
        notes: `RaiAccept: ${status}`,
      }).eq("id", payment.id);
      await supabase.from("orders").update({ payment_status: mapped }).eq("id", payment.order_id);
      console.log(`raiaccept-webhook: order ${payment.order_id} ${status}`);
    } else {
      console.log(`raiaccept-webhook: order ${payment.order_id} status=${status} (no change)`);
    }

    return ack();
  } catch (err) {
    console.error("raiaccept-webhook error:", err instanceof Error ? err.message : err);
    return ack(); // still 200 so RaiAccept does not hammer retries; we verify on demand too
  }
});
