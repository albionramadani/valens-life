import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, X, Loader2, CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const BankSettings = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gateways = [], isLoading } = useQuery({
    queryKey: ["payment_gateway"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_gateway").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("payment_gateway").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment_gateway"] });
      toast({ title: "Gateway u fshi" });
    },
  });

  const toggleActive = async (gw: any) => {
    await supabase.from("payment_gateway").update({ is_active: !gw.is_active }).eq("id", gw.id);
    queryClient.invalidateQueries({ queryKey: ["payment_gateway"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Payment Gateway</h1>
          <p className="text-sm text-muted-foreground mt-1">Konfiguroni gateway-t e pagesave online</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus size={16} /> Shto Gateway
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : gateways.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground">Nuk ka gateway të konfiguruar</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="text-primary text-sm mt-2 hover:underline">Shto gateway-n e parë</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gateways.map((gw: any) => (
            <div key={gw.id} className={cn("bg-card border rounded-xl p-5", gw.is_active ? "border-primary" : "border-border")}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{gw.gateway_name}</h3>
                    <p className="text-xs text-muted-foreground">Merchant: {gw.merchant_id}</p>
                  </div>
                </div>
                <button onClick={() => toggleActive(gw)} title={gw.is_active ? "Çaktivizo" : "Aktivizo"}>
                  {gw.is_active
                    ? <ToggleRight size={24} className="text-primary" />
                    : <ToggleLeft size={24} className="text-muted-foreground" />
                  }
                </button>
              </div>
              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Key:</span>
                  <span className="font-mono text-foreground text-xs">{gw.api_key ? "••••" + gw.api_key.slice(-4) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Secret Key:</span>
                  <span className="font-mono text-foreground text-xs">{gw.secret_key ? "••••" + gw.secret_key.slice(-4) : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", gw.mode === "live" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {gw.mode === "live" ? "Live" : "Test"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 pt-3 border-t border-border">
                <button onClick={() => { setEditing(gw); setShowForm(true); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Edit size={14} /></button>
                <button onClick={() => { if (confirm("Fshi gateway-n?")) deleteMutation.mutate(gw.id); }} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && <GatewayForm gateway={editing} onClose={() => setShowForm(false)} />}
    </div>
  );
};

const GatewayForm = ({ gateway, onClose }: { gateway: any; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({
    gateway_name: gateway?.gateway_name || "",
    merchant_id: gateway?.merchant_id || "",
    api_key: gateway?.api_key || "",
    secret_key: gateway?.secret_key || "",
    mode: gateway?.mode || "test",
    is_active: gateway?.is_active ?? false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.gateway_name || !form.merchant_id) {
      toast({ title: "Emri i gateway dhe Merchant ID janë të detyrueshme", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = { ...form, api_key: form.api_key || null, secret_key: form.secret_key || null };
    const { error } = gateway
      ? await supabase.from("payment_gateway").update(payload).eq("id", gateway.id)
      : await supabase.from("payment_gateway").insert(payload);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    toast({ title: gateway ? "Gateway u përditësua" : "Gateway u shtua" });
    queryClient.invalidateQueries({ queryKey: ["payment_gateway"] });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">{gateway ? "Ndrysho Gateway" : "Shto Gateway"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Emri i Gateway *" value={form.gateway_name} onChange={(v) => setForm({ ...form, gateway_name: v })} placeholder="p.sh. Stripe, PayPal" />
          <Field label="Merchant ID *" value={form.merchant_id} onChange={(v) => setForm({ ...form, merchant_id: v })} />
          <Field label="API Key" value={form.api_key} onChange={(v) => setForm({ ...form, api_key: v })} />
          <Field label="Secret Key" value={form.secret_key} onChange={(v) => setForm({ ...form, secret_key: v })} type="password" />
          <div>
            <label className="text-sm font-medium text-foreground">Mode</label>
            <select value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="test">Test</option>
              <option value="live">Live</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
            <span className="text-foreground">Aktiv</span>
          </label>
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}{gateway ? "Ruaj" : "Shto"}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div>
    <label className="text-sm font-medium text-foreground">{label}</label>
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
  </div>
);

export default BankSettings;
