const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const MEMORY_TTL_MS = 60_000;
let memoryCache: { body: string; expires: number } | null = null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = Date.now();
  if (memoryCache && memoryCache.expires > now) {
    return json(memoryCache.body, "memory");
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Backend not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/homepage_payload_cache?select=payload&cache_key=eq.homepage`,
    {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json",
      },
    }
  );

  if (!res.ok) {
    return new Response(JSON.stringify({ error: "Homepage payload unavailable" }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const rows = await res.json();
  const body = JSON.stringify(rows?.[0]?.payload || {});
  memoryCache = { body, expires: now + MEMORY_TTL_MS };
  return json(body, "database");
});

function json(body: string, cacheStatus: string) {
  return new Response(body, {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      "X-Valens-Cache": cacheStatus,
    },
  });
}
