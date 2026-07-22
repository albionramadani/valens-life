import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Loader2, Copy, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const Coupons = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("coupons").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["coupons"] }); toast({ title: "Kuponi u fshi" }); },
  });

  const filtered = coupons.filter((c: any) => c.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground">Kuponët</h1><p className="text-sm text-muted-foreground mt-1">{coupons.length} kuponë</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"><Plus size={16} /> Shto Kupon</button>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-muted-foreground" />
        <input type="text" placeholder="Kërko kuponë..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka kuponë</p></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Kodi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Zbritja</th>
              <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Përdorime</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Vlefshmëria</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Veprime</th>
            </tr></thead>
            <tbody>
              {filtered.map((coupon: any) => (
                <tr key={coupon.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-foreground bg-muted px-2 py-0.5 rounded">{coupon.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(coupon.code); toast({ title: "Kodi u kopjua" }); }} className="text-muted-foreground hover:text-foreground"><Copy size={12} /></button>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `€${coupon.discount_value}`}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground text-center">{coupon.used_count}{coupon.max_uses ? `/${coupon.max_uses}` : ""}</td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {coupon.end_date ? `Deri ${new Date(coupon.end_date).toLocaleDateString("sq")}` : "Pa limit"}
                  </td>
                  <td className="px-5 py-3"><span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", coupon.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>{coupon.is_active ? "Aktiv" : "Joaktiv"}</span></td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(coupon); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                      <button onClick={() => { if (confirm("Fshi kuponin?")) deleteMutation.mutate(coupon.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && <CouponForm coupon={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const CouponForm = ({ coupon, onClose }: { coupon: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    code: coupon?.code || "", description: coupon?.description || "",
    discount_type: coupon?.discount_type || "percentage", discount_value: coupon?.discount_value?.toString() || "0",
    min_order_amount: coupon?.min_order_amount?.toString() || "", max_uses: coupon?.max_uses?.toString() || "",
    start_date: coupon?.start_date?.substring(0, 10) || new Date().toISOString().substring(0, 10),
    end_date: coupon?.end_date?.substring(0, 10) || "", is_active: coupon?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const generateCode = () => { const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; let code = ""; for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]; setForm({ ...form, code }); };

  const handleSave = async () => {
    if (!form.code.trim()) { toast({ title: "Kodi është i detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { code: form.code.toUpperCase(), description: form.description || null, discount_type: form.discount_type, discount_value: parseFloat(form.discount_value) || 0, min_order_amount: form.min_order_amount ? parseFloat(form.min_order_amount) : null, max_uses: form.max_uses ? parseInt(form.max_uses) : null, start_date: form.start_date || null, end_date: form.end_date || null, is_active: form.is_active };
    const { error } = coupon ? await supabase.from("coupons").update(payload).eq("id", coupon.id) : await supabase.from("coupons").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: coupon ? "Kuponi u përditësua" : "Kuponi u shtua" });
    queryClient.invalidateQueries({ queryKey: ["coupons"] }); setSaving(false); onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{coupon ? "Ndrysho Kuponin" : "Shto Kupon"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div><label className="text-sm font-medium text-foreground">Kodi</label><div className="flex gap-2 mt-1"><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono" placeholder="SUMMER2026" /><button onClick={generateCode} className="px-3 h-10 rounded-lg border border-border text-xs hover:bg-accent">Gjenero</button></div></div>
          <div><label className="text-sm font-medium text-foreground">Përshkrimi</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[50px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-foreground">Lloji</label><select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"><option value="percentage">%</option><option value="fixed">€</option></select></div>
            <Field label="Vlera" value={form.discount_value} onChange={(v) => setForm({ ...form, discount_value: v })} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Min. porosi (€)" value={form.min_order_amount} onChange={(v) => setForm({ ...form, min_order_amount: v })} type="number" />
            <Field label="Max. përdorime" value={form.max_uses} onChange={(v) => setForm({ ...form, max_uses: v })} type="number" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fillimi" value={form.start_date} onChange={(v) => setForm({ ...form, start_date: v })} type="date" />
            <Field label="Mbarimi" value={form.end_date} onChange={(v) => setForm({ ...form, end_date: v })} type="date" />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /><span className="text-foreground">Aktiv</span></label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">{saving && <Loader2 size={14} className="animate-spin" />}{coupon ? "Ruaj" : "Shto"}</button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div><label className="text-sm font-medium text-foreground">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
);

export default Coupons;
