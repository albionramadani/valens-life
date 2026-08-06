import { useQuery } from "@tanstack/react-query";
import { STOREFRONT_LIST_SNAPSHOTS } from "@/data/storefrontListSnapshots";
import { supabase } from "@/integrations/supabase/client";

type RawShopProduct = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  base_price: number | null;
  category_id: string | null;
  stock_status: string | null;
  description?: string | null;
  tags?: string[] | null;
};

type RawShopCategory = {
  id: string;
  name: string;
};

type RawShopPayload = {
  products: RawShopProduct[];
  categories: RawShopCategory[];
};

export type ShopCardProduct = {
  id: string;
  title: string;
  price: number;
  thumb: string;
  class_name: string;
  valensSubtitle: string;
  stock_status: string;
  slug: string;
  shortDescription: string;
  tags: string[];
};

const EMPTY_PAYLOAD: RawShopPayload = { products: [], categories: [] };
const FALLBACK_THUMB = "/assets/img/products/omega-3.svg";

const toCards = (payload: RawShopPayload): ShopCardProduct[] => {
  const categoryName = new Map((payload.categories || []).map((c) => [c.id, c.name]));

  return (payload.products || []).map((p) => {
    const catName = categoryName.get(p.category_id || "") || "";
    // Tags drive the "category" role: use the product's tags when the backend
    // provides them; otherwise fall back to the single derived category.
    const tags = Array.isArray(p.tags) && p.tags.length
      ? p.tags.map((t) => String(t).trim()).filter(Boolean)
      : (catName ? [catName] : []);

    return {
      id: p.id,
      title: p.name,
      price: Number(p.base_price) || 0,
      thumb: p.image_url || FALLBACK_THUMB,
      class_name: "",
      valensSubtitle: catName || p.slug,
      stock_status: p.stock_status || "in_stock",
      slug: p.slug,
      shortDescription: (p.description || "").toString().trim(),
      tags,
    };
  });
};

// Deterministic seed built at module load from the bundled snapshot. Identical on
// server and client (no hydration mismatch) so the product list paints instantly
// instead of flashing empty while the live request is in flight.
const SEED_CARDS: ShopCardProduct[] = (() => {
  try {
    const snap = STOREFRONT_LIST_SNAPSHOTS.shop;
    return snap ? toCards({ ...EMPTY_PAYLOAD, ...snap } as RawShopPayload) : [];
  } catch {
    return [];
  }
})();

export const useStorefrontShopProducts = () =>
  useQuery({
    queryKey: ["storefront_shop_products"],
    queryFn: async () => {
      const supabaseUrl = (supabase as any).supabaseUrl || (import.meta.env.VITE_SUPABASE_URL as string) || "";
      const supabaseKey = (supabase as any).supabaseKey || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";
      if (!supabaseUrl || !supabaseKey) throw new Error("Supabase config missing");

      const response = await fetch(`${supabaseUrl}/functions/v1/storefront-page?key=shop`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) throw new Error("Shop payload request failed");

      const payload = { ...EMPTY_PAYLOAD, ...((await response.json()) || {}) } as RawShopPayload;
      return toCards(payload);
    },
    // Seed from the bundled snapshot (deterministic → no SSR hydration mismatch) so
    // products render instantly. initialDataUpdatedAt: 0 marks it stale, so the live
    // query still refetches immediately and becomes the source of truth.
    initialData: () => SEED_CARDS,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
