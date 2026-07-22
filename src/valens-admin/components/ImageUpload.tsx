import { useState, useRef } from "react";
import { Upload, X, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

/**
 * Image upload component.
 * Files are compressed client-side then uploaded to Cloud storage
 * (the public `product-media` bucket); only the public URL is stored.
 * No base64 is ever persisted to the database.
 */
const ImageUpload = ({ value, onChange, label = "Foto", className }: ImageUploadProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">(value && !value.startsWith("data:") ? "url" : "upload");
  const fileRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("compression failed"))),
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("invalid image"));
      img.src = url;
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    setUploading(true);
    try {
      const blob = await compressImage(file);
      const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("product-media")
        .upload(path, blob, { contentType: "image/jpeg", upsert: true });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("product-media").getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err?.message || "Ngarkimi dështoi");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const displayUrl = value;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex gap-1">
          <button type="button" onClick={() => setMode("upload")} className={cn("text-[10px] px-2 py-0.5 rounded", mode === "upload" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>Upload</button>
          <button type="button" onClick={() => setMode("url")} className={cn("text-[10px] px-2 py-0.5 rounded", mode === "url" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>URL</button>
        </div>
      </div>

      {mode === "url" ? (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => { onChange(e.target.value); }}
          placeholder="https://..."
          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
        />
      ) : (
        <>
          {displayUrl ? (
            <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
              <img src={displayUrl} alt="Preview" className="w-full h-32 object-cover" />
              <button type="button" onClick={clearImage} className="absolute top-2 right-2 p-1 bg-background/80 rounded-md hover:bg-background text-muted-foreground hover:text-destructive">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-2 h-32 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                uploading && "pointer-events-none opacity-70",
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/30"
              )}
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="text-muted-foreground animate-spin" />
                  <span className="text-xs text-muted-foreground">Duke ngarkuar...</span>
                </>
              ) : (
                <>
                  <Upload size={20} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Tërhiqni ose klikoni për të ngarkuar</span>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
        </>
      )}

      {error && (
        <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
          <AlertCircle size={10} /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
