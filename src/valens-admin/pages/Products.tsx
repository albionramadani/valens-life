import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit, Trash2, X, Loader2, Package, ChevronLeft, ChevronRight } from "lucide-react";
import ImageUpload from "@/valens-admin/components/ImageUpload";
import ProductGalleryManager from "@/valens-admin/components/ProductGalleryManager";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";
import { useColorPalette } from "@/valens-admin/hooks/useColorPalette";

const ColorAttrSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const { palette } = useColorPalette();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-0.5 w-full h-8 rounded-lg border border-input bg-background px-2 text-xs">
      <option value="">— Zgjidh —</option>
      {palette.map((c) => (
        <option key={c.name} value={c.name}>{c.name}</option>
      ))}
      {value && !palette.some((c) => c.name === value) && (
        <option value={value}>{value} (custom)</option>
      )}
    </select>
  );
};

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  base_price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  categories: { name: string } | null;
  product_variants: { id: string; sku: string; name: string; price: number; stock: number; is_active: boolean; attributes: Record<string, string> | null }[];
}

const Products = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showVariants, setShowVariants] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const PAGE_SIZE = 25;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name), product_variants(id, sku, name, price, stock, is_active, attributes)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Product[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Delete a product together with its variants & images (no FK cascade in DB).
  const deleteProductIds = async (ids: string[]) => {
    if (!ids.length) return;
    await supabase.from("product_images").delete().in("product_id", ids);
    await supabase.from("product_variants").delete().in("product_id", ids);
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) throw error;
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductIds([id]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produkti u fshi me sukses" });
    },
    onError: (e: any) => toast({ title: "Gabim: " + e.message, variant: "destructive" }),
  });

  const uniqueCategories = ["all", ...new Set(products.map((p) => p.categories?.name).filter(Boolean) as string[])];

  const filtered = useMemo(() => products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || p.categories?.name === categoryFilter;
    return matchSearch && matchCategory;
  }), [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [search, categoryFilter]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageIds = paginated.map((p) => p.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  const toggleOne = (id: string) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const togglePage = () => setSelected((prev) => {
    const next = new Set(prev);
    if (allPageSelected) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    return next;
  });
  const selectAllFiltered = () => setSelected(new Set(filtered.map((p) => p.id)));
  const clearSelection = () => setSelected(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    if (!confirm(`Fshi ${ids.length} produkte? Kjo fshin edhe variantet & fotot e tyre.`)) return;
    setBulkDeleting(true);
    try {
      // delete in chunks to stay within URL limits
      for (let i = 0; i < ids.length; i += 100) {
        await deleteProductIds(ids.slice(i, i + 100));
      }
      toast({ title: `${ids.length} produkte u fshinë` });
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (e: any) {
      toast({ title: "Gabim: " + e.message, variant: "destructive" });
    } finally {
      setBulkDeleting(false);
    }
  };

  const totalStock = (p: Product) => p.product_variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Produktet</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} produkte në katalog</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} />
          Shto Produkt
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-muted-foreground" />
          <input type="text" placeholder="Kërko produkte..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
        </div>
        {uniqueCategories.length > 1 && (
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1 flex-wrap">
            {uniqueCategories.map((cat) => (
              <button key={cat} onClick={() => setCategoryFilter(cat)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize", categoryFilter === cat ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk selection toolbar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between gap-3 flex-wrap bg-accent/40 border border-border rounded-lg px-4 py-2.5">
          <p className="text-sm text-foreground font-medium">{selected.size} të zgjedhura</p>
          <div className="flex items-center gap-2">
            {selected.size < filtered.length && (
              <button onClick={selectAllFiltered} className="text-xs text-primary hover:underline">Zgjidh të gjitha ({filtered.length})</button>
            )}
            <button onClick={clearSelection} className="text-xs text-muted-foreground hover:text-foreground">Pastro</button>
            <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-1.5 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-destructive/90 disabled:opacity-50">
              {bulkDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              Fshi të zgjedhurat
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nuk u gjet asnjë produkt</p>
          <button onClick={() => { setEditingProduct(null); setShowForm(true); }} className="text-primary text-sm mt-2 hover:underline">Shto produktin e parë</button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" checked={allPageSelected} onChange={togglePage} className="rounded cursor-pointer" aria-label="Zgjidh faqen" />
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Produkti</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Kategoria</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Variante</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Çmimi bazë</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Stoku</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((product) => (
                  <tr key={product.id} className={cn("border-b border-border last:border-0 hover:bg-accent/30 transition-colors", selected.has(product.id) && "bg-accent/20")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(product.id)} onChange={() => toggleOne(product.id)} className="rounded cursor-pointer" aria-label={`Zgjidh ${product.name}`} />
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.slug}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{product.categories?.name || "—"}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground text-center">
                      <button onClick={() => setShowVariants(product.id)} className="text-primary hover:underline">{product.product_variants?.length || 0}</button>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground text-right">€{Number(product.base_price).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={cn("text-sm font-medium", totalStock(product) < 10 ? "text-destructive" : totalStock(product) < 20 ? "text-amber-600" : "text-foreground")}>{totalStock(product)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>{product.is_active ? "Aktiv" : "Joaktiv"}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditingProduct(product); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                        <button onClick={() => { if (confirm("Jeni i sigurt?")) deleteMutation.mutate(product.id); }} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} nga {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"><ChevronLeft size={16} /></button>
              <span className="text-xs text-foreground px-2">Faqja {page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-md border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}


      {showForm && <ProductForm product={editingProduct} categories={categories} onClose={() => setShowForm(false)} />}
      {showVariants && <VariantsModal productId={showVariants} products={products} onClose={() => setShowVariants(null)} />}
    </div>
  );
};

// Product Form Modal
const ProductForm = ({ product, categories, onClose }: { product: Product | null; categories: any[]; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    base_price: product?.base_price?.toString() || "0",
    image_url: product?.image_url || "",
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  // Inline variant/stock management
  const [variants, setVariants] = useState(product?.product_variants || []);
  const [editingVIdx, setEditingVIdx] = useState<number | null>(null);
  const [variantForm, setVariantForm] = useState({ sku: "", name: "", price: "0", stock: "0", attributes: {} as Record<string, string> });
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [savingVariant, setSavingVariant] = useState(false);

  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Emri është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const slug = form.slug || autoSlug(form.name);
    const payload = { name: form.name, slug, description: form.description || null, category_id: form.category_id || null, base_price: parseFloat(form.base_price) || 0, image_url: form.image_url || null, is_active: form.is_active };

    if (product) {
      const { error } = await supabase.from("products").update(payload).eq("id", product.id);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Produkti u përditësua" });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Produkti u shtua" });
    }
    queryClient.invalidateQueries({ queryKey: ["products"] });
    setSaving(false);
    onClose();
  };

  const resetVariantForm = () => {
    setVariantForm({ sku: "", name: "", price: "0", stock: "0", attributes: {} });
    setEditingVIdx(null);
    setShowAddVariant(false);
  };

  const startEditVariant = (v: any, idx: number) => {
    setVariantForm({ sku: v.sku, name: v.name, price: String(v.price), stock: String(v.stock), attributes: v.attributes || {} });
    setEditingVIdx(idx);
    setShowAddVariant(true);
  };

  const handleSaveVariant = async () => {
    if (!variantForm.sku || !variantForm.name) { toast({ title: "SKU dhe emri janë të detyrueshëm", variant: "destructive" }); return; }
    if (!product) { toast({ title: "Ruani produktin fillimisht", variant: "destructive" }); return; }
    setSavingVariant(true);
    const attrs: Record<string, string> = {};
    Object.entries(variantForm.attributes).forEach(([k, v]) => { if (v.trim()) attrs[k] = v.trim(); });
    const payload = {
      product_id: product.id, sku: variantForm.sku, name: variantForm.name,
      price: parseFloat(variantForm.price) || 0, stock: parseInt(variantForm.stock) || 0,
      attributes: Object.keys(attrs).length > 0 ? attrs : {},
    };

    if (editingVIdx !== null && variants[editingVIdx]) {
      const { error } = await supabase.from("product_variants").update(payload).eq("id", variants[editingVIdx].id);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSavingVariant(false); return; }
      toast({ title: "Varianti u përditësua" });
    } else {
      const { error } = await supabase.from("product_variants").insert(payload);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSavingVariant(false); return; }
      toast({ title: "Varianti u shtua" });
    }
    queryClient.invalidateQueries({ queryKey: ["products"] });
    const { data: updatedVariants } = await supabase.from("product_variants").select("id, sku, name, price, stock, is_active, attributes").eq("product_id", product.id).order("price");
    if (updatedVariants) setVariants(updatedVariants as any);
    resetVariantForm();
    setSavingVariant(false);
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("Fshi variantin?")) return;
    await supabase.from("product_variants").delete().eq("id", id);
    setVariants((prev) => prev.filter((v) => v.id !== id));
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast({ title: "Varianti u fshi" });
  };

  const handleStockChange = async (id: string, newStock: number) => {
    const stock = Math.max(0, newStock);
    await supabase.from("product_variants").update({ stock }).eq("id", id);
    setVariants((prev) => prev.map((v) => v.id === id ? { ...v, stock } : v));
    queryClient.invalidateQueries({ queryKey: ["products", "inventory"] });
  };

  const setAttr = (key: string, value: string) => {
    setVariantForm((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{product ? "Ndrysho Produktin" : "Shto Produkt"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: form.slug ? form.slug : autoSlug(v) })} />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <div>
            <label className="text-sm font-medium text-foreground">Kategoria</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">Pa kategori</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Field label="Çmimi bazë (€)" value={form.base_price} onChange={(v) => setForm({ ...form, base_price: v })} type="number" />
          <ImageUpload label="Foto kryesore (fallback)" value={form.image_url || ""} onChange={(v) => setForm({ ...form, image_url: v })} />
          <ProductGalleryManager productId={product?.id || null} onPrimaryChange={(url) => { if (url && url !== form.image_url) setForm((f) => ({ ...f, image_url: url })); }} />
          <div>
            <label className="text-sm font-medium text-foreground">Përshkrimi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-foreground">Aktiv</span>
          </label>

          {/* Inline Stock / Variants Section */}
          {product && (
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package size={16} /> Variantet & Stoku
                </h3>
                {!showAddVariant && (
                  <button onClick={() => { resetVariantForm(); setShowAddVariant(true); }} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Plus size={12} /> Shto variant
                  </button>
                )}
              </div>

              {variants.length === 0 && !showAddVariant && (
                <p className="text-xs text-muted-foreground text-center py-4">Nuk ka variante. Shtoni një variant për të menaxhuar stokun.</p>
              )}

              {variants.length > 0 && (
                <div className="space-y-2 mb-3">
                  {variants.map((v, idx) => (
                    <div key={v.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-foreground">{v.name}</span>
                          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{v.sku}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">€{Number(v.price).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => handleStockChange(v.id, v.stock - 1)} className="w-6 h-6 rounded border border-border hover:bg-accent text-xs font-medium flex items-center justify-center">−</button>
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleStockChange(v.id, parseInt(e.target.value) || 0)}
                          className="w-14 h-6 text-center text-xs border border-border rounded bg-background"
                        />
                        <button onClick={() => handleStockChange(v.id, v.stock + 1)} className="w-6 h-6 rounded border border-border hover:bg-accent text-xs font-medium flex items-center justify-center">+</button>
                      </div>
                      <div className="flex gap-0.5 shrink-0">
                        <button onClick={() => startEditVariant(v, idx)} className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={12} /></button>
                        <button onClick={() => handleDeleteVariant(v.id)} className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddVariant && (
                <div className="space-y-3 p-3 bg-muted/20 rounded-xl border border-border">
                  <h4 className="text-xs font-semibold text-foreground">{editingVIdx !== null ? "Ndrysho variantin" : "Shto variant të ri"}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="SKU *" value={variantForm.sku} onChange={(v) => setVariantForm({ ...variantForm, sku: v })} />
                    <Field label="Emri *" value={variantForm.name} onChange={(v) => setVariantForm({ ...variantForm, name: v })} />
                    <Field label="Çmimi (€)" value={variantForm.price} onChange={(v) => setVariantForm({ ...variantForm, price: v })} type="number" />
                    <Field label="Stoku" value={variantForm.stock} onChange={(v) => setVariantForm({ ...variantForm, stock: v })} type="number" />
                  </div>
                  <div className="border-t border-border pt-2">
                    <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Atributet</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {VARIANT_ATTR_KEYS.map((key) => (
                        <div key={key}>
                          <label className="text-[10px] font-medium text-muted-foreground">{ATTR_LABELS[key]}</label>
                          {key === "color" ? (
                            <ColorAttrSelect value={variantForm.attributes[key] || ""} onChange={(v) => setAttr(key, v)} />
                          ) : (
                            <input type="text" value={variantForm.attributes[key] || ""} onChange={(e) => setAttr(key, e.target.value)}
                              placeholder={key === "storage" ? "p.sh. 512GB" : ""}
                              className="mt-0.5 w-full h-8 rounded-lg border border-input bg-background px-2 text-xs" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={resetVariantForm} className="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-accent">Anulo</button>
                    <button onClick={handleSaveVariant} disabled={savingVariant} className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1">
                      {savingVariant && <Loader2 size={12} className="animate-spin" />} {editingVIdx !== null ? "Ruaj" : "Shto"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {product ? "Ruaj" : "Shto"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Attribute keys available for variants
const VARIANT_ATTR_KEYS = ["color", "chip", "storage", "ram", "size", "connectivity"];
const ATTR_LABELS: Record<string, string> = { color: "Ngjyra", chip: "Çipi", storage: "Hapësira", ram: "RAM", size: "Madhësia", connectivity: "Lidhja" };

// Variants Modal
const VariantsModal = ({ productId, products, onClose }: { productId: string; products: Product[]; onClose: () => void }) => {
  const product = products.find((p) => p.id === productId);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [editingVariant, setEditingVariant] = useState<any>(null);
  const [variantForm, setVariantForm] = useState({ sku: "", name: "", price: "0", stock: "0", attributes: {} as Record<string, string> });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setVariantForm({ sku: "", name: "", price: "0", stock: "0", attributes: {} });
    setEditingVariant(null);
    setShowAdd(false);
  };

  const startEdit = (v: any) => {
    setVariantForm({
      sku: v.sku, name: v.name, price: String(v.price), stock: String(v.stock),
      attributes: v.attributes || {},
    });
    setEditingVariant(v);
    setShowAdd(true);
  };

  const handleSaveVariant = async () => {
    if (!variantForm.sku || !variantForm.name) { toast({ title: "SKU dhe emri janë të detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    // Clean empty attributes
    const attrs: Record<string, string> = {};
    Object.entries(variantForm.attributes).forEach(([k, v]) => { if (v.trim()) attrs[k] = v.trim(); });

    const payload = {
      product_id: productId, sku: variantForm.sku, name: variantForm.name,
      price: parseFloat(variantForm.price) || 0, stock: parseInt(variantForm.stock) || 0,
      attributes: Object.keys(attrs).length > 0 ? attrs : {},
    };

    if (editingVariant) {
      const { error } = await supabase.from("product_variants").update(payload).eq("id", editingVariant.id);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Varianti u përditësua" });
    } else {
      const { error } = await supabase.from("product_variants").insert(payload);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Varianti u shtua" });
    }
    queryClient.invalidateQueries({ queryKey: ["products"] });
    resetForm();
    setSaving(false);
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm("Fshi variantin?")) return;
    await supabase.from("product_variants").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["products"] });
    toast({ title: "Varianti u fshi" });
  };

  const setAttr = (key: string, value: string) => {
    setVariantForm((prev) => ({ ...prev, attributes: { ...prev.attributes, [key]: value } }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Variantet: {product?.name}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5">
          {product?.product_variants?.length === 0 && !showAdd ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nuk ka variante. Shtoni një variant.</p>
          ) : (
            <div className="space-y-3 mb-4">
              {product?.product_variants?.map((v) => {
                const attrs = v.attributes || {};
                return (
                  <div key={v.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{v.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{v.sku}</span>
                      </div>
                      {Object.keys(attrs).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {Object.entries(attrs).map(([k, val]) => (
                            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                              {ATTR_LABELS[k] || k}: {val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">€{Number(v.price).toLocaleString()}</p>
                      <p className={cn("text-xs", v.stock < 10 ? "text-destructive" : "text-muted-foreground")}>Stoku: {v.stock}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => startEdit(v)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                      <button onClick={() => handleDeleteVariant(v.id)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showAdd ? (
            <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border">
              <h3 className="text-sm font-semibold text-foreground">{editingVariant ? "Ndrysho variantin" : "Shto variant të ri"}</h3>
              <div className="grid grid-cols-2 gap-3">
                <Field label="SKU *" value={variantForm.sku} onChange={(v) => setVariantForm({ ...variantForm, sku: v })} />
                <Field label="Emri *" value={variantForm.name} onChange={(v) => setVariantForm({ ...variantForm, name: v })} />
                <Field label="Çmimi (€)" value={variantForm.price} onChange={(v) => setVariantForm({ ...variantForm, price: v })} type="number" />
                <Field label="Stoku" value={variantForm.stock} onChange={(v) => setVariantForm({ ...variantForm, stock: v })} type="number" />
              </div>
              <div className="border-t border-border pt-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Atributet</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {VARIANT_ATTR_KEYS.map((key) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-muted-foreground">{ATTR_LABELS[key]}</label>
                      {key === "color" ? (
                        <div className="mt-1"><ColorAttrSelect value={variantForm.attributes[key] || ""} onChange={(v) => setAttr(key, v)} /></div>
                      ) : (
                        <input
                          type="text"
                          value={variantForm.attributes[key] || ""}
                          onChange={(e) => setAttr(key, e.target.value)}
                          placeholder={key === "storage" ? "p.sh. 512GB" : key === "ram" ? "p.sh. 18GB" : key === "chip" ? "p.sh. M4 Pro" : ""}
                          className="mt-1 w-full h-9 rounded-lg border border-input bg-background px-2.5 text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={resetForm} className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
                <button onClick={handleSaveVariant} disabled={saving} className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1">
                  {saving && <Loader2 size={14} className="animate-spin" />} {editingVariant ? "Ruaj" : "Shto"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => { resetForm(); setShowAdd(true); }} className="flex items-center gap-2 text-sm text-primary hover:underline"><Plus size={14} /> Shto variant</button>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
  </div>
);

export default Products;
