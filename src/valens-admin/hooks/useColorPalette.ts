import { useMemo } from "react";
import { useHomepagePayload } from "@/hooks/useHomepagePayload";

export type PaletteColor = { name: string; hex: string };

const FALLBACK: PaletteColor[] = [
  { name: "Space Black", hex: "#1d1d1f" },
  { name: "Silver", hex: "#e3e4e5" },
  { name: "Starlight", hex: "#f0e4d3" },
  { name: "Midnight", hex: "#2e3642" },
  { name: "Space Gray", hex: "#86868b" },
  { name: "Gold", hex: "#f9d4a7" },
  { name: "Natural Titanium", hex: "#9a9690" },
  { name: "Blue Titanium", hex: "#3d4f5f" },
  { name: "White Titanium", hex: "#f2efea" },
  { name: "Black Titanium", hex: "#3c3c3d" },
  { name: "Desert Titanium", hex: "#c2b8a3" },
];

export const useColorPalette = () => {
  const { data } = useHomepagePayload();
  const palette = useMemo(() => {
    const value = data?.settings?.color_palette;
    if (!value) return FALLBACK;
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed as PaletteColor[];
      } catch {}
      return FALLBACK;
  }, [data?.settings?.color_palette]);

  const colorMap: Record<string, string> = {};
  palette.forEach((c) => (colorMap[c.name] = c.hex));

  return { palette, colorMap };
};
