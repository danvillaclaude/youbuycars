"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The sticky condensed summary bar from the teardown — the small, cheap
 * addition it singles out as having outsized effect: once the buy box
 * scrolls away, a slim bar keeps the car's name, price and contact CTA
 * reachable. Renders its own sentinel where it's placed (right after the
 * hero grid); the bar appears only when the sentinel has scrolled above
 * the viewport.
 */
export function SummaryBar({
  name,
  mileage,
  price,
  monthly,
  photoUrl,
  contactHref,
}: {
  name: string;
  mileage: string;
  price: string;
  monthly: string | null;
  photoUrl: string | null;
  contactHref: string;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  /*
   * A scroll listener, deliberately NOT an IntersectionObserver: the
   * observer only fires when the sentinel CROSSES the viewport, so a
   * jump scroll (Home key, an anchor link) that leaps from "below the
   * fold" to "above the top" in one frame never changes the intersection
   * state — and the bar sticks. Shipped that way once; caught the same
   * day. Reading the rect on scroll, rAF-throttled, has no such gap.
   */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    let ticking = false;
    const update = () => {
      ticking = false;
      setShown(el.getBoundingClientRect().top < 0);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden />
      {shown && (
        <div className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-2">
            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt=""
                className="hidden h-9 w-12 rounded-md object-cover sm:block"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {name}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">{mileage}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                {price}
              </p>
              {monthly && (
                <p className="text-xs font-semibold text-green-700 tabular-nums">
                  {monthly}
                </p>
              )}
            </div>
            <a
              href={contactHref}
              className="shrink-0 rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              💬 Text
            </a>
          </div>
        </div>
      )}
    </>
  );
}
