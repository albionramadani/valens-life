// Edge function: admin-mfa-reset
// Allows the authenticated user to delete ALL their own MFA factors so they can re-enroll.
// Uses service role + direct GoTrue admin REST API to bypass AAL2 requirement.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

  // Validate caller's JWT (any authenticated user can reset their OWN factors).
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;

  // GoTrue admin REST API to list and delete factors.
  const adminHeaders = {
    apikey: SERVICE_ROLE,
    Authorization: `Bearer ${SERVICE_ROLE}`,
    "Content-Type": "application/json",
  };

  try {
    // List factors
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}/factors`, {
      headers: adminHeaders,
    });
    if (!listRes.ok) {
      const txt = await listRes.text();
      return new Response(JSON.stringify({ error: "list_failed", detail: txt }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const listJson = await listRes.json();
    const factors: Array<{ id: string }> = listJson?.factors || listJson || [];

    let deleted = 0;
    const errors: string[] = [];
    for (const f of factors) {
      const delRes = await fetch(
        `${SUPABASE_URL}/auth/v1/admin/users/${userId}/factors/${f.id}`,
        { method: "DELETE", headers: adminHeaders },
      );
      if (delRes.ok) deleted++;
      else errors.push(`${f.id}: ${await delRes.text()}`);
    }

    return new Response(JSON.stringify({ success: true, deleted, total: factors.length, errors }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
