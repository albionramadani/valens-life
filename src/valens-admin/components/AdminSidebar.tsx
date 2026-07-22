import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Layers,
  CreditCard, Truck, FileText, Star, BarChart3, Settings, Bell,
  Shield, Percent, Wallet, Link2, Box, ChevronLeft, ChevronRight, LogOut, Rss,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/valens-admin/hooks/useAuth";

const navSections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    ],
  },
  {
    title: "Catalog",
    items: [
      { label: "Products", icon: Package, path: "/admin/products" },
      { label: "Categories", icon: Layers, path: "/admin/categories" },
      { label: "Collections", icon: Box, path: "/admin/collections" },
      { label: "Inventory", icon: Package, path: "/admin/inventory" },
    ],
  },
  {
    title: "Sales",
    items: [
      { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
      { label: "Customers", icon: Users, path: "/admin/customers" },
      { label: "Offers", icon: Percent, path: "/admin/offers" },
      { label: "Coupons", icon: Tag, path: "/admin/coupons" },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Payments", icon: CreditCard, path: "/admin/payments" },
      { label: "Payment Gateway", icon: Wallet, path: "/admin/bank-settings" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Shipping", icon: Truck, path: "/admin/shipping" },
      { label: "Reviews", icon: Star, path: "/admin/reviews" },
      { label: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Homepage", icon: FileText, path: "/admin/homepage" },
      { label: "Sessions", icon: FileText, path: "/admin/sessions" },
      { label: "CMS Blocks", icon: FileText, path: "/admin/cms" },
      { label: "Notifications", icon: Bell, path: "/admin/notifications" },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Users & Roles", icon: Shield, path: "/admin/users" },
      { label: "Profili Im", icon: Users, path: "/admin/account" },
      { label: "Odoo Integration", icon: Link2, path: "/admin/odoo" },
      { label: "Product Feed", icon: Rss, path: "/admin/feed" },
      { label: "Settings", icon: Settings, path: "/admin/settings" },
    ],
  },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 bg-card border-r border-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[272px]"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border flex-shrink-0">
        {!collapsed && (
          <span className="font-display text-base font-bold text-foreground tracking-normal">
            Valens Admin
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-md hover:bg-accent transition-colors text-muted-foreground flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
            <div key={section.title} className="mb-5">
            {!collapsed && (
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 h-10 rounded-md text-sm transition-all duration-150 group mb-1 border border-transparent",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={17} className={cn(isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              {user?.email?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Admin</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Dil nga llogaria"
              className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="p-3 border-t border-border flex-shrink-0 flex justify-center">
          <button
            onClick={handleSignOut}
            title="Dil nga llogaria"
            className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
