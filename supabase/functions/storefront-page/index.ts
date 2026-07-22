const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const MEMORY_TTL_MS = 60_000;
const memoryCache = new Map<string, { body: string; expires: number }>();

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json(JSON.stringify({ error: "Method not allowed" }), 405, "none");

  const key = new URL(req.url).searchParams.get("key") || "";
  if (!/^(shop|sales|category:[a-z0-9-]+|product:[a-z0-9-]+)$/.test(key)) {
    return json(JSON.stringify({ error: "Invalid page key" }), 400, "none");
  }

  const now = Date.now();
  const hit = memoryCache.get(key);
  if (hit && hit.expires > now) return json(hit.body, 200, "memory");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json(JSON.stringify({ error: "Backend not configured" }), 500, "none");

  const res = await fetch(
    `${supabaseUrl}/rest/v1/storefront_page_cache?select=payload&cache_key=eq.${encodeURIComponent(key)}`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) return json(JSON.stringify({ error: "Page payload unavailable" }), 502, "database-error");
  const rows = await res.json();
  const body = JSON.stringify(rows?.[0]?.payload || null);
  memoryCache.set(key, { body, expires: now + MEMORY_TTL_MS });
  return json(body, 200, "database");
});

function json(body: string, status: number, cacheStatus: string) {
  return new Response(body, {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "X-Valens-Cache": cacheStatus,
    },
  });
}
