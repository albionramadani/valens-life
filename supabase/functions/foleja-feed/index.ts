import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-feed-token',
}

// ---------------------------------------------------------------------------
// Variant flattening — mirrors src/lib/variantFlatten.ts so the feed shows the
// exact same product names as the storefront ("Apple iPhone 16 128GB Black").
// ---------------------------------------------------------------------------
const MAC_SLUGS = new Set(['mac'])
const clean = (v?: string | null) => (v || '').trim()

function buildDescriptor(attrs: any, categorySlug: string, fallback: string): string {
  const a = attrs || {}
  const color = clean(a.color)
  if (MAC_SLUGS.has(categorySlug)) {
    const ram = clean(a.storage)
    const parts = [ram, color].filter(Boolean)
    return parts.length ? parts.join(' ') : clean(fallback)
  }
  const parts = [
    clean(a.storage), color, clean(a.madh_sia), clean(a.rripi),
    clean(a.lidhshm_ria), clean(a.varianti),
  ].filter(Boolean)
  return parts.length ? parts.join(' ') : clean(fallback) || clean(a.tipi)
}

const hasRealAttrs = (v: any) => !!v.attributes && Object.keys(v.attributes).length > 0
const isSellable = (v: any) => v.is_active !== false && Number(v.price) > 1

function pickBetter(a: any, b: any): any {
  const aStock = Number(a.stock) > 0 ? 1 : 0
  const bStock = Number(b.stock) > 0 ? 1 : 0
  if (aStock !== bStock) return aStock > bStock ? a : b
  return Number(a.price) >= Number(b.price) ? a : b
}

function colorImageFor(p: any, color: string): string | null {
  if (!color || !p.gallery?.length) return null
  const lc = color.toLowerCase()
  const hit = p.gallery.find((g: any) => (g.color || '').toLowerCase() === lc && g.url)
  return hit?.url || null
}

// Build the ordered image list for a card: main photo first, then the rest.
// When a variant color is known we prefer that color's photos; if a store has
// no color-tagged gallery images we fall back to the full gallery so every
// photo still shows up.
function imagesFor(p: any, color: string): string[] {
  const out: string[] = []
  const push = (u?: string | null) => {
    const v = clean(u)
    if (v && v !== '-' && !out.includes(v)) out.push(v)
  }
  const lc = (color || '').toLowerCase()
  const gallery: any[] = p.gallery || []

  // 1) Main photo first (color-specific main if available, else product main).
  push(lc ? colorImageFor(p, color) : null)
  push(p.image_url)

  // 2) Then the rest of the gallery. When a color is known, list that color's
  //    photos first, then the shared photos (color = null) that belong to every
  //    variant (lifestyle/packaging shots). This way the feed mirrors the
  //    storefront gallery: primary photo, then all secondary photos.
  if (lc) {
    const colorMatches = gallery.filter((g) => (g.color || '').toLowerCase() === lc)
    const shared = gallery.filter((g) => !clean(g.color))
    if (colorMatches.length) {
      for (const g of colorMatches) push(g.url)
      for (const g of shared) push(g.url)
    } else {
      // No color-tagged photos for this variant → fall back to the full gallery.
      for (const g of gallery) push(g.url)
    }
  } else {
    for (const g of gallery) push(g.url)
  }

  return out
}

// Build the ordered image list for a SPECIFIC variant. Images are linked to a
// variant through product_images.variant_id, so when those links exist we list
// only that variant's own photos (plus any shared, unlinked photos). This stops
// one variant from showing the photos that belong to its siblings. If the
// product has no variant links at all we fall back to the color/gallery logic.
function variantImagesFor(p: any, variantId: string | null, color: string): string[] {
  const gallery: any[] = p.gallery || []
  const hasVariantLinks = gallery.some((g) => g.variant_id)
  if (variantId && hasVariantLinks) {
    const out: string[] = []
    const push = (u?: string | null) => {
      const v = clean(u)
      if (v && v !== '-' && !out.includes(v)) out.push(v)
    }
    const own = gallery.filter((g) => g.variant_id === variantId)
    const shared = gallery.filter((g) => !g.variant_id)
    for (const g of own) push(g.url)
    for (const g of shared) push(g.url)
    if (out.length) return out
  }
  return imagesFor(p, color)
}

interface FeedItem {
  sku: string | null
  barcode: string | null
  brand: string | null
  name: string
  price: number
  sale_price: number | null
  tvsh: number | null
  description: string | null
  color: string | null
  stock: number
  in_stock: boolean
  stock_status: string
  category: string | null
  image_url: string | null
  images: string[]
  url: string
}

function flattenProduct(p: any, baseUrl: string): FeedItem[] {
  const categorySlug = (p.categories?.slug || '').toLowerCase()
  const variants = (p.variants || []).filter(isSellable)
  const realVariants = variants.filter(hasRealAttrs)

  const mk = (over: Partial<FeedItem>): FeedItem => {
    const image_url = over.image_url ?? p.image_url ?? null
    const color = (over as any)._color ?? ''
    const variantId = (over as any)._variantId ?? null
    delete (over as any)._color
    delete (over as any)._variantId
    const images = variantId
      ? variantImagesFor(p, variantId, color)
      : imagesFor(p, color)
    // Ensure the chosen main image is first.
    if (image_url && images[0] !== image_url) {
      const idx = images.indexOf(image_url)
      if (idx > 0) images.splice(idx, 1)
      images.unshift(image_url)
    }
    return {
      sku: null,
      barcode: p.barcode ?? null,
      brand: p.brand ?? null,
      name: p.name,
      price: Number(p.base_price ?? 0),
      sale_price: Number(p.sale_price) > 0 ? Number(p.sale_price) : null,
      tvsh: p.vat_rate != null ? Number(p.vat_rate) : null,
      description: p.description ?? null,
      color: color || null,
      stock: 0,
      in_stock: (p.stock_status || 'in_stock') === 'in_stock',
      stock_status: p.stock_status || 'in_stock',
      category: p.categories?.name ?? null,
      image_url,
      images,
      url: `${baseUrl}/product/${p.slug}`,
      ...over,
    }
  }

  // No meaningful variants → single product card.
  if (realVariants.length <= 1) {
    const v = variants[0]
    const stock = v ? Number(v.stock) || 0 : 0
    return [mk({
      sku: v?.sku ?? null,
      barcode: v?.barcode ?? p.barcode ?? null,
      brand: v?.brand ?? p.brand ?? null,
      price: v ? Number(v.price) || Number(p.base_price ?? 0) : Number(p.base_price ?? 0),
      stock,
      in_stock: v ? stock > 0 : (p.stock_status || 'in_stock') === 'in_stock',
      stock_status: v ? (stock > 0 ? 'in_stock' : 'out_of_stock') : (p.stock_status || 'in_stock'),
      url: v?.id ? `${baseUrl}/product/${p.slug}?v=${v.id}` : `${baseUrl}/product/${p.slug}`,
      _variantId: v?.id ?? null,
    } as any)]
  }

  // Collapse duplicates by descriptor, keeping the best variant.
  const byLabel = new Map<string, { label: string; variant: any }>()
  for (const v of realVariants) {
    const label = buildDescriptor(v.attributes, categorySlug, v.name || '')
    if (!label) continue
    const existing = byLabel.get(label)
    byLabel.set(label, { label, variant: existing ? pickBetter(existing.variant, v) : v })
  }

  return Array.from(byLabel.values()).map(({ label, variant }) => {
    const color = clean(variant.attributes?.color)
    const stock = Number(variant.stock) || 0
    const vImages = variantImagesFor(p, variant.id, color)
    return mk({
      sku: variant.sku ?? null,
      barcode: variant.barcode ?? p.barcode ?? null,
      brand: variant.brand ?? p.brand ?? null,
      name: `${p.name} ${label}`.trim(),
      price: Number(variant.price),
      color: color || null,
      stock,
      in_stock: stock > 0,
      stock_status: stock > 0 ? 'in_stock' : 'out_of_stock',
      image_url: vImages[0] || colorImageFor(p, color) || p.image_url || null,
      url: `${baseUrl}/product/${p.slug}?v=${variant.id}`,
      _color: color,
      _variantId: variant.id,
    } as any)
  })
}

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || ''
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const providedToken =
      url.searchParams.get('token') ||
      req.headers.get('x-feed-token') ||
      (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
      ''

    const { data: config } = await supabase
      .from('feed_config')
      .select('token, allowed_ips, is_active')
      .limit(1)
      .maybeSingle()

    if (!config || config.is_active === false) {
      return new Response(JSON.stringify({ error: 'Feed disabled' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Token check (constant-ish comparison)
    if (!providedToken || providedToken !== config.token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // IP allowlist (only enforced when at least one IP is configured)
    const allowed: string[] = (config.allowed_ips || []).map((s: string) => s.trim()).filter(Boolean)
    if (allowed.length > 0) {
      const ip = getClientIp(req)
      if (!ip || !allowed.includes(ip)) {
        return new Response(JSON.stringify({ error: 'Forbidden IP', ip }), {
          status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // ----- Build the feed from the same data the storefront uses -----
    // PostgREST caps each request at 1000 rows, so page through tables that can
    // exceed that (product_images has 2000+ rows) to fetch every photo.
    const fetchAll = async (table: string, columns: string, filter?: (q: any) => any) => {
      const pageSize = 1000
      let from = 0
      const all: any[] = []
      while (true) {
        let q = supabase.from(table).select(columns).range(from, from + pageSize - 1)
        if (filter) q = filter(q)
        const { data, error } = await q
        if (error) throw error
        const rows = data || []
        all.push(...rows)
        if (rows.length < pageSize) break
        from += pageSize
      }
      return all
    }

    const [products, cats, vars, imgs] = await Promise.all([
      fetchAll('products', 'id, name, slug, base_price, sale_price, image_url, stock_status, description, category_id, barcode, vat_rate, brand', (q) => q.eq('is_active', true)),
      fetchAll('categories', 'id, name, slug'),
      fetchAll('product_variants', 'id, product_id, sku, name, price, stock, attributes, color_hex, is_active, barcode, brand', (q) => q.eq('is_active', true)),
      fetchAll('product_images', 'product_id, color, url, slot, sort_order, variant_id'),
    ])

    const catById = new Map((cats || []).map((c: any) => [c.id, c]))
    const varsByProduct = new Map<string, any[]>()
    for (const v of vars || []) {
      const arr = varsByProduct.get(v.product_id) || []
      arr.push(v)
      varsByProduct.set(v.product_id, arr)
    }
    // Full gallery per product (all images, ordered by sort_order), so the feed
    // can list every photo: main first, then the rest.
    const imgsByProduct = new Map<string, any[]>()
    for (const g of imgs || []) {
      if (!g.url || g.url === '-' || g.url === '') continue
      const arr = imgsByProduct.get(g.product_id) || []
      arr.push({ color: g.color || null, url: g.url, sort_order: g.sort_order ?? 0, variant_id: g.variant_id || null })
      imgsByProduct.set(g.product_id, arr)
    }
    for (const arr of imgsByProduct.values()) {
      arr.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    }


    const baseUrl = (url.searchParams.get('base') || 'https://valens.shop').replace(/\/$/, '')
    const items: FeedItem[] = []
    for (const p of products || []) {
      const cat = p.category_id ? catById.get(p.category_id) : null
      const enriched = {
        ...p,
        categories: cat ? { name: cat.name, slug: cat.slug } : null,
        variants: varsByProduct.get(p.id) || [],
        gallery: imgsByProduct.get(p.id) || [],
      }
      items.push(...flattenProduct(enriched, baseUrl))
    }

    // Drop out-of-stock entries: anything with no stock should not appear in the feed.
    const inStock = items.filter((it) => Number(it.stock) > 0)

    inStock.sort((a, b) => a.name.localeCompare(b.name))
    const OLD_REF = 'usgreogpqvudqtxixuji'
    const NEW_REF = 'nkgjcnmuwzbnblpqrbud'
    const rewrite = (u: string | null) =>
      typeof u === 'string' && u ? u.replaceAll(OLD_REF, NEW_REF) : u
    for (const it of inStock) {
      it.image_url = rewrite(it.image_url) as string | null
      it.images = (it.images || []).map((u) => rewrite(u) as string).filter(Boolean)
    }
    const body = JSON.stringify({
      generated_at: new Date().toISOString(),
      count: inStock.length,
      currency: 'EUR',
      products: inStock,
    })

    return new Response(body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error)?.message || e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
