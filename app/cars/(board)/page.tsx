import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  BODY_STYLES,
  canonicalFor,
  describeSearch,
  searchTerm,
  type Listing,
  type ListingPhoto,
  type PriceChange,
  type SearchFilters,
} from "@/lib/listings";
import { DEFAULT_ESTIMATE, maxPriceForPayment } from "@/lib/payments";
import { ListingCard } from "@/app/listing-card";
import { SaveSearch } from "../save-search";
import { RememberSearch } from "../remember-search";

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
  body?: string;
  year_min?: string;
  year_max?: string;
  max_price?: string;
  max_payment?: string;
  max_miles?: string;
  financing?: string;
  sort?: string;
}

/**
 * The keyword title, shared by the metadata AND the navy band's H1 —
 * one derivation, so the tab and the page can never disagree.
 */
function searchTitle(p: Params): string {
  const bits: string[] = ["Used"];
  if (p.make) bits.push(p.make);
  if (p.body && (BODY_STYLES as readonly string[]).includes(p.body))
    bits.push(`${p.body}s`);
  if (bits.length === 1) bits.push("Cars");
  let title = bits.join(" ");
  if (p.max_payment && Number(p.max_payment) > 0)
    title += ` under $${Number(p.max_payment).toLocaleString("en-US")}/mo`;
  else if (p.max_price && Number(p.max_price) > 0)
    title += ` under $${Number(p.max_price).toLocaleString("en-US")}`;
  return `${title} for Sale in Metro Detroit`;
}

/**
 * Search-driven page titles — the SEO layer (his ask: more industry
 * keywords). Every filtered view is a crawlable URL; the title makes it
 * a keyword page: "Used SUVs under $15,000 for sale in Metro Detroit".
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Params>;
}): Promise<Metadata> {
  const p = await searchParams;
  const title = searchTitle(p);
  return {
    title: `${title} | YouBuyCars`,
    description: `${title}. Every listing reviewed before it goes live — browse prices, payment estimates and local sellers, or save the search and get emailed when new matches arrive.`,
    alternates: { canonical: canonicalFor(p) },
    // A free-text search is the buyer's query, not a page: keep those
    // results out of the index and point them at the filtered board.
    ...(p.q ? { robots: { index: false, follow: true } } : {}),
  };
}

// canonicalFor + searchTerm live in lib/listings.ts so the suite pins them.

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
    q: searchTerm(params.q) || null,
    body_style:
      params.body && (BODY_STYLES as readonly string[]).includes(params.body)
        ? params.body
        : null,
    year_min: positive(params.year_min),
    year_max: positive(params.year_max),
    max_price: positive(params.max_price),
    max_payment: positive(params.max_payment),
    max_miles: positive(params.max_miles),
    financing: params.financing === "1",
  };
  const supabase = await createClient();

  /*
   * The $/mo filter converts to a price cap through the SAME assumptions
   * as the cards' est./mo — filtering by $260/mo shows exactly the cars
   * whose cards say $260 or less. The stricter of the two caps wins.
   */
  const priceCap = Math.min(
    filters.max_price ?? Infinity,
    filters.max_payment ? maxPriceForPayment(filters.max_payment) : Infinity,
  );

  let query = supabase.from("listings").select("*").eq("status", "active");
  if (filters.make) query = query.ilike("make", filters.make);
  if (filters.body_style) query = query.eq("body_style", filters.body_style);
  if (filters.q) {
    /*
     * The term rides inside PostgREST's or() grammar, where , ( ) and "
     * are OPERATORS — a comma split "ford, xlt" into extra filters, a
     * parenthesis closed the group early, and a crafted q could inject
     * its own filter (proven live: q=zzzz,model.ilike.%Edge matched the
     * Edge). Stripping the four reserved characters leaves every real
     * search intact; the ilike wildcards % and _ are a buyer's to use.
     */
    const term = searchTerm(filters.q);
    if (term) {
      query = query.or(
        `model.ilike.%${term}%,make.ilike.%${term}%,trim_level.ilike.%${term}%`,
      );
    }
  }
  if (filters.year_min) query = query.gte("year", filters.year_min);
  if (filters.year_max) query = query.lte("year", filters.year_max);
  if (priceCap !== Infinity) query = query.lte("price", priceCap);
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
  // Latest price change per listing, only when it FELL — his call,
  // increases stay quiet. Filled from the batched fetch below.
  const dropByListing = new Map<string, number>();
  if (listings.length > 0) {
    const ids = listings.map((l) => l.id);
    const sellerIds = [...new Set(listings.map((l) => l.seller_id))];
    const [
      { data: photoData },
      { data: sellerData },
      { data: reviewData },
      { data: changeData },
    ] = await Promise.all([
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
      // Price history (0015) — its only input is the same id list, so
      // it rides in this round trip instead of a third serial one.
      supabase
        .from("price_changes")
        .select("listing_id, old_price, new_price, changed_at")
        .in("listing_id", ids)
        .order("changed_at", { ascending: false }),
    ]);
    for (const c of (changeData ?? []) as PriceChange[]) {
      if (dropByListing.has(c.listing_id)) continue; // newest wins
      if (c.new_price < c.old_price)
        dropByListing.set(c.listing_id, c.old_price - c.new_price);
      else dropByListing.set(c.listing_id, 0); // latest change was a raise — no chip
    }
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
  if (filters.body_style)
    chips.push({ key: "body", label: `${filters.body_style}s` });
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
  if (filters.max_payment)
    chips.push({
      key: "max_payment",
      label: `Under $${filters.max_payment.toLocaleString("en-US")}/mo`,
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
    <main>
      {/* A real search (filters set) is remembered for the homepage's
          returning-visitor chip. A bare browse remembers nothing. */}
      {chips.length > 0 && (
        <RememberSearch
          label={describeSearch(filters)}
          qs={href(params, {}).split("?")[1] ?? ""}
        />
      )}

      {/* The navy band — CarGurus' results-page opener: the keyword
          headline over dark, the search riding in the band, the white
          sheet rounding up over it. Same title derivation as the tab. */}
      <section className="bg-slate-900 px-4 pb-14 pt-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Every listing reviewed before it goes live
          </p>
          <h1 className="mt-1.5 max-w-3xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {searchTitle(params)}
          </h1>
          <form
            action="/cars"
            method="get"
            role="search"
            aria-label="Search the board"
            className="mt-5 flex max-w-xl items-stretch gap-2 rounded-full bg-white p-1.5 pl-5"
          >
            {/* The band search changes the WORDS, keeps the filters. */}
            {(
              ["make", "body", "year_min", "year_max", "max_price", "max_payment", "max_miles", "financing", "sort"] as const
            ).map((k) =>
              params[k] ? (
                <input key={k} type="hidden" name={k} value={params[k]} />
              ) : null,
            )}
            <input
              name="q"
              type="search"
              aria-label="Search make, model or keyword"
              defaultValue={params.q ?? ""}
              placeholder="Search make, model, keyword…"
              className="w-full border-0 bg-transparent text-sm text-slate-800"
            />
            <button className="shrink-0 rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* The sheet. */}
      <div className="mx-auto -mt-6 max-w-7xl rounded-t-3xl bg-white px-4 pb-10 pt-7 sm:px-6">
      <div className="grid items-start gap-8 lg:grid-cols-[230px_1fr]">
        {/* The filter rail — collapsed accordions, the teardown's shape.
            A group with something set opens itself; the rest stay shut. */}
        <form method="get" role="search" aria-label="Filter cars" className="rounded-2xl border border-slate-200 bg-white px-4 py-2 lg:sticky lg:top-[85px]">
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}

          <details className={groupCls} open={Boolean(filters.make)}>
            <summary className={summaryCls}>
              Make <span aria-hidden="true" className="text-slate-300">▾</span>
            </summary>
            <select name="make" aria-label="Make" defaultValue={params.make ?? ""} className={inputCls}>
              <option value="">Any</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </details>

          <details className={groupCls} open={Boolean(filters.body_style)}>
            <summary className={summaryCls}>
              Body style <span aria-hidden="true" className="text-slate-300">▾</span>
            </summary>
            <select name="body" aria-label="Body style" defaultValue={params.body ?? ""} className={inputCls}>
              <option value="">Any</option>
              {BODY_STYLES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </details>

          <details className={groupCls} open={Boolean(filters.q)}>
            <summary className={summaryCls}>
              Model or keyword <span aria-hidden="true" className="text-slate-300">▾</span>
            </summary>
            <input
              name="q" aria-label="Model or keyword"
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
              Year <span aria-hidden="true" className="text-slate-300">▾</span>
            </summary>
            <div className="flex items-center gap-2">
              <input
                name="year_min" aria-label="Minimum year"
                type="number"
                min={1900}
                max={2100}
                placeholder="From"
                defaultValue={params.year_min ?? ""}
                className={inputCls}
              />
              <input
                name="year_max" aria-label="Maximum year"
                type="number"
                min={1900}
                max={2100}
                placeholder="To"
                defaultValue={params.year_max ?? ""}
                className={inputCls}
              />
            </div>
          </details>

          <details
            className={groupCls}
            open={Boolean(filters.max_price || filters.max_payment)}
          >
            <summary className={summaryCls}>
              Price &amp; monthly payment <span aria-hidden="true" className="text-slate-300">▾</span>
            </summary>
            <input
              name="max_price" aria-label="Maximum price"
              type="number"
              min={0}
              placeholder="Max $"
              defaultValue={params.max_price ?? ""}
              className={inputCls}
            />
            <input
              name="max_payment" aria-label="Maximum monthly payment"
              type="number"
              min={0}
              placeholder="Max $/mo"
              defaultValue={params.max_payment ?? ""}
              className={inputCls}
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
              $/mo uses the same estimate as the cards ($
              {DEFAULT_ESTIMATE.down.toLocaleString("en-US")} down,{" "}
              {DEFAULT_ESTIMATE.termMonths} mo, {DEFAULT_ESTIMATE.apr}%).
            </p>
          </details>

          <details className={groupCls} open={Boolean(filters.max_miles)}>
            <summary className={summaryCls}>
              Mileage <span aria-hidden="true" className="text-slate-300">▾</span>
            </summary>
            <input
              name="max_miles" aria-label="Maximum mileage"
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
          {/* The toolbar, their weight: the count in real type, the
              save pill beside sort. */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xl font-extrabold text-slate-900 tabular-nums">
              {listings.length} vehicle{listings.length === 1 ? "" : "s"} found
            </p>
            <div className="flex flex-wrap items-center gap-4">
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
              <SaveSearch filters={filters} label={describeSearch(filters)} />
            </div>
          </div>

          {/* Active filters, removable. */}
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
          </div>

          {listings.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center">
              <p className="font-semibold text-slate-700">
                Nothing on the board matches — yet.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Save this search above and we&apos;ll email you when a match
                lands, or{" "}
                <Link href="/contact" className="text-blue-600 underline">
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
                {listings.map((l, i) => {
                  const seller = sellersById.get(l.seller_id);
                  return (
                    <ListingCard
                      key={l.id}
                      priority={i < 3}
                      listing={l}
                      photoPath={photosByListing.get(l.id) ?? null}
                      sellerName={seller?.name}
                      sellerCity={seller?.city}
                      sellerFinancing={seller?.financing ?? true}
                      sellerRating={ratingBySeller.get(l.seller_id) ?? null}
                      priceDrop={dropByListing.get(l.id) || null}
                    />
                  );
                })}
              </div>
              <p className="mt-6 text-[11px] text-slate-500">
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
      </div>
    </main>
  );
}
