import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  describeSearch,
  type Listing,
  type ListingPhoto,
  type SearchFilters,
} from "@/lib/listings";
import { DEFAULT_ESTIMATE } from "@/lib/payments";
import { ListingCard } from "@/app/listing-card";
import { SaveSearch } from "./save-search";

export const metadata: Metadata = {
  title: "Cars for sale · YouBuyCars",
  description:
    "Browse vehicles for sale in Metro Detroit — every listing reviewed before it goes live. Tell us what you need and we'll text you options.",
};

/**
 * The board, rebuilt to the teardown's results shape (16 Aug 2026):
 * a persistent left rail of collapsed filter accordions, removable
 * active-filter chips with a Save-search control beside them, a result
 * count, and sort. Still a plain GET form under it all — every filtered
 * view keeps a shareable URL, which is also exactly what a saved search
 * stores. Sold cars keep their URLs but leave the board.
 */

interface Params {
  make?: string;
  q?: string;
  year_min?: string;
  year_max?: string;
  max_price?: string;
  max_miles?: string;
  financing?: string;
  sort?: string;
}

/** Rebuild the page URL with some params patched (null drops one). */
function href(params: Params, patch: Partial<Record<keyof Params, string | null>>): string {
  const merged: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...params, ...patch })) {
    if (v) merged[k] = v;
  }
  const qs = new URLSearchParams(merged).toString();
  return qs ? `/cars?${qs}` : "/cars";
}

function positive(v: string | undefined): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

const SORTS: { key: string; label: string }[] = [
  { key: "", label: "Newest" },
  { key: "price_asc", label: "Price ↑" },
  { key: "price_desc", label: "Price ↓" },
  { key: "miles_asc", label: "Miles ↑" },
];

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const filters: SearchFilters = {
    make: params.make || null,
    q: params.q || null,
    year_min: positive(params.year_min),
    year_max: positive(params.year_max),
    max_price: positive(params.max_price),
    max_miles: positive(params.max_miles),
    financing: params.financing === "1",
  };
  const supabase = await createClient();

  let query = supabase.from("listings").select("*").eq("status", "active");
  if (filters.make) query = query.ilike("make", filters.make);
  if (filters.q)
    query = query.or(
      `model.ilike.%${filters.q}%,make.ilike.%${filters.q}%,trim_level.ilike.%${filters.q}%`,
    );
  if (filters.year_min) query = query.gte("year", filters.year_min);
  if (filters.year_max) query = query.lte("year", filters.year_max);
  if (filters.max_price) query = query.lte("price", filters.max_price);
  if (filters.max_miles) query = query.lte("mileage", filters.max_miles);
  if (filters.financing) query = query.eq("financing_offered", true);
  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "miles_asc":
      query = query.order("mileage", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const [{ data: listingData }, { data: makeData }] = await Promise.all([
    query,
    supabase.from("listings").select("make").eq("status", "active"),
  ]);
  let listings = (listingData ?? []) as Listing[];
  const makes = [
    ...new Set(((makeData ?? []) as { make: string }[]).map((m) => m.make)),
  ].sort();

  // First photo per listing, one query — and the seller line's names,
  // because a card with a dealership on it reads more trustworthy than an
  // anonymous one (Concept A's rule: the seller is part of the product).
  const photosByListing = new Map<string, string>();
  const sellersById = new Map<
    string,
    { name: string | null; city: string | null; financing: boolean }
  >();
  const ratingBySeller = new Map<string, { avg: number; count: number }>();
  if (listings.length > 0) {
    const ids = listings.map((l) => l.id);
    const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
    const [{ data: photoData }, { data: sellerData }, { data: reviewData }] = await Promise.all([
      supabase
        .from("listing_photos")
        .select("listing_id, storage_path, sort_order")
        .in("listing_id", ids)
        .order("sort_order"),
      supabase
        .from("profiles")
        .select("id, display_name, city, financing_offered")
        .in("id", sellerIds),
      // RLS surfaces approved reviews only — the average is honest by law.
      supabase
        .from("seller_reviews")
        .select("seller_id, rating")
        .in("seller_id", sellerIds),
    ]);
    for (const p of (photoData ?? []) as ListingPhoto[]) {
      if (!photosByListing.has(p.listing_id)) {
        photosByListing.set(p.listing_id, p.storage_path);
      }
    }
    for (const s of (sellerData ?? []) as {
      id: string;
      display_name: string | null;
      city: string | null;
      financing_offered: boolean;
    }[]) {
      sellersById.set(s.id, {
        name: s.display_name,
        city: s.city,
        financing: s.financing_offered,
      });
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

  // The financing filter honours the seller-wide master breaker (0009)
  // the same way the cards do — a listing's own switch isn't the whole
  // truth if its seller turned financing off across the board.
  if (filters.financing) {
    listings = listings.filter(
      (l) => sellersById.get(l.seller_id)?.financing !== false,
    );
  }

  // Active-filter chips: one removable chip per set filter.
  const chips: { key: keyof Params; label: string }[] = [];
  if (filters.make) chips.push({ key: "make", label: filters.make });
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”` });
  if (filters.year_min)
    chips.push({ key: "year_min", label: `${filters.year_min} or newer` });
  if (filters.year_max)
    chips.push({ key: "year_max", label: `${filters.year_max} or older` });
  if (filters.max_price)
    chips.push({
      key: "max_price",
      label: `Under $${filters.max_price.toLocaleString("en-US")}`,
    });
  if (filters.max_miles)
    chips.push({
      key: "max_miles",
      label: `Under ${filters.max_miles.toLocaleString("en-US")} mi`,
    });
  if (filters.financing)
    chips.push({ key: "financing", label: "Financing offered" });

  const groupCls = "border-b border-slate-100 py-3";
  const summaryCls =
    "flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden";
  const inputCls =
    "mt-1 block w-full rounded-lg border border-slate-300 px-2.5 py-2 text-sm";

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-2xl font-bold">Cars for sale</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every listing is reviewed before it goes live. Don&apos;t see what you
        want?{" "}
        <Link href="/#inquiry" className="text-blue-600 underline">
          Tell us — we&apos;ll find it and text you.
        </Link>
      </p>

      <div className="mt-6 grid items-start gap-8 lg:grid-cols-[230px_1fr]">
        {/* The filter rail — collapsed accordions, the teardown's shape.
            A group with something set opens itself; the rest stay shut. */}
        <form method="get" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 lg:sticky lg:top-4">
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}

          <details className={groupCls} open={Boolean(filters.make)}>
            <summary className={summaryCls}>
              Make <span className="text-slate-300">▾</span>
            </summary>
            <select name="make" defaultValue={params.make ?? ""} className={inputCls}>
              <option value="">Any</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </details>

          <details className={groupCls} open={Boolean(filters.q)}>
            <summary className={summaryCls}>
              Model or keyword <span className="text-slate-300">▾</span>
            </summary>
            <input
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Equinox, F-150…"
              className={inputCls}
            />
          </details>

          <details
            className={groupCls}
            open={Boolean(filters.year_min || filters.year_max)}
          >
            <summary className={summaryCls}>
              Year <span className="text-slate-300">▾</span>
            </summary>
            <div className="flex items-center gap-2">
              <input
                name="year_min"
                type="number"
                min={1900}
                max={2100}
                placeholder="From"
                defaultValue={params.year_min ?? ""}
                className={inputCls}
              />
              <input
                name="year_max"
                type="number"
                min={1900}
                max={2100}
                placeholder="To"
                defaultValue={params.year_max ?? ""}
                className={inputCls}
              />
            </div>
          </details>

          <details className={groupCls} open={Boolean(filters.max_price)}>
            <summary className={summaryCls}>
              Price <span className="text-slate-300">▾</span>
            </summary>
            <input
              name="max_price"
              type="number"
              min={0}
              placeholder="Max $"
              defaultValue={params.max_price ?? ""}
              className={inputCls}
            />
          </details>

          <details className={groupCls} open={Boolean(filters.max_miles)}>
            <summary className={summaryCls}>
              Mileage <span className="text-slate-300">▾</span>
            </summary>
            <input
              name="max_miles"
              type="number"
              min={0}
              placeholder="Max miles"
              defaultValue={params.max_miles ?? ""}
              className={inputCls}
            />
          </details>

          <label className="flex items-center gap-2 py-3 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              name="financing"
              value="1"
              defaultChecked={filters.financing}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            Financing offered
          </label>

          <div className="flex items-center gap-3 py-3">
            <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Update results
            </button>
            {chips.length > 0 && (
              <Link
                href="/cars"
                className="text-xs font-medium text-slate-400 hover:text-slate-600"
              >
                Clear all
              </Link>
            )}
          </div>
        </form>

        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700 tabular-nums">
              {listings.length} car{listings.length === 1 ? "" : "s"} for sale
            </p>
            <p className="text-xs text-slate-500">
              Sort:{" "}
              {SORTS.map((s, i) => (
                <span key={s.key}>
                  {i > 0 && <span className="text-slate-300"> · </span>}
                  {(params.sort ?? "") === s.key ? (
                    <span className="font-bold text-slate-800">{s.label}</span>
                  ) : (
                    <Link
                      href={href(params, { sort: s.key || null })}
                      className="hover:text-blue-600"
                    >
                      {s.label}
                    </Link>
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* Active filters + the save-search control, one row. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <Link
                key={c.key}
                href={href(params, { [c.key]: null })}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-400"
              >
                {c.label} <span className="ml-0.5 text-slate-400">✕</span>
              </Link>
            ))}
            <SaveSearch filters={filters} label={describeSearch(filters)} />
          </div>

          {listings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center">
              <p className="font-semibold text-slate-700">
                Nothing on the board matches — yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Save this search above and we&apos;ll email you when a match
                lands, or{" "}
                <Link href="/#inquiry" className="text-blue-600 underline">
                  tell us what you&apos;re after
                </Link>{" "}
                and a real person will text you options. Selling?{" "}
                <Link href="/sell" className="text-blue-600 underline">
                  List your own car
                </Link>
                .
              </p>
            </div>
          ) : (
            <>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l) => {
                  const seller = sellersById.get(l.seller_id);
                  return (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      photoPath={photosByListing.get(l.id) ?? null}
                      sellerName={seller?.name}
                      sellerCity={seller?.city}
                      sellerFinancing={seller?.financing ?? true}
                      sellerRating={ratingBySeller.get(l.seller_id) ?? null}
                    />
                  );
                })}
              </div>
              <p className="mt-6 text-[11px] text-slate-400">
                Monthly estimates assume $
                {DEFAULT_ESTIMATE.down.toLocaleString("en-US")} down,{" "}
                {DEFAULT_ESTIMATE.termMonths} months, {DEFAULT_ESTIMATE.apr}%
                APR — estimates only, never an offer of credit. Open any car to
                run your own numbers.
              </p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
