import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, type Listing, type ListingPhoto } from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";
import { ListingCard } from "@/app/listing-card";
import { LastSearchChip } from "./last-search";
import { PromoSplit } from "./promo-split";

/**
 * The front door. Cut to what CarGurus' own homepage is (16 Aug 2026,
 * the owner's correction after two rounds of restyling missed the
 * point: "notice none of this is on cargurus home page"): search,
 * inventory, promos — NOTHING else. The Text-START band and its
 * registered disclosure live on /contact now; the texting explainer's
 * canonical home is /sms-consent (always was — the homepage copy
 * mirrored it); the find-a-car form belongs to dealer pages, gated to
 * paying tiers. Every registered sentence still lives at a public URL,
 * and /sms-consent — the campaign's registered proof page — is
 * untouched.
 */
/**
 * Brand-first on the home page (23 Aug 2026 SEO plan): the layout's
 * keyword title is what /cars wears, and the two pages used to be
 * byte-identical in the tab. The brand query is the one query a small
 * site must win, and it is currently owned by an unrelated company —
 * so the home page says its own name first, and declares its canonical.
 */
export const metadata: Metadata = {
  title: "YouBuyCars — Used Cars for Sale in Metro Detroit, Michigan",
  alternates: { canonical: "/" },
};

/**
 * Organization + WebSite JSON-LD — the brand-level structured data Google
 * still reads. Email only: the platform phone number lives on /contact
 * alone (the owner's rule), so it is deliberately not in this markup.
 * sameAs is empty until the owner's own profiles exist (Facebook and
 * LinkedIn pages named exactly YouBuyCars) — add their URLs here.
 */
const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.domain}/#organization`,
      name: SITE.name,
      url: SITE.domain,
      logo: `${SITE.domain}/apple-icon.png`,
      email: SITE.email,
      description:
        "A used-car marketplace for Metro Detroit, Michigan: reviewed listings from local dealers and sellers, payment estimates, price drops, and sellers you contact directly.",
      areaServed: { "@type": "Place", name: SITE.area },
      sameAs: [] as string[],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.domain}/#website`,
      url: SITE.domain,
      name: SITE.name,
      publisher: { "@id": `${SITE.domain}/#organization` },
    },
  ],
};

export default async function HomePage() {
  // The shelf above the fold: newest live cars, and the makes the search
  // select offers — same vocabulary the browse page filters on.
  const supabase = await createClient();
  const [{ data: latestData }, { data: makeData }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("listings").select("make").eq("status", "active"),
  ]);
  const latest = (latestData ?? []) as Listing[];
  const makes = [
    ...new Set(((makeData ?? []) as { make: string }[]).map((m) => m.make)),
  ].sort();

  const photosByListing = new Map<string, string>();
  const sellersById = new Map<
    string,
    { name: string | null; city: string | null; financing: boolean }
  >();
  const ratingBySeller = new Map<string, { avg: number; count: number }>();
  if (latest.length > 0) {
    const sellerIds = [...new Set(latest.map((l) => l.seller_id))];
    const [{ data: photoData }, { data: sellerData }, { data: reviewData }] = await Promise.all([
      supabase
        .from("listing_photos")
        .select("listing_id, storage_path, sort_order")
        .in("listing_id", latest.map((l) => l.id))
        .order("sort_order"),
      supabase
        .from("profiles")
        .select("id, display_name, city, financing_offered")
        .in("id", sellerIds),
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

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />
      {/* Hero — search first, the way car shoppers actually arrive.
          Section separation below is the teardown's zebra rhythm: the
          backgrounds alternate and NOTHING draws a border between them. */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-6 pb-14 pt-14">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Find your next car without the runaround.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
            Real cars from Metro Detroit sellers — or tell us what you&apos;re
            looking for and we&apos;ll text you options. No pushy calls, no
            sitting at a dealership all day.
          </p>

          {/* The search bar — a plain GET straight onto the browse board.
              A clean full-width stack on phones (his report: the wrap was
              ragged), the one-row pill bar from sm up. */}
          <form
            action="/cars"
            method="get"
            role="search"
            aria-label="Search used cars"
            className="mx-auto mt-8 grid max-w-2xl gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-900/5 sm:flex sm:flex-wrap sm:items-stretch"
          >
            <select
              name="make"
              aria-label="Make"
              defaultValue=""
              className="w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 sm:w-auto"
            >
              <option value="">All makes</option>
              {makes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              name="q"
              type="search"
              aria-label="Model or keyword"
              placeholder="Model or keyword — Equinox, F-150…"
              className="w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:min-w-40 sm:w-auto sm:flex-1"
            />
            <input
              name="max_price"
              aria-label="Maximum price"
              type="number"
              min={0}
              placeholder="Max $"
              className="w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:w-24"
            />
            <button className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 sm:w-auto">
              Search
            </button>
          </form>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
            {[
              { label: "Under $15k", href: "/cars?max_price=15000" },
              { label: "Under $25k", href: "/cars?max_price=25000" },
              { label: "SUVs", href: "/cars?body=SUV" },
              { label: "Trucks", href: "/cars?body=Truck" },
              { label: "Everything", href: "/cars" },
            ].map((c) => (
              <Link
                key={c.label}
                href={c.href}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700"
              >
                {c.label}
              </Link>
            ))}
          </div>
          {/* Returning visitors get their last search back — content
              personalizes, the layout never moves (the teardown's rule). */}
          <LastSearchChip />
        </div>
      </section>

      {/* Shop-by-style tiles + the trust strip — the premium furniture the
          big sites teach shoppers to expect. Tiles are just searches. */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Real body-style searches now (0015) — the q= keyword hack
              is dead. */}
          {[
            { label: "SUVs & Crossovers", href: "/cars?body=SUV", art: "M8 34c-3 0-5-2-5-5 0-2 2-4 4-5l8-2 6-9c2-3 5-4 8-4h18c3 0 6 1 8 4l7 9 11 2c3 1 5 3 5 5 0 3-2 5-5 5" },
            { label: "Trucks", href: "/cars?body=Truck", art: "M6 34c-2 0-4-2-4-4s1-4 3-4l9-2 5-8c1-2 3-3 6-3h14v13h26c3 0 5 2 5 4s-1 4-3 4" },
            { label: "Sedans", href: "/cars?body=Sedan", art: "M7 33c-3 0-5-2-5-4s2-4 4-4l9-3 8-8c2-2 4-3 7-3h16c3 0 5 1 7 3l8 8 10 3c2 0 4 2 4 4s-2 4-5 4" },
            { label: "Under $15k", href: "/cars?max_price=15000", art: null },
          ].map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="group flex flex-col items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-5 text-center hover:border-blue-300"
            >
              {t.art ? (
                <svg viewBox="0 0 80 44" className="h-9 w-16 text-slate-400 group-hover:text-blue-600" fill="none">
                  <path d={t.art} stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="24" cy="34" r="6" stroke="currentColor" strokeWidth="3" />
                  <circle cx="58" cy="34" r="6" stroke="currentColor" strokeWidth="3" />
                </svg>
              ) : (
                <span className="flex h-9 items-center text-2xl font-extrabold text-slate-400 group-hover:text-blue-600">
                  $
                </span>
              )}
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                {t.label}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs font-medium text-slate-500">
          <span>✓ Every listing reviewed before it goes live</span>
          <span>✓ Text the seller — no phone tag, no pressure</span>
          <span>✓ Local Metro Detroit cars and dealers</span>
        </div>
      </section>

      {/* Real inventory above the fold — the CarGurus move. Gray stripe
          in the zebra: full-bleed background, contained content. */}
      {latest.length > 0 && (
        <section className="mt-10 bg-slate-50 px-6 py-12">
          <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Fresh on the lot
            </h2>
            <Link
              href="/cars"
              className="text-sm font-semibold text-blue-600 hover:underline"
            >
              See all cars →
            </Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((l) => {
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
          </div>
        </section>
      )}

      {/* The teardown's 50/50 promo module — sell-side pitch, product
          proof mocked in CSS. White stripe in the zebra. */}
      <section className="px-6 py-14">
        <PromoSplit
          eyebrow="Sell with us"
          headline="Your car, listed by tonight."
          sub="Free to list your own car. A real person reviews it, it goes live to Metro Detroit buyers, and interested buyers text — your number never sits on a classifieds board."
          ctaLabel="List your car — free"
          ctaHref="/sell"
        >
          {/* Product proof: a mini listing card with the live chip. */}
          <div className="relative w-64 rounded-xl border border-slate-200 bg-white shadow-lg shadow-blue-900/5">
            <div className="flex aspect-[4/3] items-center justify-center rounded-t-xl bg-gradient-to-br from-slate-100 to-slate-200 text-5xl">
              🚙
            </div>
            <div className="p-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-slate-900">{formatPrice(14500)}</span>
                <span className="text-xs font-semibold text-green-700">{`$${estimateMonthly(14500).toLocaleString("en-US")}/mo est.`}</span>
              </div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                2018 Chevrolet Equinox LT
              </div>
              <div className="mt-0.5 text-xs text-slate-500">74,200 mi</div>
            </div>
            <span className="absolute -right-3 -top-3 rounded-full bg-green-700 px-3 py-1 text-xs font-bold text-white shadow">
              ✓ Live — reviewed today
            </span>
          </div>
        </PromoSplit>
      </section>

      {/* The saved-search promo — gray stripe in the zebra. */}
      <section className="bg-slate-50 px-6 py-14">
        <PromoSplit
          flip
          eyebrow="Save a search"
          headline="Let the cars come to you."
          sub="Save any search with your email and we'll send one letter when new matching cars go live — the day they're approved. One-click unsubscribe in every letter, nothing else, ever."
          ctaLabel="Browse & save a search"
          ctaHref="/cars"
        >
          {/* Product proof: the alert letter, in miniature. */}
          <div className="relative w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-blue-900/5">
            <p className="text-xs font-semibold text-slate-500">
              From: YouBuyCars
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              2 new cars match your search
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Watching: <span className="font-semibold">Chevrolet · under $15,000</span>
            </p>
            <div className="mt-3 space-y-2">
              {["2018 Equinox LT — $14,500", "2016 Malibu — $11,900"].map((c) => (
                <div
                  key={c}
                  className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
                >
                  {c} · <span className="text-blue-600">See this car →</span>
                </div>
              ))}
            </div>
            <span className="absolute -left-3 -top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow">
              🔔 New match
            </span>
          </div>
        </PromoSplit>
      </section>

      {/* How it works — the MARKETPLACE story (16 Aug 2026, his call:
          "considering youbuycars is a multivendor site... it should be
          something totally different"). The old three steps told the
          concierge tale — tell us, we find it — which reads like one
          dealer, not a board of many sellers. The marketplace tells it
          straight: browse, deal with the seller, drive it home. The
          concierge survives as the door under it, on /contact. */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Browse real local cars",
              body: "Every listing comes from a Metro Detroit seller or dealer, and a real person reviews each one before it goes live.",
            },
            {
              title: "Deal directly with the seller",
              body: "Text, call, or message on-site — every car connects you straight to whoever's selling it, with payment numbers you can run yourself.",
            },
            {
              title: "Drive it home",
              body: "Meet the seller, take the drive, make the deal. Sold cars stay marked, so the board never shows you a ghost.",
            },
          ].map((step, i) => (
            <div key={step.title} className="text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.body}</p>
            </div>
          ))}
        </div>
        {/* The CTA does step 1 (his call, 16 Aug 2026: "the start a
            conversation button should be a browse cars button"). The
            concierge door lives on /contact, reachable from the footer. */}
        <div className="mt-9 text-center">
          <Link
            href="/cars"
            className="inline-block rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Browse cars
          </Link>
        </div>
      </section>
    </main>
  );
}
