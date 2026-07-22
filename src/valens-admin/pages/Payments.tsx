import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const Payments = () => {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payments").select("*, orders(order_number, customers(name))").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const stats = {
    total: payments.reduce((s: number, p: any) => s + Number(p.amount), 0),
    completed: payments.filter((p: any) => p.status === "completed").length,
    pending: payments.filter((p: any) => p.status === "pending").length,
    failed: payments.filter((p: any) => p.status === "failed").length,
  };

  const statusIcons: Record<string, any> = { completed: CheckCircle, pending: Clock, failed: XCircle };
  const statusColors: Record<string, string> = { completed: "bg-emerald-100 text-emerald-700", pending: "bg-amber-100 text-amber-700", failed: "bg-red-100 text-red-700" };
  const statusLabels: Record<string, string> = { completed: "Përfunduar", pending: "Në pritje", failed: "Dështuar" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-foreground">Pagesat</h1><p className="text-sm text-muted-foreground mt-1">{payments.length} transaksione</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><CreditCard size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Totali</span></div>
          <p className="text-xl font-semibold text-foreground">€{stats.total.toLocaleString()}</p>
        </div>
        {(["completed", "pending", "failed"] as const).map((s) => {
          const Icon = statusIcons[s];
          return (
            <div key={s} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1"><Icon size={16} className={cn(s === "completed" ? "text-emerald-500" : s === "pending" ? "text-amber-500" : "text-destructive")} /><span className="text-xs text-muted-foreground">{statusLabels[s]}</span></div>
              <p className="text-xl font-semibold text-foreground">{s === "completed" ? stats.completed : s === "pending" ? stats.pending : stats.failed}</p>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka pagesa ende</p></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Referenca</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Porosia</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Metoda</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Shuma</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Data</th>
            </tr></thead>
            <tbody>
              {payments.map((p: any) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-mono text-muted-foreground">{p.reference || p.id.substring(0, 8)}</td>
                  <td className="px-5 py-3 text-sm text-primary">{p.orders?.order_number || "—"}</td>
                  <td className="px-5 py-3 text-sm text-foreground capitalize">{p.method}</td>
                  <td className="px-5 py-3"><span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusColors[p.status])}>{statusLabels[p.status] || p.status}</span></td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground text-right">€{Number(p.amount).toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString("sq")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payments;
