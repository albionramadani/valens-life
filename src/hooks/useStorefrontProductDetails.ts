import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_price: number | null;
  sale_price: number | null;
  image_url: string | null;
  stock_status: string | null;
  categories?: { name?: string | null; slug?: string | null } | null;
};

type VariantRow = {
  id: string;
  product_id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string> | null;
  color_hex: string | null;
  is_active: boolean;
};

type GalleryRow = {
  id: string;
  url: string | null;
  alt: string | null;
  color: string | null;
  slot: number | null;
  sort_order: number | null;
};

type RelatedRow = {
  id: string;
  name: string;
  slug: string;
  base_price: number | null;
  image_url: string | null;
  categories?: { name?: string | null } | null;
};

export type StorefrontProductDetails = {
  product: ProductRow;
  variants: VariantRow[];
  gallery: GalleryRow[];
  related: RelatedRow[];
};

const validUrl = (u: string | null | undefined) => !!u && u !== "-";

export const useStorefrontProductDetails = (slug?: string) =>
  useQuery({
    queryKey: ["storefront_product_details", slug || ""],
    enabled: !!slug,
    queryFn: async () => {
      const supabaseUrl = (supabase as any).supabaseUrl || (import.meta.env.VITE_SUPABASE_URL as string) || "";
      const supabaseKey = (supabase as any).supabaseKey || (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";
      if (!supabaseUrl || !supabaseKey) throw new Error("Supabase config missing");

      const response = await fetch(`${supabaseUrl}/functions/v1/storefront-page?key=product:${slug}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });

      if (!response.ok) throw new Error("Product payload request failed");

      const payload = (await response.json()) as Partial<StorefrontProductDetails> | null;
      if (!payload?.product?.id) return null;

      const normalized: StorefrontProductDetails = {
        product: {
          id: payload.product.id,
          name: payload.product.name || "",
          slug: payload.product.slug || "",
          description: payload.product.description || null,
          base_price: payload.product.base_price ?? null,
          sale_price: payload.product.sale_price ?? null,
          image_url: payload.product.image_url || null,
          stock_status: payload.product.stock_status || "out_of_stock",
          categories: payload.product.categories || null,
        },
        variants: (payload.variants || []).filter((v) => Number(v?.price) > 1),
        gallery: (payload.gallery || []).filter((g) => validUrl(g?.url)),
        related: payload.related || [],
      };
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
