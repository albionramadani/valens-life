// Auto-generated snapshot of the live storefront 'shop' payload.
// Purpose: seed the product list on first paint so products appear instantly
// (no spinner / empty flash) while the live query refetches fresh data in the
// background. Deterministic (same on server + client) so it causes no SSR
// hydration mismatch. Regenerate after large catalog changes; prices/stock stay
// fresh via the background refetch regardless.
export const STOREFRONT_LIST_SNAPSHOTS: Record<string, any> = {
  shop: {
  "categories": [
    {
      "id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "name": "femra"
    },
    {
      "id": "1680e354-4bc4-46e9-951e-e3d405b17abd",
      "name": "gjumi"
    },
    {
      "id": "e632c652-f533-4d78-b905-f8b3d313e7d7",
      "name": "imuniteti"
    },
    {
      "id": "26e5383f-4c7d-4916-b426-3137a6f01c68",
      "name": "meshkuj"
    },
    {
      "id": "5eb71691-da97-416e-a9de-bcd8f3dabc4d",
      "name": "truri"
    },
    {
      "id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "name": "zemra"
    }
  ],
  "products": [
    {
      "id": "f2cd246a-7a2d-4c77-a6d0-5d3ed6e27866",
      "name": "BioActive Folate & Vitamin B12",
      "slug": "bioactive-folate-vitamin-b12-odoo-381",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/f2cd246a-7a2d-4c77-a6d0-5d3ed6e27866/vmain-313.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "in_stock",
      "description": "90 vegetarian capsules",
      "tags": [
        "Zemra",
        "Truri",
        "Femra"
      ]
    },
    {
      "id": "28d7eec0-e095-4922-bd88-029f5865c28d",
      "name": "Body Trim and Appetite Control",
      "slug": "body-trim-and-appetite-control-odoo-382",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/28d7eec0-e095-4922-bd88-029f5865c28d/vmain-314.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "30 vegetarian capsules",
      "tags": [
        "Femra",
        "Meshkuj"
      ]
    },
    {
      "id": "8d98699d-c726-4e4d-a6e0-0f391b5bb7b5",
      "name": "Calcium Citrate with Vitamin D, 200 vegetarian capsules",
      "slug": "calcium-citrate-with-vitamin-d-200-vegetarian-capsules-odoo-383",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/8d98699d-c726-4e4d-a6e0-0f391b5bb7b5/vmain-315.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": null,
      "tags": [
        "Femra"
      ]
    },
    {
      "id": "92da959c-1b27-41bd-8285-92db875fc55d",
      "name": "Citicoline (CDP-Choline)",
      "slug": "citicoline-cdp-choline-odoo-384",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/92da959c-1b27-41bd-8285-92db875fc55d/vmain-316.jpg",
      "category_id": "5eb71691-da97-416e-a9de-bcd8f3dabc4d",
      "stock_status": "out_of_stock",
      "description": "250 mg, 60 vegetarian capsules",
      "tags": [
        "Truri"
      ]
    },
    {
      "id": "a28a8887-50b4-4f0c-b13b-45ea762fba4d",
      "name": "Cognitex Basics",
      "slug": "cognitex-basics-odoo-385",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/a28a8887-50b4-4f0c-b13b-45ea762fba4d/vmain-317.jpg",
      "category_id": "5eb71691-da97-416e-a9de-bcd8f3dabc4d",
      "stock_status": "out_of_stock",
      "description": "30 softgels",
      "tags": [
        "Truri"
      ]
    },
    {
      "id": "bf76ef16-ce25-4c1d-aea5-33db7dc24102",
      "name": "Creatine Capsules",
      "slug": "creatine-capsules-odoo-386",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/bf76ef16-ce25-4c1d-aea5-33db7dc24102/vmain-318.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "120 vegetarian capsules",
      "tags": [
        "Femra",
        "Meshkuj"
      ]
    },
    {
      "id": "e3bde1da-5dfe-424b-9db4-3146c9c0eee8",
      "name": "Enhanced Sleep without Melatonin, 30 capsules",
      "slug": "enhanced-sleep-without-melatonin-30-capsules-odoo-387",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/e3bde1da-5dfe-424b-9db4-3146c9c0eee8/vmain-319.jpg",
      "category_id": "1680e354-4bc4-46e9-951e-e3d405b17abd",
      "stock_status": "out_of_stock",
      "description": null,
      "tags": [
        "Gjumi"
      ]
    },
    {
      "id": "7bb8ad6c-044e-404b-a454-26a808ef7427",
      "name": "Estrogen Balance Elite",
      "slug": "estrogen-balance-elite-odoo-388",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/7bb8ad6c-044e-404b-a454-26a808ef7427/vmain-320.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "60 tablets",
      "tags": [
        "Femra",
        "Gjumi"
      ]
    },
    {
      "id": "10656675-0f9b-4ff5-bacb-18697ee70aa5",
      "name": "Hair, Skin & Nails Collagen Plus Formula",
      "slug": "hair-skin-nails-collagen-plus-formula-odoo-389",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/10656675-0f9b-4ff5-bacb-18697ee70aa5/vmain-321.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "120 tablets",
      "tags": [
        "Femra",
        "Meshkuj"
      ]
    },
    {
      "id": "36a55271-9e04-47da-93a8-d82525b3e235",
      "name": "Herbal Sleep PM",
      "slug": "herbal-sleep-pm-odoo-390",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/36a55271-9e04-47da-93a8-d82525b3e235/vmain-322.jpg",
      "category_id": "1680e354-4bc4-46e9-951e-e3d405b17abd",
      "stock_status": "out_of_stock",
      "description": "30 capsules",
      "tags": [
        "Gjumi",
        "Truri"
      ]
    },
    {
      "id": "31a1fed4-fbb6-4cbb-acce-e23b82fc3069",
      "name": "Inositol Caps",
      "slug": "inositol-caps-odoo-391",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/31a1fed4-fbb6-4cbb-acce-e23b82fc3069/vmain-323.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "1000 mg, 360 vegetarian capsules",
      "tags": [
        "Femra",
        "Truri"
      ]
    },
    {
      "id": "29106f9c-1ecb-4776-a086-a8aeed66454d",
      "name": "Iron Protein Plus",
      "slug": "iron-protein-plus-odoo-392",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/29106f9c-1ecb-4776-a086-a8aeed66454d/vmain-324.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "300 mg, 100 capsules",
      "tags": [
        "Femra",
        "Imuniteti"
      ]
    },
    {
      "id": "9b47936d-863f-43f6-96e7-0de53b809b87",
      "name": "L-Carnitine",
      "slug": "l-carnitine-odoo-393",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/9b47936d-863f-43f6-96e7-0de53b809b87/vmain-325.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "500 mg, 30 vegetarian capsules",
      "tags": [
        "Femra",
        "Meshkuj",
        "Zemra"
      ]
    },
    {
      "id": "66266d18-1ccc-4f89-8b20-ec81ec049fa2",
      "name": "L-Theanine, 100 mg, 60 vegetarian capsules",
      "slug": "l-theanine-100-mg-60-vegetarian-capsules-odoo-394",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/66266d18-1ccc-4f89-8b20-ec81ec049fa2/vmain-326.jpg",
      "category_id": "1680e354-4bc4-46e9-951e-e3d405b17abd",
      "stock_status": "out_of_stock",
      "description": null,
      "tags": [
        "Gjumi"
      ]
    },
    {
      "id": "ec600169-d352-417d-bbe3-4b1f890c6fbb",
      "name": "Magnesium Caps",
      "slug": "magnesium-caps-odoo-395",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/ec600169-d352-417d-bbe3-4b1f890c6fbb/vmain-327.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "out_of_stock",
      "description": "500 mg, 100 vegetarian capsules",
      "tags": [
        "Zemra",
        "Truri",
        "Gjumi"
      ]
    },
    {
      "id": "313c3725-a6a0-42f2-b342-91fb86f74ac8",
      "name": "Male Vascular Sexual Support",
      "slug": "male-vascular-sexual-support-odoo-396",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/313c3725-a6a0-42f2-b342-91fb86f74ac8/vmain-328.jpg",
      "category_id": "26e5383f-4c7d-4916-b426-3137a6f01c68",
      "stock_status": "out_of_stock",
      "description": "30 vegetarian capsules",
      "tags": [
        "Meshkuj"
      ]
    },
    {
      "id": "c5fc70e9-6637-426c-89e8-d914b1c96a09",
      "name": "Mushroom Immune with Beta Glucans",
      "slug": "mushroom-immune-with-beta-glucans-odoo-397",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/c5fc70e9-6637-426c-89e8-d914b1c96a09/vmain-329.jpg",
      "category_id": "e632c652-f533-4d78-b905-f8b3d313e7d7",
      "stock_status": "out_of_stock",
      "description": "30 vegetarian capsules",
      "tags": [
        "Imuniteti"
      ]
    },
    {
      "id": "7d2cfd29-65ea-4fd0-a2ff-150ef4554bab",
      "name": "Neuro-Mag® Magnesium L-Threonate",
      "slug": "neuro-mag-magnesium-l-threonate-odoo-398",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/7d2cfd29-65ea-4fd0-a2ff-150ef4554bab/vmain-330.jpg",
      "category_id": "5eb71691-da97-416e-a9de-bcd8f3dabc4d",
      "stock_status": "out_of_stock",
      "description": "90 vegetarian capsules",
      "tags": [
        "Truri",
        "Gjumi"
      ]
    },
    {
      "id": "4546eb5a-3ccb-4304-8dac-1096e6e83f31",
      "name": "Optimized Ashwagandha",
      "slug": "optimized-ashwagandha-odoo-399",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/4546eb5a-3ccb-4304-8dac-1096e6e83f31/vmain-331.jpg",
      "category_id": "1680e354-4bc4-46e9-951e-e3d405b17abd",
      "stock_status": "out_of_stock",
      "description": "60 vegetarian capsules",
      "tags": [
        "Gjumi",
        "Truri"
      ]
    },
    {
      "id": "cc2629bb-df0b-4712-946a-e90193a3a0b6",
      "name": "PalmettoGuard® Saw Palmetto/Nettle Root Formula with Beta-Sitosterol",
      "slug": "palmettoguard-saw-palmetto-nettle-root-formula-with-beta-sitosterol-odoo-401",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/cc2629bb-df0b-4712-946a-e90193a3a0b6/vmain-333.jpg",
      "category_id": "26e5383f-4c7d-4916-b426-3137a6f01c68",
      "stock_status": "out_of_stock",
      "description": "60 softgels",
      "tags": [
        "Meshkuj"
      ]
    },
    {
      "id": "f47d4651-c563-4e22-a7cf-99b9d7fc2a78",
      "name": "PQQ Caps Pyrroloquinoline Quinone, 10 mg, 30 vegetarian capsules",
      "slug": "pqq-caps-pyrroloquinoline-quinone-10-mg-30-vegetarian-capsules-odoo-400",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/f47d4651-c563-4e22-a7cf-99b9d7fc2a78/vmain-332.jpg",
      "category_id": "5eb71691-da97-416e-a9de-bcd8f3dabc4d",
      "stock_status": "out_of_stock",
      "description": null,
      "tags": [
        "Truri"
      ]
    },
    {
      "id": "dbb10399-c863-4f3e-8dce-e18567c6fcbb",
      "name": "Super Omega-3 EPA/DHA with Sesame Lignans & Olive Extract",
      "slug": "super-omega-3-epa-dha-with-sesame-lignans-olive-extract-odoo-402",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/dbb10399-c863-4f3e-8dce-e18567c6fcbb/vmain-334.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "out_of_stock",
      "description": "60 softgels",
      "tags": [
        "Zemra",
        "Truri",
        "Imuniteti"
      ]
    },
    {
      "id": "e1b32e5d-a62c-45cb-bf96-48f1908517e6",
      "name": "Super Selenium Complex",
      "slug": "super-selenium-complex-odoo-403",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/e1b32e5d-a62c-45cb-bf96-48f1908517e6/vmain-335.jpg",
      "category_id": "e632c652-f533-4d78-b905-f8b3d313e7d7",
      "stock_status": "out_of_stock",
      "description": "200 mcg & Vitamin E, 100 vegetarian capsules",
      "tags": [
        "Imuniteti",
        "Femra",
        "Meshkuj"
      ]
    },
    {
      "id": "4192065b-4727-4c44-a814-b30d91f61673",
      "name": "Super Vitamin E",
      "slug": "super-vitamin-e-odoo-404",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/4192065b-4727-4c44-a814-b30d91f61673/vmain-336.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "out_of_stock",
      "description": "268 mg 400 IU, 90 softgels",
      "tags": [
        "Zemra",
        "Imuniteti"
      ]
    },
    {
      "id": "90bc6ff8-25d8-4530-92a5-2fa4064d4e06",
      "name": "Super-Absorbable CoQ10 Ubiquinone with d-Limonene",
      "slug": "super-absorbable-coq10-ubiquinone-with-d-limonene-odoo-405",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/90bc6ff8-25d8-4530-92a5-2fa4064d4e06/vmain-337.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "out_of_stock",
      "description": "100 mg, 60 softgels",
      "tags": [
        "Zemra"
      ]
    },
    {
      "id": "278f6d28-312a-4722-974f-00753cc7c3e7",
      "name": "Taurine",
      "slug": "taurine-odoo-406",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/278f6d28-312a-4722-974f-00753cc7c3e7/vmain-338.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "out_of_stock",
      "description": "1000 mg, 90 vegetarian capsules",
      "tags": [
        "Zemra",
        "Truri"
      ]
    },
    {
      "id": "ed269981-e390-4313-aba6-fd81b8534e5f",
      "name": "Testosterone Elite",
      "slug": "testosterone-elite-odoo-407",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/ed269981-e390-4313-aba6-fd81b8534e5f/vmain-339.jpg",
      "category_id": "26e5383f-4c7d-4916-b426-3137a6f01c68",
      "stock_status": "out_of_stock",
      "description": "30 vegetarian capsules",
      "tags": [
        "Meshkuj"
      ]
    },
    {
      "id": "41a6c00e-0da5-4059-be3b-8916f3394321",
      "name": "Triple Action Thyroid",
      "slug": "triple-action-thyroid-odoo-408",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/41a6c00e-0da5-4059-be3b-8916f3394321/vmain-340.jpg",
      "category_id": "cf9d48e9-20cb-48e7-aeb7-d44d2d18972a",
      "stock_status": "out_of_stock",
      "description": "60 vegetarian capsules",
      "tags": [
        "Femra",
        "Meshkuj"
      ]
    },
    {
      "id": "8c219bec-8385-4f01-976c-e57bc756f04a",
      "name": "Vitamin B12",
      "slug": "vitamin-b12-odoo-409",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/8c219bec-8385-4f01-976c-e57bc756f04a/vmain-341.jpg",
      "category_id": "5eb71691-da97-416e-a9de-bcd8f3dabc4d",
      "stock_status": "out_of_stock",
      "description": "500 mcg, 100 lozenges",
      "tags": [
        "Truri",
        "Zemra"
      ]
    },
    {
      "id": "bc7b1049-038f-4174-a8ad-0c5b9522c9c9",
      "name": "Vitamin C and Quercetin Phytosome",
      "slug": "vitamin-c-and-quercetin-phytosome-odoo-410",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/bc7b1049-038f-4174-a8ad-0c5b9522c9c9/vmain-342.jpg",
      "category_id": "e632c652-f533-4d78-b905-f8b3d313e7d7",
      "stock_status": "out_of_stock",
      "description": "60 vegetarian tablets",
      "tags": [
        "Imuniteti",
        "Zemra"
      ]
    },
    {
      "id": "e3384640-0f8d-4370-b52d-e2cdff861a5b",
      "name": "Vitamins D and K",
      "slug": "vitamins-d-and-k-odoo-411",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/e3384640-0f8d-4370-b52d-e2cdff861a5b/vmain-343.jpg",
      "category_id": "6fb1ea08-c337-4ee5-b2fd-3fa689bef25b",
      "stock_status": "out_of_stock",
      "description": "60 capsules",
      "tags": [
        "Zemra",
        "Femra",
        "Imuniteti"
      ]
    },
    {
      "id": "ddd5a6d8-3c99-4147-8dd0-e57dcfa2eddc",
      "name": "Zinc Caps High Potency",
      "slug": "zinc-caps-high-potency-odoo-412",
      "base_price": 5,
      "image_url": "https://cgqrgayhpzzkruypqqyy.supabase.co/storage/v1/object/public/product-media/ddd5a6d8-3c99-4147-8dd0-e57dcfa2eddc/vmain-344.jpg",
      "category_id": "e632c652-f533-4d78-b905-f8b3d313e7d7",
      "stock_status": "out_of_stock",
      "description": "50 mg, 90 vegetarian capsules",
      "tags": [
        "Imuniteti",
        "Meshkuj"
      ]
    }
  ]
},
};
