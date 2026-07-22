
import { } from "@tanstack/react-router";
import { useEffect } from "react";

const HOME_SECTION_IDS = ["categories", "products", "about", "faq", "contact"] as const;

const clearHash = () => {
  if (typeof window === "undefined") return;

  if (!window.location.hash) return;

  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}`
  );
};

const setHash = (id: string) => {
  if (typeof window === "undefined") return;

  const nextHash = `#${id}`;
  if (window.location.hash === nextHash) return;

  // Preserve the current path/search; only update the hash.
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}${nextHash}`
  );
};

const getScrollBehavior = () => {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return prefersReducedMotion ? "auto" : "smooth";
};

const scrollToCurrentHash = () => {
  if (typeof window === "undefined") return;

  const rawHash = window.location.hash;
  if (!rawHash || rawHash === "#") return;

  const id = decodeURIComponent(rawHash.replace(/^#/, ""));
  const el = document.getElementById(id);
  if (!el) return;

  // Wait a tick for layout (especially after route transitions)
  requestAnimationFrame(() => {
    el.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
  });
};

const SmoothScrollToHash = () => {
  const pathname = (typeof window !== "undefined" ? window.location.pathname : "/");

  useEffect(() => {
    scrollToCurrentHash();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const sections = HOME_SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );

    if (!sections.length) {
      return;
    }

    const sectionState: Record<string, { isIntersecting: boolean; ratio: number; top: number }> = {};

    const syncActiveHash = () => {
      if (window.scrollY < 80) {
        clearHash();
        return;
      }

      const visible = HOME_SECTION_IDS
        .map((id) => ({ id, ...sectionState[id] }))
        .filter((item) => item.isIntersecting);

      if (!visible.length) return;

      visible.sort((a, b) => {
        if (b.ratio !== a.ratio) return b.ratio - a.ratio;
        return a.top - b.top;
      });

      setHash(visible[0].id);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          sectionState[entry.target.id] = {
            isIntersecting: entry.isIntersecting,
            ratio: entry.intersectionRatio,
            top: entry.boundingClientRect.top,
          };
        }

        syncActiveHash();
      },
      {
        threshold: [0, 0.15, 0.3, 0.45, 0.6],
        rootMargin: "-120px 0px -55% 0px",
      }
    );

    for (const section of sections) observer.observe(section);

    const onScroll = () => {
      if (window.scrollY < 80) clearHash();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => scrollToCurrentHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
};

export default SmoothScrollToHash;
