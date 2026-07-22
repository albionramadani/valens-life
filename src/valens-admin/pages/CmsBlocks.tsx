import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Loader2, FileText, Globe, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const blockTypes = [{ value: "page", label: "Faqe" }, { value: "banner", label: "Banner" }, { value: "block", label: "Bllok" }, { value: "faq", label: "FAQ" }];

const CmsBlocks = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["cms_blocks"],
    queryFn: async () => { const { data, error } = await supabase.from("cms_blocks").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cms_blocks").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms_blocks"] }); toast({ title: "Blloku u fshi" }); },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, published }: { id: string; published: boolean }) => { const { error } = await supabase.from("cms_blocks").update({ is_published: published }).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cms_blocks"] }); toast({ title: "Statusi u përditësua" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground">CMS Blloqe</h1><p className="text-sm text-muted-foreground mt-1">{blocks.length} blloqe përmbajtjeje</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"><Plus size={16} /> Shto Bllok</button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka blloqe CMS</p></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Titulli</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Slug</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Lloji</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Data</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Veprime</th>
            </tr></thead>
            <tbody>
              {blocks.map((block: any) => (
                <tr key={block.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3"><div className="flex items-center gap-2"><FileText size={16} className="text-muted-foreground" /><span className="text-sm font-medium text-foreground">{block.title}</span></div></td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">/{block.slug}</td>
                  <td className="px-5 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize">{block.block_type}</span></td>
                  <td className="px-5 py-3">
                    <button onClick={() => togglePublish.mutate({ id: block.id, published: !block.is_published })} className={cn("flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full", block.is_published ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                      {block.is_published ? <><Globe size={12} /> Publikuar</> : <><EyeOff size={12} /> Draft</>}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(block.created_at).toLocaleDateString("sq")}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(block); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                      <button onClick={() => { if (confirm("Fshi bllokun?")) deleteMutation.mutate(block.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <CmsForm block={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const CmsForm = ({ block, onClose }: { block: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const autoSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const [form, setForm] = useState({
    title: block?.title || "", slug: block?.slug || "", content: block?.content || "",
    block_type: block?.block_type || "page", is_published: block?.is_published ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Titulli është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { title: form.title, slug: form.slug || autoSlug(form.title), content: form.content || null, block_type: form.block_type, is_published: form.is_published };
    const { error } = block ? await supabase.from("cms_blocks").update(payload).eq("id", block.id) : await supabase.from("cms_blocks").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: block ? "Blloku u përditësua" : "Blloku u shtua" });
    queryClient.invalidateQueries({ queryKey: ["cms_blocks"] }); setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{block ? "Ndrysho Bllokun" : "Shto Bllok"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Titulli" value={form.title} onChange={(v) => setForm({ ...form, title: v, slug: form.slug ? form.slug : autoSlug(v) })} />
          <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
          <div><label className="text-sm font-medium text-foreground">Lloji</label><select value={form.block_type} onChange={(e) => setForm({ ...form, block_type: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">{blockTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
          <div><label className="text-sm font-medium text-foreground">Përmbajtja</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[150px] font-mono" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="rounded" /><span className="text-foreground">Publiko</span></label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 size={14} className="animate-spin" />}{block ? "Ruaj" : "Shto"}</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div><label className="text-sm font-medium text-foreground">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
);

export default CmsBlocks;
