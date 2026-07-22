// Public checkout: creates customer + order + items + payment using service role to bypass RLS safely.
// SECURITY (F-01): All prices, line totals, subtotal, shipping and grand total are recomputed
// server-side from the database. Client-supplied price fields are IGNORED entirely.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const round2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const body = await req.json();
    const { customer, order, items, payment, fingerprint } = body;



    if (!customer?.email || !customer?.name) {
      return json({ error: "customer.name and customer.email required" }, 400);
    }
    if (!Array.isArray(items) || items.length === 0) {
      return json({ error: "items required" }, 400);
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });

    // --- F-01: rebuild every order line from authoritative DB data ---
    const computedItems: {
      product_id: string;
      variant_id: string | null;
      product_name: string;
      variant_name: string | null;
      unit_price: number;
      quantity: number;
      total: number;
    }[] = [];
    let subtotal = 0;

    for (const it of items) {
      const productId = it?.product_id;
      const variantId = it?.variant_id ?? null;
      const quantity = Math.max(1, Math.min(99, parseInt(String(it?.quantity ?? 1), 10) || 1));
      if (!productId) return json({ error: "Produkt i pavlefshëm" }, 400);

      const { data: product } = await supabase
        .from("products")
        .select("id, name, base_price, is_active")
        .eq("id", productId)
        .maybeSingle();
      if (!product || !product.is_active) return json({ error: "Produkti nuk u gjet ose nuk është aktiv" }, 400);

      let unitPrice = Number(product.base_price) || 0;
      let variantName: string | null = null;

      if (variantId) {
        const { data: variant } = await supabase
          .from("product_variants")
          .select("id, name, price, stock, is_active, product_id")
          .eq("id", variantId)
          .maybeSingle();
        if (!variant || !variant.is_active || variant.product_id !== productId) {
          return json({ error: "Varianti nuk u gjet ose nuk është aktiv" }, 400);
        }
        if (variant.stock !== null && variant.stock < quantity) {
          return json({ error: `Stok i pamjaftueshëm për ${product.name}` }, 400);
        }
        unitPrice = Number(variant.price) || 0;
        variantName = variant.name;
      }

      const lineTotal = round2(unitPrice * quantity);
      subtotal = round2(subtotal + lineTotal);
      computedItems.push({
        product_id: productId,
        variant_id: variantId,
        product_name: product.name,
        variant_name: variantName,
        unit_price: round2(unitPrice),
        quantity,
        total: lineTotal,
      });
    }

    // --- F-01: recompute shipping server-side from shipping_methods + free-delivery threshold ---
    let shippingCost = 0;
    const shippingMethodId = order?.shipping_method_id ?? null;
    if (shippingMethodId) {
      const { data: method } = await supabase
        .from("shipping_methods")
        .select("id, price, is_active")
        .eq("id", shippingMethodId)
        .maybeSingle();
      if (method && method.is_active) shippingCost = Number(method.price) || 0;
    }
    // Free delivery threshold (store_settings.free_delivery_threshold)
    const { data: threshRow } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "free_delivery_threshold")
      .maybeSingle();
    const threshold = Number(threshRow?.value) || 0;
    if (threshold > 0 && subtotal >= threshold) shippingCost = 0;

    const tax = 0;
    const total = round2(subtotal + tax + shippingCost);

    // Upsert customer by email
    let customerId: string | null = null;
    const { data: existing } = await supabase.from("customers").select("id").eq("email", customer.email).maybeSingle();
    if (existing?.id) {
      customerId = existing.id;
      await supabase.from("customers").update({
        name: customer.name,
        phone: customer.phone ?? null,
        address: customer.address ?? null,
        city: customer.city ?? null,
      }).eq("id", customerId);
    } else {
      const { data: ins, error: insErr } = await supabase.from("customers").insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone ?? null,
        address: customer.address ?? null,
        city: customer.city ?? null,
      }).select("id").single();
      if (insErr) throw insErr;
      customerId = ins.id;
    }

    const orderNumber = order?.order_number || `ORD-${Date.now()}`;

    const { data: createdOrder, error: orderErr } = await supabase.from("orders").insert({
      order_number: orderNumber,
      customer_id: customerId,
      status: order?.status || "processing",
      payment_status: order?.payment_status || "pending",
      subtotal,
      tax,
      shipping_cost: shippingCost,
      total,
      shipping_address: order?.shipping_address ?? null,
      notes: order?.notes ?? null,
    }).select("id, order_number").single();
    if (orderErr) throw orderErr;

    const itemRows = computedItems.map((it) => ({ order_id: createdOrder.id, ...it }));
    const { error: itemsErr } = await supabase.from("order_items").insert(itemRows);
    if (itemsErr) throw itemsErr;

    if (payment) {
      // Payment amount is the server-computed total, never the client's claim.
      await supabase.from("payments").insert({
        order_id: createdOrder.id,
        method: payment.method || "card",
        amount: total,
        status: payment.status || "pending",
      });
    }

    // --- Clear the visitor's server-side cart now that the order exists ---
    try {
      let userId: string | null = null;
      const authHeader = req.headers.get("Authorization");
      const jwt = authHeader?.replace("Bearer ", "").trim();
      // Decode the JWT payload locally (no getClaims — unavailable in this SDK).
      if (jwt && jwt.split(".").length === 3) {
        try {
          const payloadB64 = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
          const decoded = JSON.parse(atob(payloadB64));
          userId = (decoded?.sub as string) ?? null;
        } catch {
          userId = null;
        }
      }

      const cartIds = new Set<string>();
      if (userId) {
        const { data } = await supabase
          .from("carts")
          .select("id")
          .eq("user_id", userId)
          .eq("status", "active");
        (data ?? []).forEach((c) => cartIds.add(c.id));
      }
      if (fingerprint) {
        const { data } = await supabase
          .from("carts")
          .select("id")
          .eq("device_fingerprint", fingerprint)
          .eq("status", "active");
        (data ?? []).forEach((c) => cartIds.add(c.id));
      }

      if (cartIds.size > 0) {
        const ids = Array.from(cartIds);
        await supabase.from("cart_items").delete().in("cart_id", ids);
        await supabase.from("carts").update({ status: "ordered" }).in("id", ids);
      }
    } catch (clearErr) {
      console.error("cart cleanup after order failed:", clearErr);
    }

    return json({ order_id: createdOrder.id, order_number: createdOrder.order_number, customer_id: customerId, total });
  } catch (err) {
    console.error("create-order error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
