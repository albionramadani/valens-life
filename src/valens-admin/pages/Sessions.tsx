import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/valens-admin/hooks/use-toast";

interface Session {
  id: string;
  category: string;
  title: string;
  date_text: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

const emptyForm = { category: "", title: "", date_text: "", image_url: "", sort_order: 0, is_active: true };

const Sessions = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Session | null>(null);
  const [form, setForm] = useState(emptyForm);
  const { toast } = useToast();

  const fetchSessions = async () => {
    const { data } = await supabase
      .from("store_sessions")
      .select("*")
      .order("sort_order");
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSessions(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (s: Session) => {
    setEditing(s);
    setForm({ category: s.category, title: s.title, date_text: s.date_text, image_url: s.image_url || "", sort_order: s.sort_order, is_active: s.is_active });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...form, image_url: form.image_url || null };
    if (editing) {
      const { error } = await supabase.from("store_sessions").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("store_sessions").insert(payload);
      if (error) { toast({ title: "Gabim", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editing ? "U përditësua" : "U shtua" });
    setOpen(false);
    fetchSessions();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Jeni i sigurt?")) return;
    await supabase.from("store_sessions").delete().eq("id", id);
    fetchSessions();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sesionet</h1>
          <p className="text-sm text-muted-foreground">Menaxho sesionet që shfaqen në faqen kryesore</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew}><Plus size={16} className="mr-2" />Shto sesion</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Ndrysho sesionin" : "Sesion i ri"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Kategoria</Label>
                <Input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="p.sh. Konfigurim" />
              </div>
              <div>
                <Label>Titulli</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="p.sh. Konfigurimi i Pajisjes" />
              </div>
              <div>
                <Label>Data / Orari</Label>
                <Input value={form.date_text} onChange={e => setForm({ ...form, date_text: e.target.value })} placeholder="p.sh. Çdo ditë, 10:00 – 20:00" />
              </div>
              <div>
                <Label>URL e fotos</Label>
                <Input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Renditja</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => setForm({ ...form, is_active: v })} />
                <Label>Aktiv</Label>
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Ruaj ndryshimet" : "Shto"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Duke ngarkuar...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kategoria</TableHead>
              <TableHead>Titulli</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Renditja</TableHead>
              <TableHead>Aktiv</TableHead>
              <TableHead className="text-right">Veprime</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.category}</TableCell>
                <TableCell>{s.title}</TableCell>
                <TableCell>{s.date_text}</TableCell>
                <TableCell>{s.sort_order}</TableCell>
                <TableCell>{s.is_active ? "Po" : "Jo"}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil size={14} /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Sessions;
