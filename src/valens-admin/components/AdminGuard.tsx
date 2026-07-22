import { Navigate } from "react-router-dom";
import { useAuth } from "@/valens-admin/hooks/useAuth";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, currentAAL, hasVerifiedFactor } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Duke verifikuar aksesin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Aksesi i Ndaluar</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Nuk keni leje për të aksesuar panelin administrativ. Kontaktoni administratorin.
          </p>
          <button
            onClick={() => window.location.href = "/"}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Kthehu në faqen kryesore
          </button>
        </div>
      </div>
    );
  }

  // F-02: Enforce MFA for admin accounts.
  // - No verified factor → must enroll one.
  // - Has factor but session not yet AAL2 → must complete challenge.
  if (!hasVerifiedFactor) {
    return <Navigate to="/admin/mfa-setup" replace />;
  }
  if (currentAAL !== "aal2") {
    return <Navigate to="/admin/mfa-challenge" replace />;
  }

  return <>{children}</>;
};

export default AdminGuard;
