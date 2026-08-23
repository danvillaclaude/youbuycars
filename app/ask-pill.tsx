"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * The persistent Ask-AI pill (17 Aug 2026, from the fresh CarGurus
 * look: their "Ask Guru" bubble rides every page, bottom-right). Ours
 * opens /ask — the teaser today, the real assistant when it lands. It
 * REPLACED the back-to-top arrow outright, the owner's call: one
 * floating thing per corner, and this one earns the spot.
 *
 * Two refinements from his desktop pass the same day: the pill runs at
 * 75% opacity ("it looks too solid right now" — his 75% has always
 * meant 25% see-through), and it ducks away once the footer scrolls
 * into view, so it never floats over the site's own ground floor.
 * Footer-watching is an rAF scroll listener, not an IntersectionObserver
 * — jump-scrolls skip crossings and IO never fires (the SummaryBar
 * lesson).
 */
export function AskPill() {
  const [hidden, setHidden] = useState(false);
  // A chat thread's composer sits in the pill's corner, and its Send
  // button is the one control on that page (23 Aug 2026 audit). The
  // pill stays off the threads; the inbox list keeps it.
  const pathname = usePathname();
  const onThread = /^\/messages\/(?!start$)[^/]+$/.test(pathname ?? "");

  useEffect(() => {
    let ticking = false;
    const check = () => {
      ticking = false;
      const footer = document.querySelector("footer");
      if (!footer) return;
      setHidden(footer.getBoundingClientRect().top < window.innerHeight);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(check);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <Link
      href="/ask"
      aria-hidden={hidden || onThread || undefined}
      tabIndex={hidden || onThread ? -1 : undefined}
      className={`fixed bottom-4 right-4 z-40 rounded-full bg-slate-900/75 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/20 transition-opacity duration-150 hover:bg-slate-900/90 ${
        hidden || onThread ? "pointer-events-none opacity-0" : ""
      }`}
    >
      ✦ Ask AI
    </Link>
  );
}
