import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, UserPlus, Trash2, X, Eye, EyeOff, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { adminCreateUser } from "@/lib/admin-users.functions";

const UsersRoles = () => {
  const [showAdd, setShowAdd] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const [{ data: profiles, error: pErr }, { data: roles, error: rErr }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (pErr) throw pErr;
      if (rErr) throw rErr;
      const rolesByUser = (roles || []).reduce<Record<string, { role: string }[]>>((acc, r: any) => {
        (acc[r.user_id] ||= []).push({ role: r.role });
        return acc;
      }, {});
      return (profiles || []).map((p: any) => ({ ...p, user_roles: rolesByUser[p.id] || [] }));
    },
  });

  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Roli u hoq" }); },
  });

  const addRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase.from("user_roles").insert([{ user_id: userId, role: role as any }]);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast({ title: "Roli u shtua" }); },
  });

  const sendReset = async (email: string) => {
    const { error } = await supabase.functions.invoke("send-password-reset", {
      body: { email, redirect_to: `${window.location.origin}/admin/reset-password` },
    });
    if (error) toast({ title: "Gabim: " + error.message, variant: "destructive" });
    else toast({ title: `Linku i rivendosjes u dërgua te ${email}` });
  };

  const roleColors: Record<string, string> = { admin: "bg-red-100 text-red-700", moderator: "bg-blue-100 text-blue-700", user: "bg-muted text-muted-foreground" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Përdoruesit & Rolet</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} përdorues</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <UserPlus size={16} /> Shto Përdorues
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-muted-foreground" size={24} /></div>
      ) : users.length === 0 ? (
        <div className="text-center py-20"><p className="text-muted-foreground">Nuk ka përdorues</p></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Përdoruesi</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Email</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Rolet</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Regjistruar</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Veprime</th>
            </tr></thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                        {(user.full_name || user.email)?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 flex-wrap">
                      {user.user_roles?.map((r: any) => (
                        <span key={r.role} className={cn("text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1", roleColors[r.role] || "bg-muted text-muted-foreground")}>
                          {r.role}
                          <button onClick={() => { if (confirm(`Hiq rolin ${r.role}?`)) removeRole.mutate({ userId: user.id, role: r.role }); }} className="hover:text-destructive"><X size={10} /></button>
                        </span>
                      ))}
                      {(!user.user_roles || user.user_roles.length === 0) && <span className="text-xs text-muted-foreground">Pa role</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString("sq")}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => { if (confirm(`Dërgo link rivendosjeje fjalëkalimi te ${user.email}?`)) sendReset(user.email); }}
                        className="inline-flex items-center gap-1 text-xs h-7 px-2 rounded border border-border hover:bg-accent"
                        title="Dërgo link rivendosjeje"
                      >
                        <KeyRound size={12} /> Reset
                      </button>
                      <select onChange={(e) => { if (e.target.value) { addRole.mutate({ userId: user.id, role: e.target.value }); e.target.value = ""; } }} className="text-xs h-7 rounded border border-border bg-background px-2" defaultValue="">
                        <option value="" disabled>+ Shto rol</option>
                        {["admin", "moderator", "user"].filter(r => !user.user_roles?.some((ur: any) => ur.role === r)).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} />}
    </div>
  );
};

const AddUserModal = ({ onClose }: { onClose: () => void }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const createUserFn = useServerFn(adminCreateUser);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "user" as "admin" | "moderator" | "user" });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;

    setFormError("");
    const email = form.email.trim().toLowerCase();
    const fullName = form.full_name.trim();
    if (!email || !form.password) {
      const message = "Email dhe fjalëkalimi janë të detyrueshme";
      setFormError(message);
      toast({ title: message, variant: "destructive" });
      return;
    }
    if (form.password.length < 12) {
      const message = "Fjalëkalimi duhet të ketë së paku 12 karaktere";
      setFormError(message);
      toast({ title: message, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await createUserFn({ data: { email, password: form.password, full_name: fullName, role: form.role } });
      toast({ title: "Përdoruesi u krijua me sukses" });
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onClose();
    } catch (err: any) {
      const message = err?.message || "Diçka shkoi keq";
      setFormError(message);
      toast({ title: "Gabim: " + message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <form className="bg-card border border-border rounded-xl w-full max-w-md" onSubmit={handleSave} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Shto Përdorues të Ri</h2>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Emri i plotë</label>
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Email *</label>
            <input type="email" required autoComplete="email" value={form.email} onChange={(e) => { setForm({ ...form, email: e.target.value }); setFormError(""); }} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Fjalëkalimi *</label>
            <div className="relative mt-1">
              <input type={showPw ? "text" : "password"} required minLength={12} autoComplete="new-password" value={form.password} onChange={(e) => { setForm({ ...form, password: e.target.value }); setFormError(""); }} className="w-full h-10 rounded-lg border border-input bg-background px-3 pr-10 text-sm" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Së paku 12 karaktere</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Roli</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "moderator" | "user" })} className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        </div>
        <div className="p-5 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-accent">Anulo</button>
          <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Krijo Përdoruesin
          </button>
        </div>
      </form>
    </div>
  );
};

export default UsersRoles;
