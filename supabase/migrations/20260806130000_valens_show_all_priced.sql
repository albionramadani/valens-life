-- Valens: show every priced product on the storefront.
--   The storefront cache and the stock/price RPCs previously hid anything with a
--   price of 0 or 1 (a `> 1` gate inherited from the old catalog). Valens wants all
--   products visible; the odoo sync now floors a 0/missing price to 1 euro, so here
--   we relax every price gate from `> 1` to `> 0`. The shop/category/product
--   payloads keep emitting `description` + `tags` (categories-as-tags) as well.
--   tags column is re-added idempotently in case an earlier migration was skipped.

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}'::text[];

CREATE OR REPLACE FUNCTION public.rebuild_storefront_page_cache()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.storefront_page_cache WHERE true;

  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at) VALUES ('shop', jsonb_build_object(
    'categories', COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.sort_order) FROM (SELECT id, name, slug, sort_order FROM public.categories WHERE is_active = true) c), '[]'::jsonb),
    'products', COALESCE((SELECT jsonb_agg(prod ORDER BY prod->>'name') FROM (
      SELECT jsonb_build_object(
        'id', p.id, 'name', p.name, 'slug', p.slug, 'base_price', p.base_price,
        'image_url', p.image_url, 'stock_status', p.stock_status, 'category_id', p.category_id, 'subcategory', p.subcategory,
        'description', p.description, 'tags', to_jsonb(COALESCE(p.tags, ARRAY[]::text[])),
        'variants', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', v.id, 'sku', v.sku, 'name', v.name, 'price', v.price, 'stock', v.stock, 'attributes', v.attributes, 'color_hex', v.color_hex, 'is_active', v.is_active))
          FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true AND v.price > 0), '[]'::jsonb),
        'variant_images', COALESCE((SELECT jsonb_agg(DISTINCT jsonb_build_object('color', g.color, 'url', g.url))
          FROM public.product_images g WHERE g.product_id = p.id AND g.color IS NOT NULL AND g.url IS NOT NULL AND g.url <> '-' AND g.url <> ''), '[]'::jsonb)
      ) AS prod
      FROM public.products p WHERE p.is_active = true AND p.base_price > 0
        AND EXISTS (SELECT 1 FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true AND v.price > 0)) s), '[]'::jsonb)
  ), now());

  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at) VALUES ('sales', jsonb_build_object(
    'products', COALESCE((SELECT jsonb_agg(prod ORDER BY prod->>'name') FROM (
      SELECT jsonb_build_object(
        'id', pr.id, 'name', pr.name, 'slug', pr.slug, 'base_price', pr.base_price, 'sale_price', pr.sale_price,
        'image_url', pr.image_url, 'stock_status', pr.stock_status,
        'categories', jsonb_build_object('slug', c.slug, 'name', c.name),
        'variants', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', v.id, 'sku', v.sku, 'name', v.name, 'price', v.price, 'stock', v.stock, 'attributes', v.attributes, 'color_hex', v.color_hex, 'is_active', v.is_active))
          FROM public.product_variants v WHERE v.product_id = pr.id AND v.is_active = true AND v.price > 0), '[]'::jsonb),
        'variant_images', COALESCE((SELECT jsonb_agg(DISTINCT jsonb_build_object('color', g.color, 'url', g.url))
          FROM public.product_images g WHERE g.product_id = pr.id AND g.color IS NOT NULL AND g.url IS NOT NULL AND g.url <> '-' AND g.url <> ''), '[]'::jsonb)
      ) AS prod
      FROM public.products pr LEFT JOIN public.categories c ON c.id = pr.category_id
      WHERE pr.is_active = true AND pr.base_price > 0
        AND EXISTS (SELECT 1 FROM public.product_variants v WHERE v.product_id = pr.id AND v.is_active = true AND v.price > 0)) s), '[]'::jsonb)
  ), now());

  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at)
  SELECT 'category:' || c.slug, jsonb_build_object(
    'id', c.id, 'name', c.name, 'slug', c.slug, 'image_url', c.image_url, 'description', c.description,
    'products', COALESCE((SELECT jsonb_agg(prod ORDER BY prod->>'name') FROM (
      SELECT jsonb_build_object(
        'id', p.id, 'name', p.name, 'slug', p.slug, 'base_price', p.base_price,
        'image_url', p.image_url, 'stock_status', p.stock_status, 'is_active', p.is_active, 'subcategory', p.subcategory,
        'description', p.description, 'tags', to_jsonb(COALESCE(p.tags, ARRAY[]::text[])),
        'variants', COALESCE((SELECT jsonb_agg(jsonb_build_object('id', v.id, 'sku', v.sku, 'name', v.name, 'price', v.price, 'stock', v.stock, 'attributes', v.attributes, 'color_hex', v.color_hex, 'is_active', v.is_active))
          FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true AND v.price > 0), '[]'::jsonb),
        'variant_images', COALESCE((SELECT jsonb_agg(DISTINCT jsonb_build_object('color', g.color, 'url', g.url))
          FROM public.product_images g WHERE g.product_id = p.id AND g.color IS NOT NULL AND g.url IS NOT NULL AND g.url <> '-' AND g.url <> ''), '[]'::jsonb)
      ) AS prod
      FROM public.products p WHERE p.category_id = c.id AND p.is_active = true AND p.base_price > 0
        AND EXISTS (SELECT 1 FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true AND v.price > 0)) s), '[]'::jsonb)
  ), now() FROM public.categories c WHERE c.is_active = true;

  INSERT INTO public.storefront_page_cache (cache_key, payload, updated_at)
  SELECT 'product:' || p.slug, jsonb_build_object(
    'product', jsonb_build_object('id', p.id, 'name', p.name, 'slug', p.slug, 'description', p.description,
      'category_id', p.category_id, 'base_price', p.base_price, 'sale_price', p.sale_price,
      'image_url', p.image_url, 'stock_status', p.stock_status, 'is_active', p.is_active,
      'tags', to_jsonb(COALESCE(p.tags, ARRAY[]::text[])),
      'categories', jsonb_build_object('name', c.name, 'slug', c.slug)),
    'variants', COALESCE((SELECT jsonb_agg(to_jsonb(v) ORDER BY v.price) FROM (
      SELECT id, product_id, name, sku, price, stock, attributes, color_hex, is_active
      FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true AND v.price > 0) v), '[]'::jsonb),
    'gallery', COALESCE((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.sort_order) FROM (
      SELECT id, url, alt, color, slot, sort_order FROM public.product_images g WHERE g.product_id = p.id) g), '[]'::jsonb),
    'related', COALESCE((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.name) FROM (
      SELECT rp.id, rp.name, rp.slug, rp.base_price, rp.image_url,
        jsonb_build_object('name', rc.name) AS categories
      FROM public.products rp LEFT JOIN public.categories rc ON rc.id = rp.category_id
      WHERE rp.is_active = true AND rp.category_id = p.category_id AND rp.id <> p.id AND rp.base_price > 0
        AND EXISTS (SELECT 1 FROM public.product_variants rv WHERE rv.product_id = rp.id AND rv.is_active = true AND rv.price > 0)
      ORDER BY rp.name LIMIT 4) r), '[]'::jsonb)
  ), now() FROM public.products p LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE p.is_active = true AND p.base_price > 0
      AND EXISTS (SELECT 1 FROM public.product_variants v WHERE v.product_id = p.id AND v.is_active = true AND v.price > 0);
END;
$$;

-- Stock status: a product is in stock when any priced (>0) active variant has stock.
CREATE OR REPLACE FUNCTION public.apply_variant_stock(p jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE changed integer := 0; status_changed integer := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p) u JOIN public.product_variants v ON v.sku = (u.value->>'sku')
    WHERE v.stock IS DISTINCT FROM GREATEST(0, (u.value->>'stock')::int)) THEN
    UPDATE public.product_variants v SET stock = GREATEST(0, (u.value->>'stock')::int)
    FROM jsonb_array_elements(p) u WHERE v.sku = (u.value->>'sku')
      AND v.stock IS DISTINCT FROM GREATEST(0, (u.value->>'stock')::int);
    GET DIAGNOSTICS changed = ROW_COUNT;
  END IF;
  UPDATE public.products pr SET stock_status = CASE WHEN EXISTS (
    SELECT 1 FROM public.product_variants v WHERE v.product_id = pr.id AND v.is_active = true AND v.price > 0 AND v.stock > 0
  ) THEN 'in_stock' ELSE 'out_of_stock' END
  WHERE pr.stock_status IS DISTINCT FROM CASE WHEN EXISTS (
    SELECT 1 FROM public.product_variants v WHERE v.product_id = pr.id AND v.is_active = true AND v.price > 0 AND v.stock > 0
  ) THEN 'in_stock' ELSE 'out_of_stock' END;
  GET DIAGNOSTICS status_changed = ROW_COUNT;
  IF changed > 0 OR status_changed > 0 THEN
    PERFORM public.rebuild_storefront_page_cache();
    INSERT INTO public.homepage_payload_cache (cache_key, payload, updated_at)
    VALUES ('homepage', public.build_homepage_payload(), now())
    ON CONFLICT (cache_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at;
  END IF;
  RETURN changed;
END; $$;

-- Pricelist: apply any positive incoming price; base_price = min priced (>0) variant.
CREATE OR REPLACE FUNCTION public.apply_pricelist_prices(p jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE changed integer := 0; base_changed integer := 0; status_changed integer := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(p) u JOIN public.product_variants v ON v.sku = (u.value->>'sku')
    WHERE (u.value->>'price')::numeric > 0 AND v.price IS DISTINCT FROM (u.value->>'price')::numeric) THEN
    UPDATE public.product_variants v SET price = (u.value->>'price')::numeric
    FROM jsonb_array_elements(p) u WHERE v.sku = (u.value->>'sku')
      AND (u.value->>'price')::numeric > 0 AND v.price IS DISTINCT FROM (u.value->>'price')::numeric;
    GET DIAGNOSTICS changed = ROW_COUNT;
  END IF;
  UPDATE public.products pr SET base_price = sub.minp
  FROM (SELECT product_id, MIN(price) AS minp FROM public.product_variants
    WHERE is_active = true AND price > 0 GROUP BY product_id) sub
  WHERE pr.id = sub.product_id AND pr.base_price IS DISTINCT FROM sub.minp;
  GET DIAGNOSTICS base_changed = ROW_COUNT;
  UPDATE public.products pr SET stock_status = CASE WHEN EXISTS (
    SELECT 1 FROM public.product_variants v WHERE v.product_id = pr.id AND v.is_active = true AND v.price > 0 AND v.stock > 0
  ) THEN 'in_stock' ELSE 'out_of_stock' END
  WHERE pr.stock_status IS DISTINCT FROM CASE WHEN EXISTS (
    SELECT 1 FROM public.product_variants v WHERE v.product_id = pr.id AND v.is_active = true AND v.price > 0 AND v.stock > 0
  ) THEN 'in_stock' ELSE 'out_of_stock' END;
  GET DIAGNOSTICS status_changed = ROW_COUNT;
  IF changed > 0 OR base_changed > 0 OR status_changed > 0 THEN
    PERFORM public.rebuild_storefront_page_cache();
    INSERT INTO public.homepage_payload_cache (cache_key, payload, updated_at)
    VALUES ('homepage', public.build_homepage_payload(), now())
    ON CONFLICT (cache_key) DO UPDATE SET payload = EXCLUDED.payload, updated_at = EXCLUDED.updated_at;
  END IF;
  RETURN changed;
END; $$;

-- Rebuild immediately so the relaxed gates take effect without waiting for a sync.
SELECT public.rebuild_storefront_page_cache();
