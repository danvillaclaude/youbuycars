"use client";

import { useEffect, useRef, useState } from "react";

const SHOW_AFTER_PX = 600;

/**
 * The floating back-to-top arrow (his ask, 16 Aug 2026; refined the
 * same day: "just the arrow without the white circle button... 75%
 * transparency (25% see through)" — a bare glyph at opacity-75, no
 * chrome). Same rAF-throttled scroll listener as the summary bar (an
 * IntersectionObserver misses jump-scrolls; a rect read never does).
 * z-40 keeps it under the sticky bar (z-50) and the lightbox (z-100).
 */
export function BackToTop() {
  const [shown, setShown] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      ticking.current = false;
      setShown(window.scrollY > SHOW_AFTER_PX);
    };
    const onScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!shown) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-4 right-4 z-40 p-2 text-3xl font-bold leading-none text-slate-900 opacity-75"
    >
      ↑
    </button>
  );
}
