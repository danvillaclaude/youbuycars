"use client";

import { useEffect } from "react";

/**
 * The browser half of listing analytics (0007). sendBeacon where it
 * exists — it survives the page unloading under a tel:/sms: tap — with
 * keepalive fetch as the fallback. Fire-and-forget everywhere: analytics
 * must never cost a shopper anything, including an error in the console.
 */
export function track(listingId: string, kind: string): void {
  try {
    const payload = JSON.stringify({ listing_id: listingId, kind });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    });
  } catch {
    // Never a shopper's problem.
  }
}

/**
 * One view per listing per browser session — sessionStorage is the dedup,
 * so a shopper flipping between photos and specs isn't ten views, and a
 * crawler (which doesn't run this at all) is zero.
 */
export function TrackView({ listingId }: { listingId: string }) {
  useEffect(() => {
    const key = `ybc-viewed-${listingId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Storage blocked (private mode hardening) — count it anyway.
    }
    track(listingId, "view");
  }, [listingId]);
  return null;
}

/** A contact CTA that logs its tap on the way out the door. */
export function TrackedContact({
  href,
  listingId,
  kind,
  className,
  children,
}: {
  href: string;
  listingId: string;
  kind: "text_tap" | "call_tap";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => track(listingId, kind)}
    >
      {children}
    </a>
  );
}
