import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, ShoppingCart, Users, Package, Loader2, Percent, Tag, Truck, CreditCard, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useToast } from "@/valens-admin/hooks/use-toast";

const formatCurrency = (v: number) => `€${v.toLocaleString("de-DE", { minimumFractionDigits: 0 })}`;

const Dashboard = () => {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [ordersRes, customersRes, productsRes, offersRes, couponsRes, shippingRes, paymentsRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, payment_status, created_at, customers(name, email), order_items(id)"),
        supabase.from("customers").select("id"),
        supabase.from("products").select("id, product_variants(stock)"),
        supabase.from("offers").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(5),
        supabase.from("coupons").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(5),
        supabase.from("shipping_methods").select("*").eq("is_active", true).order("name"),
        supabase.from("payments").select("id, amount, method, status, reference, created_at, order_id").order("created_at", { ascending: false }).limit(10),
      ]);

      const orders = ordersRes.data || [];
      const customers = customersRes.data || [];
      const products = productsRes.data || [];

      const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
      const avgOrder = orders.length > 0 ? revenue / orders.length : 0;
      const totalStock = products.reduce((sum, p) => sum + ((p.product_variants as any[])?.reduce((s: number, v: any) => s + v.stock, 0) || 0), 0);

      return {
        revenue, orderCount: orders.length, customerCount: customers.length, avgOrder, totalStock,
        recentOrders: orders.slice(0, 5),
        offers: offersRes.data || [],
        coupons: couponsRes.data || [],
        shipping: shippingRes.data || [],
        payments: paymentsRes.data || [],
      };
    },
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "U kopjua!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>;

  const kpis = [
    { label: "Të ardhurat", value: formatCurrency(stats?.revenue || 0), icon: DollarSign },
    { label: "Porosi", value: (stats?.orderCount || 0).toString(), icon: ShoppingCart },
    { label: "Klientë", value: (stats?.customerCount || 0).toString(), icon: Users },
    { label: "Porosi mesatare", value: formatCurrency(stats?.avgOrder || 0), icon: Package },
  ];

  const statusColors: Record<string, string> = {
    processing: "bg-amber-100 text-amber-700",
    shipped: "bg-blue-100 text-blue-700",
    delivered: "bg-emerald-100 text-emerald-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const paymentStatusColors: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
  };

  const methodIcons: Record<string, string> = {
    card: "💳",
    visa: "💳 Visa",
    mastercard: "💳 Mastercard",
    bank_transfer: "🏦",
    cash: "💵",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Mirë se vini. Ja çfarë ndodh me dyqanin tuaj.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon size={18} className="text-primary" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Offers & Coupons Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Offers */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Zbritjet aktive</h3>
            </div>
            <Link to="/admin/offers" className="text-xs text-primary hover:underline">Menaxho</Link>
          </div>
          {stats?.offers && stats.offers.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.offers.map((offer: any) => (
                <div key={offer.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{offer.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {offer.discount_type === "percentage" ? `${offer.discount_value}%` : `€${offer.discount_value}`} zbritje
                      {offer.end_date && ` • Deri ${new Date(offer.end_date).toLocaleDateString("sq")}`}
                    </p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Aktiv</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka zbritje aktive</div>
          )}
        </div>

        {/* Active Coupons */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Kuponat aktive</h3>
            </div>
            <Link to="/admin/coupons" className="text-xs text-primary hover:underline">Menaxho</Link>
          </div>
          {stats?.coupons && stats.coupons.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.coupons.map((coupon: any) => (
                <div key={coupon.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-semibold text-foreground bg-muted px-2 py-0.5 rounded">{coupon.code}</code>
                        <button
                          onClick={() => handleCopy(coupon.code, coupon.id)}
                          className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Kopjo kodin"
                        >
                          {copiedId === coupon.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `€${coupon.discount_value}`}
                        {coupon.max_uses && ` • ${coupon.used_count}/${coupon.max_uses} përdorime`}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Aktiv</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka kupona aktive</div>
          )}
        </div>
      </div>

      {/* Shipping & Payments Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Shipping / Delivery Times */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Koha e dërgesës</h3>
            </div>
            <Link to="/admin/shipping" className="text-xs text-primary hover:underline">Menaxho</Link>
          </div>
          {stats?.shipping && stats.shipping.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.shipping.map((method: any) => (
                <div key={method.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{method.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {method.estimated_days || "Pa specifikuar"} ditë
                      {method.zones && ` • ${method.zones}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{formatCurrency(Number(method.price))}</span>
                    <button
                      onClick={() => handleCopy(`${method.name}: ${method.estimated_days || "?"} ditë - ${formatCurrency(Number(method.price))}`, `ship-${method.id}`)}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      title="Kopjo"
                    >
                      {copiedId === `ship-${method.id}` ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka metoda dërgese</div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Pagesat e fundit</h3>
            </div>
            <Link to="/admin/payments" className="text-xs text-primary hover:underline">Shiko të gjitha</Link>
          </div>
          {stats?.payments && stats.payments.length > 0 ? (
            <div className="divide-y divide-border">
              {stats.payments.slice(0, 5).map((payment: any) => (
                <div key={payment.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{methodIcons[payment.method] || "💳"}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{formatCurrency(Number(payment.amount))}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.method === "card" ? "Kartë" : payment.method === "bank_transfer" ? "Transfer bankar" : payment.method}
                        {payment.reference && ` • ${payment.reference}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", paymentStatusColors[payment.status] || "bg-muted text-muted-foreground")}>
                      {payment.status === "completed" ? "Përfunduar" : payment.status === "pending" ? "Në pritje" : payment.status}
                    </span>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(payment.created_at).toLocaleDateString("sq")}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">Nuk ka pagesa ende</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Porositë e fundit</h3>
          <Link to="/admin/orders" className="text-xs text-primary hover:underline">Shiko të gjitha</Link>
        </div>
        {stats?.recentOrders && stats.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Porosia</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Klienti</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Data</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Totali</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-primary">{order.id.substring(0, 8)}</td>
                    <td className="px-5 py-3 text-sm text-foreground">{order.customers?.name || "—"}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("sq")}</td>
                    <td className="px-5 py-3">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize", statusColors[order.status] || "bg-muted text-muted-foreground")}>{order.status}</span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground text-right">{formatCurrency(Number(order.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-muted-foreground">Nuk ka porosi ende</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
