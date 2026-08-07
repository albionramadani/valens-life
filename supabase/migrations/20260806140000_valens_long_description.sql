-- Valens: long product description shown on the product-details page.
-- Sourced from Odoo "Internal Notes" (product.template.description) by the
-- odoo-fetch-products sync. The details page reads the products table directly
-- (useProductDetailsById), so no cache-function change is needed here.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS long_description text;
