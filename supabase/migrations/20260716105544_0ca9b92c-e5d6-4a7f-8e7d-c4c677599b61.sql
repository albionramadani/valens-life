ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS color text;
CREATE INDEX IF NOT EXISTS idx_product_images_color ON public.product_images (product_id, color);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  user_id uuid,
  status text NOT NULL DEFAULT 'active',
  currency text NOT NULL DEFAULT 'EUR',
  device_fingerprint text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);
CREATE INDEX idx_carts_user_id ON public.carts(user_id);
CREATE INDEX idx_carts_token ON public.carts(token);
CREATE INDEX idx_carts_device_fingerprint ON public.carts (device_fingerprint) WHERE device_fingerprint IS NOT NULL;
GRANT SELECT ON public.carts TO authenticated;
GRANT ALL ON public.carts TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cart" ON public.carts FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 99),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE UNIQUE INDEX uq_cart_items_variant ON public.cart_items(cart_id, product_id, variant_id) WHERE variant_id IS NOT NULL;
CREATE UNIQUE INDEX uq_cart_items_novariant ON public.cart_items(cart_id, product_id) WHERE variant_id IS NULL;
GRANT SELECT ON public.cart_items TO authenticated;
GRANT ALL ON public.cart_items TO service_role;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own cart items" ON public.cart_items FOR SELECT TO authenticated USING (EXISTS (
  SELECT 1 FROM public.carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
));
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON public.carts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_variants_product_active ON public.product_variants (product_id, is_active, price);
CREATE INDEX IF NOT EXISTS idx_products_category_active ON public.products (category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active_name ON public.products (name) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_featured_active ON public.products (featured_on_homepage) WHERE is_active = true AND featured_on_homepage = true;
ALTER TABLE public.mfa_recovery_codes ADD COLUMN IF NOT EXISTS attempts integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_homepage_banners_active_sort ON public.homepage_banners (sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_store_categories_active_sort ON public.store_categories (sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_store_sessions_active_sort ON public.store_sessions (sort_order) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_homepage_active_name ON public.products (name) WHERE is_active = true AND featured_on_homepage = true;

CREATE TABLE IF NOT EXISTS public.homepage_payload_cache (
  cache_key text PRIMARY KEY DEFAULT 'homepage',
  payload jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT homepage_payload_cache_singleton CHECK (cache_key = 'homepage')
);
GRANT SELECT ON public.homepage_payload_cache TO anon, authenticated;
GRANT ALL ON public.homepage_payload_cache TO service_role;
ALTER TABLE public.homepage_payload_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read homepage payload cache" ON public.homepage_payload_cache
  FOR SELECT TO anon, authenticated USING (cache_key = 'homepage');

CREATE OR REPLACE FUNCTION public.build_homepage_payload()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT jsonb_build_object(
    'settings', COALESCE((SELECT jsonb_object_agg(s.key, s.value ORDER BY s.key) FROM public.store_settings s), '{}'::jsonb),
    'homepage_banners', COALESCE((SELECT jsonb_agg(to_jsonb(b) ORDER BY b.sort_order) FROM (
      SELECT id, section_type, title, subtitle, description, image_url, link_url, link_label,
        secondary_link_url, secondary_link_label, bg_color, text_color, sort_order,
        btn1_bg, btn1_text, btn2_bg, btn2_text
      FROM public.homepage_banners WHERE is_active = true) b), '[]'::jsonb),
    'store_categories', COALESCE((SELECT jsonb_agg(to_jsonb(sc) ORDER BY sc.sort_order) FROM (
      SELECT id, name, icon, link_url, sort_order, is_active FROM public.store_categories WHERE is_active = true) sc), '[]'::jsonb),
    'store_sessions', COALESCE((SELECT jsonb_agg(to_jsonb(ss) ORDER BY ss.sort_order) FROM (
      SELECT id, category, title, date_text, image_url, sort_order FROM public.store_sessions WHERE is_active = true) ss), '[]'::jsonb),
    'featured_products', COALESCE((SELECT jsonb_agg(to_jsonb(fp) ORDER BY fp.name) FROM (
      SELECT p.id, p.name, p.slug, p.base_price, p.image_url, p.stock_status,
        jsonb_build_object('name', c.name, 'slug', c.slug) AS categories
      FROM public.products p LEFT JOIN public.categories c ON c.id = p.category_id
      WHERE p.featured_on_homepage = true AND p.is_active = true) fp), '[]'::jsonb)
  );
$$;

CREATE OR REPLACE FUNCTION public.refresh_homepage_payload_cache()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.homepage_payload_cache (cache_key, payload, updated_at)
  VALUES ('homepage', public.build_homepage_payload(), now())
  ON CONFLICT (cache_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at;
  RETURN COALESCE(NEW, OLD);
END; $$;

INSERT INTO public.homepage_payload_cache (cache_key, payload, updated_at)
VALUES ('homepage', public.build_homepage_payload(), now())
ON CONFLICT (cache_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at;

CREATE OR REPLACE FUNCTION public.get_homepage_payload()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT payload FROM public.homepage_payload_cache WHERE cache_key = 'homepage' LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.build_homepage_payload() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_homepage_payload_cache() TO service_role;
GRANT EXECUTE ON FUNCTION public.get_homepage_payload() TO anon, authenticated, service_role;

CREATE TRIGGER refresh_homepage_payload_cache_settings AFTER INSERT OR UPDATE OR DELETE ON public.store_settings
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_homepage_payload_cache();
CREATE TRIGGER refresh_homepage_payload_cache_banners AFTER INSERT OR UPDATE OR DELETE ON public.homepage_banners
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_homepage_payload_cache();
CREATE TRIGGER refresh_homepage_payload_cache_categories AFTER INSERT OR UPDATE OR DELETE ON public.store_categories
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_homepage_payload_cache();
CREATE TRIGGER refresh_homepage_payload_cache_sessions AFTER INSERT OR UPDATE OR DELETE ON public.store_sessions
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_homepage_payload_cache();

CREATE TABLE IF NOT EXISTS public.storefront_page_cache (
  cache_key text PRIMARY KEY,
  payload jsonb NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT ON public.storefront_page_cache TO anon, authenticated;
GRANT ALL ON public.storefront_page_cache TO service_role;
ALTER TABLE public.storefront_page_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read storefront page cache" ON public.storefront_page_cache FOR SELECT TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.rebuild_storefront_page_cache()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.storefront_page_cache;
  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at) VALUES ('shop', jsonb_build_object(
    'categories', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.sort_order) FROM (SELECT id, name, slug, sort_order FROM public.categories WHERE is_active = true) c), '[]'::jsonb),
    'products', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.name) FROM (SELECT id, name, slug, description, base_price, image_url, stock_status, category_id FROM public.products WHERE is_active = true) p), '[]'::jsonb)
  ), now());
  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at) VALUES ('sales', jsonb_build_object(
    'products', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.name) FROM (
      SELECT pr.id, pr.name, pr.slug, pr.description, pr.base_price, pr.sale_price, pr.image_url, pr.stock_status,
        jsonb_build_object('slug', c.slug, 'name', c.name) AS categories
      FROM public.products pr LEFT JOIN public.categories c ON c.id = pr.category_id WHERE pr.is_active = true) p), '[]'::jsonb)
  ), now());
  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at)
  SELECT 'category:' || c.slug, jsonb_build_object(
    'id', c.id, 'name', c.name, 'slug', c.slug, 'image_url', c.image_url, 'description', c.description,
    'products', COALESCE((SELECT jsonb_agg(to_jsonb(p) ORDER BY p.name) FROM (
      SELECT id, name, slug, description, base_price, image_url, stock_status, is_active
      FROM public.products p WHERE p.category_id = c.id AND p.is_active = true) p), '[]'::jsonb)
  ), now() FROM public.categories c WHERE c.is_active = true;
  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at)
  SELECT 'product:' || p.slug, jsonb_build_object(
    'product', jsonb_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'description', p.description,
      'category_id', p.category_id, 'base_price', p.base_price, 'sale_price', p.sale_price,
      'image_url', p.image_url, 'stock_status', p.stock_status, 'is_active', p.is_active,
      'categories', jsonb_build_object('name', c.name, 'slug', c.slug)),
    'variants', COALESCE((SELECT jsonb_agg(to_jsonb(v) ORDER BY v.price) FROM (
      SELECT id, product_id, name, sku, price, stock, attributes, color_hex, is_active
      FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true) v), '[]'::jsonb),
    'gallery', COALESCE((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.sort_order) FROM (
      SELECT id, url, alt, color, slot, sort_order FROM public.product_images g WHERE g.product_id = p.id) g), '[]'::jsonb),
    'related', COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.name) FROM (
      SELECT rp.id, rp.name, rp.slug, rp.base_price, rp.image_url,
        jsonb_build_object('name', rc.name) AS categories
      FROM public.products rp LEFT JOIN public.categories rc ON rc.id = rp.category_id
      WHERE rp.is_active = true AND rp.category_id = p.category_id AND rp.id <> p.id
      ORDER BY rp.name LIMIT 4) r), '[]'::jsonb)
  ), now() FROM public.products p LEFT JOIN public.categories c ON c.id = p.category_id WHERE p.is_active = true;
END; $$;

CREATE OR REPLACE FUNCTION public.refresh_storefront_page_cache_trigger()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.rebuild_storefront_page_cache(); RETURN COALESCE(NEW, OLD); END; $$;

SELECT public.rebuild_storefront_page_cache();

CREATE TRIGGER refresh_storefront_cache_products AFTER INSERT OR UPDATE OR DELETE ON public.products
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_storefront_page_cache_trigger();
CREATE TRIGGER refresh_storefront_cache_variants AFTER INSERT OR UPDATE OR DELETE ON public.product_variants
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_storefront_page_cache_trigger();
CREATE TRIGGER refresh_storefront_cache_images AFTER INSERT OR UPDATE OR DELETE ON public.product_images
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_storefront_page_cache_trigger();
CREATE TRIGGER refresh_storefront_cache_categories AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_storefront_page_cache_trigger();

GRANT EXECUTE ON FUNCTION public.rebuild_storefront_page_cache() TO service_role;
GRANT EXECUTE ON FUNCTION public.refresh_storefront_page_cache_trigger() TO service_role;