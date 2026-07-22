import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertCircle, LogOut } from "lucide-react";
import { useAuth } from "@/valens-admin/hooks/useAuth";
import TurnstileWidget from "@/valens-admin/components/TurnstileWidget";


/**
 * AAL2 challenge: prompts the user for the TOTP code from their authenticator app
 * to upgrade the session from aal1 → aal2.
 */
const MfaChallenge = () => {
  const navigate = useNavigate();
  const { user, signOut, refreshMfaState } = useAuth();
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/admin/login", { replace: true });
      return;
    }
    (async () => {
      const { data } = await supabase.auth.mfa.listFactors();
      const verifiedList = (data?.totp || []).filter((f: any) => f.status === "verified");
      if (verifiedList.length === 0) {
        navigate("/admin/mfa-setup", { replace: true });
        return;
      }
      // Use the most recently created verified factor (in case duplicates exist
      // from older builds — the latest one matches what's in the user's app).
      const sorted = [...verifiedList].sort((a: any, b: any) => {
        const ta = new Date(a.created_at || 0).getTime();
        const tb = new Date(b.created_at || 0).getTime();
        return tb - ta;
      });
      setFactorId(sorted[0].id);
      setLoading(false);
    })();
  }, [user, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^\d{6}$/.test(code)) {
      setError("Kodi duhet të jetë 6 shifra.");
      return;
    }
    setVerifying(true);
    const { error: vErr } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });
    setVerifying(false);
    if (vErr) {
      setError("Kodi i pasaktë. Provoni përsëri.");
      setCode("");
      return;
    }
    // Refresh AAL state before navigating so AdminGuard sees aal2 immediately
    await refreshMfaState();
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-background" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Verifikim MFA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shkruani kodin nga aplikacioni juaj authenticator
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle size={16} className="text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            <input
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="w-full h-14 px-4 rounded-lg border border-input bg-background text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={6}
              required
              autoFocus
            />
            <button
              type="submit"
              disabled={verifying || code.length !== 6}
              className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {verifying ? "Duke verifikuar..." : "Verifiko"}
            </button>
            <button
              type="button"
              onClick={async () => { await signOut(); navigate("/admin/login", { replace: true }); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center gap-1"
            >
              <LogOut size={14} /> Dil
            </button>
            <MfaRecoveryInline email={user?.email || ""} onRecovered={async () => { await signOut(); navigate("/admin/login", { replace: true }); }} />
          </form>
        )}
      </div>
    </div>
  );
};

const MfaRecoveryInline = ({ email, onRecovered }: { email: string; onRecovered: () => void }) => {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<"idle" | "sent" | "done">("idle");
  const [code, setCode] = useState("");
  const [secs, setSecs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [tsToken, setTsToken] = useState("");
  const [tsKey, setTsKey] = useState(0);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [secs]);

  const request = async () => {
    if (!tsToken) { setErr("Plotësoni verifikimin CAPTCHA."); return; }
    setBusy(true); setErr("");
    const { error } = await supabase.functions.invoke("mfa-recovery", { body: { action: "request", email, turnstileToken: tsToken } });
    setTsToken(""); setTsKey((k) => k + 1);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setStage("sent"); setSecs(60);
  };

  const verify = async () => {
    setBusy(true); setErr("");
    const { error } = await supabase.functions.invoke("mfa-recovery", { body: { action: "verify", email, code } });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setStage("done");
    setTimeout(onRecovered, 1500);
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="w-full text-xs text-muted-foreground hover:text-foreground underline">
        Keni humbur qasjen tek aplikacioni MFA?
      </button>
    );
  }

  return (
    <div className="border border-border rounded-lg p-3 space-y-2 text-sm">
      <div className="text-xs text-muted-foreground">Rikuperim MFA për: <strong>{email}</strong></div>
      {err && <p className="text-xs text-destructive">{err}</p>}
      {stage === "idle" && (
        <>
          <TurnstileWidget key={`mfar-${tsKey}`} onVerify={setTsToken} onExpire={() => setTsToken("")} onError={() => setTsToken("")} />
          <button type="button" onClick={request} disabled={busy || !email || !tsToken} className="w-full h-9 rounded-lg bg-foreground text-background text-xs disabled:opacity-50">
            {busy ? "Duke dërguar..." : "Dërgo kodin (vlefshëm 60s)"}
          </button>
        </>
      )}
      {stage === "sent" && (
        <>
          <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="6-shifror" className="w-full h-10 rounded-lg border border-input bg-background px-3 text-center font-mono tracking-widest" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Skadon për {secs}s</span>
            <button type="button" onClick={request} disabled={busy || secs > 0} className="underline disabled:opacity-50">Ridërgo</button>
          </div>
          <button type="button" onClick={verify} disabled={busy || code.length !== 6} className="w-full h-9 rounded-lg bg-foreground text-background text-xs disabled:opacity-50">
            {busy ? "Duke verifikuar..." : "Verifiko & rivendos MFA"}
          </button>
        </>
      )}
      {stage === "done" && <p className="text-xs text-emerald-600">MFA u rivendos. Po ridrejtoheni…</p>}
    </div>
  );
};

export default MfaChallenge;
