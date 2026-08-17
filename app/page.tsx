import Link from "next/link";
import { SITE } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { type Listing, type ListingPhoto } from "@/lib/listings";
import { ListingCard } from "@/app/listing-card";
import { InquiryForm } from "./inquiry-form";
import { LastSearchChip } from "./last-search";
import { PromoSplit } from "./promo-split";

/**
 * The front door — and the A2P campaign's primary Call-to-Action URL.
 * Every compliance sentence on this page is registered with carriers;
 * change the words here and the campaign registration must change too.
 *
 * Rebuilt to Concept A (15 Aug 2026, the owner's report: "it doesn't
 * feel like cargurus"): a light search-first hero and REAL CARS above
 * the fold — the marketplace leads with its inventory, and the
 * tell-us-what-you-want funnel follows it. Every registered sentence
 * survives verbatim; only the frame around them changed.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ about?: string }>;
}) {
  const { about } = await searchParams;

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
            className="mx-auto mt-8 grid max-w-2xl gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-900/5 sm:flex sm:flex-wrap sm:items-stretch"
          >
            <select
              name="make"
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
              placeholder="Model or keyword — Equinox, F-150…"
              className="w-full rounded-full border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700 sm:min-w-40 sm:w-auto sm:flex-1"
            />
            <input
              name="max_price"
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
              { label: "Trucks", href: "/cars?q=F-150" },
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
      <section className="mx-auto max-w-5xl px-6 pt-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "SUVs & Crossovers", href: "/cars?q=Equinox", art: "M8 34c-3 0-5-2-5-5 0-2 2-4 4-5l8-2 6-9c2-3 5-4 8-4h18c3 0 6 1 8 4l7 9 11 2c3 1 5 3 5 5 0 3-2 5-5 5" },
            { label: "Trucks", href: "/cars?q=F-150", art: "M6 34c-2 0-4-2-4-4s1-4 3-4l9-2 5-8c1-2 3-3 6-3h14v13h26c3 0 5 2 5 4s-1 4-3 4" },
            { label: "Sedans", href: "/cars?q=Accord", art: "M7 33c-3 0-5-2-5-4s2-4 4-4l9-3 8-8c2-2 4-3 7-3h16c3 0 5 1 7 3l8 8 10 3c2 0 4 2 4 4s-2 4-5 4" },
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
          <div className="mx-auto max-w-5xl">
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
                <span className="text-lg font-extrabold text-slate-900">$14,500</span>
                <span className="text-xs font-semibold text-green-700">$258/mo est.</span>
              </div>
              <div className="mt-0.5 text-sm font-semibold text-slate-900">
                2018 Chevrolet Equinox LT
              </div>
              <div className="mt-0.5 text-xs text-slate-500">74,200 mi</div>
            </div>
            <span className="absolute -right-3 -top-3 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow">
              ✓ Live — reviewed today
            </span>
          </div>
        </PromoSplit>
      </section>

      {/* Text-us-first — the second registered opt-in path. Restyled to
          the accent-sky band CarGurus uses (pale stripe, navy headline,
          product proof beside it) — the loud blue slab read as an ad, not
          a premium marketplace. EVERY registered sentence is verbatim;
          only the frame changed, same rule as the Concept A rebuild. */}
      <section className="bg-sky-50 px-6 py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Prefer to skip the form?
            </p>
            <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Text <span className="rounded-lg bg-white px-2 text-blue-600 shadow-sm">START</span> to{" "}
              <a href={`sms:${SITE.phoneE164}`} className="whitespace-nowrap underline decoration-blue-300 underline-offset-4 hover:decoration-blue-600">
                {SITE.phoneDisplay}
              </a>
            </p>
            <p className="mt-2 text-slate-600">
              and a real person will text you back about your next car.
            </p>
            <a
              href={`sms:${SITE.phoneE164}?&body=START`}
              className="mt-5 inline-block rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              💬 Text START now
            </a>
          </div>

          {/* Product proof, their phone-in-hand trick in CSS: the thread
              a shopper actually starts. The reply bubble deliberately
              reuses the page's own sentence — nothing invented. */}
          <div className="flex justify-center">
            <div className="w-64 rounded-[2rem] border-8 border-slate-900 bg-white p-3 shadow-xl shadow-blue-900/10">
              <p className="text-center text-[10px] font-semibold text-slate-400">
                {SITE.phoneDisplay}
              </p>
              <div className="mt-2 ml-auto w-fit rounded-2xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white">
                START
              </div>
              <div className="mt-2 max-w-[85%] rounded-2xl bg-slate-100 px-3.5 py-2 text-xs leading-relaxed text-slate-700">
                A real person will text you back about your next car. 👋
              </div>
              <div className="mt-2 flex w-fit gap-1 rounded-2xl bg-slate-100 px-3.5 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-slate-500">
          By texting START (or any message) to {SITE.phoneDisplay}, you agree
          to receive text messages from YouBuyCars about your vehicle inquiry,
          appointments, and follow-ups. Consent is not a condition of
          purchase. Message frequency varies. Message and data rates may
          apply. Reply STOP to opt out at any time, or HELP for help. See our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </section>

      {/* How it works — the teardown's numbered-circle explainer (a real
          sequence, so the numbers carry information), no emoji cards. */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              title: "Tell us what you want",
              body: "Year, make, model, budget — or just describe what you need.",
            },
            {
              title: "We text you back",
              body: "A real person texts you options that actually fit. No phone tag.",
            },
            {
              title: "Come drive it",
              body: "Like what you see? We'll have it pulled up and ready for you.",
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
      </section>

      {/* The form — the first registered opt-in path, now in the
          teardown's floating-white-card dress over a pale stripe. The
          form component itself (registered consent language) untouched. */}
      <section id="inquiry" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
          <h2 className="text-2xl font-bold">What are you looking for?</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Fill this out and we&apos;ll text you back shortly.
          </p>
          <InquiryForm defaultLookingFor={about ?? ""} />
        </div>
      </section>

      {/* The saved-search promo — white stripe, below the form so the
          zebra alternates cleanly all the way to the footer. */}
      <section className="px-6 py-14">
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
            <p className="text-xs font-semibold text-slate-400">
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

      {/* The consent story, in plain sight — mirrors /sms-consent.
          Gray stripe closes the zebra before the dark footer. */}
      <section className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-3xl">
        <h2 className="text-xl font-bold">About our text messages</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You&apos;ll only ever receive texts from YouBuyCars through one of
          the three ways below — each one is you choosing to hear from us, and
          messages are always about your vehicle inquiry, appointments, and
          follow-ups.
        </p>
        {/* Same three ways, same words — the circles just carry the
            numbering the way the rest of the page now does. */}
        <ol className="mt-6 space-y-5 text-sm leading-relaxed text-slate-600">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              1
            </span>
            <span>
              <strong className="text-slate-800">The form on this page.</strong>{" "}
              You fill it out with your number, and tick the optional consent
              checkbox next to the full disclosure. The box is never pre-checked
              and never required — you can send the form without it, and if you
              do, we won&apos;t text you.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              2
            </span>
            <span>
              <strong className="text-slate-800">Texting us first.</strong> You
              text START — or any message — to {SITE.phoneDisplay}. Starting the
              conversation is your consent to receive our replies about it, and
              replying STOP at any time ends it immediately.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
              3
            </span>
            <span>
              <strong className="text-slate-800">In person or on a call.</strong>{" "}
              You give us your number and tell us it&apos;s OK to text you. The
              salesperson records that you agreed, when, and how, before any
              message is sent.{" "}
              <Link href="/sms-consent" className="text-blue-600 underline">
                See exactly how that works →
              </Link>
            </span>
          </li>
        </ol>
        <ul className="mt-6 space-y-1 text-xs text-slate-500">
          <li>Message frequency varies based on our conversation.</li>
          <li>Message and data rates may apply.</li>
          <li>Reply STOP at any time to opt out, or HELP for help.</li>
          <li>
            We never sell or share your mobile number or SMS consent with
            third parties or affiliates for marketing.
          </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
