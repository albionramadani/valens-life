import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Save, Copy, Plus, Trash2, Rss, Check, Play, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/valens-admin/hooks/use-toast";
import { cn } from "@/lib/utils";

const FEED_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/foleja-feed`;

const randomToken = () =>
  (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");

const FeedSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: number; count?: number; error?: string; ip?: string } | null>(null);

  const { data: config, isLoading } = useQuery({
    queryKey: ["feed_config"],
    queryFn: async () => {
      const { data, error } = await supabase.from("feed_config").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (config && !form) {
    setForm({
      id: config.id,
      token: config.token,
      allowed_ips: config.allowed_ips || [],
      is_active: config.is_active,
    });
  }

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleSave = async () => {
    if (!form?.id) return;
    setSaving(true);
    const cleanIps = (form.allowed_ips || []).map((s: string) => s.trim()).filter(Boolean);
    const { error } = await supabase
      .from("feed_config")
      .update({ token: form.token, allowed_ips: cleanIps, is_active: form.is_active })
      .eq("id", form.id);
    setSaving(false);
    if (error) { toast({ title: "Gabim: " + error.message, variant: "destructive" }); return; }
    toast({ title: "Konfigurimi u ruajt" });
    queryClient.invalidateQueries({ queryKey: ["feed_config"] });
  };

  const handleTest = async () => {
    if (!form?.token) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(`${FEED_URL}?token=${encodeURIComponent(form.token)}`, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
      });
      let count: number | undefined;
      let error: string | undefined;
      let ip: string | undefined;
      try {
        const json = await res.json();
        count = json?.count;
        error = json?.error;
        ip = json?.ip;
      } catch { /* non-json */ }
      setTestResult({ status: res.status, count, error, ip });
    } catch (e: any) {
      setTestResult({ status: 0, error: e?.message || "Network error" });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading || !form) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;
  }

  const fullUrl = `${FEED_URL}?token=${form.token}`;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Feed i Produkteve</h1>
        <p className="text-sm text-muted-foreground mt-1">Feed JSON me të gjitha produktet (emër, çmim, përshkrim, stock), i mbrojtur me token dhe IP.</p>
      </div>

      {/* Status / URL */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", form.is_active ? "bg-emerald-100" : "bg-muted")}>
              <Rss size={18} className={form.is_active ? "text-emerald-700" : "text-muted-foreground"} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Statusi i feed-it</p>
              <p className="text-xs text-muted-foreground">{form.is_active ? "Aktiv" : "Joaktiv"}</p>
            </div>
          </div>
          <button
            onClick={() => setForm({ ...form, is_active: !form.is_active })}
            className={cn("w-11 h-6 rounded-full transition-colors relative", form.is_active ? "bg-primary" : "bg-muted")}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-all", form.is_active ? "left-6" : "left-1")} />
          </button>
        </div>

        <div className="border-t border-border pt-4">
          <label className="text-sm font-medium text-foreground">URL e plotë e feed-it</label>
          <div className="mt-1 flex items-center gap-2">
            <code className="flex-1 truncate bg-muted rounded-lg px-3 py-2 text-xs text-foreground">{fullUrl}</code>
            <button onClick={() => copy(fullUrl, "url")} className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground">
              {copied === "url" ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Kjo është URL-ja zyrtare e feed-it — kopjoje dhe jepja partnerit. Punon direkt me token-in dhe IP-në e lejuar, pa nevojë për konfigurim shtesë në server.
          </p>

          {/* Test feed */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} Testo feed-in
            </button>

            {testResult && (
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                  testResult.status === 200
                    ? "bg-emerald-100 text-emerald-700"
                    : testResult.status === 401
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {testResult.status === 200 ? (
                  <CheckCircle2 size={15} />
                ) : testResult.status === 401 ? (
                  <ShieldAlert size={15} />
                ) : (
                  <XCircle size={15} />
                )}
                <span>
                  {testResult.status === 200
                    ? `200 OK — ${testResult.count ?? "?"} produkte`
                    : testResult.status === 401
                    ? "401 — Token i pavlefshëm"
                    : testResult.status === 403
                    ? `403 — Qasje e ndaluar${testResult.ip ? ` (IP: ${testResult.ip})` : " (IP/feed joaktiv)"}`
                    : `${testResult.status || "Gabim"} — ${testResult.error || "Dështoi"}`}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Testi bëhet nga IP-ja jote aktuale. Nëse ke vendosur IP të lejuara që nuk përfshijnë IP-në tënde, do të shohësh 403 — kjo është normale.
          </p>
        </div>
      </div>


      {/* Token */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Token i sigurisë</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate bg-muted rounded-lg px-3 py-2 text-xs text-foreground">{form.token}</code>
          <button onClick={() => copy(form.token, "token")} className="p-2 rounded-lg border border-border hover:bg-accent text-muted-foreground">
            {copied === "token" ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
          </button>
          <button
            onClick={() => setForm({ ...form, token: randomToken() })}
            className="flex items-center gap-1.5 p-2 px-3 rounded-lg border border-border hover:bg-accent text-muted-foreground text-xs whitespace-nowrap"
          >
            <RefreshCw size={14} /> Gjenero të ri
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Pas ndryshimit të token-it, kujto ta përditësosh kudo ku përdoret. Ruaj që të aplikohet.</p>
      </div>

      {/* Allowed IPs */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">IP të lejuara</h3>
          <button
            onClick={() => setForm({ ...form, allowed_ips: [...(form.allowed_ips || []), ""] })}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <Plus size={14} /> Shto IP
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Nëse lista është bosh, qasja lejohet vetëm me token (pa kufizim IP-je).</p>
        <div className="space-y-2">
          {(form.allowed_ips || []).length === 0 && (
            <p className="text-xs text-muted-foreground/70 italic">Asnjë IP — vetëm token-i kërkohet.</p>
          )}
          {(form.allowed_ips || []).map((ip: string, i: number) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={ip}
                onChange={(e) => {
                  const next = [...form.allowed_ips];
                  next[i] = e.target.value;
                  setForm({ ...form, allowed_ips: next });
                }}
                placeholder="p.sh. 185.123.45.67"
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm placeholder:text-muted-foreground/50"
              />
              <button
                onClick={() => setForm({ ...form, allowed_ips: form.allowed_ips.filter((_: any, j: number) => j !== i) })}
                className="p-2 rounded-lg border border-border hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Ruaj konfigurimin
        </button>
      </div>
    </div>
  );
};

export default FeedSettings;
