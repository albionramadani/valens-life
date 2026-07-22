import { Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { Search, Bell, LogOut, User as UserIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/valens-admin/hooks/useAuth";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false);
      return count ?? 0;
    },
    refetchInterval: 30000,
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (() => {
    const email = user?.email || "";
    const name = (user?.user_metadata as any)?.full_name as string | undefined;
    const source = name?.trim() || email;
    if (!source) return "AK";
    const parts = source.split(/[\s@._-]+/).filter(Boolean);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase() || "AK";
  })();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between px-7 sticky top-0 z-30">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search size={17} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Kërko produkte, porosi, klientë..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/notifications")}
              className="relative w-10 h-10 rounded-md border border-transparent hover:border-border hover:bg-accent transition-colors flex items-center justify-center"
              title="Njoftimet"
            >
              <Bell size={18} className="text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-semibold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold hover:bg-primary/90 transition-colors"
                title={user?.email || ""}
              >
                {initials}
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-popover border border-border rounded-lg shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs text-muted-foreground">I kyçur si</p>
                    <p className="text-sm font-medium text-foreground truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setMenuOpen(false); navigate("/admin/users"); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                  >
                    <UserIcon size={14} /> Përdoruesit
                  </button>
                  <button
                    onClick={async () => { setMenuOpen(false); await signOut(); navigate("/admin/login", { replace: true }); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                  >
                    <LogOut size={14} /> Dil
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Content */}
        <main className="flex-1 p-7 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
