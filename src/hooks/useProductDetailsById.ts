import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ProductDetailsById = {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    base_price: number;
    sale_price: number | null;
    image_url: string | null;
    stock_status: string;
    categories: { name?: string | null; slug?: string | null } | null;
  };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributes: Record<string, string> | null;
    color_hex: string | null;
    is_active: boolean;
  }>;
  gallery: Array<{
    id: string;
    url: string;
    alt: string | null;
    color: string | null;
    slot: number;
    sort_order: number;
  }>;
  related: Array<{
    id: string;
    name: string;
    slug: string;
    base_price: number;
    image_url: string | null;
    categories: { name?: string | null } | null;
  }>;
};

export const useProductDetailsById = (productId?: string) =>
  useQuery({
    queryKey: ["product_details_by_id", productId || ""],
    enabled: !!productId,
    queryFn: async () => {
      const { data: products, error: productError } = await supabase
        .from("products")
        .select("id,name,slug,description,base_price,sale_price,image_url,stock_status,category_id,categories(name,slug)")
        .eq("id", productId!)
        .eq("is_active", true)
        .limit(1);

      if (productError) throw productError;
      if (!products?.length) return null;

      const p = products[0];

      const [variantsRes, galleryRes, relatedRes] = await Promise.all([
        supabase
          .from("product_variants")
          .select("id,name,sku,price,stock,attributes,color_hex,is_active")
          .eq("product_id", p.id)
          .eq("is_active", true)
          .order("price"),
        supabase
          .from("product_images")
          .select("id,url,alt,color,slot,sort_order")
          .eq("product_id", p.id)
          .order("sort_order"),
        p.category_id
          ? supabase
              .from("products")
              .select("id,name,slug,base_price,image_url,categories(name)")
              .eq("is_active", true)
              .eq("category_id", p.category_id)
              .neq("id", p.id)
              .order("name")
              .limit(4)
          : Promise.resolve({ data: [] as any[], error: null }),
      ]);

      if (variantsRes.error) throw variantsRes.error;
      if (galleryRes.error) throw galleryRes.error;
      if (relatedRes.error) throw relatedRes.error;

      const variants = (variantsRes.data || []).filter((v) => Number(v.price) > 0);
      const gallery = (galleryRes.data || []).filter((g) => !!g.url && g.url !== "-");
      const related = relatedRes.data || [];

      const normalized: ProductDetailsById = {
        product: {
          id: p.id,
          name: p.name || "",
          slug: p.slug || "",
          description: p.description || null,
          base_price: Number(p.base_price) || 0,
          sale_price: p.sale_price ?? null,
          image_url: p.image_url || null,
          stock_status: p.stock_status || "out_of_stock",
          categories: p.categories || null,
        },
        variants,
        gallery: gallery.map((g) => ({
          id: g.id,
          url: g.url!,
          alt: g.alt,
          color: g.color,
          slot: g.slot ?? 0,
          sort_order: g.sort_order ?? 0,
        })),
        related: related.map((r) => ({
          id: r.id,
          name: r.name,
          slug: r.slug,
          base_price: Number(r.base_price) || 0,
          image_url: r.image_url,
          categories: r.categories,
        })),
      };

      return normalized;
    },
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
