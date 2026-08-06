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

// Deterministic seed (no localStorage). Identical on server + client, so it does
// not cause a hydration mismatch and nothing is persisted to the browser.
const SEED_PAYLOAD: HomepagePayload = { ...EMPTY_PAYLOAD, ...HOMEPAGE_PAYLOAD_SNAPSHOT };

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
      return { ...EMPTY_PAYLOAD, ...(rows?.[0]?.payload || {}) };
    },
    initialData: () => SEED_PAYLOAD,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
