"use client";

import { useEffect, useRef, useState } from "react";

const SHOW_AFTER_PX = 600;

/**
 * The floating back-to-top arrow (his ask, 16 Aug 2026), dressed to the
 * teardown's icon-button spec: a true circle wearing a permanent soft
 * shadow as its resting affordance — no hover state, cursor alone.
 * Same rAF-throttled scroll listener as the summary bar (an
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
      className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg font-bold text-slate-700 shadow-[0_0_8px_rgba(0,0,0,0.2)]"
    >
      ↑
    </button>
  );
}
