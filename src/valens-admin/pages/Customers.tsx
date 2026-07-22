import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, Edit, Trash2, X, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const Customers = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*, orders(id, total)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast({ title: "Klienti u fshi" });
    },
  });

  const filtered = customers.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Klientët</h1>
          <p className="text-sm text-muted-foreground mt-1">{customers.length} klientë të regjistruar</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <UserPlus size={16} /> Shto Klient
        </button>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 max-w-sm">
        <Search size={16} className="text-muted-foreground" />
        <input type="text" placeholder="Kërko klientë..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nuk ka klientë</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="text-primary text-sm mt-2 hover:underline">Shto klientin e parë</button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Klienti</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Telefoni</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Porosi</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Total i shpenzuar</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Regjistruar</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Veprime</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer: any) => {
                  const orderCount = customer.orders?.length || 0;
                  const totalSpent = customer.orders?.reduce((sum: number, o: any) => sum + Number(o.total), 0) || 0;
                  return (
                    <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                            {customer.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{customer.name}</p>
                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{customer.phone || "—"}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground text-center">{orderCount}</td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground text-right">€{totalSpent.toLocaleString()}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(customer.created_at).toLocaleDateString("sq")}</td>
                      <td className="px-5 py-3">
                        <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                          customer.status === "vip" ? "bg-purple-100 text-purple-700" :
                          customer.status === "active" ? "bg-emerald-100 text-emerald-700" :
                          "bg-blue-100 text-blue-700"
                        )}>{customer.status}</span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditing(customer); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                          <button onClick={() => { if (confirm("Fshi klientin?")) deleteMutation.mutate(customer.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showForm && <CustomerForm customer={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const CustomerForm = ({ customer, onClose }: { customer: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    city: customer?.city || "",
    country: customer?.country || "Kosovo",
    status: customer?.status || "active",
    notes: customer?.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { toast({ title: "Emri dhe email janë të detyrueshëm", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...form, phone: form.phone || null, address: form.address || null, city: form.city || null, notes: form.notes || null };

    if (customer) {
      const { error } = await supabase.from("customers").update(payload).eq("id", customer.id);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Klienti u përditësua" });
    } else {
      const { error } = await supabase.from("customers").insert(payload);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "Klienti u shtua" });
    }
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{customer ? "Ndrysho Klientin" : "Shto Klient"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <Field label="Telefoni" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Adresa" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Qyteti" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Field label="Shteti" value={form.country} onChange={(v) => setForm({ ...form, country: v })} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Statusi</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="new">I ri</option>
              <option value="active">Aktiv</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Shënime</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" />
          </div>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />} {customer ? "Ruaj" : "Shto"}
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

export default Customers;
