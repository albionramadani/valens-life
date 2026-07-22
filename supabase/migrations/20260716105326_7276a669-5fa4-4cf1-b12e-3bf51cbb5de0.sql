CREATE TABLE IF NOT EXISTS public.admin_secrets (
  key text PRIMARY KEY, value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_secrets TO authenticated;
GRANT ALL ON public.admin_secrets TO service_role;
ALTER TABLE public.admin_secrets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage admin_secrets" ON public.admin_secrets FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  url text NOT NULL DEFAULT '', alt text,
  slot integer NOT NULL DEFAULT 0, sort_order integer NOT NULL DEFAULT 0,
  odoo_ref text UNIQUE, odoo_model text, odoo_src_id bigint, odoo_field text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON public.product_images(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_product_images_variant ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS idx_product_images_pending ON public.product_images(url) WHERE url = '';
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT SELECT ON public.product_images TO anon;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage product_images" ON public.product_images FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Public view product_images" ON public.product_images FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.is_active = true));

CREATE TABLE IF NOT EXISTS public.smtp_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host TEXT NOT NULL DEFAULT 'smtp.office365.com', port INTEGER NOT NULL DEFAULT 587,
  secure BOOLEAN NOT NULL DEFAULT false,
  username TEXT NOT NULL DEFAULT '', password TEXT NOT NULL DEFAULT '',
  from_email TEXT NOT NULL DEFAULT '', from_name TEXT NOT NULL DEFAULT 'iCore',
  admin_notification_email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smtp_settings TO authenticated;
GRANT ALL ON public.smtp_settings TO service_role;
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view smtp" ON public.smtp_settings FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins insert smtp" ON public.smtp_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update smtp" ON public.smtp_settings FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TABLE IF NOT EXISTS public.mfa_recovery_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL, used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_email ON public.mfa_recovery_codes(email);
CREATE INDEX IF NOT EXISTS idx_mfa_recovery_expires ON public.mfa_recovery_codes(expires_at);
GRANT SELECT ON public.mfa_recovery_codes TO authenticated;
GRANT ALL ON public.mfa_recovery_codes TO service_role;
ALTER TABLE public.mfa_recovery_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view recovery" ON public.mfa_recovery_codes FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

INSERT INTO public.store_settings (key, value) VALUES ('turnstile_site_key', '0x4AAAAAADNt5dFv4QorNpCF') ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_profiles_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.homepage_banners
  ADD COLUMN IF NOT EXISTS btn1_bg text,
  ADD COLUMN IF NOT EXISTS btn1_text text,
  ADD COLUMN IF NOT EXISTS btn2_bg text,
  ADD COLUMN IF NOT EXISTS btn2_text text;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE POLICY "Public read product-media" ON storage.objects FOR SELECT USING (bucket_id = 'product-media');
CREATE POLICY "Admins insert product-media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update product-media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins delete product-media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-media' AND has_role(auth.uid(), 'admin'::app_role));

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS odoo_id BIGINT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS odoo_id BIGINT;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS odoo_id BIGINT;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS color_hex TEXT;
CREATE INDEX IF NOT EXISTS idx_products_odoo_id ON public.products(odoo_id);
CREATE INDEX IF NOT EXISTS idx_categories_odoo_id ON public.categories(odoo_id);
CREATE INDEX IF NOT EXISTS idx_variants_odoo_id ON public.product_variants(odoo_id);