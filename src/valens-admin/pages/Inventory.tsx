import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: variants = [], isLoading } = useQuery({
    queryKey: ["inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*, products(name, is_active)")
        .order("stock", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      const { error } = await supabase.from("product_variants").update({ stock }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ title: "Stoku u përditësua" });
    },
  });

  const filtered = variants.filter((v: any) => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.sku.toLowerCase().includes(search.toLowerCase()) || v.products?.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || (filter === "low" && v.stock > 0 && v.stock <= 10) || (filter === "out" && v.stock === 0);
    return matchSearch && matchFilter;
  });

  const totalItems = variants.length;
  const lowStock = variants.filter((v: any) => v.stock > 0 && v.stock <= 10).length;
  const outOfStock = variants.filter((v: any) => v.stock === 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Inventari</h1>
        <p className="text-sm text-muted-foreground mt-1">Menaxhoni stokun e varianteve</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><Package size={16} className="text-primary" /><span className="text-xs text-muted-foreground">Total Variante</span></div>
          <p className="text-xl font-semibold text-foreground">{totalItems}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className="text-amber-500" /><span className="text-xs text-muted-foreground">Stok i Ulët</span></div>
          <p className="text-xl font-semibold text-amber-600">{lowStock}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1"><AlertTriangle size={16} className="text-destructive" /><span className="text-xs text-muted-foreground">Pa Stok</span></div>
          <p className="text-xl font-semibold text-destructive">{outOfStock}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-muted-foreground" />
          <input type="text" placeholder="Kërko variante..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
          {([["all", "Të gjitha"], ["low", "Stok i ulët"], ["out", "Pa stok"]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", filter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka variante për të shfaqur</p></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Produkti</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Varianti</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">SKU</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Çmimi</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Stoku</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Ndrysho Stok</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((v: any) => (
                <tr key={v.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-foreground">{v.products?.name || "—"}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{v.name}</td>
                  <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{v.sku}</td>
                  <td className="px-5 py-3 text-sm text-foreground text-right">€{Number(v.price).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={cn("text-sm font-semibold", v.stock === 0 ? "text-destructive" : v.stock <= 10 ? "text-amber-600" : "text-foreground")}>{v.stock}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => updateStock.mutate({ id: v.id, stock: Math.max(0, v.stock - 1) })} className="w-7 h-7 rounded border border-border hover:bg-accent text-sm font-medium">−</button>
                      <input type="number" value={v.stock} onChange={(e) => updateStock.mutate({ id: v.id, stock: Math.max(0, parseInt(e.target.value) || 0) })} className="w-16 h-7 text-center text-sm border border-border rounded bg-background" />
                      <button onClick={() => updateStock.mutate({ id: v.id, stock: v.stock + 1 })} className="w-7 h-7 rounded border border-border hover:bg-accent text-sm font-medium">+</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;
