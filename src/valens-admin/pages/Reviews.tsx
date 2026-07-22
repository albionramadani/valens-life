import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Star, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const statusFilters = ["all", "pending", "approved", "rejected"];
const statusLabels: Record<string, string> = { pending: "Në pritje", approved: "Aprovuar", rejected: "Refuzuar" };
const statusColors: Record<string, string> = { pending: "bg-amber-100 text-amber-700", approved: "bg-emerald-100 text-emerald-700", rejected: "bg-red-100 text-red-700" };

const Reviews = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reviews"] }); toast({ title: "Statusi u përditësua" }); },
  });

  const filtered = reviews.filter((r: any) => {
    const matchFilter = filter === "all" || r.status === filter;
    const matchSearch = !search || r.customer_name.toLowerCase().includes(search.toLowerCase()) || r.products?.name?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-foreground">Vlerësimet</h1><p className="text-sm text-muted-foreground mt-1">{reviews.length} vlerësime · ⭐ {avgRating} mesatare</p></div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 flex-1 max-w-sm">
          <Search size={16} className="text-muted-foreground" />
          <input type="text" placeholder="Kërko vlerësime..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg p-1">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {s === "all" ? "Të gjitha" : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka vlerësime</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review: any) => (
            <div key={review.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground">{review.customer_name}</span>
                    <span className="text-xs text-muted-foreground">{review.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} className={cn(i <= review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30")} />)}
                    <span className="text-xs text-muted-foreground ml-2">{review.products?.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusColors[review.status])}>{statusLabels[review.status] || review.status}</span>
                </div>
              </div>
              {review.title && <p className="text-sm font-medium text-foreground mb-1">{review.title}</p>}
              {review.comment && <p className="text-sm text-muted-foreground mb-3">{review.comment}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString("sq")}</span>
                <div className="flex items-center gap-1">
                  {review.status !== "approved" && <button onClick={() => updateStatus.mutate({ id: review.id, status: "approved" })} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-emerald-50 text-emerald-600 text-xs"><CheckCircle size={14} /> Aprovo</button>}
                  {review.status !== "rejected" && <button onClick={() => updateStatus.mutate({ id: review.id, status: "rejected" })} className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-red-50 text-red-600 text-xs"><XCircle size={14} /> Refuzo</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
