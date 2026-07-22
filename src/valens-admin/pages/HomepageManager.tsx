import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Loader2, LayoutGrid, Monitor, ShoppingBag, Star, StarOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";
import ImageUpload from "@/valens-admin/components/ImageUpload";

const HomepageManager = () => {
  const [activeTab, setActiveTab] = useState<"banners" | "categories" | "products">("banners");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Homepage</h1>
        <p className="text-sm text-muted-foreground mt-1">Menaxhoni seksionet e faqes kryesore</p>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setActiveTab("banners")} className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors", activeTab === "banners" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <LayoutGrid size={14} className="inline mr-2" />Banners
        </button>
        <button onClick={() => setActiveTab("categories")} className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors", activeTab === "categories" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <Monitor size={14} className="inline mr-2" />Store Categories
        </button>
        <button onClick={() => setActiveTab("products")} className={cn("px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors", activeTab === "products" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
          <ShoppingBag size={14} className="inline mr-2" />Produktet në Homepage
        </button>
      </div>

      {activeTab === "banners" ? <BannersTab /> : activeTab === "categories" ? <CategoriesTab /> : <FeaturedProductsTab />}
    </div>
  );
};

// ─── Featured Products Tab ───────────────────────────────
const FeaturedProductsTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: categories = [] } = useQuery({
    queryKey: ["categories_for_filter"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products_for_homepage", categoryFilter],
    queryFn: async () => {
      let query = supabase.from("products").select("*, categories(name)").eq("is_active", true).order("name");
      if (categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const toggleFeatured = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase.from("products").update({ featured_on_homepage: featured }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products_for_homepage"] });
      toast({ title: "U përditësua" });
    },
  });

  const updateStockStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("products").update({ stock_status: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products_for_homepage"] });
      toast({ title: "Statusi u përditësua" });
    },
  });

  const featuredCount = products.filter((p: any) => p.featured_on_homepage).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="all">Të gjitha kategoritë</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="text-xs text-muted-foreground">
            {featuredCount} produkte të zgjedhura për homepage
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Produkti</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Kategoria</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Çmimi</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Statusi i stokut</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Në Homepage</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <ShoppingBag size={14} className="text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.categories?.name || "—"}</td>
                  <td className="px-5 py-3 text-sm text-foreground">€{p.base_price?.toFixed(2)}</td>
                  <td className="px-5 py-3 text-center">
                    <select
                      value={p.stock_status || "in_stock"}
                      onChange={(e) => updateStockStatus.mutate({ id: p.id, status: e.target.value })}
                      className="text-xs rounded-md border border-input bg-background px-2 py-1"
                    >
                      <option value="in_stock">Në stok</option>
                      <option value="out_of_stock">Jashtë stokut</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => toggleFeatured.mutate({ id: p.id, featured: !p.featured_on_homepage })}
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        p.featured_on_homepage
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      {p.featured_on_homepage ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Nuk ka produkte {categoryFilter !== "all" ? "në këtë kategori" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Banners Tab ─────────────────────────────────────────
const BannersTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["homepage_banners_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_banners").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("homepage_banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage_banners_admin"] });
      toast({ title: "Banner u fshi" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/90">
          <Plus size={14} /> Shto Banner
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nuk ka banner</div>
      ) : (
        <div className="space-y-3">
          {banners.map((b: any) => (
            <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
              <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center text-xs font-medium", b.section_type === "hero" ? "bg-primary/10 text-primary" : "bg-accent text-foreground")}>
                {b.section_type === "hero" ? "HERO" : "GRID"}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{b.title}</h3>
                <p className="text-xs text-muted-foreground truncate">{b.subtitle}</p>
                <div className="flex gap-2 mt-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded-full", b.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>{b.is_active ? "Aktiv" : "Joaktiv"}</span>
                  <span className="text-[10px] text-muted-foreground">Sort: {b.sort_order}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(b); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                <button onClick={() => { if (confirm("Fshi bannerin?")) deleteMutation.mutate(b.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <BannerForm banner={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const BannerForm = ({ banner, onClose }: { banner: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    section_type: banner?.section_type || "hero",
    title: banner?.title || "",
    subtitle: banner?.subtitle || "",
    description: banner?.description || "",
    image_url: banner?.image_url || "",
    link_url: banner?.link_url || "",
    link_label: banner?.link_label || "Mëso më shumë",
    secondary_link_url: banner?.secondary_link_url || "",
    secondary_link_label: banner?.secondary_link_label || "",
    bg_color: banner?.bg_color || "#f5f5f7",
    text_color: banner?.text_color || "#1d1d1f",
    btn1_bg: banner?.btn1_bg || "#0a0a0a",
    btn1_text: banner?.btn1_text || "#ffffff",
    btn2_bg: banner?.btn2_bg || "#0071e3",
    btn2_text: banner?.btn2_text || "#ffffff",
    sort_order: banner?.sort_order?.toString() || "0",
    is_active: banner?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title) { toast({ title: "Titulli është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0, description: form.description || null, image_url: form.image_url || null, link_url: form.link_url || null, secondary_link_url: form.secondary_link_url || null, secondary_link_label: form.secondary_link_label || null };
    const { error } = banner
      ? await supabase.from("homepage_banners").update(payload).eq("id", banner.id)
      : await supabase.from("homepage_banners").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: banner ? "Banner u përditësua" : "Banner u shtua" });
    queryClient.invalidateQueries({ queryKey: ["homepage_banners_admin"] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{banner ? "Ndrysho Banner" : "Shto Banner"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Lloji</label>
            <select value={form.section_type} onChange={(e) => setForm({ ...form, section_type: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="hero">Hero (Full Width)</option>
              <option value="grid">Grid (Half Width)</option>
            </select>
          </div>
          <Field label="Titulli *" value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
          <Field label="Nëntitulli" value={form.subtitle} onChange={(v) => setForm({ ...form, subtitle: v })} />
          <Field label="Përshkrimi" value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
          <ImageUpload label="Foto" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Link URL" value={form.link_url} onChange={(v) => setForm({ ...form, link_url: v })} />
            <Field label="Link Label" value={form.link_label} onChange={(v) => setForm({ ...form, link_label: v })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Secondary Link URL" value={form.secondary_link_url} onChange={(v) => setForm({ ...form, secondary_link_url: v })} />
            <Field label="Secondary Label" value={form.secondary_link_label} onChange={(v) => setForm({ ...form, secondary_link_label: v })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground">Bg Color</label>
              <input type="color" value={form.bg_color} onChange={(e) => setForm({ ...form, bg_color: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background p-1 cursor-pointer" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Text Color</label>
              <input type="color" value={form.text_color} onChange={(e) => setForm({ ...form, text_color: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background p-1 cursor-pointer" />
            </div>
            <Field label="Renditja" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} type="number" />
          </div>
          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground mb-3">Ngjyrat e butonave</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Butoni 1 — Bg</label>
                <input type="color" value={form.btn1_bg} onChange={(e) => setForm({ ...form, btn1_bg: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background p-1 cursor-pointer" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Butoni 1 — Teksti</label>
                <input type="color" value={form.btn1_text} onChange={(e) => setForm({ ...form, btn1_text: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background p-1 cursor-pointer" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Butoni 2 — Bg</label>
                <input type="color" value={form.btn2_bg} onChange={(e) => setForm({ ...form, btn2_bg: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background p-1 cursor-pointer" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Butoni 2 — Teksti</label>
                <input type="color" value={form.btn2_text} onChange={(e) => setForm({ ...form, btn2_text: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background p-1 cursor-pointer" />
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-foreground">Aktiv</span>
          </label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}{banner ? "Ruaj" : "Shto"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Store Categories Tab ────────────────────────────────
const CategoriesTab = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["store_categories_admin"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_categories").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("store_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store_categories_admin"] });
      toast({ title: "Kategoria u fshi" });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:bg-foreground/90">
          <Plus size={14} /> Shto Kategori
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Emri</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Ikona</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Renditja</th>
                <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Veprime</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat: any) => (
                <tr key={cat.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{cat.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground font-mono">{cat.icon}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground text-center">{cat.sort_order}</td>
                  <td className="px-5 py-3 text-center">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", cat.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>{cat.is_active ? "Aktiv" : "Joaktiv"}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditing(cat); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                      <button onClick={() => { if (confirm("Fshi?")) deleteMutation.mutate(cat.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && <StoreCategoryForm category={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const StoreCategoryForm = ({ category, onClose }: { category: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: category?.name || "",
    icon: category?.icon || "smartphone",
    link_url: category?.link_url || "#",
    sort_order: category?.sort_order?.toString() || "0",
    is_active: category?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name) { toast({ title: "Emri është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...form, sort_order: parseInt(form.sort_order) || 0 };
    const { error } = category
      ? await supabase.from("store_categories").update(payload).eq("id", category.id)
      : await supabase.from("store_categories").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: category ? "U përditësua" : "U shtua" });
    queryClient.invalidateQueries({ queryKey: ["store_categories_admin"] });
    setSaving(false);
    onClose();
  };

  const iconOptions = ["laptop", "smartphone", "tablet", "watch", "glasses", "headphones", "tag", "tv", "speaker", "briefcase", "gift", "monitor", "camera", "music"];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{category ? "Ndrysho" : "Shto"} Kategori</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="text-sm font-medium text-foreground">Ikona (Lucide)</label>
            <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              {iconOptions.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <Field label="Link URL" value={form.link_url} onChange={(v) => setForm({ ...form, link_url: v })} />
          <Field label="Renditja" value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} type="number" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-foreground">Aktiv</span>
          </label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}{category ? "Ruaj" : "Shto"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div>
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50" />
  </div>
);

export default HomepageManager;
