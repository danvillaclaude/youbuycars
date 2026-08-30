import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  cityFromSlug,
  citySlug,
  type Listing,
  type ListingPhoto,
  type PriceChange,
} from "@/lib/listings";
import { ListingCard } from "@/app/listing-card";
import { Breadcrumbs } from "@/app/breadcrumbs";

/**
 * City landing pages (30 Aug 2026, the owner's SEO round: "real city +
 * earned pages"). One page per Metro Detroit municipality — the URL is
 * derived from the 78-town list, so an unknown slug is a 404, never a
 * generated page.
 *
 * EARNED means earned: a city with zero live cars serves noindex,follow —
 * the same anti-doorway rule the browse board enforces on empty filter
 * views. Google's faceted-navigation guidance is written about exactly
 * the site that publishes 78 keyword headlines over 77 empty grids; the
 * board's link pack and the sitemap only ever point at cities that have
 * inventory, so a crawler shouldn't even find the empty ones.
 *
 * A car belongs to a city through its SELLER's profile city (the
 * dropdown-validated one) — the car itself has no location column, and
 * inventing one would be a second copy of the same fact.
 */

async function loadCity(slug: string) {
  const city = cityFromSlug(slug);
  if (!city) return null;
  const supabase = await createClient();

  const { data: sellerData } = await supabase
    .from("profiles")
    .select("id, display_name, city, financing_offered, public_slug")
    .eq("city", city);
  const sellers = (sellerData ?? []) as {
    id: string;
    display_name: string | null;
    city: string | null;
    financing_offered: boolean;
    public_slug: string | null;
  }[];
  if (sellers.length === 0) return { city, listings: [] as Listing[], sellers };

  const { data: listingData } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .in(
      "seller_id",
      sellers.map((s) => s.id),
    )
    .order("created_at", { ascending: false });
  return { city, listings: (listingData ?? []) as Listing[], sellers };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadCity(slug);
  if (!found) return { title: "Used cars · YouBuyCars" };
  const { city, listings } = found;
  return {
    title: `Used Cars for Sale in ${city}, MI | YouBuyCars`,
    description: `Browse used cars, SUVs and trucks for sale in ${city}, Michigan. Every listing reviewed before it goes live — prices, photos and local sellers on YouBuyCars, Metro Detroit's used-car marketplace.`,
    alternates: { canonical: `/cars/city/${citySlug(city)}` },
    // The earned-page rule: no cars, no index. The page stays usable and
    // its links crawlable, same as the board's empty views.
    ...(listings.length === 0
      ? { robots: { index: false, follow: true } }
      : {}),
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await loadCity(slug);
  if (!found) notFound();
  const { city, listings, sellers } = found;
  const supabase = await createClient();

  // The same card dressing the board builds: first photo, seller line,
  // honest ratings, latest price DROP.
  const photosByListing = new Map<string, string>();
  const dropByListing = new Map<string, number>();
  const ratingBySeller = new Map<string, { avg: number; count: number }>();
  if (listings.length > 0) {
    const ids = listings.map((l) => l.id);
    const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
    const [{ data: photoData }, { data: reviewData }, { data: changeData }] =
      await Promise.all([
        supabase
          .from("listing_photos")
          .select("listing_id, storage_path, sort_order")
          .in("listing_id", ids)
          .order("sort_order"),
        supabase
          .from("seller_reviews")
          .select("seller_id, rating")
          .in("seller_id", sellerIds),
        supabase
          .from("price_changes")
          .select("listing_id, old_price, new_price, changed_at")
          .in("listing_id", ids)
          .order("changed_at", { ascending: false }),
      ]);
    for (const p of (photoData ?? []) as ListingPhoto[]) {
      if (!photosByListing.has(p.listing_id)) {
        photosByListing.set(p.listing_id, p.storage_path);
      }
    }
    for (const c of (changeData ?? []) as PriceChange[]) {
      if (dropByListing.has(c.listing_id)) continue;
      if (c.new_price < c.old_price)
        dropByListing.set(c.listing_id, c.old_price - c.new_price);
      else dropByListing.set(c.listing_id, 0);
    }
    const sums = new Map<string, { total: number; count: number }>();
    for (const r of (reviewData ?? []) as { seller_id: string; rating: number }[]) {
      const cur = sums.get(r.seller_id) ?? { total: 0, count: 0 };
      cur.total += r.rating;
      cur.count++;
      sums.set(r.seller_id, cur);
    }
    for (const [id, v] of sums) {
      ratingBySeller.set(id, { avg: v.total / v.count, count: v.count });
    }
  }
  const sellersById = new Map(sellers.map((s) => [s.id, s]));

  return (
    <main>
      <section className="bg-slate-900 px-4 pb-14 pt-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Every listing reviewed before it goes live
          </p>
          <h1 className="mt-1.5 max-w-3xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Used Cars for Sale in {city}, Michigan
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            {listings.length > 0
              ? `${listings.length} vehicle${listings.length === 1 ? "" : "s"} from ${city} sellers — with prices, photos and payment estimates.`
              : `No live cars from ${city} sellers right now — the whole Metro Detroit board is one tap away.`}
          </p>
        </div>
      </section>

      <div className="mx-auto -mt-6 max-w-7xl rounded-t-3xl bg-white px-4 pb-10 pt-7 sm:px-6">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Used cars", href: "/cars" },
            { name: `${city}, MI` },
          ]}
          className="mb-5"
        />

        {listings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-10 text-center">
            <p className="font-semibold text-slate-700">
              Nothing from {city} on the board — yet.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              <Link href="/cars" className="text-blue-600 underline">
                Browse every used car in Metro Detroit
              </Link>{" "}
              — or, selling a car in {city}?{" "}
              <Link href="/sell" className="text-blue-600 underline">
                List it free
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l, i) => {
                const seller = sellersById.get(l.seller_id);
                return (
                  <ListingCard
                    key={l.id}
                    priority={i < 3}
                    listing={l}
                    photoPath={photosByListing.get(l.id) ?? null}
                    sellerName={seller?.display_name}
                    sellerCity={seller?.city}
                    sellerFinancing={seller?.financing_offered ?? true}
                    sellerRating={ratingBySeller.get(l.seller_id) ?? null}
                    priceDrop={dropByListing.get(l.id) || null}
                  />
                );
              })}
            </div>
            <p className="mt-8 text-sm text-slate-500">
              Looking beyond {city}?{" "}
              <Link href="/cars" className="text-blue-600 underline">
                Browse all used cars in Metro Detroit
              </Link>{" "}
              — or save a search and get emailed when new matches land.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
