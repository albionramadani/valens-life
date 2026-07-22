import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertCircle, Copy, Check } from "lucide-react";
import { useAuth } from "@/valens-admin/hooks/useAuth";

/**
 * TOTP MFA enrollment for admin accounts.
 * Generates a TOTP factor, shows QR + secret, verifies first code, then redirects to /admin.
 */
const MfaSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [qrSvg, setQrSvg] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/admin/login", { replace: true });
      return;
    }
    (async () => {
      // If a verified factor already exists, do NOT create a new one — go to challenge.
      const { data: list } = await supabase.auth.mfa.listFactors();
      const verified = (list?.totp || []).find((f: any) => f.status === "verified");
      if (verified) {
        navigate("/admin/mfa-challenge", { replace: true });
        return;
      }
      // Clean up any stale unverified factors before creating a new one.
      const unverified = (list?.totp || []).filter((f: any) => f.status !== "verified");
      for (const f of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }

      const { data, error: enrollErr } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: `Valens Admin ${Date.now()}`,
      });
      if (enrollErr || !data) {
        setError(enrollErr?.message || "Gabim në krijimin e MFA.");
        setLoading(false);
        return;
      }
      setFactorId(data.id);
      setQrSvg(data.totp.qr_code);
      setSecret(data.totp.secret);
      setLoading(false);
    })();
  }, [user, navigate]);

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

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
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={24} className="text-background" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Aktivizo MFA</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Skanoni QR-in me Google Authenticator, Authy ose 1Password
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-5">
            {qrSvg && (
              <div className="flex justify-center bg-white p-4 rounded-xl border border-border">
                <img
                  src={qrSvg}
                  alt="MFA QR code"
                  className="w-48 h-48"
                />
              </div>
            )}

            {secret && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-foreground break-all">{secret}</code>
                <button
                  type="button"
                  onClick={copySecret}
                  className="flex-shrink-0 p-2 hover:bg-muted rounded-md transition-colors"
                  title="Kopjo"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle size={16} className="text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Kodi 6-shifror nga aplikacioni
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="w-full h-11 px-4 rounded-lg border border-input bg-background text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={verifying || code.length !== 6}
                className="w-full h-11 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                {verifying ? "Duke verifikuar..." : "Aktivizo MFA"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MfaSetup;
