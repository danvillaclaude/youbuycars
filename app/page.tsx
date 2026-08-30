import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import {
  canonicalFor,
  formatPrice,
  photoSrcSet,
  photoUrl,
  PHOTO_WIDTHS,
  type Listing,
  type ListingPhoto,
} from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";
import { ListingCard } from "@/app/listing-card";
import { LastSearchChip } from "./last-search";
import { HomeSearch } from "./home-search";

/**
 * The front door, rebuilt to the owner's own mockup (29 Aug 2026, "I
 * don't like the homepage... look at the body"): a split hero with a
 * REAL car from the board, a tabbed search panel, photo category tiles,
 * live inventory, four feature cards, a dealer band, and a trust strip.
 * Two rules survived the redesign intact: the hero headline and
 * sub-line are verbatim (campaign-adjacent copy is not reworded), and
 * every number on the page is a product fact — counts come from live
 * inventory, the payment figure runs the live formula on a real car,
 * and a category with nothing behind it doesn't render (the mock's
 * "3,281 listings" placeholders became real counts, its Motorcycles
 * tile and app-store badges didn't survive contact with reality).
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

/** One inventory summary feeds every count and gate on the page. */
interface InvRow {
  id: string;
  slug: string;
  make: string;
  model: string;
  body_style: string | null;
  price: number;
  financing_offered: boolean;
  created_at: string;
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: latestData }, { data: invData }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("listings")
      .select("id, slug, make, model, body_style, price, financing_offered, created_at")
      .eq("status", "active"),
  ]);
  const latest = (latestData ?? []) as Listing[];
  const inv = (invData ?? []) as InvRow[];

  const makes = [...new Set(inv.map((m) => m.make))].sort();
  const models = [...new Set(inv.map((m) => m.model))].sort();
  const hasUnder = (cap: number) => inv.some((m) => m.price <= cap);

  // Category tiles: each body style with inventory, wearing the NEWEST
  // car in that style as its photo and its real count.
  const categories = new Map<string, { count: number; newest: InvRow }>();
  for (const row of inv) {
    if (!row.body_style) continue;
    const cur = categories.get(row.body_style);
    if (!cur) categories.set(row.body_style, { count: 1, newest: row });
    else {
      cur.count++;
      if (row.created_at > cur.newest.created_at) cur.newest = row;
    }
  }
  const categoryList = [...categories.entries()].sort((a, b) => b[1].count - a[1].count);

  // The payments card runs the live formula on the cheapest financed car.
  const cheapestFinanced = inv
    .filter((m) => m.financing_offered)
    .sort((a, b) => a.price - b.price)[0];


  const photosByListing = new Map<string, string>();
  const sellersById = new Map<
    string,
    { name: string | null; city: string | null; financing: boolean }
  >();
  const ratingBySeller = new Map<string, { avg: number; count: number }>();
  if (inv.length > 0) {
    const photoIds = [
      ...new Set([
        ...latest.map((l) => l.id),
        ...categoryList.map(([, v]) => v.newest.id),
        ...(cheapestFinanced ? [cheapestFinanced.id] : []),
      ]),
    ];
    const sellerIds = [...new Set(latest.map((l) => l.seller_id))];
    const [{ data: photoData }, { data: sellerData }, { data: reviewData }] = await Promise.all([
      supabase
        .from("listing_photos")
        .select("listing_id, storage_path, sort_order")
        .in("listing_id", photoIds)
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

  // The hero wears a real car: the newest live listing with a photo.
  const heroListing = latest.find((l) => photosByListing.has(l.id));
  const heroPhoto = heroListing ? photosByListing.get(heroListing.id) : null;
  const heroName = heroListing
    ? `${heroListing.year} ${heroListing.make} ${heroListing.model}`
    : null;

  // The compare card shows two real covers.
  const compareCovers = latest
    .filter((l) => photosByListing.has(l.id))
    .slice(0, 2)
    .map((l) => ({ id: l.id, path: photosByListing.get(l.id) as string }));

  const chipCls =
    "rounded-full border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:border-blue-300 hover:text-blue-700";

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSON_LD) }}
      />

      {/* Hero — his mock's split: the pitch on the left, a REAL car from
          the board on the right (his call: a generated car on a "real
          cars" site reads as fake). Headline and sub-line verbatim. */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-6 pb-12 pt-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                Find your next car without the runaround.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-600">
                Real cars from Metro Detroit sellers — or tell us what
                you&apos;re looking for and we&apos;ll text you options. No
                pushy calls, no sitting at a dealership all day.
              </p>
              <ul className="mt-6 space-y-2 text-sm font-medium text-slate-700">
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">✓</span>
                  Every listing reviewed by a real person before it goes live
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">✓</span>
                  Text or call the seller directly — no middleman
                </li>
                <li className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">✓</span>
                  {"Free for buyers — no fees from us, ever"}
                </li>
              </ul>
            </div>
            {heroListing && heroPhoto && (
              <Link
                href={`/cars/${heroListing.slug}`}
                className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl(heroPhoto, PHOTO_WIDTHS.gallery)}
                  srcSet={photoSrcSet(heroPhoto)}
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  alt={heroName ?? "A car on the board"}
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur group-hover:bg-slate-900">
                  {`On the board now: ${heroName} — ${formatPrice(heroListing.price)} →`}
                </span>
              </Link>
            )}
          </div>

          {/* The search panel — the mock's centerpiece, wired to the
              board's real URLs. */}
          <HomeSearch makes={makes} models={models} />
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Popular:</span>
            {[
              { label: "Under $15k", href: "/cars?max_price=15000", show: hasUnder(15000) },
              { label: "Under $25k", href: "/cars?max_price=25000", show: hasUnder(25000) },
              ...categoryList.slice(0, 2).map(([body]) => ({
                label: `${body}s`,
                href: canonicalFor({ body }),
                show: true,
              })),
              { label: "Everything", href: "/cars", show: true },
            ]
              .filter((c) => c.show)
              .map((c) => (
                <Link key={c.label} href={c.href} className={chipCls}>
                  {c.label}
                </Link>
              ))}
          </div>
          {/* Returning visitors get their last search back — content
              personalizes, the layout never moves (the teardown's rule). */}
          <div className="text-center">
            <LastSearchChip />
          </div>
        </div>
      </section>

      {/* Shop by category — his mock's photo tiles, honest edition: each
          tile wears the NEWEST real car in that style and its REAL
          count, and a style with nothing behind it doesn't render. */}
      {categoryList.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pt-10">
          <h2 className="text-xl font-bold text-slate-900">Shop by category</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categoryList.map(([body, v]) => {
              const cover = photosByListing.get(v.newest.id);
              return (
                <Link
                  key={body}
                  href={canonicalFor({ body })}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:border-blue-300"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl(cover, PHOTO_WIDTHS.card)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : (
                    <div aria-hidden="true" className="flex aspect-[16/9] items-center justify-center bg-slate-100 text-3xl">
                      🚗
                    </div>
                  )}
                  <div className="flex items-baseline justify-between px-3.5 py-2.5">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                      {`${body}s`}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {`${v.count} listing${v.count === 1 ? "" : "s"}`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

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

      {/* A better way to buy a car — the mock's value props carrying the
          marketplace story the old How-it-works told (his 16 Aug call:
          browse, deal directly, drive it home — plus the alert letters). */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold">A better way to buy a car.</h2>
        <div className="mt-9 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "M11 4a7 7 0 1 0 4.4 12.4L20 21l1-1-4.6-4.6A7 7 0 0 0 11 4Z",
              title: "Real local cars",
              body: "Every listing comes from a Metro Detroit seller or dealer, and a real person reviews each one before it goes live.",
            },
            {
              icon: "M4 5h16v11H9l-5 4V5Z",
              title: "Deal directly with the seller",
              body: "Text, call, or message on-site — every car connects you straight to whoever's selling it.",
            },
            {
              icon: "M12 3v18M7 7h7a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h8",
              title: "Run your own numbers",
              body: "Payment estimates on every financed car, and a calculator that works backward from the payment that fits your life.",
            },
            {
              icon: "M12 4a5 5 0 0 0-5 5v4l-2 3h14l-2-3V9a5 5 0 0 0-5-5Zm-2 14a2 2 0 0 0 4 0",
              title: "Let the cars come to you",
              body: "Save any search with your email and get one letter when a match goes live — an unsubscribe link in every letter.",
            },
          ].map((prop) => (
            <div key={prop.title} className="text-center sm:text-left">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-100">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-700" fill="none" aria-hidden="true">
                  <path d={prop.icon} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-3 font-semibold text-slate-900">{prop.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{prop.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The feature cards — his mock's four doors, each opening onto a
          feature that actually exists. Dark cards on the gray stripe. */}
      <section className="bg-slate-50 px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col rounded-2xl bg-slate-900 p-6 text-white">
            <h3 className="text-lg font-bold">Estimate your payments</h3>
            {cheapestFinanced ? (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                <span className="block text-3xl font-extrabold text-green-400 tabular-nums">
                  {`$${estimateMonthly(cheapestFinanced.price).toLocaleString("en-US")}/mo est.`}
                </span>
                {`on the ${cheapestFinanced.make} ${cheapestFinanced.model} — real personalized numbers on every financed car.`}
              </p>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Real monthly estimates on every financed car, worked out in
                seconds.
              </p>
            )}
            <Link
              href={cheapestFinanced ? `/cars/${cheapestFinanced.slug}#calculator` : "/cars"}
              className="mt-auto inline-block self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-200"
            >
              Calculate payment
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl bg-slate-900 p-6 text-white">
            <h3 className="text-lg font-bold">Compare cars</h3>
            {compareCovers.length === 2 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {compareCovers.map((c) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={c.id}
                    src={photoUrl(c.path, PHOTO_WIDTHS.thumb)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full rounded-lg object-cover"
                  />
                ))}
              </div>
            )}
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Line up two vehicles side by side and find your perfect match.
            </p>
            <Link
              href="/compare"
              className="mt-auto inline-block self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-200"
            >
              Compare now
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl bg-slate-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">Ask our AI</h3>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                Coming soon
              </span>
            </div>
            <span aria-hidden="true" className="mt-3 text-4xl">✦</span>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Instant answers about cars and pricing are on the way. Today, a
              real person answers by text.
            </p>
            <Link
              href="/ask"
              className="mt-auto inline-block self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-200"
            >
              Take a look
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl bg-slate-900 p-6 text-white">
            <h3 className="text-lg font-bold">Sell your car</h3>
            <span className="mt-3 text-3xl font-extrabold text-blue-400">Free.</span>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Your car, listed by tonight — reviewed by a real person, live to
              Metro Detroit buyers, and buyers text you directly.
            </p>
            <Link
              href="/sell"
              className="mt-auto inline-block self-start rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      {/* The dealer band — the mock's black stripe, selling the real
          thing: /dealers, its walkthrough form, and the CRM behind it. */}
      <section className="bg-slate-950 px-6 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Are you a dealer?</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-300">
              Get your inventory in front of Metro Detroit shoppers on
              YouBuyCars.
            </p>
            <ul className="mt-4 grid gap-x-8 gap-y-2 text-sm font-medium text-slate-200 sm:grid-cols-3">
              <li>✓ Leads from local shoppers, straight to you</li>
              <li>✓ Your own dealer page with reviews</li>
              <li>✓ Tools to grow your whole desk</li>
            </ul>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <Link
              href="/dealers"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              {"Dealers — get started"}
            </Link>
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white">
              Or sign in
            </Link>
          </div>
        </div>
      </section>

      {/* The trust strip — the mock's closer, every claim true. */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4 lg:text-left">
          {[
            {
              title: "Local focus",
              body: "Metro Detroit through and through — the cars, the sellers, and the person behind the site.",
            },
            {
              title: "Verified sellers",
              body: "A real person reviews every seller and every listing before it goes live.",
            },
            {
              title: "Secure & private",
              body: "Your number stays yours — message on-site, and share it only when you choose.",
            },
            {
              title: "Here to help",
              body: "Real support from a real person, usually the same day.",
            },
          ].map((t) => (
            <div key={t.title}>
              <h3 className="text-sm font-bold text-slate-900">{t.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{t.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
