import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, ShoppingCart, Users, Package, DollarSign, Star } from "lucide-react";

const Analytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [ordersRes, customersRes, productsRes, reviewsRes, paymentsRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, created_at"),
        supabase.from("customers").select("id, created_at"),
        supabase.from("products").select("id, product_variants(stock)"),
        supabase.from("reviews").select("id, rating"),
        supabase.from("payments").select("id, amount, status"),
      ]);

      const orders = ordersRes.data || [];
      const customers = customersRes.data || [];
      const products = productsRes.data || [];
      const reviews = reviewsRes.data || [];
      const payments = paymentsRes.data || [];

      const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
      const totalStock = products.reduce((s, p) => s + ((p.product_variants as any[])?.reduce((ss: number, v: any) => ss + v.stock, 0) || 0), 0);
      const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      const paidPayments = payments.filter(p => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);

      // Orders by status
      const ordersByStatus = orders.reduce((acc: Record<string, number>, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

      // Monthly revenue
      const monthlyRevenue = orders.reduce((acc: Record<string, number>, o) => {
        const month = new Date(o.created_at).toLocaleDateString("sq", { month: "short", year: "numeric" });
        acc[month] = (acc[month] || 0) + Number(o.total);
        return acc;
      }, {});

      return { revenue, orderCount: orders.length, customerCount: customers.length, productCount: products.length, totalStock, avgRating, paidPayments, ordersByStatus, monthlyRevenue, reviewCount: reviews.length };
    },
  });

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;

  const kpis = [
    { label: "Të ardhurat totale", value: `€${(data?.revenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Porosi", value: data?.orderCount || 0, icon: ShoppingCart, color: "text-blue-500" },
    { label: "Klientë", value: data?.customerCount || 0, icon: Users, color: "text-emerald-500" },
    { label: "Produkte", value: data?.productCount || 0, icon: Package, color: "text-purple-500" },
    { label: "Stoku total", value: data?.totalStock || 0, icon: TrendingUp, color: "text-amber-500" },
    { label: "Vlerësim mesatar", value: `⭐ ${(data?.avgRating || 0).toFixed(1)}`, icon: Star, color: "text-amber-500" },
  ];

  const statusLabels: Record<string, string> = { processing: "Në përpunim", shipped: "Dërguar", delivered: "Dorëzuar", cancelled: "Anuluar" };
  const statusColors: Record<string, string> = { processing: "bg-amber-500", shipped: "bg-blue-500", delivered: "bg-emerald-500", cancelled: "bg-red-500" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-foreground">Analitika</h1><p className="text-sm text-muted-foreground mt-1">Pasqyrë e performancës së dyqanit</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2"><kpi.icon size={16} className={kpi.color} /><span className="text-xs text-muted-foreground">{kpi.label}</span></div>
            <p className="text-2xl font-semibold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Orders by Status */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Porositë sipas statusit</h3>
          <div className="space-y-3">
            {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => {
              const total = data?.orderCount || 1;
              const pct = ((count as number) / total * 100).toFixed(0);
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground capitalize">{statusLabels[status] || status}</span>
                    <span className="text-foreground font-medium">{count as number} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${statusColors[status] || "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Të ardhurat mujore</h3>
          {Object.keys(data?.monthlyRevenue || {}).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nuk ka të dhëna ende</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(data?.monthlyRevenue || {}).map(([month, amount]) => (
                <div key={month} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{month}</span>
                  <span className="text-foreground font-medium">€{(amount as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
