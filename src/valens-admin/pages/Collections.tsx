import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit, Trash2, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";
import ImageUpload from "@/valens-admin/components/ImageUpload";

const Collections = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*, product_collections(product_id)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("collections").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast({ title: "Koleksioni u fshi" });
    },
  });

  const filtered = collections.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Koleksionet</h1>
          <p className="text-sm text-muted-foreground mt-1">{collections.length} koleksione</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Shto Koleksion
        </button>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-muted-foreground" />
        <input type="text" placeholder="Kërko koleksione..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nuk ka koleksione</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="text-primary text-sm mt-2 hover:underline">Shto koleksionin e parë</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((col: any) => (
            <div key={col.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{col.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">/{col.slug}</p>
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", col.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                  {col.is_active ? "Aktiv" : "Joaktiv"}
                </span>
              </div>
              {col.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{col.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{col.product_collections?.length || 0} produkte</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => { setEditing(col); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                  <button onClick={() => { if (confirm("Fshi koleksionin?")) deleteMutation.mutate(col.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <CollectionForm collection={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const CollectionForm = ({ collection, onClose }: { collection: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: collection?.name || "",
    slug: collection?.slug || "",
    description: collection?.description || "",
    image_url: collection?.image_url || "",
    is_active: collection?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Emri është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const slug = form.slug || autoSlug(form.name);
    const payload = { name: form.name, slug, description: form.description || null, image_url: form.image_url || null, is_active: form.is_active };

    if (collection) {
      const { error } = await supabase.from("collections").update(payload).eq("id", collection.id);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Koleksioni u përditësua" });
    } else {
      const { error } = await supabase.from("collections").insert(payload);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Koleksioni u shtua" });
    }
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{collection ? "Ndrysho Koleksionin" : "Shto Koleksion"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri" value={form.name} onChange={(v) => setForm({ ...form, name: v, slug: form.slug ? form.slug : autoSlug(v) })} />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <div>
            <label className="text-sm font-medium text-foreground">Përshkrimi</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" />
          </div>
          <ImageUpload label="Foto e koleksionit" value={form.image_url} onChange={(v) => setForm({ ...form, image_url: v })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-foreground">Aktiv</span>
          </label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />} {collection ? "Ruaj" : "Shto"}
          </button>
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

export default Collections;
