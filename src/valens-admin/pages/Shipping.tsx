import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Loader2, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const Shipping = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["shipping_methods"],
    queryFn: async () => { const { data, error } = await supabase.from("shipping_methods").select("*").order("price"); if (error) throw error; return data; },
  });

  const { data: thresholdSetting } = useQuery({
    queryKey: ["store_settings", "free_delivery_threshold"],
    queryFn: async () => {
      const { data, error } = await supabase.from("store_settings").select("*").eq("key", "free_delivery_threshold").maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [thresholdValue, setThresholdValue] = useState("");
  const [savingThreshold, setSavingThreshold] = useState(false);

  const saveThreshold = async () => {
    const val = parseFloat(thresholdValue);
    if (isNaN(val) || val < 0) { toast({ title: "Vlerë e pavlefshme", variant: "destructive" }); return; }
    setSavingThreshold(true);
    const { error } = thresholdSetting
      ? await supabase.from("store_settings").update({ value: val.toString() }).eq("id", thresholdSetting.id)
      : await supabase.from("store_settings").insert({ key: "free_delivery_threshold", value: val.toString(), category: "shipping" });
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSavingThreshold(false); return; }
    toast({ title: "U ruajt" });
    queryClient.invalidateQueries({ queryKey: ["store_settings", "free_delivery_threshold"] });
    setSavingThreshold(false);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("shipping_methods").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["shipping_methods"] }); toast({ title: "Metoda u fshi" }); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground">Transporti</h1><p className="text-sm text-muted-foreground mt-1">Menaxhoni metodat e transportit</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"><Plus size={16} /> Shto Metodë</button>
      </div>

      {/* Free delivery threshold */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Dërgesa Falas</h2>
        <div className="flex items-end gap-3">
          <div className="flex-1 max-w-xs">
            <label className="text-xs text-muted-foreground">Vlera minimum e porosisë për dërgesë falas (€)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              defaultValue={thresholdSetting?.value || ""}
              onChange={(e) => setThresholdValue(e.target.value)}
              className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              placeholder="p.sh. 50"
            />
          </div>
          <button
            onClick={saveThreshold}
            disabled={savingThreshold}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {savingThreshold && <Loader2 size={14} className="animate-spin" />}
            Ruaj
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Vendosni 0 për të çaktivizuar dërgesën falas.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : methods.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka metoda transporti</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {methods.map((m: any) => (
            <div key={m.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Truck size={18} className="text-primary" /></div>
                  <div><h3 className="text-sm font-semibold text-foreground">{m.name}</h3><p className="text-lg font-bold text-foreground">€{Number(m.price).toFixed(2)}</p></div>
                </div>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", m.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>{m.is_active ? "Aktiv" : "Joaktiv"}</span>
              </div>
              {m.description && <p className="text-xs text-muted-foreground mb-2">{m.description}</p>}
              {m.estimated_days && <p className="text-xs text-muted-foreground">⏱ {m.estimated_days}</p>}
              {m.zones && <p className="text-xs text-muted-foreground">📍 {m.zones}</p>}
              <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t border-border">
                <button onClick={() => { setEditing(m); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                <button onClick={() => { if (confirm("Fshi metodën?")) deleteMutation.mutate(m.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <ShippingForm method={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const ShippingForm = ({ method, onClose }: { method: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: method?.name || "", description: method?.description || "",
    price: method?.price?.toString() || "0", estimated_days: method?.estimated_days || "",
    zones: method?.zones || "", is_active: method?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: "Emri është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { name: form.name, description: form.description || null, price: parseFloat(form.price) || 0, estimated_days: form.estimated_days || null, zones: form.zones || null, is_active: form.is_active };
    const { error } = method ? await supabase.from("shipping_methods").update(payload).eq("id", method.id) : await supabase.from("shipping_methods").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: method ? "Metoda u përditësua" : "Metoda u shtua" });
    queryClient.invalidateQueries({ queryKey: ["shipping_methods"] }); setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{method ? "Ndrysho Metodën" : "Shto Metodë"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div><label className="text-sm font-medium text-foreground">Përshkrimi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[50px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Çmimi (€)" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
            <Field label="Kohëzgjatja" value={form.estimated_days} onChange={(v) => setForm({ ...form, estimated_days: v })} />
          </div>
          <Field label="Zonat (p.sh. Kosovë, Shqipëri)" value={form.zones} onChange={(v) => setForm({ ...form, zones: v })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /><span className="text-foreground">Aktiv</span></label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 size={14} className="animate-spin" />}{method ? "Ruaj" : "Shto"}</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div><label className="text-sm font-medium text-foreground">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
);

export default Shipping;
