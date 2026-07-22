import { useState } from "react";
import { useAuth } from "@/valens-admin/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, User } from "lucide-react";

const Account = () => {
  const { user } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setDone(false);
    if (password.length < 8) { setError("Fjalëkalimi duhet të ketë së paku 8 karaktere."); return; }
    if (password !== confirm) { setError("Fjalëkalimet nuk përputhen."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setPassword(""); setConfirm("");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Profili Im</h1>
        <p className="text-sm text-muted-foreground mt-1">Menaxho llogarinë tënde administrative</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User size={18} className="text-primary" /></div>
          <div>
            <p className="text-sm font-medium text-foreground">{user?.email}</p>
            <p className="text-xs text-muted-foreground">Llogari administrative</p>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-foreground mb-1">Ndrysho Fjalëkalimin</h2>
        <p className="text-sm text-muted-foreground mb-4">Vendosni një fjalëkalim të ri për llogarinë tuaj.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle size={16} className="text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
          {done && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700">Fjalëkalimi u ndryshua me sukses.</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Fjalëkalimi i ri</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 pl-10 pr-11 rounded-lg border border-input bg-background text-sm" maxLength={128} required />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" tabIndex={-1}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Konfirmo fjalëkalimin</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full h-11 pl-10 pr-4 rounded-lg border border-input bg-background text-sm" maxLength={128} required />
            </div>
          </div>
          <button type="submit" disabled={loading} className="h-11 px-5 bg-foreground text-background rounded-lg text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50">
            {loading ? "Duke ruajtur..." : "Ndrysho fjalëkalimin"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;
