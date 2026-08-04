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
};

const EMPTY_PAYLOAD: RawShopPayload = { products: [], categories: [] };
const FALLBACK_THUMB = "/assets/img/products/omega-3.svg";
const SHOP_CACHE_KEY = "valens_storefront_shop_payload";

const readStoredPayload = (): RawShopPayload | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(SHOP_CACHE_KEY);
    if (raw) return { ...EMPTY_PAYLOAD, ...JSON.parse(raw) } as RawShopPayload;
    return { ...EMPTY_PAYLOAD, ...(STOREFRONT_LIST_SNAPSHOTS.shop || {}) } as RawShopPayload;
  } catch {
    return { ...EMPTY_PAYLOAD, ...(STOREFRONT_LIST_SNAPSHOTS.shop || {}) } as RawShopPayload;
  }
};

const storePayload = (payload: RawShopPayload) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SHOP_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors; network payload is still usable.
  }
};

const toCards = (payload: RawShopPayload): ShopCardProduct[] => {
  const categoryName = new Map((payload.categories || []).map((c) => [c.id, c.name]));

  return (payload.products || []).map((p) => ({
    id: p.id,
    title: p.name,
    price: Number(p.base_price) || 0,
    thumb: p.image_url || FALLBACK_THUMB,
    class_name: "",
    valensSubtitle: categoryName.get(p.category_id || "") || p.slug,
    stock_status: p.stock_status || "in_stock",
    slug: p.slug,
  }));
};

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
      storePayload(payload);
      return toCards(payload);
    },
    // Deterministic EMPTY initial data (identical on server and client) avoids the
    // SSR hydration mismatch. We intentionally do NOT seed from a bundled snapshot or
    // localStorage — the live query below is the single source of truth for products.
    initialData: () => [] as ShopCardProduct[],
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
