import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/valens-admin/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { sanitizeEmail } from "@/valens-admin/lib/sanitize";
import TurnstileWidget from "@/valens-admin/components/TurnstileWidget";
import { verifyTurnstileToken } from "@/valens-admin/lib/verifyTurnstile";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_KEY = "valens_admin_lockout";
const ATTEMPTS_KEY = "valens_admin_attempts";

const getLockoutState = () => {
  try {
    const lockUntil = parseInt(localStorage.getItem(LOCKOUT_KEY) || "0", 10);
    const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) || "0", 10);
    return { lockUntil, attempts };
  } catch {
    return { lockUntil: 0, attempts: 0 };
  }
};

const setLockoutState = (attempts: number, lockUntil: number) => {
  try {
    localStorage.setItem(ATTEMPTS_KEY, String(attempts));
    localStorage.setItem(LOCKOUT_KEY, String(lockUntil));
  } catch {
    // silent
  }
};

const clearLockoutState = () => {
  try {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // silent
  }
};

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [mode, setMode] = useState<"login" | "recover">("login");
  const [recoverSent, setRecoverSent] = useState(false);
  const [tsToken, setTsToken] = useState("");
  const [tsKey, setTsKey] = useState(0); // forces remount on reset
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Check lockout on mount
  useEffect(() => {
    const { lockUntil } = getLockoutState();
    if (lockUntil > Date.now()) {
      setLockedUntil(lockUntil);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockedUntil <= Date.now()) {
      setRemainingSeconds(0);
      return;
    }

    const update = () => {
      const diff = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        clearInterval(timerRef.current);
        setLockedUntil(0);
        clearLockoutState();
      }
    };

    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, [lockedUntil]);

  const isLocked = lockedUntil > Date.now();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLocked) {
      setError(`Llogaria është bllokuar. Provoni përsëri pas ${remainingSeconds} sekondash.`);
      return;
    }

    setLoading(true);

    const trimmedEmail = sanitizeEmail(email.trim());
    if (!trimmedEmail || !password) {
      setError("Plotësoni të gjitha fushat.");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Formati i emailit nuk është i vlefshëm.");
      setLoading(false);
      return;
    }

    // Password length check
    if (password.length < 6 || password.length > 128) {
      setError("Fjalëkalimi duhet të jetë 6-128 karaktere.");
      setLoading(false);
      return;
    }

    const { error: authError } = await signIn(trimmedEmail, password);
    if (authError) {
      const { attempts } = getLockoutState();
      const newAttempts = attempts + 1;

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
        setLockoutState(newAttempts, lockUntil);
        setLockedUntil(lockUntil);
        setError(`Shumë tentativa të dështuara. Llogaria është bllokuar për 5 minuta.`);
      } else {
        setLockoutState(newAttempts, 0);
        const remaining = MAX_ATTEMPTS - newAttempts;
        setError(`Email ose fjalëkalimi i gabuar. ${remaining} tentativa të mbetura.`);
      }
      setLoading(false);
      return;
    }

    // Success — clear lockout
    clearLockoutState();
    navigate("/admin", { replace: true });
  }, [email, password, signIn, navigate, isLocked, remainingSeconds, tsToken]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = sanitizeEmail(email.trim());
    if (!trimmedEmail) { setError("Shkruani emailin tuaj."); return; }
    if (!tsToken) { setError("Plotësoni verifikimin CAPTCHA."); return; }
    setLoading(true);
    const { error } = await supabase.functions.invoke("send-password-reset", {
      body: { email: trimmedEmail, redirect_to: `${window.location.origin}/admin/reset-password`, turnstileToken: tsToken },
    });
    setTsToken("");
    setTsKey((k) => k + 1);
    setLoading(false);
    if (error) { setError(error.message); return; }
    setRecoverSent(true);
  };

  if (mode === "recover") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
              <Mail size={24} className="text-background" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Rikthe Fjalëkalimin</h1>
            <p className="text-sm text-muted-foreground mt-1">Shkruani emailin për të marrë linkun e rikthimit</p>
          </div>

          {recoverSent ? (
            <div className="text-center space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <p className="text-sm text-emerald-700">Linku i rikthimit u dërgua në emailin tuaj. Kontrolloni inbox-in.</p>
              </div>
              <button onClick={() => { setMode("login"); setRecoverSent(false); setError(""); }} className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                <ArrowLeft size={14} /> Kthehu te identifikimi
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle size={16} className="text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(sanitizeEmail(e.target.value))} placeholder="admin@valens.com" className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all" maxLength={255} required />
                </div>
              </div>
              <div className="flex justify-center">
                <TurnstileWidget key={`r-${tsKey}`} onVerify={setTsToken} onExpire={() => setTsToken("")} onError={() => setTsToken("")} />
              </div>
              <button type="submit" disabled={loading || !tsToken} className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> Duke dërguar...</> : "Dërgo linkun e rikthimit"}
              </button>
              <button type="button" onClick={() => { setMode("login"); setError(""); }} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> Kthehu te identifikimi
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[440px] bg-card border border-border rounded-lg shadow-[0_12px_48px_color-mix(in_oklab,var(--foreground)_8%,transparent)] p-8 sm:p-10">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mx-auto mb-5 shadow-md">
            <Lock size={24} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-normal">Valens Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">Paneli i operacioneve dhe menaxhimit</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              {isLocked ? (
                <ShieldAlert size={16} className="text-destructive flex-shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-destructive flex-shrink-0" />
              )}
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isLocked && (
            <div className="text-center py-4 bg-muted/50 rounded-lg border border-border">
              <ShieldAlert size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Llogaria e bllokuar</p>
              <p className="text-2xl font-mono font-bold text-foreground mt-1">{formatTime(remainingSeconds)}</p>
              <p className="text-xs text-muted-foreground mt-1">Provoni përsëri më vonë</p>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                placeholder="admin@valens.com"
                className="w-full h-12 pl-10 pr-4 rounded-md border border-input bg-card text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/15 focus:border-ring transition-all"
                autoComplete="username"
                maxLength={255}
                required
                disabled={isLocked}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fjalëkalimi</label>
              <button type="button" onClick={() => { setMode("recover"); setError(""); }} className="text-xs font-semibold text-foreground hover:underline">Keni harruar fjalëkalimin?</button>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 pl-10 pr-11 rounded-md border border-input bg-card text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/15 focus:border-ring transition-all"
                autoComplete="current-password"
                maxLength={128}
                required
                disabled={isLocked}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}

            className="w-full h-12 bg-primary text-primary-foreground rounded-md text-sm font-bold hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Duke u identifikuar...
              </>
            ) : isLocked ? (
              "E bllokuar"
            ) : (
              "Identifikohu"
            )}
          </button>
        </form>

        <p className="text-[11px] text-muted-foreground text-center mt-8">
          © 2026 Valens · Paneli Administrativ · Të gjitha të drejtat e rezervuara
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
