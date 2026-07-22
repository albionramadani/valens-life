import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bell, Info, AlertTriangle, CheckCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/valens-admin/hooks/use-toast";

const typeIcons: Record<string, any> = { info: Info, warning: AlertTriangle, success: CheckCircle, error: AlertTriangle };
const typeColors: Record<string, string> = { info: "bg-blue-100 text-blue-700", warning: "bg-amber-100 text-amber-700", success: "bg-emerald-100 text-emerald-700", error: "bg-red-100 text-red-700" };

const Notifications = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => { const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id); if (error) throw error; },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => { const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast({ title: "Të gjitha u shënuan si të lexuara" }); },
  });

  const deleteNotif = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("notifications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast({ title: "Njoftimi u fshi" }); },
  });

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-semibold text-foreground">Njoftimet</h1><p className="text-sm text-muted-foreground mt-1">{unreadCount} të palexuara</p></div>
        {unreadCount > 0 && <button onClick={() => markAllRead.mutate()} className="text-sm text-primary hover:underline">Shëno të gjitha si të lexuara</button>}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20"><Bell size={32} className="text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">Nuk ka njoftime</p></div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const Icon = typeIcons[n.type] || Info;
            return (
              <div key={n.id} className={cn("bg-card border rounded-xl p-4 flex items-start gap-3 transition-colors", n.is_read ? "border-border" : "border-primary/30 bg-primary/5")} onClick={() => !n.is_read && markRead.mutate(n.id)}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", typeColors[n.type])}><Icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={cn("text-sm", n.is_read ? "text-foreground" : "text-foreground font-semibold")}>{n.title}</p>
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleDateString("sq")}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id); }} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-destructive flex-shrink-0"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
