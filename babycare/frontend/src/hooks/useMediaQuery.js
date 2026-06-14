import { useState, useEffect } from "react";

/**
 * useMediaQuery — Detects if a media query matches.
 *
 * Usage:
 *   const isMobile = useMediaQuery("(max-width: 768px)");
 *   if (isMobile) return <MobileLayout />;
 */
export function useMediaQuery(query) {
  const getMatch = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);

    // Initial sync (in case state was stale)
    setMatches(mql.matches);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
      return () => mql.removeEventListener("change", handler);
    }
    // Safari < 14 fallback
    mql.addListener(handler);
    return () => mql.removeListener(handler);
  }, [query]);

  return matches;
}

// ─── Breakpoint convenience hooks ───
// Tailwind-like breakpoints
export const useIsMobile = () => useMediaQuery("(max-width: 640px)");      // sm
export const useIsTablet = () => useMediaQuery("(max-width: 768px)");      // md
export const useIsLaptop = () => useMediaQuery("(max-width: 1024px)");     // lg
export const useIsDesktop = () => useMediaQuery("(min-width: 1025px)");

// Orientation
export const useIsPortrait = () => useMediaQuery("(orientation: portrait)");
export const useIsLandscape = () => useMediaQuery("(orientation: landscape)");

// Dark mode preference (user system setting)
export const usePrefersDark = () => useMediaQuery("(prefers-color-scheme: dark)");

// Reduced motion preference
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

/**
 * useIsPWA — Detect if app is running as installed PWA.
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);
  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true; // iOS
    setIsPWA(isStandalone);
  }, []);
  return isPWA;
}
