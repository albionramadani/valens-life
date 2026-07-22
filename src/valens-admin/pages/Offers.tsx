import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Plus, Edit, Trash2, X, Loader2, Percent, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const Offers = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["offers"] }); toast({ title: "Oferta u fshi" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Ofertat</h1>
          <p className="text-sm text-muted-foreground mt-1">{offers.length} oferta promocionale</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Shto Ofertë
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka oferta</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((offer: any) => (
            <div key={offer.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    {offer.discount_type === "percentage" ? <Percent size={16} className="text-primary" /> : <DollarSign size={16} className="text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{offer.name}</h3>
                    <p className="text-xs text-muted-foreground">{offer.discount_type === "percentage" ? `${offer.discount_value}%` : `€${offer.discount_value}`} zbritje</p>
                  </div>
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", offer.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                  {offer.is_active ? "Aktiv" : "Joaktiv"}
                </span>
              </div>
              {offer.description && <p className="text-xs text-muted-foreground mb-3">{offer.description}</p>}
              <div className="text-xs text-muted-foreground mb-3">
                {offer.start_date && <span>Nga: {new Date(offer.start_date).toLocaleDateString("sq")}</span>}
                {offer.end_date && <span className="ml-2">Deri: {new Date(offer.end_date).toLocaleDateString("sq")}</span>}
              </div>
              {offer.min_order_amount && <p className="text-xs text-muted-foreground">Min. porosi: €{offer.min_order_amount}</p>}
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border">
                <button onClick={() => { setEditing(offer); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                <button onClick={() => { if (confirm("Fshi ofertën?")) deleteMutation.mutate(offer.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <OfferForm offer={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const OfferForm = ({ offer, onClose }: { offer: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: offer?.name || "", description: offer?.description || "",
    discount_type: offer?.discount_type || "percentage", discount_value: offer?.discount_value?.toString() || "0",
    min_order_amount: offer?.min_order_amount?.toString() || "",
    start_date: offer?.start_date?.substring(0, 10) || new Date().toISOString().substring(0, 10),
    end_date: offer?.end_date?.substring(0, 10) || "", is_active: offer?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Emri është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { name: form.name, description: form.description || null, discount_type: form.discount_type, discount_value: parseFloat(form.discount_value) || 0, min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null, start_date: form.start_date || null, end_date: form.end_date || null, is_active: form.is_active };
    const { error } = offer ? await supabase.from("offers").update(payload).eq("id", offer.id) : await supabase.from("offers").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: offer ? "Oferta u përditësua" : "Oferta u shtua" });
    queryClient.invalidateQueries({ queryKey: ["offers"] }); setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{offer ? "Ndrysho Ofertën" : "Shto Ofertë"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div><label className="text-sm font-medium text-foreground">Përshkrimi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-foreground">Lloji</label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"><option value="percentage">Përqindje (%)</option><option value="fixed">Vlerë fikse (€)</option></select></div>
            <Field label="Vlera" value={form.discount_value} onChange={(v) => setForm({ ...form, discount_value: v })} type="number" />
          </div>
          <Field label="Min. porosi (€)" value={form.min_order_amount} onChange={(v) => setForm({ ...form, min_order_amount: v })} type="number" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data e fillimit" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} type="date" />
            <Field label="Data e mbarimit" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} type="date" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /><span className="text-foreground">Aktiv</span></label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 size={14} className="animate-spin" />}{offer ? "Ruaj" : "Shto"}</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div><label className="text-sm font-medium text-foreground">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
);

export default Offers;
