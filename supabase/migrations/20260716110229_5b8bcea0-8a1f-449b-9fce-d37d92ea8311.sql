
-- 1) Remove permissive WITH CHECK (true) INSERT policies on checkout tables.
-- Checkout will run through server functions using the service role, which
-- bypasses RLS, so client-side inserts are no longer permitted.
DROP POLICY IF EXISTS "Anon can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Auth can insert orders" ON public.orders;
DROP POLICY IF EXISTS "Anon can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Auth can insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Anon can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Auth can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Anon insert payments" ON public.payments;

-- 2) Lock down SECURITY DEFINER functions so anon/authenticated cannot call
-- them directly through PostgREST. `has_role` stays executable because RLS
-- policies invoke it as the current role.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_order_number() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rebuild_storefront_page_cache() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_homepage_payload_cache() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.refresh_storefront_page_cache_trigger() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.build_homepage_payload() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_homepage_payload() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
-- apply_pricelist_prices / apply_variant_stock already lack public execute.

-- 3) Scope store_settings public reads to explicitly-public keys only.
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

UPDATE public.store_settings SET is_public = true WHERE key = 'turnstile_site_key';

DROP POLICY IF EXISTS "Public view store_settings" ON public.store_settings;

CREATE POLICY "Public can read public store_settings"
  ON public.store_settings
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);
