import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, ArrowLeft, ArrowRight, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/valens-admin/hooks/use-toast";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

interface Props {
  productId: string | null;
  /** Optional: keep main image_url synced to first gallery image */
  onPrimaryChange?: (url: string) => void;
}

const MAX_DIM = 1600;
const QUALITY = 0.85;

const compressImage = (file: File): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      const ratio = Math.min(1, MAX_DIM / Math.max(width, height));
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      // White background prevents transparent → black on JPEG
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))),
        "image/jpeg",
        QUALITY
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("invalid image")); };
    img.src = url;
  });

const uploadToStorage = async (blob: Blob): Promise<string> => {
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
  const { error } = await supabase.storage
    .from("product-media")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  return supabase.storage.from("product-media").getPublicUrl(path).data.publicUrl;
};

const ProductGalleryManager = ({ productId, onPrimaryChange }: Props) => {
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!productId) { setImages([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("product_images" as any)
      .select("id, url, alt, sort_order")
      .eq("product_id", productId)
      .order("sort_order");
    setImages(((data as any) || []) as GalleryImage[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [productId]);

  const syncPrimary = (list: GalleryImage[]) => {
    if (onPrimaryChange) onPrimaryChange(list[0]?.url || "");
  };

  const handleFiles = async (files: FileList | File[]) => {
    if (!productId) {
      toast({ title: "Ruani produktin fillimisht", description: "Pastaj mund të ngarkoni foto.", variant: "destructive" });
      return;
    }
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!arr.length) return;
    setUploading(true);
    const startOrder = images.length;
    const rows: { product_id: string; url: string; sort_order: number }[] = [];
    for (let i = 0; i < arr.length; i++) {
      try {
        const blob = await compressImage(arr[i]);
        const publicUrl = await uploadToStorage(blob);
        rows.push({ product_id: productId, url: publicUrl, sort_order: startOrder + i });
      } catch {
        toast({ title: `Foto e pavlefshme: ${arr[i].name}`, variant: "destructive" });
      }
    }
    if (rows.length) {
      const { error } = await supabase.from("product_images" as any).insert(rows);
      if (error) { toast({ title: "Gabim ngarkimi", description: error.message, variant: "destructive" }); }
      else { toast({ title: `${rows.length} foto u shtuan` }); await load().then(() => {/* primary synced via effect below */}); }
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  // Sync primary whenever images list changes
  useEffect(() => { syncPrimary(images); /* eslint-disable-next-line */ }, [images]);

  const removeImage = async (id: string) => {
    if (!confirm("Fshi foton?")) return;
    await supabase.from("product_images" as any).delete().eq("id", id);
    const next = images.filter((i) => i.id !== id).map((i, idx) => ({ ...i, sort_order: idx }));
    setImages(next);
    // Persist new sort orders
    for (const img of next) {
      await supabase.from("product_images" as any).update({ sort_order: img.sort_order }).eq("id", img.id);
    }
  };

  const move = async (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    const reordered = next.map((i, n) => ({ ...i, sort_order: n }));
    setImages(reordered);
    await supabase.from("product_images" as any).update({ sort_order: idx }).eq("id", reordered[idx].id);
    await supabase.from("product_images" as any).update({ sort_order: target }).eq("id", reordered[target].id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">Foto të produktit (galeria)</label>
        <span className="text-[11px] text-muted-foreground">E para = foto kryesore. Optimizuar automatikisht.</span>
      </div>

      {!productId && (
        <div className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/40 border border-dashed border-border">
          Ruani produktin së pari për të shtuar foto në galeri.
        </div>
      )}

      {productId && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"}`}
          >
            {uploading ? <Loader2 className="animate-spin text-muted-foreground" size={20} /> : <Upload size={20} className="text-muted-foreground" />}
            <span className="text-xs text-muted-foreground">{uploading ? "Duke ngarkuar..." : "Tërhiq ose klikoni — mund të zgjidhni disa foto"}</span>
            <span className="text-[10px] text-muted-foreground/60">JPG / PNG / WEBP • Riatdesinohet në max {MAX_DIM}px</span>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />

          {loading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-muted-foreground" size={18} /></div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
              {images.map((img, idx) => (
                <div key={img.id} className="relative group rounded-lg border border-border overflow-hidden bg-white">
                  <div className="aspect-square flex items-center justify-center p-1">
                    <img src={img.url} alt={img.alt || `Foto ${idx + 1}`} className="max-w-full max-h-full object-contain" />
                  </div>
                  {idx === 0 && <span className="absolute top-1 left-1 text-[9px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-medium">Kryesore</span>}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1 bg-background/85 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-accent disabled:opacity-30"><ArrowLeft size={12} /></button>
                    <button type="button" onClick={() => removeImage(img.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><X size={12} /></button>
                    <button type="button" onClick={() => move(idx, 1)} disabled={idx === images.length - 1} className="p-1 rounded hover:bg-accent disabled:opacity-30"><ArrowRight size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-3 py-3">
              <ImageIcon size={14} /> Asnjë foto ende
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGalleryManager;
