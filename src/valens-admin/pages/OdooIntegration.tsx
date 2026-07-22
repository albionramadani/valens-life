import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Link2, RefreshCw, Save, Package, Tag, Boxes } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

type Scope = "qty" | "prices" | "products" | "all";

const SCOPE_META: Record<Exclude<Scope, "all">, { title: string; description: string; icon: any; enabledKey: string; intervalKey: string; lastKey: string }> = {
  qty: {
    title: "Sasitë (stoku)",
    description: "Përditëson vetëm sasitë e stokut nga Odoo.",
    icon: Boxes,
    enabledKey: "sync_qty_enabled",
    intervalKey: "qty_interval_minutes",
    lastKey: "last_qty_sync_at",
  },
  prices: {
    title: "Çmimet (pricelist)",
    description: "Merr çmimet fikse nga pricelist-i \"Valens Retail\".",
    icon: Tag,
    enabledKey: "sync_prices_enabled",
    intervalKey: "prices_interval_minutes",
    lastKey: "last_prices_sync_at",
  },
  products: {
    title: "Produktet e reja (fetch i plotë)",
    description: "Sinkronizim i plotë i produkteve, varianteve, kategorive dhe imazheve — pa prekur çmimet.",
    icon: Package,
    enabledKey: "sync_products_enabled",
    intervalKey: "products_interval_minutes",
    lastKey: "last_products_sync_at",
  },
};

const formatInterval = (minutes: number): string => {
  if (!minutes || minutes <= 0) return "—";
  if (minutes < 60) return `çdo ${minutes} min`;
  const h = minutes / 60;
  if (h < 24) return h % 1 === 0 ? `çdo ${h} orë` : `çdo ${h.toFixed(1)} orë`;
  const d = h / 24;
  return d % 1 === 0 ? `çdo ${d} ditë` : `çdo ${d.toFixed(1)} ditë`;
};

const OdooIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ["odoo_config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("odoo_config").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [runningScope, setRunningScope] = useState<Scope | null>(null);

  const runSync = async (scope: Scope) => {
    setRunningScope(scope);
    try {
      const path = scope === "all"
        ? "odoo-fetch-products?sync=true&force=true"
        : `odoo-fetch-products?sync=true&force=true&scope=${scope}`;
      const { data, error } = await supabase.functions.invoke(path, { body: {} });
      if (error) throw error;
      if (data?.success === false) throw new Error(data.error || "Sinkronizimi dështoi");
      toast({ title: "Sinkronizimi përfundoi", description: data?.message || "Përfundoi me sukses" });
      queryClient.invalidateQueries({ queryKey: ["odoo_config"] });
    } catch (e: any) {
      toast({ title: "Gabim në sinkronizim", description: e.message, variant: "destructive" });
    } finally {
      setRunningScope(null);
    }
  };

  // Initialize form when data loads
  if (config && !form) {
    setForm({
      server_url: config.server_url, database_name: config.database_name,
      username: config.username, api_key: config.api_key || "",
      sync_products: config.sync_products, sync_orders: config.sync_orders,
      sync_customers: config.sync_customers, is_active: config.is_active,
      sync_qty_enabled: config.sync_qty_enabled ?? true,
      sync_prices_enabled: config.sync_prices_enabled ?? true,
      sync_products_enabled: config.sync_products_enabled ?? true,
      qty_interval_minutes: config.qty_interval_minutes ?? 3,
      prices_interval_minutes: config.prices_interval_minutes ?? 1440,
      products_interval_minutes: config.products_interval_minutes ?? 120,
    });
  }

  if (!form && !config && !isLoading) {
    setForm({
      server_url: "", database_name: "", username: "", api_key: "",
      sync_products: false, sync_orders: false, sync_customers: false, is_active: false,
      sync_qty_enabled: true, sync_prices_enabled: true, sync_products_enabled: true,
      qty_interval_minutes: 3, prices_interval_minutes: 1440, products_interval_minutes: 120,
    });
  }

  const handleSave = async () => {
    if (!form.server_url || !form.database_name || !form.username) { toast({ title: "Plotësoni fushat e detyrueshme", variant: "destructive" }); return; }
    setSaving(true);
    const payload = { ...form, api_key: form.api_key || null };

    if (config) {
      const { error } = await supabase.from("odoo_config").update(payload).eq("id", config.id);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    } else {
      const { error } = await supabase.from("odoo_config").insert(payload);
      if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); setSaving(false); return; }
    }
    toast({ title: "Konfigurimi u ruajt" });
    queryClient.invalidateQueries({ queryKey: ["odoo_config"] }); setSaving(false);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-foreground">Integrimi Odoo</h1><p className="text-sm text-muted-foreground mt-1">Konfiguroni lidhjen me Odoo ERP dhe orarin e sinkronizimit</p></div>

      {/* Status */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config?.is_active ? "bg-emerald-100" : "bg-muted")}>
              <Link2 size={18} className={config?.is_active ? "text-emerald-700" : "text-muted-foreground"} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Statusi i lidhjes</p>
              <p className="text-xs text-muted-foreground">{config?.is_active ? "Aktiv — i lidhur" : "Joaktiv — i shkëputur"}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {config?.last_sync_at && <p className="text-xs text-muted-foreground">Sinkronizimi i plotë i fundit: {new Date(config.last_sync_at).toLocaleString("sq")}</p>}
            <button onClick={() => runSync("all")} disabled={runningScope !== null} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {runningScope === "all" ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Sinkronizim i plotë tani
            </button>
          </div>
        </div>
      </div>

      {/* Per-scope schedules */}
      {form && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Orari i sinkronizimit</h3>
            <p className="text-xs text-muted-foreground mt-1">Aktivizo/çaktivizo dhe cakto sa shpesh të kryhet çdo lloj sinkronizimi automatik.</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {(Object.keys(SCOPE_META) as Array<Exclude<Scope, "all">>).map((key) => {
              const meta = SCOPE_META[key];
              const Icon = meta.icon;
              const enabled = form[meta.enabledKey];
              const interval = form[meta.intervalKey];
              const lastAt = (config as any)?.[meta.lastKey];
              return (
                <div key={key} className="border border-border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0"><Icon size={16} className="text-foreground" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{meta.title}</p>
                      <p className="text-xs text-muted-foreground">{meta.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {enabled ? formatInterval(Number(interval) || 0) : "çaktivizuar"}
                        {lastAt ? ` · i fundit ${new Date(lastAt).toLocaleString("sq")}` : " · nuk ka ekzekutim të mëparshëm"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={1}
                        value={interval ?? 0}
                        onChange={(e) => setForm({ ...form, [meta.intervalKey]: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-20 h-9 text-center text-sm rounded-lg border border-input bg-background"
                      />
                      <span className="text-xs text-muted-foreground">min</span>
                    </div>
                    <Toggle
                      label=""
                      description=""
                      checked={!!enabled}
                      onChange={(v) => setForm({ ...form, [meta.enabledKey]: v })}
                    />
                    <button
                      onClick={() => runSync(key)}
                      disabled={runningScope !== null}
                      className="flex items-center gap-1.5 border border-border hover:bg-accent px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                    >
                      {runningScope === key ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Ekzekuto
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-muted-foreground pt-2 border-t border-border">
            Shënim: cron-i i platformës kontrollon sinkronizimet çdo pak minuta, prandaj intervali minimal efektiv është ~3 minuta. Ndryshimet ruhen kur shtypni "Ruaj konfigurimin".
          </p>
        </div>
      )}

      {form && (
        <div className="bg-card border border-border rounded-xl p-5 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Konfigurimi API</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="URL e serverit *" value={form.server_url} onChange={(v) => setForm({ ...form, server_url: v })} placeholder="https://odoo.kompania.com" />
            <Field label="Emri i databazës *" value={form.database_name} onChange={(v) => setForm({ ...form, database_name: v })} placeholder="mycompany_db" />
            <Field label="Përdoruesi *" value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="admin" />
            <Field label="API Key" value={form.api_key} onChange={(v) => setForm({ ...form, api_key: v })} type="password" placeholder="••••••••" />
          </div>

          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Opsionet e sinkronizimit</h3>
            <div className="space-y-3">
              <Toggle label="Sinkronizo produktet" description="Importo/eksporto produktet nga Odoo" checked={form.sync_products} onChange={(v) => setForm({ ...form, sync_products: v })} />
              <Toggle label="Sinkronizo porositë" description="Dërgo porositë automatikisht në Odoo" checked={form.sync_orders} onChange={(v) => setForm({ ...form, sync_orders: v })} />
              <Toggle label="Sinkronizo klientët" description="Mban klientët e sinkronizuar" checked={form.sync_customers} onChange={(v) => setForm({ ...form, sync_customers: v })} />
            </div>
          </div>

          <div className="border-t border-border pt-5">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" /><span className="text-foreground font-medium">Aktivizo integrimin</span></label>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Ruaj konfigurimin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div><label className="text-sm font-medium text-foreground">{label}</label><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50" /></div>
);

const Toggle = ({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between gap-3">
    {(label || description) && (
      <div><p className="text-sm text-foreground">{label}</p><p className="text-xs text-muted-foreground">{description}</p></div>
    )}
    <button onClick={() => onChange(!checked)} className={cn("w-10 h-6 rounded-full transition-colors relative shrink-0", checked ? "bg-primary" : "bg-muted")}>
      <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", checked ? "left-5" : "left-1")} />
    </button>
  </div>
);

export default OdooIntegration;
