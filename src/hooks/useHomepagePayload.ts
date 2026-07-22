import { useQuery } from "@tanstack/react-query";
import { HOMEPAGE_PAYLOAD_SNAPSHOT } from "@/data/homepagePayloadSnapshot";

export interface HomepagePayload {
  settings: Record<string, string>;
  homepage_banners: any[];
  store_categories: any[];
  store_sessions: any[];
  featured_products: any[];
}

const EMPTY_PAYLOAD: HomepagePayload = {
  settings: {},
  homepage_banners: [],
  store_categories: [],
  store_sessions: [],
  featured_products: [],
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
const HOMEPAGE_CACHE_URL = `${SUPABASE_URL}/rest/v1/homepage_payload_cache?select=payload&cache_key=eq.homepage&limit=1`;

const readStoredPayload = (): HomepagePayload | undefined => {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem("valens_homepage_payload");
    return raw ? ({ ...EMPTY_PAYLOAD, ...JSON.parse(raw) } as HomepagePayload) : ({ ...EMPTY_PAYLOAD, ...HOMEPAGE_PAYLOAD_SNAPSHOT } as HomepagePayload);
  } catch {
    return { ...EMPTY_PAYLOAD, ...HOMEPAGE_PAYLOAD_SNAPSHOT } as HomepagePayload;
  }
};

const storePayload = (payload: HomepagePayload) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("valens_homepage_payload", JSON.stringify(payload));
  } catch {
    // Ignore storage quota/private-mode errors; the network payload still works.
  }
};

export const useHomepagePayload = () =>
  useQuery({
    queryKey: ["homepage_payload"],
    queryFn: async () => {
      const response = await fetch(HOMEPAGE_CACHE_URL, {
        headers: {
          Accept: "application/json",
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (!response.ok) throw new Error("Homepage payload request failed");
      const rows = (await response.json()) as { payload?: HomepagePayload }[];
      const payload = { ...EMPTY_PAYLOAD, ...(rows?.[0]?.payload || {}) };
      storePayload(payload);
      return payload;
    },
    initialData: readStoredPayload,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
