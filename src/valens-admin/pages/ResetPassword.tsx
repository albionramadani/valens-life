import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import TurnstileWidget from "@/valens-admin/components/TurnstileWidget";
import { verifyTurnstileToken } from "@/valens-admin/lib/verifyTurnstile";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [authState, setAuthState] = useState<"checking" | "valid" | "invalid">("checking");
  const [tsToken, setTsToken] = useState("");
  const [tsKey, setTsKey] = useState(0);

  useEffect(() => {
    let recovered = false;

    // Listen first so we don't miss the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && window.location.hash.includes("type=recovery"))) {
        recovered = true;
        setAuthState("valid");
      }
    });

    // If the URL has a recovery hash, give Supabase a moment to process it
    const hasRecoveryHash = window.location.hash.includes("type=recovery");

    const timer = setTimeout(async () => {
      if (recovered) return;
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAuthState("valid");
      } else {
        setAuthState("invalid");
      }
    }, hasRecoveryHash ? 1500 : 300);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (authState === "invalid") {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Fjalëkalimi duhet të ketë së paku 6 karaktere."); return; }
    if (password !== confirmPassword) { setError("Fjalëkalimet nuk përputhen."); return; }
    if (!tsToken) { setError("Plotësoni verifikimin CAPTCHA."); return; }
    setLoading(true);
    const captchaOk = await verifyTurnstileToken(tsToken);
    if (!captchaOk) {
      setLoading(false);
      setError("Verifikimi CAPTCHA dështoi.");
      setTsToken("");
      setTsKey((k) => k + 1);
      return;
    }
    // Use service-role edge function to bypass AAL2 requirement for users with MFA.
    // The recovery email already proved identity (AAL1 session is active).
    const { data, error } = await supabase.functions.invoke("recovery-update-password", { body: { password } });
    setLoading(false);
    if (error || (data as any)?.error) { setError(((data as any)?.error) || error?.message || "Gabim"); return; }
    await supabase.auth.signOut().catch(() => {});
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[400px] text-center">
          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-foreground">Fjalëkalimi u ndryshua!</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">Tani mund të identifikoheni me fjalëkalimin e ri.</p>
          <a href="/admin/login" className="bg-foreground text-background px-6 py-3 rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors inline-block">
            Shko te identifikimi
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-background" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Ndrysho Fjalëkalimin</h1>
          <p className="text-sm text-muted-foreground mt-1">Vendosni fjalëkalimin e ri</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle size={16} className="text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Fjalëkalimi i ri</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 pl-10 pr-11 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all" maxLength={128} required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Konfirmo fjalëkalimin</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={showPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all" maxLength={128} required />
            </div>
          </div>
          <div className="flex justify-center">
            <TurnstileWidget key={`rp-${tsKey}`} onVerify={setTsToken} onExpire={() => setTsToken("")} onError={() => setTsToken("")} />
          </div>
          <button type="submit" disabled={loading || !tsToken} className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> Duke ruajtur...</> : "Ndrysho Fjalëkalimin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
