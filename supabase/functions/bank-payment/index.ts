const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const OrderSchema = z.object({
  order_id: z.string().uuid(),
  return_url: z.string().url(),
  cancel_url: z.string().url(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (req.method === "POST") {
      const body = await req.json();
      const parsed = OrderSchema.safeParse(body);

      if (!parsed.success) {
        return new Response(
          JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { order_id, return_url, cancel_url } = parsed.data;

      // Fetch order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("id, order_number, total, payment_status")
        .eq("id", order_id)
        .single();

      if (orderErr || !order) {
        return new Response(
          JSON.stringify({ error: "Order not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (order.payment_status === "paid") {
        return new Response(
          JSON.stringify({ error: "Order already paid" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const transactionId = `TXN-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

      // Update payment record
      await supabase.from("payments").update({
        reference: transactionId,
        status: "processing",
      }).eq("order_id", order_id);

      // Check if there's an active gateway configured
      const { data: gateway } = await supabase
        .from("payment_gateway")
        .select("id, gateway_name, merchant_id, api_key, mode")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (gateway) {
        // Real bank gateway flow
        const bankBaseUrl = gateway.mode === "live"
          ? "https://gateway.rbko-bank.com/pay"
          : "https://sandbox.rbko-bank.com/pay";

        const redirectUrl = `${bankBaseUrl}?` + new URLSearchParams({
          merchant_id: gateway.merchant_id,
          transaction_id: transactionId,
          amount: order.total.toString(),
          currency: "EUR",
          order_ref: order.order_number,
          return_url: return_url,
          cancel_url: cancel_url,
          callback_url: `${supabaseUrl}/functions/v1/bank-payment-callback`,
        }).toString();

        console.log(`Payment initiated: order=${order.order_number}, txn=${transactionId}`);

        return new Response(
          JSON.stringify({ redirect_url: redirectUrl, transaction_id: transactionId }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // SIMULATION MODE — no real gateway configured
      // Simulate 90% success rate
      const isSuccess = Math.random() < 0.9;

      if (isSuccess) {
        // Mark payment as paid
        await supabase.from("payments").update({
          status: "paid",
          reference: transactionId,
          notes: "Simulation: pagesa u krye me sukses",
        }).eq("order_id", order_id);

        // Mark order as paid
        await supabase.from("orders").update({
          payment_status: "paid",
          status: "confirmed",
        }).eq("id", order_id);

        // Deduct stock for each order item
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("variant_id, quantity")
          .eq("order_id", order_id);

        if (orderItems) {
          for (const item of orderItems) {
            if (item.variant_id) {
              // Get current stock
              const { data: variant } = await supabase
                .from("product_variants")
                .select("stock")
                .eq("id", item.variant_id)
                .single();

              if (variant) {
                const newStock = Math.max(0, variant.stock - item.quantity);
                await supabase.from("product_variants").update({ stock: newStock }).eq("id", item.variant_id);
              }
            }
          }
        }

        console.log(`Simulation SUCCESS: order=${order.order_number}, txn=${transactionId}`);

        return new Response(
          JSON.stringify({
            redirect_url: `${return_url}${return_url.includes('?') ? '&' : '?'}txn=${transactionId}`,
            transaction_id: transactionId,
            simulation: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else {
        // Mark payment as failed
        await supabase.from("payments").update({
          status: "failed",
          reference: transactionId,
          notes: "Simulation: pagesa dështoi",
        }).eq("order_id", order_id);

        await supabase.from("orders").update({
          payment_status: "failed",
        }).eq("id", order_id);

        console.log(`Simulation FAILED: order=${order.order_number}, txn=${transactionId}`);

        return new Response(
          JSON.stringify({
            redirect_url: `${cancel_url}${cancel_url.includes('?') ? '&' : '?'}txn=${transactionId}&reason=declined`,
            transaction_id: transactionId,
            simulation: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Payment error:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
