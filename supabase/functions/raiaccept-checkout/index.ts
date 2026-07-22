// RaiAccept (Raiffeisen Bank) — initiate a card payment for an existing order.
// SECURITY: the payable amount is ALWAYS read from the database (authoritative),
// never trusted from the client. Merchant credentials live only in this backend.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  getAuthToken,
  createOrder,
  createCheckout,
  type RaiOrderPayload,
} from "../_shared/raiaccept.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  order_id: z.string().uuid(),
  return_base: z.string().url(),
  consumer: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    email: z.string().email().max(160),
    phone: z.string().min(3).max(40),
  }),
  billing: z.object({
    address: z.string().min(1).max(200),
    city: z.string().min(1).max(80),
    postalCode: z.string().max(20).optional().default(""),
    country: z.string().min(2).max(3).optional().default("XKK"),
  }),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { order_id, return_base, consumer, billing } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    // Authoritative order + amount from DB
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, order_number, total, payment_status")
      .eq("id", order_id)
      .single();
    if (orderErr || !order) return json({ error: "Order not found" }, 404);
    if (order.payment_status === "paid") return json({ error: "Order already paid" }, 400);

    const amount = Math.round((Number(order.total) || 0) * 100) / 100;
    if (amount <= 0) return json({ error: "Invalid order amount" }, 400);

    // Line items (for the invoice breakdown shown by RaiAccept)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_name, variant_name, quantity, unit_price")
      .eq("order_id", order_id);

    const items = (orderItems ?? []).map((it) => ({
      description: [it.product_name, it.variant_name].filter(Boolean).join(" - ").slice(0, 120) || "Artikull",
      numberOfItems: Number(it.quantity) || 1,
      price: Math.round((Number(it.unit_price) || 0) * 100) / 100,
    }));

    const ipAddress =
      req.headers.get("cf-connecting-ip") ||
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      undefined;

    const base = return_base.replace(/\/$/, "");
    const ref = order.order_number;
    // RaiAccept requires a globally-unique merchantOrderReference. Suffix per
    // attempt so a customer can retry a failed/abandoned payment on the same order.
    const merchantRef = `${ref}-${Date.now().toString(36)}`;

    // RaiAccept phone must match ^(\+|00)[1-9]\d{1,3}\d{6,11}$ or ^\d{8,16}$ — strip spaces/dashes/parens
    const cleanPhone = consumer.phone.replace(/[^\d+]/g, "");

    const payload: RaiOrderPayload = {
      consumer: {
        firstName: consumer.firstName,
        lastName: consumer.lastName,
        email: consumer.email,
        mobilePhone: cleanPhone,
        ipAddress,
      },
      billingAddress: {
        firstName: consumer.firstName,
        lastName: consumer.lastName,
        addressStreet1: billing.address,
        city: billing.city,
        postalCode: billing.postalCode || "10000",
        country: billing.country || "XKK",
      },
      invoice: {
        amount,
        currency: "EUR",
        description: `Porosi ${ref}`,
        merchantOrderReference: merchantRef,
        items: items.length > 0 ? items : [{ description: `Porosi ${ref}`, numberOfItems: 1, price: amount }],
      },
      paymentMethodPreference: "CARD",
      recurring: { recurringModel: "NONE" },
      urls: {
        successUrl: `${base}/checkout?status=success&order=${encodeURIComponent(ref)}`,
        failUrl: `${base}/checkout?status=canceled&order=${encodeURIComponent(ref)}&reason=declined`,
        cancelUrl: `${base}/checkout?status=canceled&order=${encodeURIComponent(ref)}`,
        notificationUrl: `${Deno.env.get("SUPABASE_URL")}/functions/v1/raiaccept-webhook`,
      },
    };

    // RaiAccept 3-step flow
    const idToken = await getAuthToken();
    const orderIdentification = await createOrder(idToken, payload);
    const paymentRedirectURL = await createCheckout(idToken, orderIdentification, payload);

    // Link RaiAccept order to our payment record for webhook verification
    await supabase
      .from("payments")
      .update({ reference: orderIdentification, status: "processing", method: "card" })
      .eq("order_id", order_id);

    // Append frameless mode for iframe embedding
    const sep = paymentRedirectURL.includes("?") ? "&" : "?";
    const iframeURL = `${paymentRedirectURL}${sep}mode=frameless`;

    console.log(`RaiAccept checkout created: order=${ref}, raiId=${orderIdentification}`);

    return json({
      paymentRedirectURL,
      iframeURL,
      orderIdentification,
    });
  } catch (err) {
    console.error("raiaccept-checkout error:", err instanceof Error ? err.message : err);
    return json({ error: "Payment initiation failed" }, 500);
  }
});
