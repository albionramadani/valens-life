import { useEffect, useRef, useId, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Cloudflare Turnstile widget.
 *
 * Site key resolution order:
 *   1. store_settings.turnstile_site_key (managed via /admin/settings → Siguria)
 *   2. VITE_TURNSTILE_SITE_KEY env var
 *   3. Cloudflare test key (always passes)
 *
 * Secret key (TURNSTILE_SECRET_KEY) must be set as a backend secret.
 */

const TEST_SITE_KEY = "1x00000000000000000000AA";
const ENV_SITE_KEY = (import.meta as any).env?.VITE_TURNSTILE_SITE_KEY || "";

let cachedSiteKey: string | null = null;
const fetchSiteKey = async (): Promise<string> => {
  if (cachedSiteKey) return cachedSiteKey;
  try {
    const { data } = await supabase
      .from("store_settings")
      .select("value")
      .eq("key", "turnstile_site_key")
      .maybeSingle();
    const v = (data?.value || "").trim();
    cachedSiteKey = v || ENV_SITE_KEY || TEST_SITE_KEY;
  } catch {
    cachedSiteKey = ENV_SITE_KEY || TEST_SITE_KEY;
  }
  return cachedSiteKey as string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement | string,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
        }
      ) => string;
      reset: (id?: string) => void;
      remove: (id: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

let scriptLoading: Promise<void> | null = null;
const loadScript = () => {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Turnstile"));
    document.head.appendChild(s);
  });
  return scriptLoading;
};

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const TurnstileWidget = ({ onVerify, onExpire, onError, theme = "light", className }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const id = useId();
  const [siteKey, setSiteKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSiteKey().then((k) => { if (!cancelled) setSiteKey(k); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          callback: (token) => onVerify(token),
          "error-callback": () => onError?.(),
          "expired-callback": () => onExpire?.(),
        });
      })
      .catch(() => onError?.());

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <div ref={containerRef} id={`ts-${id}`} className={className} />;
};

export default TurnstileWidget;
