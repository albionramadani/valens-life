import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ===== Odoo instance connection (loaded per-request from public.odoo_config) =====
let ODOO_URL = 'https://valens.odoo.com'
let ODOO_DB = 'valens'
let ODOO_USERNAME = 'pleurat.halili@novus.ch'


const IMAGE_FIELD = 'image_1024'
const BUCKET = 'product-media'
const MISSING = '-' // sentinel for "no image in Odoo" so we don't retry forever

async function authenticateXmlRpc(password: string): Promise<number> {
  const xml = `<?xml version="1.0"?>
<methodCall><methodName>authenticate</methodName><params>
<param><value><string>${escapeXml(ODOO_DB)}</string></value></param>
<param><value><string>${escapeXml(ODOO_USERNAME)}</string></value></param>
<param><value><string>${escapeXml(password)}</string></value></param>
<param><value><struct></struct></value></param>
</params></methodCall>`
  const response = await fetch(`${ODOO_URL}/xmlrpc/2/common`, {
    method: 'POST', headers: { 'Content-Type': 'text/xml' }, body: xml,
  })
  const text = await response.text()
  const intMatch = text.match(/<int>(\d+)<\/int>/)
  if (!intMatch) throw new Error(`Auth failed: ${text.substring(0, 300)}`)
  return parseInt(intMatch[1])
}

async function jsonRpcCall(uid: number, password: string, model: string, method: string, args: any[], kwargs: any = {}) {
  const response = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 2,
      params: { service: 'object', method: 'execute_kw', args: [ODOO_DB, uid, password, model, method, args, kwargs] },
    }),
  })
  const data = await response.json()
  if (data.error) throw new Error(`RPC error: ${JSON.stringify(data.error)}`)
  return data.result
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function slugify(str: string, suffix: string | number): string {
  const base = (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'
  return `${base}-odoo-${suffix}`
}

function stockStatus(qty: number): string {
  return qty > 0 ? 'in_stock' : 'out_of_stock'
}

function realPrice(value: unknown): number | null {
  const price = Number(value) || 0
  return price > 0 ? price : null
}

// Every product/variant must carry a price so it is never hidden by the
// storefront filters. Unpriced (0 / null) items fall back to a 1-euro floor.
const PRICE_FLOOR = 1
function pricedOr1(value: unknown): number {
  const p = realPrice(value)
  return p !== null ? p : PRICE_FLOOR
}

// Map Odoo attribute names -> frontend selector keys
function attrKey(odooAttrName: string): string {
  const n = (odooAttrName || '').toLowerCase()
  if (n.includes('ngjyr') || n.includes('color')) return 'color'
  if (n.includes('memor') || n.includes('storage') || n.includes('hapësir') || n.includes('hapesir')) return 'storage'
  return n.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'option'
}

// Decide which of the 6 fixed store categories a product belongs to.
// Many real devices (iPhone 17 Pro Max, MacBook, iPad, Apple Watch…) have an
// EMPTY category in Odoo, so we classify primarily by NAME and use the Odoo
// category path only as a secondary hint. Anything that is an accessory or that
// we cannot confidently place as a device -> 'aksesore'.
function classifyCategory(catPath: string, name: string): string {
  const n = (name || '').toLowerCase()
  const c = (catPath || '').toLowerCase()

  // 1) Audio devices first (their names often contain "Case" = the charging case)
  const isAudioDevice = (n.includes('airpods') || n.includes('earpods')) &&
    !n.includes('charging') && !n.includes('cable') && !n.includes('stand') && !n.includes('strap')
  if (isAudioDevice) return 'airpods'
  const isBeatsAudio = n.includes('beats') &&
    !n.includes('case') && !n.includes('iphone') && !n.includes('ipad') &&
    !n.includes('cable') && !n.includes('protector') && !n.includes('charging')
  if (isBeatsAudio) return 'airpods'

  // 2) Accessory keywords (in the product name) -> Aksesorë
  const accHints = [
    'case', 'cover', 'folio', 'bumper', 'strap', 'band', 'loop',
    'screen protector', 'tempered glass', 'glass', 'cable', 'adapter',
    'charger', 'charging', 'power adapter', 'keyboard', 'mouse', 'trackpad',
    'pencil', 'stand', 'hub', 'airtag', 'polishing', 'remote', 'battery',
    'tips', 'apple tv', 'dock', 'protector', 'wallet', 'cardholder',
    'key ring', 'for iphone', 'for ipad', 'for apple watch', 'for mac',
  ]
  if (accHints.some((k) => n.includes(k))) return 'aksesore'

  // 3) Accessory categories from Odoo -> Aksesorë
  const accCats = [
    'accessor', 'cases', 'cables', 'chargers', 'magic keyboard',
    'magic mouse', 'apple pencil', 'watch bands', 'polishing', 'third-party',
    'satechi', 'belkin', 'dviced', 'jlab', 'logitech', 'health', 'ultrahuman',
    'withings', 'apple tv', 'airtag', 'beats accessories',
  ]
  if (accCats.some((k) => c.includes(k))) return 'aksesore'

  // 4) Pure devices (by name, then category path)
  if (n.includes('macbook') || n.includes('imac') || n.includes('mac mini') ||
      n.includes('mac studio') || c === 'mac' || c.startsWith('mac /') || c.startsWith('mac/')) return 'mac'
  if (n.includes('ipad') || c.startsWith('ipad')) return 'ipad'
  if (n.includes('iphone') || c.startsWith('iphone')) return 'iphone'
  if (n.includes('watch') || c.includes('watch')) return 'watch'

  // 5) Fallback
  return 'aksesore'
}

// Extract the leaf sub-category from an Odoo category path
// (e.g. "All / Saleable / Accessories / Cases & Covers" -> "Cases & Covers").
// Generic top-level segments are ignored so we only keep a real sub-category.
function subcategoryFor(catPath: string): string | null {
  const segments = String(catPath || '')
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
  if (segments.length < 2) return null
  const leaf = segments[segments.length - 1]
  const generic = new Set([
    'all', 'saleable', 'accessories', 'accessory', 'aksesore', 'aksesorë',
    'expenses', 'internal', 'products', 'product',
  ])
  if (generic.has(leaf.toLowerCase())) return null
  return leaf
}

function b64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\s/g, '')
  const bin = atob(clean)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    const doSync = url.searchParams.get('sync') === 'true'
    const imagesLimit = Math.min(parseInt(url.searchParams.get('images') || '0') || 0, 60)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Load Odoo connection settings from odoo_config (fallback to env vars)
    const { data: connCfg } = await supabase
      .from('odoo_config')
      .select('server_url, database_name, username, api_key')
      .limit(1)
      .maybeSingle()

    if (connCfg?.server_url) ODOO_URL = String(connCfg.server_url).replace(/\/+$/, '')
    if (connCfg?.database_name) ODOO_DB = String(connCfg.database_name)
    if (connCfg?.username) ODOO_USERNAME = String(connCfg.username)

    const password = (connCfg?.api_key && String(connCfg.api_key).trim())
      || Deno.env.get('ODOO_PASSWORD')
      || ''
    if (!password) throw new Error('Odoo password/API key not configured (odoo_config.api_key or ODOO_PASSWORD)')

    const uid = await authenticateXmlRpc(password)


    // ============ IMAGE DOWNLOAD ONLY (queue worker) ============
    // When called with images=N and not sync, just process pending images.
    if (!doSync && imagesLimit > 0) {
      const processed = await downloadPendingImages(supabase, uid, password, imagesLimit)
      const { count } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('url', '')
      return new Response(JSON.stringify({ success: true, images_downloaded: processed, images_pending: count ?? 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // scope controls which kind of automatic sync runs:
    //   qty      -> only stock quantities
    //   prices   -> only prices from the "Valens Retail" pricelist
    //   products -> full product/variant/image sync WITHOUT touching prices
    //   all      -> manual full sync incl. prices (admin "Sinkronizo tani" button)
    // Intervals + enable flags are read from public.odoo_config; cron ticks are
    // gated by those settings. ?force=true bypasses the interval/enabled check
    // (used by the "Run now" buttons in the admin UI).
    const scope = url.searchParams.get('scope') || 'all'
    const force = url.searchParams.get('force') === 'true'

    const { data: cfgRow } = await supabase
      .from('odoo_config')
      .select('id, sync_qty_enabled, sync_prices_enabled, sync_products_enabled, qty_interval_minutes, prices_interval_minutes, products_interval_minutes, last_qty_sync_at, last_prices_sync_at, last_products_sync_at')
      .limit(1)
      .maybeSingle()

    const shouldRun = (enabled: boolean | null | undefined, intervalMin: number | null | undefined, lastAt: string | null | undefined) => {
      if (force) return true
      if (enabled === false) return false
      const interval = Math.max(1, Number(intervalMin) || 0)
      if (!lastAt) return true
      const elapsedMs = Date.now() - new Date(lastAt).getTime()
      return elapsedMs >= interval * 60_000
    }

    if (doSync && scope === 'qty') {
      if (!shouldRun(cfgRow?.sync_qty_enabled, cfgRow?.qty_interval_minutes, cfgRow?.last_qty_sync_at)) {
        return new Response(JSON.stringify({ success: true, scope: 'qty', skipped: true, reason: 'not_due' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const result = await runQtySync(supabase, uid, password)
      if (cfgRow) await supabase.from('odoo_config').update({ last_qty_sync_at: new Date().toISOString() }).eq('id', cfgRow.id)
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (doSync && scope === 'prices') {
      if (!shouldRun(cfgRow?.sync_prices_enabled, cfgRow?.prices_interval_minutes, cfgRow?.last_prices_sync_at)) {
        return new Response(JSON.stringify({ success: true, scope: 'prices', skipped: true, reason: 'not_due' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const result = await runPriceSync(supabase, uid, password)
      if (cfgRow) await supabase.from('odoo_config').update({ last_prices_sync_at: new Date().toISOString() }).eq('id', cfgRow.id)
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (doSync && scope === 'products') {
      if (!shouldRun(cfgRow?.sync_products_enabled, cfgRow?.products_interval_minutes, cfgRow?.last_products_sync_at)) {
        return new Response(JSON.stringify({ success: true, scope: 'products', skipped: true, reason: 'not_due' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // For the "products" cron we keep prices managed exclusively by the pricelist sync.
    const includePrices = scope === 'all'

    // ============ FETCH CATALOG ============
    const templates = await jsonRpcCall(uid, password, 'product.template', 'search_read',
      [[['sale_ok', '=', true]]],
      { fields: ['name', 'list_price', 'default_code', 'description_sale', 'categ_id', 'qty_available', 'active', 'barcode', 'taxes_id', 'product_tag_ids'], limit: 1000 })

    const variants = await jsonRpcCall(uid, password, 'product.product', 'search_read',
      [[['sale_ok', '=', true]]],
      { fields: ['display_name', 'name', 'lst_price', 'list_price', 'default_code', 'qty_available', 'active', 'barcode', 'product_tmpl_id', 'product_template_variant_value_ids'], limit: 2000 })

    if (!doSync) {
      return new Response(JSON.stringify({
        success: true,
        total_products: templates.length,
        total_variants: variants.length,
        products: templates.slice(0, 50).map((p: any) => ({ id: p.id, name: p.name, price: p.list_price, sku: p.default_code, category: p.categ_id?.[1] || null, stock: p.qty_available })),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ============ SYNC MODE ============
    // 1) STORE CATEGORIES — the storefront's own category rows (Zemra, Truri,
    //    Gjumi, Meshkuj, Femra, Imuniteti, …). A product is linked to a category
    //    automatically by matching its tags against these rows (by name or slug);
    //    the matched category id becomes the product's primary category_id. We do
    //    NOT create categories from Odoo.
    const { data: fixedCats } = await supabase.from('categories').select('id, slug, name')
    const fixedCatMap = new Map<string, string>((fixedCats || []).map((c: any) => [c.slug, c.id]))
    // Accent/case-insensitive lookup: normalized name/slug -> category id.
    const normCat = (s: string) => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase()
    const catIdByLabel = new Map<string, string>()
    for (const c of (fixedCats || [])) {
      if (c.slug) catIdByLabel.set(normCat(c.slug), c.id)
      if (c.name) catIdByLabel.set(normCat(c.name), c.id)
    }

    // 1b) VAT RATES — resolve the % amount for every sales tax referenced by the
    //     templates so we can store a plain number (e.g. 8 or 18) per product.
    const taxIds = new Set<number>()
    for (const t of templates) for (const id of (t.taxes_id || [])) taxIds.add(id)
    const taxAmount = new Map<number, number>()
    const taxArr = Array.from(taxIds)
    for (let i = 0; i < taxArr.length; i += 200) {
      const recs = await jsonRpcCall(uid, password, 'account.tax', 'read',
        [taxArr.slice(i, i + 200)], { fields: ['amount', 'amount_type'] }).catch(() => [])
      for (const r of recs) {
        if (r.amount_type && r.amount_type !== 'percent') continue
        taxAmount.set(r.id, Number(r.amount) || 0)
      }
    }
    // Pick the first percentage tax of a template as its VAT rate.
    function vatFor(t: any): number | null {
      for (const id of (t.taxes_id || [])) {
        if (taxAmount.has(id)) return taxAmount.get(id)!
      }
      return null
    }

    // 1c) BRANDS — read the brand per template. Guarded: if the Odoo brand module
    //     (product_brand_id) is not present the read throws, so we swallow the error
    //     and simply leave brand untouched (existing brands stay intact on upsert).
    const brandByTmpl = new Map<number, string>()
    {
      const tmplIds = templates.map((t: any) => t.id)
      for (let i = 0; i < tmplIds.length; i += 200) {
        const recs = await jsonRpcCall(uid, password, 'product.template', 'read',
          [tmplIds.slice(i, i + 200)], { fields: ['product_brand_id'] }).catch(() => [])
        for (const r of recs) {
          const b = Array.isArray(r.product_brand_id) ? String(r.product_brand_id[1] || '').trim() : ''
          if (b) brandByTmpl.set(r.id, b)
        }
      }
    }

    // 1d) CATEGORIES-AS-TAGS — a Valens product can belong to several categories
    //     (up to 4-5), entered in Odoo as "Product Tags" (product_tag_ids). We
    //     resolve their display names so the storefront can show a chip per
    //     category. Guarded: if the tag model is missing the read is skipped.
    const tagName = new Map<number, string>()      // product.tag id -> name
    {
      const tagIds = new Set<number>()
      for (const t of templates) for (const id of (t.product_tag_ids || [])) tagIds.add(id)
      const tagArr = Array.from(tagIds)
      for (let i = 0; i < tagArr.length; i += 200) {
        const recs = await jsonRpcCall(uid, password, 'product.tag', 'read',
          [tagArr.slice(i, i + 200)], { fields: ['name'] }).catch(() => [])
        for (const r of recs) {
          const nm = String(r.name || '').trim()
          if (nm) tagName.set(r.id, nm)
        }
      }
    }

    // Short display name: Odoo names carry the size/packaging as a suffix that
    // matches the sales description (e.g. "…, 90 vegetarian capsules"). We move
    // that detail out of the name so the card shows a clean product name and the
    // size lives in the short description instead. Only strips when the sales
    // description is actually the trailing part of the name — otherwise untouched.
    const shortName = (rawName: string, saleDesc: string | null): string => {
      const n = (rawName || '').trim()
      const d = (saleDesc || '').trim()
      if (d && n.length > d.length && n.toLowerCase().endsWith(d.toLowerCase())) {
        const cut = n.slice(0, n.length - d.length).replace(/[\s,;:·—–-]+$/, '').trim()
        if (cut) return cut
      }
      return n
    }


    // 2) PRODUCTS (templates)
    const tmplSlug = new Map<number, string>()
    const productRows = templates.map((t: any) => {
      const slug = slugify(t.name || `product-${t.id}`, t.id)
      tmplSlug.set(t.id, slug)
      const catName = Array.isArray(t.categ_id) ? String(t.categ_id[1] || '') : ''
      // Demo units from Odoo (e.g. "... (Demo)") must never appear on the web.
      const isDemo = /\(\s*demo\s*\)/i.test(t.name || '')
      // Categories shown on the web = the product's tags, de-duplicated
      // (case-insensitive) while preserving first-seen order.
      const tags: string[] = []
      const seenTags = new Set<string>()
      for (const id of (t.product_tag_ids || [])) {
        const v = (tagName.get(id) || '').trim()
        if (!v) continue
        const key = v.toLowerCase()
        if (seenTags.has(key)) continue
        seenTags.add(key)
        tags.push(v)
      }
      // Primary category_id is derived automatically from the tags: the first
      // tag that matches an existing store category (by name or slug) wins.
      // Falls back to the Odoo-category classification when no tag matches.
      let catUuid: string | null = null
      for (const tg of tags) {
        const hit = catIdByLabel.get(normCat(tg))
        if (hit) { catUuid = hit; break }
      }
      if (!catUuid) catUuid = fixedCatMap.get(classifyCategory(catName, t.name || '')) || null
      const row: any = {
        name: shortName(t.name, t.description_sale) || `Product ${t.id}`, slug, odoo_id: t.id,
        description: t.description_sale || null,
        tags,
        barcode: (t.barcode && String(t.barcode).trim()) || null,
        vat_rate: vatFor(t),
        subcategory: subcategoryFor(catName),
        category_id: catUuid, stock_status: stockStatus(t.qty_available || 0), is_active: t.active !== false && !isDemo,
      }
      if (brandByTmpl.has(t.id)) row.brand = brandByTmpl.get(t.id)
      // Prices come from the pricelist sync; only the manual full sync sets them
      // here. A 0 / missing price is floored to 1 euro so the product still shows.
      if (includePrices) {
        row.base_price = pricedOr1(t.list_price)
      }
      return row
    })
    let productsSynced = 0
    for (let i = 0; i < productRows.length; i += 100) {
      const { error } = await supabase.from('products').upsert(productRows.slice(i, i + 100), { onConflict: 'slug' })
      if (error) console.error('Product upsert:', error.message); else productsSynced += Math.min(100, productRows.length - i)
    }
    const { data: dbProducts } = await supabase.from('products').select('id, odoo_id')
    const odooTmplToUuid = new Map<number, string>((dbProducts || []).filter((p: any) => p.odoo_id).map((p: any) => [p.odoo_id, p.id]))

    // 3) VARIANTS with attributes (color + hex, storage)
    const allValIds = new Set<number>()
    for (const v of variants) for (const id of (v.product_template_variant_value_ids || [])) allValIds.add(id)
    const valMap = new Map<number, { attr: string; name: string; hex: string | null }>()
    const valArr = Array.from(allValIds)
    for (let i = 0; i < valArr.length; i += 200) {
      const recs = await jsonRpcCall(uid, password, 'product.template.attribute.value', 'read', [valArr.slice(i, i + 200)], { fields: ['name', 'attribute_id', 'html_color'] })
      for (const r of recs) valMap.set(r.id, { attr: r.attribute_id?.[1] || '', name: r.name, hex: r.html_color || null })
    }

    // 3b) DEFAULT STORAGE from the parent template.
    // Some Odoo products (e.g. iPhone 16 base) keep their single memory option as a
    // NON-variant attribute, so it never appears on product.product variants. We read
    // the template's attribute lines and, when a memory/storage attribute has exactly
    // ONE value, use it as the default storage for every variant of that template.
    const tmplDefaultStorage = new Map<number, string>()
    {
      const tmplIds = templates.map((t: any) => t.id)
      const attrLines: any[] = []
      for (let i = 0; i < tmplIds.length; i += 200) {
        const recs = await jsonRpcCall(uid, password, 'product.template.attribute.line', 'search_read',
          [[['product_tmpl_id', 'in', tmplIds.slice(i, i + 200)]]],
          { fields: ['product_tmpl_id', 'attribute_id', 'value_ids'] }).catch(() => [])
        attrLines.push(...recs)
      }
      // Resolve attribute value names (product.attribute.value) for storage lines.
      const storageLines = attrLines.filter((l: any) => attrKey(l.attribute_id?.[1] || '') === 'storage')
      const avIds = new Set<number>()
      for (const l of storageLines) for (const id of (l.value_ids || [])) avIds.add(id)
      const avName = new Map<number, string>()
      const avArr = Array.from(avIds)
      for (let i = 0; i < avArr.length; i += 200) {
        const recs = await jsonRpcCall(uid, password, 'product.attribute.value', 'read',
          [avArr.slice(i, i + 200)], { fields: ['name'] }).catch(() => [])
        for (const r of recs) avName.set(r.id, r.name)
      }
      for (const l of storageLines) {
        const vals = l.value_ids || []
        if (vals.length !== 1) continue // only when there is a single memory option
        const name = avName.get(vals[0])
        const tmplId = Array.isArray(l.product_tmpl_id) ? l.product_tmpl_id[0] : null
        if (name && tmplId) tmplDefaultStorage.set(tmplId, name)
      }
    }

    const variantRows: any[] = []
    // odoo product.product id -> color name (used to attach a color to images)
    const variantColorByOdoo = new Map<number, string | null>()
    for (const v of variants) {
      const tmplId = v.product_tmpl_id?.[0]
      const productId = tmplId ? odooTmplToUuid.get(tmplId) : null
      if (!productId) continue
      const sku = (v.default_code && String(v.default_code).trim()) || `ODOO-VAR-${v.id}`
      const attributes: Record<string, string> = {}
      let colorHex: string | null = null
      const labelParts: string[] = []
      for (const id of (v.product_template_variant_value_ids || [])) {
        const val = valMap.get(id); if (!val) continue
        const key = attrKey(val.attr)
        attributes[key] = val.name
        labelParts.push(val.name)
        if (key === 'color' && val.hex) colorHex = val.hex
      }
      // Fill in the default memory from the template when the variant has none.
      if (!attributes.storage && tmplId && tmplDefaultStorage.has(tmplId)) {
        attributes.storage = tmplDefaultStorage.get(tmplId)!
      }
      variantColorByOdoo.set(v.id, attributes.color || null)
      const vr: any = {
        product_id: productId, odoo_id: v.id, sku,
        name: labelParts.length ? labelParts.join(' / ') : 'Standard',
        barcode: (v.barcode && String(v.barcode).trim()) || null,
        stock: Math.max(0, Math.round(v.qty_available || 0)),
        attributes, color_hex: colorHex, is_active: v.active !== false,
      }
      if (tmplId && brandByTmpl.has(tmplId)) vr.brand = brandByTmpl.get(tmplId)
      // Prices come from the pricelist sync; only the manual full sync sets them
      // here. A 0 / missing price is floored to 1 euro so the variant still shows.
      if (includePrices) {
        const price = realPrice(v.lst_price) ?? realPrice(v.list_price)
        vr.price = price !== null ? price : PRICE_FLOOR
      }
      variantRows.push(vr)
    }
    // Dedupe by SKU — Odoo can expose the same default_code on multiple variants.
    // We collapse them into one row and SUM the stock so totals stay accurate.
    const bySku = new Map<string, any>()
    for (const r of variantRows) {
      const existing = bySku.get(r.sku)
      if (existing) {
        existing.stock += r.stock
        if (!existing.color_hex && r.color_hex) existing.color_hex = r.color_hex
        if (!existing.barcode && r.barcode) existing.barcode = r.barcode
        if (!existing.brand && r.brand) existing.brand = r.brand
        if (existing.name === 'Standard' && r.name !== 'Standard') existing.name = r.name
      } else {
        bySku.set(r.sku, { ...r })
      }
    }
    const dedupedVariants = Array.from(bySku.values())
    let variantsSynced = 0
    for (let i = 0; i < dedupedVariants.length; i += 100) {
      const { error } = await supabase.from('product_variants').upsert(dedupedVariants.slice(i, i + 100), { onConflict: 'sku' })
      if (error) console.error('Variant upsert:', error.message); else variantsSynced += Math.min(100, dedupedVariants.length - i)
    }
    const { data: dbVariants } = await supabase.from('product_variants').select('id, odoo_id, product_id')
    const odooVarToUuid = new Map<number, string>((dbVariants || []).filter((v: any) => v.odoo_id).map((v: any) => [v.odoo_id, v.id]))
    const odooVarToProduct = new Map<number, string>((dbVariants || []).filter((v: any) => v.odoo_id).map((v: any) => [v.odoo_id, v.product_id]))

    // 4) QUEUE IMAGES (metadata only, no binary download here)
    // Image model the user asked for:
    //   - "default" template images (no color)  -> shown directly on the product
    //   - per-color images: ONE main render per color (slot 1) + up to 4 gallery
    //     templates per color. We only ever pull a single resolution (image_1024)
    //     per color, never the 512/256 duplicates.
    const imageRows: any[] = []
    // 4a) variant main image -> slot 1, ONE per (product, color)
    const seenColorMain = new Set<string>()
    for (const v of variants) {
      const vuuid = odooVarToUuid.get(v.id); if (!vuuid) continue
      const puuid = odooVarToProduct.get(v.id)
      const color = variantColorByOdoo.get(v.id) || null
      // only one main image per color (storage variants reuse the same render)
      const dedupeKey = `${puuid}|${color ?? '_default'}`
      if (color && seenColorMain.has(dedupeKey)) continue
      seenColorMain.add(dedupeKey)
      imageRows.push({
        product_id: puuid, variant_id: vuuid, slot: 1, url: '', color,
        alt: v.display_name || v.name, sort_order: 1,
        odoo_ref: color ? `cmain-${puuid}-${color}` : `vmain-${v.id}`,
        odoo_model: 'product.product', odoo_src_id: v.id, odoo_field: IMAGE_FIELD,
      })
    }
    // 4b) product.image gallery — up to 4 templates per color, defaults stay color=null
    const tmplIds = templates.map((t: any) => t.id)
    let galleryImgs: any[] = []
    for (let i = 0; i < tmplIds.length; i += 200) {
      const recs = await jsonRpcCall(uid, password, 'product.image', 'search_read',
        [[['product_tmpl_id', 'in', tmplIds.slice(i, i + 200)]]],
        { fields: ['name', 'sequence', 'product_variant_id', 'product_tmpl_id'], limit: 5000 }).catch(() => [])
      galleryImgs = galleryImgs.concat(recs)
    }
    const colorGalleryCount = new Map<string, number>() // limit 4 per color
    for (const g of galleryImgs) {
      const tmplId = Array.isArray(g.product_tmpl_id) ? g.product_tmpl_id[0] : null
      const puuid = tmplId ? odooTmplToUuid.get(tmplId) : null
      if (!puuid) continue
      const varOdoo = Array.isArray(g.product_variant_id) ? g.product_variant_id[0] : null
      const vuuid = varOdoo ? odooVarToUuid.get(varOdoo) || null : null
      const color = varOdoo ? variantColorByOdoo.get(varOdoo) || null : null
      if (color) {
        const key = `${puuid}|${color}`
        const n = colorGalleryCount.get(key) || 0
        if (n >= 4) continue // max 4 templates per color
        colorGalleryCount.set(key, n + 1)
      }
      const slot = g.sequence || 0
      imageRows.push({
        product_id: puuid, variant_id: vuuid, slot, url: '', color,
        alt: g.name || null, sort_order: slot,
        odoo_ref: `pimg-${g.id}`, odoo_model: 'product.image', odoo_src_id: g.id, odoo_field: IMAGE_FIELD,
      })
    }
    let imagesQueued = 0
    for (let i = 0; i < imageRows.length; i += 200) {
      const { error } = await supabase.from('product_images').upsert(imageRows.slice(i, i + 200), { onConflict: 'odoo_ref', ignoreDuplicates: true })
      if (error) console.error('Image queue:', error.message); else imagesQueued += Math.min(200, imageRows.length - i)
    }

    // 5) Download pending images. A full product sync pulls them all by default
    //    (in small batches, time-bounded) so photos appear without needing a
    //    separate ?images= call; an explicit ?images=N still caps the amount.
    let imagesDownloaded = 0
    const imageBudget = imagesLimit > 0 ? imagesLimit : (doSync ? 500 : 0)
    if (imageBudget > 0) {
      const startedAt = Date.now()
      let batch = 0
      do {
        const take = Math.min(20, imageBudget - imagesDownloaded)
        if (take <= 0) break
        batch = await downloadPendingImages(supabase, uid, password, take)
        imagesDownloaded += batch
      } while (batch > 0 && imagesDownloaded < imageBudget && (Date.now() - startedAt) < 110000)
    }

    // 6) last sync — track both a global last_sync_at (manual full sync) and per-scope timestamps
    const nowIso = new Date().toISOString()
    const update: Record<string, string> = { last_products_sync_at: nowIso }
    if (scope === 'all') {
      update.last_sync_at = nowIso
      update.last_qty_sync_at = nowIso
      update.last_prices_sync_at = nowIso
    }
    if (cfgRow) await supabase.from('odoo_config').update(update).eq('id', cfgRow.id)

    const { count: pending } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('url', '')

    // Product-level fields (name, tags, short description) do not flow through the
    // stock/price RPCs, so their changes would otherwise never reach the storefront
    // cache. Rebuild it explicitly at the end of a product sync.
    const { error: cacheErr } = await supabase.rpc('rebuild_storefront_page_cache')
    if (cacheErr) console.error('Cache rebuild:', cacheErr.message)

    return new Response(JSON.stringify({
      success: true,
      categories: fixedCatMap.size, products_synced: productsSynced, variants_synced: variantsSynced,
      images_queued: imageRows.length, images_downloaded: imagesDownloaded, images_pending: pending ?? 0,
      message: `${productsSynced} produkte, ${variantsSynced} variante. Imazhe: ${imagesDownloaded} u shkarkuan, ${pending ?? 0} në pritje.`,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Odoo error:', error)
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

// Download up to `limit` pending images (url='') from Odoo and upload to storage.
async function downloadPendingImages(supabase: any, uid: number, password: string, limit: number): Promise<number> {
  const { data: pending } = await supabase
    .from('product_images')
    .select('id, product_id, variant_id, slot, odoo_model, odoo_src_id, odoo_field, odoo_ref')
    .eq('url', '')
    .not('odoo_src_id', 'is', null)
    .order('slot')
    .limit(limit)
  if (!pending || !pending.length) return 0

  let done = 0
  for (const row of pending) {
    try {
      const recs = await jsonRpcCall(uid, password, row.odoo_model, 'read', [[row.odoo_src_id]], { fields: [row.odoo_field] })
      const b64 = recs?.[0]?.[row.odoo_field]
      if (!b64 || typeof b64 !== 'string') {
        await supabase.from('product_images').update({ url: MISSING }).eq('id', row.id)
        continue
      }
      const bytes = b64ToBytes(b64)
      const path = `${row.product_id}/${row.odoo_ref}.jpg`
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: true })
      if (upErr) { console.error('upload', upErr.message); continue }
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
      const publicUrl = pub.publicUrl
      await supabase.from('product_images').update({ url: publicUrl }).eq('id', row.id)
      // set product thumbnail from slot-1 variant image if missing
      if (row.slot === 1 && row.product_id) {
        await supabase.from('products').update({ image_url: publicUrl }).eq('id', row.product_id).is('image_url', null)
      }
      done++
    } catch (e) {
      console.error('img dl', row.odoo_ref, e instanceof Error ? e.message : e)
    }
  }
  return done
}

// ============ QTY-ONLY SYNC (cron every 3 minutes) ============
// Pulls only stock quantities from Odoo and applies them in ONE bulk DB call,
// so the storefront cache is rebuilt at most once (only when something changed).
async function runQtySync(supabase: any, uid: number, password: string) {
  const variants = await jsonRpcCall(uid, password, 'product.product', 'search_read',
    [[['sale_ok', '=', true]]],
    { fields: ['default_code', 'qty_available'], limit: 3000 })

  const bySku = new Map<string, number>()
  for (const v of variants) {
    const sku = (v.default_code && String(v.default_code).trim()) || `ODOO-VAR-${v.id}`
    const qty = Math.max(0, Math.round(v.qty_available || 0))
    bySku.set(sku, (bySku.get(sku) || 0) + qty)
  }
  const updates = Array.from(bySku.entries()).map(([sku, stock]) => ({ sku, stock }))

  const { data, error } = await supabase.rpc('apply_variant_stock', { p: updates })
  if (error) throw new Error('Stock update: ' + error.message)

  return {
    success: true, scope: 'qty', variants_checked: updates.length, rows_updated: data ?? 0,
    message: `Sasitë u kontrolluan (${updates.length} variante, ${data ?? 0} ndryshuan).`,
  }
}

// ============ PRICE-ONLY SYNC from the "Valens Retail" pricelist (cron every 24h) ============
// Reads fixed prices from the pricelist and applies them in ONE bulk DB call.
// Products not present in the pricelist keep their current price untouched.
const PRICELIST_NAME = 'Valens Retail'

async function runPriceSync(supabase: any, uid: number, password: string) {
  const pls = await jsonRpcCall(uid, password, 'product.pricelist', 'search_read',
    [[['name', '=', PRICELIST_NAME]]], { fields: ['id', 'name'], limit: 1 })
  if (!pls || !pls.length) throw new Error(`Pricelist "${PRICELIST_NAME}" nuk u gjet në Odoo`)
  const plId = pls[0].id

  const items = await jsonRpcCall(uid, password, 'product.pricelist.item', 'search_read',
    [[['pricelist_id', '=', plId]]],
    { fields: ['applied_on', 'product_tmpl_id', 'product_id', 'compute_price', 'fixed_price', 'min_quantity', 'date_start', 'date_end'], limit: 10000 })

  const now = new Date()
  const variantFixed = new Map<number, number>() // product.product id -> price
  const tmplFixed = new Map<number, number>()     // product.template id -> price
  for (const it of items) {
    if (it.compute_price !== 'fixed') continue
    if ((it.min_quantity || 0) > 1) continue
    if (it.date_start && new Date(it.date_start) > now) continue
    if (it.date_end && new Date(it.date_end) < now) continue
    const price = Number(it.fixed_price) || 0
    if (price <= 0) continue
    if (it.applied_on === '0_product_variant' && Array.isArray(it.product_id)) {
      variantFixed.set(it.product_id[0], price)
    } else if (it.applied_on === '1_product' && Array.isArray(it.product_tmpl_id)) {
      tmplFixed.set(it.product_tmpl_id[0], price)
    }
  }

  const { data: dbProducts } = await supabase.from('products').select('id, odoo_id')
  const uuidToTmpl = new Map<string, number>((dbProducts || []).filter((p: any) => p.odoo_id).map((p: any) => [p.id, p.odoo_id]))
  const { data: dbVariants } = await supabase.from('product_variants').select('sku, odoo_id, product_id')

  const updates: any[] = []
  for (const v of (dbVariants || [])) {
    let price: number | undefined
    if (v.odoo_id && variantFixed.has(v.odoo_id)) {
      price = variantFixed.get(v.odoo_id)
    } else {
      const tmpl = v.product_id ? uuidToTmpl.get(v.product_id) : undefined
      if (tmpl && tmplFixed.has(tmpl)) price = tmplFixed.get(tmpl)
    }
    if (price !== undefined) updates.push({ sku: v.sku, price })
  }

  if (!updates.length) {
    return { success: true, scope: 'prices', priced: 0, rows_updated: 0,
      message: `Asnjë çmim fiks i gjetur në pricelist "${PRICELIST_NAME}".` }
  }

  const { data, error } = await supabase.rpc('apply_pricelist_prices', { p: updates })
  if (error) throw new Error('Price update: ' + error.message)

  return {
    success: true, scope: 'prices', priced: updates.length, rows_updated: data ?? 0,
    message: `Çmimet u përditësuan nga "${PRICELIST_NAME}" (${updates.length} të vendosura, ${data ?? 0} ndryshuan).`,
  }
}
