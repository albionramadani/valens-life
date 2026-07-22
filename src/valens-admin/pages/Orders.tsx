import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Loader2, Eye, X, Pencil, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const statusFilters = ["all", "processing", "shipped", "delivered", "cancelled"];
const statusLabels: Record<string, string> = { processing: "Në përpunim", shipped: "Dërguar", delivered: "Dorëzuar", cancelled: "Anuluar" };

type OrderItem = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total: number;
  variant?: { sku: string | null; attributes: any } | null;
};

const attrLabels: Record<string, string> = {
  chip: "Chip",
  processor: "Procesor",
  ram: "RAM",
  memory: "Memorie",
  storage: "Hapësira",
  color: "Ngjyra",
  size: "Madhësia",
  display: "Ekrani",
};

const renderAttrs = (attrs: any) => {
  if (!attrs || typeof attrs !== "object") return null;
  const entries = Object.entries(attrs).filter(([, v]) => v != null && v !== "");
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {entries.map(([k, v]) => (
        <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          <span className="font-medium">{attrLabels[k.toLowerCase()] || k}:</span> {String(v)}
        </span>
      ))}
    </div>
  );
};

const Orders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editShippingAddress, setEditShippingAddress] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editShippingCost, setEditShippingCost] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(name, email, phone), order_items(id, product_id, variant_id, product_name, variant_name, quantity, unit_price, total)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Enrich viewed order items with variant details (sku/attributes)
  useEffect(() => {
    const loadVariants = async () => {
      if (!viewOrder?.order_items?.length) return;
      const variantIds = viewOrder.order_items.map((i: any) => i.variant_id).filter(Boolean);
      if (variantIds.length === 0) {
        setEditItems(viewOrder.order_items);
        return;
      }
      const { data } = await supabase
        .from("product_variants")
        .select("id, sku, attributes")
        .in("id", variantIds);
      const map = new Map((data || []).map((v: any) => [v.id, v]));
      setEditItems(
        viewOrder.order_items.map((i: any) => ({ ...i, variant: i.variant_id ? map.get(i.variant_id) : null }))
      );
    };
    if (viewOrder) {
      loadVariants();
      setEditStatus(viewOrder.status);
      setEditPaymentStatus(viewOrder.payment_status);
      setEditShippingAddress(viewOrder.shipping_address || "");
      setEditNotes(viewOrder.notes || "");
      setEditShippingCost(Number(viewOrder.shipping_cost) || 0);
      setEditing(false);
    }
  }, [viewOrder]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Statusi u përditësua" });
    },
  });

  const saveOrder = useMutation({
    mutationFn: async () => {
      // Update items
      for (const item of editItems) {
        const total = Number(item.quantity) * Number(item.unit_price);
        const { error } = await supabase
          .from("order_items")
          .update({ quantity: item.quantity, unit_price: item.unit_price, total })
          .eq("id", item.id);
        if (error) throw error;
      }
      const subtotal = editItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
      const tax = Number(viewOrder.tax) || 0;
      const total = subtotal + tax + Number(editShippingCost);
      const { error } = await supabase
        .from("orders")
        .update({
          status: editStatus,
          payment_status: editPaymentStatus,
          shipping_address: editShippingAddress,
          notes: editNotes,
          shipping_cost: editShippingCost,
          subtotal,
          total,
        })
        .eq("id", viewOrder.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({ title: "Porosia u ruajt" });
      setEditing(false);
      setViewOrder(null);
    },
    onError: (e: any) => toast({ title: "Gabim", description: e.message, variant: "destructive" }),
  });

  const removeItem = async (itemId: string) => {
    if (!confirm("Hiq këtë artikull?")) return;
    const { error } = await supabase.from("order_items").delete().eq("id", itemId);
    if (error) {
      toast({ title: "Gabim", description: error.message, variant: "destructive" });
      return;
    }
    setEditItems((prev) => prev.filter((i) => i.id !== itemId));
    toast({ title: "Artikulli u hoq" });
  };

  const filtered = orders.filter((o: any) => {
    const matchSearch = o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customers?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const liveSubtotal = editItems.reduce((s, i) => s + Number(i.quantity) * Number(i.unit_price), 0);
  const liveTotal = liveSubtotal + (Number(viewOrder?.tax) || 0) + Number(editShippingCost);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Porositë</h1>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} porosi totale</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-muted-foreground" />
          <input type="text" placeholder="Kërko porosi..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize", statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {s === "all" ? "Të gjitha" : statusLabels[s] || s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka porosi</p></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Nr. Porosisë</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Klienti</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Data</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Artikuj</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Statusi</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Pagesa</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Totali</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order: any) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-primary">{order.order_number}</td>
                    <td className="px-5 py-3">
                      <p className="text-sm text-foreground">{order.customers?.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{order.customers?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("sq")}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground text-center">{order.order_items?.length || 0}</td>
                    <td className="px-5 py-3">
                      <select value={order.status} onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })} className={cn("text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer",
                        order.status === "processing" ? "bg-amber-100 text-amber-700" :
                        order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                        order.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                        "bg-red-100 text-red-700"
                      )}>
                        <option value="processing">Në përpunim</option>
                        <option value="shipped">Dërguar</option>
                        <option value="delivered">Dorëzuar</option>
                        <option value="cancelled">Anuluar</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                        order.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" :
                        order.payment_status === "pending" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      )}>{order.payment_status === "paid" ? "Paguar" : order.payment_status === "pending" ? "Në pritje" : "Rimbursuar"}</span>
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-foreground text-right">€{Number(order.total).toLocaleString()}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setViewOrder(order)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"><Eye size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewOrder(null)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-lg font-semibold text-foreground">Porosia {viewOrder.order_number}</h2>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <button onClick={() => saveOrder.mutate()} disabled={saveOrder.isPending} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 disabled:opacity-50">
                      {saveOrder.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Ruaj
                    </button>
                    <button onClick={() => setEditing(false)} className="px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-accent">Anulo</button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-accent">
                    <Pencil size={14} /> Modifiko
                  </button>
                )}
                <button onClick={() => setViewOrder(null)} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Klienti:</span> <span className="text-foreground font-medium">{viewOrder.customers?.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{viewOrder.customers?.email}</span></div>
                {viewOrder.customers?.phone && <div><span className="text-muted-foreground">Tel:</span> <span className="text-foreground">{viewOrder.customers.phone}</span></div>}
                <div>
                  <span className="text-muted-foreground">Statusi:</span>{" "}
                  {editing ? (
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="ml-1 text-xs border border-border rounded px-2 py-0.5 bg-background">
                      <option value="processing">Në përpunim</option>
                      <option value="shipped">Dërguar</option>
                      <option value="delivered">Dorëzuar</option>
                      <option value="cancelled">Anuluar</option>
                    </select>
                  ) : <span className="text-foreground capitalize">{statusLabels[viewOrder.status] || viewOrder.status}</span>}
                </div>
                <div>
                  <span className="text-muted-foreground">Pagesa:</span>{" "}
                  {editing ? (
                    <select value={editPaymentStatus} onChange={(e) => setEditPaymentStatus(e.target.value)} className="ml-1 text-xs border border-border rounded px-2 py-0.5 bg-background">
                      <option value="pending">Në pritje</option>
                      <option value="paid">Paguar</option>
                      <option value="refunded">Rimbursuar</option>
                    </select>
                  ) : <span className="text-foreground capitalize">{viewOrder.payment_status}</span>}
                </div>
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground block mb-1">Adresa:</span>
                {editing ? (
                  <textarea value={editShippingAddress} onChange={(e) => setEditShippingAddress(e.target.value)} className="w-full text-sm border border-border rounded p-2 bg-background" rows={2} />
                ) : <span className="text-foreground">{viewOrder.shipping_address || "—"}</span>}
              </div>

              <div className="text-sm">
                <span className="text-muted-foreground block mb-1">Shënime:</span>
                {editing ? (
                  <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full text-sm border border-border rounded p-2 bg-background" rows={2} />
                ) : <span className="text-foreground">{viewOrder.notes || "—"}</span>}
              </div>

              <h3 className="text-sm font-semibold text-foreground pt-2">Artikujt</h3>
              {editItems.length > 0 ? (
                <div className="space-y-2">
                  {editItems.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-3 bg-background/50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                          {item.variant_name && <p className="text-xs text-muted-foreground mt-0.5">{item.variant_name}</p>}
                          {item.variant?.sku && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">SKU: <span className="font-mono">{item.variant.sku}</span></p>
                          )}
                          {renderAttrs(item.variant?.attributes)}
                        </div>
                        {editing && (
                          <button onClick={() => removeItem(item.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-3 text-sm">
                        {editing ? (
                          <>
                            <label className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Sasia</span>
                              <input type="number" min={1} value={item.quantity} onChange={(e) => {
                                const q = Math.max(1, Number(e.target.value) || 1);
                                setEditItems((prev) => prev.map((i) => i.id === item.id ? { ...i, quantity: q, total: q * Number(i.unit_price) } : i));
                              }} className="w-16 text-sm border border-border rounded px-2 py-1 bg-background" />
                            </label>
                            <label className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Çmimi</span>
                              <input type="number" min={0} step="0.01" value={item.unit_price} onChange={(e) => {
                                const p = Number(e.target.value) || 0;
                                setEditItems((prev) => prev.map((i) => i.id === item.id ? { ...i, unit_price: p, total: i.quantity * p } : i));
                              }} className="w-24 text-sm border border-border rounded px-2 py-1 bg-background" />
                            </label>
                            <span className="ml-auto text-sm font-medium">€{(item.quantity * item.unit_price).toFixed(2)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted-foreground">Sasia: <span className="text-foreground">{item.quantity}</span></span>
                            <span className="text-muted-foreground">Çmimi: <span className="text-foreground">€{Number(item.unit_price).toLocaleString()}</span></span>
                            <span className="ml-auto font-medium">€{Number(item.total).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">Nuk ka artikuj</p>}

              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Nëntotali</span><span className="text-foreground">€{(editing ? liveSubtotal : Number(viewOrder.subtotal)).toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Taksa</span><span className="text-foreground">€{Number(viewOrder.tax).toFixed(2)}</span></div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transporti</span>
                  {editing ? (
                    <input type="number" min={0} step="0.01" value={editShippingCost} onChange={(e) => setEditShippingCost(Number(e.target.value) || 0)} className="w-24 text-sm border border-border rounded px-2 py-1 bg-background text-right" />
                  ) : <span className="text-foreground">€{Number(viewOrder.shipping_cost).toFixed(2)}</span>}
                </div>
                <div className="flex justify-between font-semibold text-base pt-1"><span>Totali</span><span>€{(editing ? liveTotal : Number(viewOrder.total)).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
