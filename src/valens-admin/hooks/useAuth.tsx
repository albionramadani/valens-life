import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

type AAL = "aal1" | "aal2" | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  currentAAL: AAL;
  nextAAL: AAL;
  hasVerifiedFactor: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshMfaState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentAAL, setCurrentAAL] = useState<AAL>(null);
  const [nextAAL, setNextAAL] = useState<AAL>(null);
  const [hasVerifiedFactor, setHasVerifiedFactor] = useState(false);

  const checkAdminRole = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return !!data;
  };

  const fetchMfaState = async () => {
    try {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      setCurrentAAL((aalData?.currentLevel as AAL) || null);
      setNextAAL((aalData?.nextLevel as AAL) || null);
      const { data: factors } = await supabase.auth.mfa.listFactors();
      const verified = (factors?.totp || []).some((f: any) => f.status === "verified");
      setHasVerifiedFactor(verified);
    } catch {
      setCurrentAAL(null);
      setNextAAL(null);
      setHasVerifiedFactor(false);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            const admin = await checkAdminRole(session.user.id);
            setIsAdmin(admin);
            await fetchMfaState();
            setLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setCurrentAAL(null);
          setNextAAL(null);
          setHasVerifiedFactor(false);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const admin = await checkAdminRole(session.user.id);
        setIsAdmin(admin);
        await fetchMfaState();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: "global" });
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setCurrentAAL(null);
    setNextAAL(null);
    setHasVerifiedFactor(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        currentAAL,
        nextAAL,
        hasVerifiedFactor,
        signIn,
        signOut,
        refreshMfaState: fetchMfaState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
