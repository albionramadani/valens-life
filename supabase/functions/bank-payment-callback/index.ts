const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Bank callback validation schema
const CallbackSchema = z.object({
  transaction_id: z.string().min(1).max(100),
  status: z.enum(["success", "failed", "canceled"]),
  amount: z.string().or(z.number()),
  bank_reference: z.string().optional(),
  error_code: z.string().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const parsed = CallbackSchema.safeParse(body);

    if (!parsed.success) {
      console.error("Invalid callback payload:", parsed.error.flatten().fieldErrors);
      return new Response(
        JSON.stringify({ error: "Invalid callback data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { transaction_id, status, bank_reference } = parsed.data;

    // Find payment by transaction reference (parameterized, no raw SQL)
    const { data: payment, error: payErr } = await supabase
      .from("payments")
      .select("id, order_id, amount, status")
      .eq("reference", transaction_id)
      .single();

    if (payErr || !payment) {
      console.error(`Payment not found for txn: ${transaction_id}`);
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent double-processing
    if (payment.status === "paid") {
      return new Response(
        JSON.stringify({ message: "Already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map bank status to our status
    const paymentStatus = status === "success" ? "paid" : status === "canceled" ? "canceled" : "failed";

    // Update payment record (store only reference, status, timestamp - NO card data)
    await supabase.from("payments").update({
      status: paymentStatus,
      notes: bank_reference ? `Bank ref: ${bank_reference}` : null,
    }).eq("id", payment.id);

    // Update order payment status
    const orderPaymentStatus = status === "success" ? "paid" : "failed";
    await supabase.from("orders").update({
      payment_status: orderPaymentStatus,
      ...(status === "success" ? { status: "confirmed" } : {}),
    }).eq("id", payment.order_id);

    // Log without sensitive data
    console.log(`Payment callback: txn=${transaction_id}, status=${paymentStatus}`);

    return new Response(
      JSON.stringify({ message: "OK", status: paymentStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Callback error:", err instanceof Error ? err.message : "Unknown error");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
