import { supabase } from "@/integrations/supabase/client";

/**
 * Verifies a Cloudflare Turnstile token via our edge function.
 * Returns true if verification succeeds, false otherwise.
 */
export const verifyTurnstileToken = async (token: string): Promise<boolean> => {
  if (!token) return false;
  try {
    const { data, error } = await supabase.functions.invoke("verify-turnstile", {
      body: { token },
    });
    if (error) return false;
    return !!(data as any)?.success;
  } catch {
    return false;
  }
};
