"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The photo gallery + lightbox, the teardown's shape: a counter chip on
 * the main image, click to open a full-screen modal — title bar with the
 * car's name and price, a scrollable thumbnail rail (desktop), round
 * prev/next buttons, arrow keys and Escape. No library; it's a dialog,
 * two buttons and an index.
 */
export function Gallery({
  photos,
  name,
  price,
}: {
  photos: { id: string; url: string; srcSet: string; thumb: string }[];
  name: string;
  price: string;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const step = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + photos.length) % photos.length);
    },
    [photos.length],
  );

  /*
   * The lightbox promised aria-modal and delivered none of it (23 Aug
   * 2026 audit): focus stayed on the cover button UNDER the overlay, and
   * Tab walked the buy box behind it. Now focus lands on Close, Tab
   * wraps inside the dialog, and closing returns to the cover.
   */
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!dialogRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      trigger?.focus();
    };
  }, [open, step]);

  const current = photos[index] ?? photos[0];

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-slate-100"
        aria-label={`Open photo gallery, ${photos.length} ${photos.length === 1 ? "photo" : "photos"}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          srcSet={current.srcSet}
          sizes="(min-width: 1152px) 660px, (min-width: 1024px) 60vw, 100vw"
          alt={name}
          fetchPriority="high"
          decoding="async"
          className="aspect-[16/10] w-full object-cover"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
          {index + 1}/{photos.length}
        </span>
      </button>

      {photos.length > 1 && (
        <div className="mt-2.5 grid grid-cols-4 gap-2.5 sm:grid-cols-5">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`overflow-hidden rounded-lg ${
                i === index ? "ring-2 ring-blue-600" : ""
              }`}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt="" loading="lazy" fetchPriority="low" decoding="async" className="aspect-[4/3] w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          className="fixed inset-0 z-[100] flex flex-col bg-slate-950/95"
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="truncate text-sm font-semibold">
              {name} <span className="ml-2 font-bold tabular-nums">{price}</span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close gallery"
              className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold hover:bg-white/20"
            >
              ✕
            </button>
          </div>
          <div className="flex min-h-0 flex-1 gap-3 p-4 pt-0">
            {photos.length > 1 && (
              <div className="hidden w-24 shrink-0 space-y-2 overflow-y-auto sm:block">
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`block w-full overflow-hidden rounded-lg ${
                      i === index ? "ring-2 ring-blue-500" : "opacity-60 hover:opacity-100"
                    }`}
                    aria-label={`Photo ${i + 1}`}
                    aria-current={i === index ? "true" : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.thumb} alt="" className="aspect-[4/3] w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex min-w-0 flex-1 items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.url}
                alt={`${name}, photo ${index + 1}`}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3.5 py-2.5 text-lg font-bold text-slate-900 hover:bg-white"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3.5 py-2.5 text-lg font-bold text-slate-900 hover:bg-white"
                  >
                    ›
                  </button>
                </>
              )}
              <span className="absolute bottom-3 rounded-full bg-slate-900/70 px-2.5 py-1 text-xs font-semibold text-white tabular-nums">
                {index + 1}/{photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
