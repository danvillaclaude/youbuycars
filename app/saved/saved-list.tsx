"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  emptySnapshot,
  savedSnapshot,
  subscribeSaved,
} from "@/app/saved-cars";
import { ListingCard } from "@/app/listing-card";
import type { Listing, ListingPhoto } from "@/lib/listings";

/**
 * The saved-cars board: slugs from the device store, cars from the
 * public board (anon reads active AND sold — a saved car that sold
 * stays visible wearing its Sold state rather than vanishing, the same
 * never-a-ghost rule as everywhere else). Un-hearting removes the card
 * live via the store subscription.
 */
export function SavedList() {
  const slugs = useSyncExternalStore(subscribeSaved, savedSnapshot, emptySnapshot);
  const [loaded, setLoaded] = useState<{
    listings: Listing[];
    covers: Record<string, string>;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (slugs.length === 0) return; // Empty renders directly, no fetch.
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("listings")
        .select("*")
        .in("slug", slugs)
        .in("status", ["active", "sold"]);
      const listings = (data ?? []) as Listing[];
      const covers: Record<string, string> = {};
      if (listings.length > 0) {
        const { data: photoData } = await supabase
          .from("listing_photos")
          .select("listing_id, storage_path, sort_order")
          .in("listing_id", listings.map((l) => l.id))
          .order("sort_order");
        for (const p of (photoData ?? []) as ListingPhoto[]) {
          if (!covers[p.listing_id]) covers[p.listing_id] = p.storage_path;
        }
      }
      // Keep the heart order: newest save last, like they tapped them.
      listings.sort((a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug));
      if (!cancelled) setLoaded({ listings, covers });
    })();
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  // Un-hearting filters instantly from what's already loaded; the
  // effect refetches in the background when slugs change.
  const visible =
    loaded?.listings.filter((l) => slugs.includes(l.slug)) ?? null;

  if (slugs.length === 0) {
    return (
      <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center">
        <p className="font-semibold text-slate-700">No saved cars yet.</p>
        <p className="mt-1 text-sm text-slate-500">
          Tap the ♡ on any car and it&apos;ll wait for you here.{" "}
          <Link href="/cars" className="text-blue-600 underline">
            Browse the board →
          </Link>
        </p>
      </div>
    );
  }

  if (visible === null) {
    return <p className="mt-8 text-sm text-slate-500">Loading your shortlist…</p>;
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {visible.map((l) => (
        <div key={l.id} className="relative">
          <ListingCard listing={l} photoPath={loaded?.covers[l.id] ?? null} />
          {l.status === "sold" && (
            <span className="absolute left-2 top-2 rounded-full bg-slate-900/80 px-2.5 py-1 text-xs font-bold text-white">
              Sold
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
