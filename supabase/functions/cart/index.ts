// Secure server-side shopping cart.
// - Stores only product/variant + quantity (NEVER prices/totals).
// - Recalculates every price, line total and subtotal from the database.
// - Binds the cart to the caller's (anonymous or logged-in) auth uid via RLS-safe service role.
// - Issues an HttpOnly Secure cookie holding an opaque cart token as a secondary anchor.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const COOKIE_NAME = "valens_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// --- In-memory cart cache (per warm edge instance) ---------------------------
// Caches the fully-computed cart payload keyed by cart id. Reads are served from
// here when fresh; every mutation (and order completion via DB) invalidates it.
// This is purely a performance layer — the database stays the source of truth.
const CART_CACHE_TTL_MS = 30_000;
type CachedCart = { payload: unknown; expires: number };
const cartCache = new Map<string, CachedCart>();

function getCachedCart(cartId: string): unknown | null {
  const hit = cartCache.get(cartId);
  if (!hit) return null;
  if (Date.now() > hit.expires) {
    cartCache.delete(cartId);
    return null;
  }
  return hit.payload;
}
function setCachedCart(cartId: string, payload: unknown) {
  cartCache.set(cartId, { payload, expires: Date.now() + CART_CACHE_TTL_MS });
}
function invalidateCart(cartId: string) {
  cartCache.delete(cartId);
}

function corsHeaders(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

const ItemRef = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullish(),
});

const fingerprint = z.string().min(8).max(128).optional();

const BodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("get"), fingerprint }),
  z.object({ action: z.literal("clear"), fingerprint }),
  z.object({
    action: z.literal("add"),
    fingerprint,
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullish(),
    quantity: z.number().int().min(1).max(99).default(1),
  }),
  z.object({
    action: z.literal("update"),
    fingerprint,
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullish(),
    quantity: z.number().int().min(0).max(99),
  }),
  z.object({
    action: z.literal("remove"),
    fingerprint,
    productId: z.string().uuid(),
    variantId: z.string().uuid().nullish(),
  }),
]);

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > -1) out[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
  }
  return out;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const cors = corsHeaders(origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const json = (data: unknown, status = 200, extraHeaders: Record<string, string> = {}) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...cors, "Content-Type": "application/json", ...extraHeaders },
    });

  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    // --- Validate body ---
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return json({ error: "Invalid request", details: parsed.error.flatten() }, 400);
    }
    const body = parsed.data;

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });

    // --- Resolve caller identity from JWT (anonymous or real user) ---
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "").trim();
    // Ignore the project anon key (sent on unauthenticated calls) — only a real
    // user/anonymous-session JWT (three dot-separated segments) identifies a user.
    if (token && token.split(".").length === 3) {
      const anon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
      const { data } = await anon.auth.getUser(token);
      userId = data?.user?.id ?? null;
    }

    // --- Resolve cart token from cookie + device fingerprint from body ---
    const cookies = parseCookies(req.headers.get("Cookie"));
    let cartToken = cookies[COOKIE_NAME] ?? null;
    const deviceFp = body.fingerprint ?? null;

    // --- Find or create the active cart ---
    let cart: { id: string; token: string; user_id: string | null; device_fingerprint: string | null } | null = null;

    if (userId) {
      const { data } = await admin
        .from("carts")
        .select("id, token, user_id, device_fingerprint")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      cart = data;
    }
    if (!cart && cartToken) {
      const { data } = await admin
        .from("carts")
        .select("id, token, user_id, device_fingerprint")
        .eq("token", cartToken)
        .eq("status", "active")
        .maybeSingle();
      cart = data;
      // Attach an anonymous cart to the now-known user.
      if (cart && userId && !cart.user_id) {
        await admin.from("carts").update({ user_id: userId }).eq("id", cart.id);
      }
    }
    // Final fallback: recover the cart by device fingerprint (e.g. cookie cleared).
    if (!cart && deviceFp) {
      const { data } = await admin
        .from("carts")
        .select("id, token, user_id, device_fingerprint")
        .eq("device_fingerprint", deviceFp)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      cart = data;
    }

    let setCookie = false;
    if (!cart) {
      // Reads for a visitor with no cart yet: return an empty cart WITHOUT
      // creating a row. This keeps the "is there anything in my cart?" check on
      // every page load cheap and avoids littering the DB with empty carts.
      if (body.action === "get" || body.action === "clear") {
        return json({
          cart: { id: null, currency: "EUR", items: [], subtotal: 0, totalItems: 0, totalPrice: 0 },
        });
      }
      const { data, error } = await admin
        .from("carts")
        .insert({ user_id: userId, device_fingerprint: deviceFp })
        .select("id, token, user_id, device_fingerprint")
        .single();
      if (error) throw error;
      cart = data;
      cartToken = data.token;
      setCookie = true;
    } else if (cart.token !== cartToken) {
      cartToken = cart.token;
      setCookie = true;
    }
    // Keep the fingerprint fresh on the resolved cart — folded into the final
    // background write so it never adds a round-trip to the critical path.
    const fpNeedsUpdate = !!(deviceFp && cart.device_fingerprint !== deviceFp);

    // --- Fast path: serve reads from the in-memory cache when fresh ---
    if (body.action === "get") {
      const cached = getCachedCart(cart.id);
      if (cached) return json({ cart: cached, cached: true });
    } else {
      // Any mutation invalidates the cached snapshot for this cart.
      invalidateCart(cart.id);
    }

    // --- Helper: validate a product/variant and return its server-side price & stock ---
    async function resolveProduct(productId: string, variantId?: string | null) {
      // Fetch product (and variant, when needed) in parallel to cut a round-trip.
      const [productRes, variantRes] = await Promise.all([
        admin.from("products").select("id, name, base_price, image_url, is_active").eq("id", productId).maybeSingle(),
        variantId
          ? admin
              .from("product_variants")
              .select("id, name, price, stock, is_active, product_id")
              .eq("id", variantId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      const product = productRes.data;
      if (!product || !product.is_active) return { error: "Produkti nuk u gjet" };

      if (variantId) {
        const variant = variantRes.data;
        if (!variant || !variant.is_active || variant.product_id !== productId) {
          return { error: "Varianti nuk u gjet" };
        }
        return { product, variant };
      }
      return { product, variant: null };
    }


    // --- Mutations ---
    if (body.action === "add") {
      // Validate the product/variant AND look up the existing line concurrently —
      // they are independent, so this removes a sequential round-trip.
      const existingLineQuery = (() => {
        const q = admin
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cart.id)
          .eq("product_id", body.productId);
        return body.variantId
          ? q.eq("variant_id", body.variantId).maybeSingle()
          : q.is("variant_id", null).maybeSingle();
      })();
      const [res, existingRes] = await Promise.all([
        resolveProduct(body.productId, body.variantId),
        existingLineQuery,
      ]);
      if ("error" in res) return json({ error: res.error }, 400);
      const stock = res.variant ? res.variant.stock : null;
      const existing = existingRes.data;

      let nextQty = (existing?.quantity ?? 0) + body.quantity;
      if (stock !== null) nextQty = Math.min(nextQty, stock);
      if (nextQty < 1) return json({ error: "Produkti nuk ka stok" }, 400);

      if (existing) {
        await admin.from("cart_items").update({ quantity: nextQty }).eq("id", existing.id);
      } else {
        await admin.from("cart_items").insert({
          cart_id: cart.id,
          product_id: body.productId,
          variant_id: body.variantId ?? null,
          quantity: nextQty,
        });
      }
    } else if (body.action === "update") {
      if (body.quantity === 0) {
        const delQuery = admin.from("cart_items").delete().eq("cart_id", cart.id).eq("product_id", body.productId);
        if (body.variantId) await delQuery.eq("variant_id", body.variantId);
        else await delQuery.is("variant_id", null);
      } else {
        const res = await resolveProduct(body.productId, body.variantId);
        if ("error" in res) return json({ error: res.error }, 400);
        let qty = body.quantity;
        if (res.variant && res.variant.stock !== null) qty = Math.min(qty, res.variant.stock);
        if (qty < 1) return json({ error: "Produkti nuk ka stok" }, 400);
        const updQuery = admin.from("cart_items").update({ quantity: qty }).eq("cart_id", cart.id).eq("product_id", body.productId);
        if (body.variantId) await updQuery.eq("variant_id", body.variantId);
        else await updQuery.is("variant_id", null);
      }
    } else if (body.action === "remove") {
      const delQuery = admin.from("cart_items").delete().eq("cart_id", cart.id).eq("product_id", body.productId);
      if (body.variantId) await delQuery.eq("variant_id", body.variantId);
      else await delQuery.is("variant_id", null);
    } else if (body.action === "clear") {
      await admin.from("cart_items").delete().eq("cart_id", cart.id);
    }

    // --- Build authoritative cart state (all numbers computed here) ---
    const { data: rows } = await admin
      .from("cart_items")
      .select("id, product_id, variant_id, quantity, created_at")
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: true });

    const cartRows = rows ?? [];

    // Batch-load every referenced product and variant in ONE query each, instead
    // of an N+1 round-trip per line (the previous source of the cart slowness).
    const productIds = [...new Set(cartRows.map((r) => r.product_id))];
    const variantIds = [...new Set(cartRows.map((r) => r.variant_id).filter(Boolean))] as string[];

    const [productsRes, variantsRes] = await Promise.all([
      productIds.length
        ? admin.from("products").select("id, name, base_price, image_url, is_active").in("id", productIds)
        : Promise.resolve({ data: [] as any[] }),
      variantIds.length
        ? admin.from("product_variants").select("id, name, price, stock, attributes, is_active").in("id", variantIds)
        : Promise.resolve({ data: [] as any[] }),
    ]);

    const productMap = new Map((productsRes.data ?? []).map((p: any) => [p.id, p]));
    const variantMap = new Map((variantsRes.data ?? []).map((v: any) => [v.id, v]));

    const items: any[] = [];
    let subtotal = 0;
    let totalItems = 0;
    // Tracks already-seen product/variant lines so duplicate rows
    // (e.g. created by rapid double-clicks) get merged into one line.
    const lineIndexByKey = new Map<string, number>();
    // Collect DB mutations and run them in parallel at the end.
    const deleteIds: string[] = [];
    const qtyUpdates: { id: string; quantity: number }[] = [];

    for (const row of cartRows) {
      const product = productMap.get(row.product_id);
      if (!product || !product.is_active) {
        deleteIds.push(row.id);
        continue;
      }
      let unitPrice = Number(product.base_price) || 0;
      let variantName: string | null = null;
      let stock: number | null = null;
      let attributes: Record<string, string> | null = null;

      if (row.variant_id) {
        const variant = variantMap.get(row.variant_id);
        if (!variant || !variant.is_active) {
          deleteIds.push(row.id);
          continue;
        }
        unitPrice = Number(variant.price) || 0;
        variantName = variant.name;
        stock = variant.stock;
        attributes = (variant.attributes as Record<string, string>) ?? null;
      }

      // Clamp to live stock
      let qty = row.quantity;
      if (stock !== null && qty > stock) {
        qty = Math.max(0, stock);
        if (qty === 0) {
          deleteIds.push(row.id);
          continue;
        }
        qtyUpdates.push({ id: row.id, quantity: qty });
      }

      // Merge duplicate rows for the same product/variant into a single line.
      const key = `${row.product_id}::${row.variant_id ?? ""}`;
      const existingIdx = lineIndexByKey.get(key);
      if (existingIdx !== undefined) {
        const line = items[existingIdx];
        let mergedQty = line.quantity + qty;
        if (stock !== null) mergedQty = Math.min(mergedQty, stock);
        const removedQty = line.quantity + qty - mergedQty;
        // Persist the consolidated quantity and drop the duplicate row.
        qtyUpdates.push({ id: line.itemId, quantity: mergedQty });
        deleteIds.push(row.id);
        subtotal += unitPrice * (qty - removedQty);
        totalItems += qty - removedQty;
        line.quantity = mergedQty;
        line.lineTotal = unitPrice * mergedQty;
        continue;
      }

      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      totalItems += qty;
      lineIndexByKey.set(key, items.length);
      items.push({
        itemId: row.id,
        productId: row.product_id,
        variantId: row.variant_id,
        name: product.name,
        variantName,
        imageUrl: product.image_url,
        attributes,
        quantity: qty,
        unitPrice,
        lineTotal,
        stock,
      });
    }

    // The authoritative payload is already computed in memory, so the leftover
    // writes (duplicate/stale cleanup, stock clamps, cart bump + fingerprint)
    // don't need to block the response. Run them in the background; the next
    // read rebuilds from the DB anyway, so this stays correct.
    const cartPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (fpNeedsUpdate) cartPatch.device_fingerprint = deviceFp;
    const backgroundWrites = Promise.allSettled([
      deleteIds.length ? admin.from("cart_items").delete().in("id", deleteIds) : Promise.resolve(),
      ...qtyUpdates.map((u) => admin.from("cart_items").update({ quantity: u.quantity }).eq("id", u.id)),
      admin.from("carts").update(cartPatch).eq("id", cart.id),
    ]);
    try {
      (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } })
        .EdgeRuntime?.waitUntil?.(backgroundWrites);
    } catch {
      // No waitUntil available — fall back to awaiting so writes still land.
      await backgroundWrites;
    }

    const responseHeaders: Record<string, string> = {};
    if (setCookie && cartToken) {
      responseHeaders["Set-Cookie"] =
        `${COOKIE_NAME}=${cartToken}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=None`;
    }

    const cartPayload = {
      id: cart.id,
      currency: "EUR",
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      totalItems,
      totalPrice: Math.round(subtotal * 100) / 100,
    };

    // Refresh the in-memory cache with the freshly computed snapshot.
    setCachedCart(cart.id, cartPayload);

    return json({ cart: cartPayload }, 200, responseHeaders);
  } catch (err) {
    console.error("cart error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});
