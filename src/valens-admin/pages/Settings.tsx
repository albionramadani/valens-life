import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, Store, Globe, ShieldCheck, Palette, Plus, Trash2, Mail } from "lucide-react";
import { useToast } from "@/valens-admin/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import ImageUpload from "@/valens-admin/components/ImageUpload";
import { useColorPalette, PaletteColor } from "@/valens-admin/hooks/useColorPalette";

const defaultSettings: Record<string, { label: string; category: string; defaultValue: string }> = {
  store_name: { label: "Emri i dyqanit", category: "general", defaultValue: "Valens Store" },
  store_email: { label: "Email", category: "general", defaultValue: "" },
  store_phone: { label: "Telefoni", category: "general", defaultValue: "" },
  store_address: { label: "Adresa", category: "general", defaultValue: "" },
  store_city: { label: "Qyteti", category: "general", defaultValue: "" },
  store_country: { label: "Shteti", category: "general", defaultValue: "Kosovo" },
  currency: { label: "Valuta", category: "general", defaultValue: "EUR" },
  favicon_url: { label: "Favicon", category: "appearance", defaultValue: "" },
  hero_banner_url: { label: "Hero Banner (sfondi)", category: "appearance", defaultValue: "" },
  hero_logo_url: { label: "Hero Logo (në qendër)", category: "appearance", defaultValue: "" },
  hero_address_label: { label: "Adresa — Titulli", category: "appearance", defaultValue: "Address" },
  hero_address_text: { label: "Adresa — Teksti", category: "appearance", defaultValue: "Albi Mall\nPrishtinë 1000 Kosovë" },
  hero_hours_label: { label: "Oraret — Titulli", category: "appearance", defaultValue: "Hours" },
  hero_hours_text: { label: "Oraret — Teksti", category: "appearance", defaultValue: "Open 10:00 – 20:00\nMonday – Sunday" },
  hero_info_label_color: { label: "Ngjyra e titujve (Address/Hours)", category: "appearance", defaultValue: "#ffffff" },
  hero_info_text_color: { label: "Ngjyra e tekstit (Address/Hours)", category: "appearance", defaultValue: "#ffffff" },
  hero_subtitle_color: { label: "Ngjyra e subtitle (Apple Authorized Reseller)", category: "appearance", defaultValue: "#ffffff" },
  action_button_color: { label: "Ngjyra e butonave kryesore (Learn more, Shop, Shto në shportë, Konfirmo porosinë)", category: "appearance", defaultValue: "#0a0a0a" },
  action_button_secondary_color: { label: "Ngjyra e butonit 'Buy / Blej' (sekondar)", category: "appearance", defaultValue: "#0071e3" },
  footer_about_text: { label: "Footer — Teksti hyrës", category: "footer", defaultValue: "Valens është Apple Authorized Reseller në Kosovë. Çmimet mund të ndryshojnë. Të gjitha produktet janë origjinale Apple me garanci të plotë. Vizitoni dyqanin tonë në Albi Mall, Prishtinë ose porosisni online." },
  footer_reseller_label: { label: "Footer — Etiketa (Apple Authorized Reseller)", category: "footer", defaultValue: "Apple Authorized Reseller" },
  footer_country: { label: "Footer — Shteti", category: "footer", defaultValue: "Kosovë" },
  footer_copyright: { label: "Footer — Të drejtat e rezervuara", category: "footer", defaultValue: "© 2026 Valens. Të gjitha të drejtat e rezervuara." },
  tax_rate: { label: "Norma e taksës (%)", category: "tax", defaultValue: "18" },
  tax_included: { label: "Taksa e përfshirë në çmim", category: "tax", defaultValue: "false" },
  order_prefix: { label: "Prefiksi i porosive", category: "orders", defaultValue: "ORD-" },
  low_stock_threshold: { label: "Pragu i stokut të ulët", category: "inventory", defaultValue: "10" },
  payment_methods: { label: "Mënyrat e pagesës", category: "payments", defaultValue: "both" },
  meta_title: { label: "Meta titulli", category: "seo", defaultValue: "Valens - Apple Reseller" },
  meta_description: { label: "Meta përshkrimi", category: "seo", defaultValue: "" },
  turnstile_site_key: { label: "Cloudflare Turnstile Site Key", category: "security", defaultValue: "1x00000000000000000000AA" },
};

const Settings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ["store_settings"],
    queryFn: async () => { const { data, error } = await supabase.from("store_settings").select("*"); if (error) throw error; return data; },
  });

  useEffect(() => {
    const vals: Record<string, string> = {};
    Object.entries(defaultSettings).forEach(([key, def]) => {
      const existing = settings.find((s: any) => s.key === key);
      vals[key] = existing?.value ?? def.defaultValue;
    });
    setValues(vals);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    for (const [key, value] of Object.entries(values)) {
      const def = defaultSettings[key];
      if (!def) continue;
      const existing = settings.find((s: any) => s.key === key);
      if (existing) {
        await supabase.from("store_settings").update({ value, category: def.category }).eq("id", existing.id);
      } else {
        await supabase.from("store_settings").insert({ key, value, category: def.category });
      }
    }
    queryClient.invalidateQueries({ queryKey: ["store_settings"] });
    toast({ title: "Cilësimet u ruajtën" });
    setSaving(false);
  };

  const tabs = [
    { key: "general", label: "Të përgjithshme", icon: Store },
    { key: "appearance", label: "Pamja", icon: Store },
    { key: "footer", label: "Footer", icon: Store },
    { key: "colors", label: "Ngjyrat", icon: Palette },
    { key: "tax", label: "Taksat", icon: Globe },
    { key: "orders", label: "Porositë", icon: Store },
    { key: "inventory", label: "Inventari", icon: Store },
    { key: "payments", label: "Pagesat", icon: Globe },
    { key: "seo", label: "SEO", icon: Globe },
    { key: "security", label: "Siguria", icon: ShieldCheck },
    { key: "smtp", label: "SMTP / Email", icon: Mail },
  ];

  const currentFields = Object.entries(defaultSettings).filter(([, def]) => def.category === activeTab);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground">Cilësimet</h1><p className="text-sm text-muted-foreground mt-1">Konfiguroni dyqanin tuaj</p></div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Ruaj
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-48 flex-shrink-0">
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.key ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}>
                <tab.icon size={16} /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-5 capitalize">{tabs.find(t => t.key === activeTab)?.label}</h3>
          {activeTab === "security" && (
            <div className="mb-5 p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Cloudflare Turnstile:</strong> Site Key është publik. Secret Key ruhet i sigurt (vetëm admin) dhe përdoret nga serveri për të verifikuar tokenin.</p>
              <p>Test mode: <code className="font-mono">1x00000000000000000000AA</code> (kalon gjithmonë).</p>
            </div>
          )}
          {activeTab === "smtp" ? (
            <SmtpSettingsManager />
          ) : activeTab === "colors" ? (
            <ColorPaletteManager />
          ) : activeTab === "security" ? (
            <div className="space-y-4">
              {currentFields.map(([key, def]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-foreground">{def.label}</label>
                  <input type="text" value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
              ))}
              <TurnstileSecretManager />
            </div>
          ) : (
          <div className="space-y-4">
            {currentFields.map(([key, def]) => {
              if (key === "tax_included") {
                return (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={values[key] === "true"} onChange={(e) => setValues({ ...values, [key]: e.target.checked ? "true" : "false" })} className="rounded" />
                    <span className="text-foreground">{def.label}</span>
                  </label>
                );
              }
              if (key === "favicon_url" || key === "hero_banner_url" || key === "hero_logo_url") {
                return (
                  <ImageUpload key={key} label={def.label} value={values[key] || ""} onChange={(v) => setValues({ ...values, [key]: v })} />
                );
              }
              if (key === "hero_address_text" || key === "hero_hours_text" || key === "footer_about_text") {
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-foreground">{def.label}</label>
                    <textarea rows={3} value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
                    <p className="text-[10px] text-muted-foreground mt-1">Përdor Enter për rresht të ri.</p>
                  </div>
                );
              }
              if (key.endsWith("_color")) {
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-foreground">{def.label}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <input type="color" value={values[key] || "#ffffff"} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="w-12 h-10 rounded cursor-pointer border border-border" />
                      <input type="text" value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono" />
                    </div>
                  </div>
                );
              }
              if (key === "payment_methods") {
                return (
                  <div key={key}>
                    <label className="text-sm font-medium text-foreground">{def.label}</label>
                    <select value={values[key] || "both"} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
                      <option value="both">Cash & Kartelë</option>
                      <option value="cash">Vetëm Cash</option>
                      <option value="card">Vetëm Kartelë</option>
                    </select>
                  </div>
                );
              }
              return (
                <div key={key}>
                  <label className="text-sm font-medium text-foreground">{def.label}</label>
                  <input type="text" value={values[key] || ""} onChange={(e) => setValues({ ...values, [key]: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TurnstileSecretManager = () => {
  const { toast } = useToast();
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("admin_secrets").select("value").eq("key", "turnstile_secret_key").maybeSingle();
      setValue(data?.value || "");
      setLoaded(true);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const v = value.trim();
    const { error } = await (supabase as any).from("admin_secrets").upsert({ key: "turnstile_secret_key", value: v, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Secret Key u ruajt" });
  };

  return (
    <div className="pt-4 border-t border-border space-y-2">
      <label className="text-sm font-medium text-foreground">Cloudflare Turnstile Secret Key</label>
      <p className="text-xs text-muted-foreground">Ruhet i sigurt në bazën e të dhënave (vetëm admin). Përdoret nga serveri për verifikim.</p>
      <div className="flex gap-2">
        <input type={show ? "text" : "password"} value={loaded ? value : ""} onChange={(e) => setValue(e.target.value)} placeholder="0x..." className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono" />
        <button type="button" onClick={() => setShow(!show)} className="h-10 px-3 rounded-lg border border-border text-xs">{show ? "Fshih" : "Shfaq"}</button>
        <button onClick={save} disabled={saving || !loaded} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">{saving ? "Duke ruajtur..." : "Ruaj"}</button>
      </div>
    </div>
  );
};

const ColorPaletteManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { palette } = useColorPalette();
  const [items, setItems] = useState<PaletteColor[]>([]);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#000000");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setItems(palette); }, [palette]);

  const persist = async (next: PaletteColor[]) => {
    setSaving(true);
    const { data: existing } = await supabase.from("store_settings").select("id").eq("key", "color_palette").maybeSingle();
    const value = JSON.stringify(next);
    if (existing) {
      await supabase.from("store_settings").update({ value, category: "appearance" }).eq("id", existing.id);
    } else {
      await supabase.from("store_settings").insert({ key: "color_palette", value, category: "appearance" });
    }
    queryClient.invalidateQueries({ queryKey: ["color_palette"] });
    setSaving(false);
    toast({ title: "Paleta u ruajt" });
  };

  const addColor = () => {
    const name = newName.trim();
    if (!name) return;
    if (items.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Ngjyra ekziston tashmë", variant: "destructive" });
      return;
    }
    const next = [...items, { name, hex: newHex }];
    setItems(next);
    setNewName("");
    setNewHex("#000000");
    persist(next);
  };

  const removeColor = (name: string) => {
    const next = items.filter((c) => c.name !== name);
    setItems(next);
    persist(next);
  };

  const updateColor = (idx: number, patch: Partial<PaletteColor>) => {
    const next = items.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    setItems(next);
  };

  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">Shto, modifiko ose largo ngjyra. Këto shfaqen tek selektori i ngjyrës në variantet e produkteve dhe në faqen e produktit.</p>

      <div className="space-y-2">
        {items.map((c, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-background">
            <input type="color" value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })} onBlur={() => persist(items)} className="w-10 h-10 rounded cursor-pointer border border-border" />
            <input type="text" value={c.name} onChange={(e) => updateColor(i, { name: e.target.value })} onBlur={() => persist(items)} className="flex-1 h-9 rounded-lg border border-input bg-background px-2.5 text-sm" />
            <input type="text" value={c.hex} onChange={(e) => updateColor(i, { hex: e.target.value })} onBlur={() => persist(items)} className="w-28 h-9 rounded-lg border border-input bg-background px-2.5 text-xs font-mono" />
            <button onClick={() => removeColor(c.name)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>

      <div className="flex items-end gap-2 pt-3 border-t border-border">
        <input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-border" />
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">Emri i ngjyrës</label>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="p.sh. Midnight" className="mt-1 w-full h-9 rounded-lg border border-input bg-background px-2.5 text-sm" />
        </div>
        <button onClick={addColor} disabled={saving || !newName.trim()} className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-sm flex items-center gap-1 disabled:opacity-50">
          <Plus size={14} /> Shto
        </button>
      </div>
    </div>
  );
};

const SmtpSettingsManager = () => {
  const { toast } = useToast();
  const [row, setRow] = useState<any>({ host: "smtp.office365.com", port: 587, secure: false, username: "", password: "", from_email: "", from_name: "Valens", admin_notification_email: "" });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any).from("smtp_settings").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
      if (data) setRow(data);
      setLoaded(true);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const payload = { ...row, updated_at: new Date().toISOString() };
    let res;
    if (row.id) {
      res = await (supabase as any).from("smtp_settings").update(payload).eq("id", row.id);
    } else {
      res = await (supabase as any).from("smtp_settings").insert(payload).select().single();
      if (res.data) setRow(res.data);
    }
    setSaving(false);
    if (res.error) { toast({ title: "Gabim", description: res.error.message, variant: "destructive" }); return; }
    toast({ title: "Cilësimet SMTP u ruajtën" });
  };

  const sendTest = async () => {
    if (!testTo) return;
    setTesting(true);
    const { error } = await (supabase as any).functions.invoke("send-smtp-email", {
      body: { to: testTo, subject: "Test SMTP – Valens", html: "<p>Ky është një email test nga konfigurimi SMTP.</p>" },
    });
    setTesting(false);
    if (error) { toast({ title: "Dështoi", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Email-i test u dërgua" });
  };

  const set = (k: string, v: any) => setRow({ ...row, [k]: v });

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs text-muted-foreground">
        Office365: <code className="font-mono">smtp.office365.com</code>, port <code>587</code>, STARTTLS (lëre <strong>Secure (SSL/TLS)</strong> jashtë). Username & password janë të llogarisë email që dërgon.
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">Host</label><input value={row.host || ""} onChange={(e) => set("host", e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
        <div><label className="text-sm font-medium">Port</label><input type="number" value={row.port || 587} onChange={(e) => set("port", parseInt(e.target.value || "587"))} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!row.secure} onChange={(e) => set("secure", e.target.checked)} />
        <span>Secure (SSL/TLS direkt – aktivizo vetëm për port 465)</span>
      </label>

      <div><label className="text-sm font-medium">Username (email)</label><input value={row.username || ""} onChange={(e) => set("username", e.target.value)} placeholder="noreply@yourdomain.com" className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <div className="flex gap-2 mt-1">
          <input type={showPwd ? "text" : "password"} value={loaded ? (row.password || "") : ""} onChange={(e) => set("password", e.target.value)} className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm" />
          <button type="button" onClick={() => setShowPwd(!showPwd)} className="h-10 px-3 rounded-lg border border-border text-xs">{showPwd ? "Fshih" : "Shfaq"}</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-sm font-medium">From Email</label><input value={row.from_email || ""} onChange={(e) => set("from_email", e.target.value)} placeholder="noreply@yourdomain.com" className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
        <div><label className="text-sm font-medium">From Name</label><input value={row.from_name || ""} onChange={(e) => set("from_name", e.target.value)} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>
      </div>

      <div><label className="text-sm font-medium">Email i administratorit (për njoftime porosish)</label><input value={row.admin_notification_email || ""} onChange={(e) => set("admin_notification_email", e.target.value)} placeholder="admin@yourdomain.com" className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" /></div>

      <div className="flex gap-2 pt-2">
        <button onClick={save} disabled={saving || !loaded} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm disabled:opacity-50">{saving ? "Duke ruajtur..." : "Ruaj"}</button>
      </div>

      <div className="pt-4 border-t border-border space-y-2">
        <label className="text-sm font-medium">Dërgo email test</label>
        <div className="flex gap-2">
          <input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="email@example.com" className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm" />
          <button onClick={sendTest} disabled={testing || !testTo} className="h-10 px-4 rounded-lg border border-border text-sm disabled:opacity-50">{testing ? "Duke dërguar..." : "Dërgo"}</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

