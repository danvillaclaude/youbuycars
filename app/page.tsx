import Link from "next/link";
import { SITE } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { type Listing, type ListingPhoto } from "@/lib/listings";
import { ListingCard } from "@/app/listing-card";
import { InquiryForm } from "./inquiry-form";

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

          {/* The search bar — a plain GET straight onto the browse board. */}
          <form
            action="/cars"
            method="get"
            className="mx-auto mt-8 flex max-w-2xl flex-wrap items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-blue-900/5"
          >
            <select
              name="make"
              defaultValue=""
              className="rounded-full border-0 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
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
              className="min-w-40 flex-1 rounded-full border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
            <input
              name="max_price"
              type="number"
              min={0}
              placeholder="Max $"
              className="w-24 rounded-full border-0 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
            <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
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

      {/* Text-us-first — the second registered opt-in path. */}
      <section className="bg-blue-600 px-6 py-12 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
          Prefer to skip the form?
        </p>
        <p className="mt-3 text-3xl font-bold sm:text-4xl">
          Text <span className="rounded-lg bg-blue-500 px-2">START</span> to{" "}
          <a href={`sms:${SITE.phoneE164}`} className="underline">
            {SITE.phoneDisplay}
          </a>
        </p>
        <p className="mt-2 text-blue-100">
          and a real person will text you back about your next car.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-blue-200">
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

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              emoji: "📝",
              title: "1. Tell us what you want",
              body: "Year, make, model, budget — or just describe what you need.",
            },
            {
              emoji: "💬",
              title: "2. We text you back",
              body: "A real person texts you options that actually fit. No phone tag.",
            },
            {
              emoji: "🔑",
              title: "3. Come drive it",
              body: "Like what you see? We'll have it pulled up and ready for you.",
            },
          ].map((step) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm"
            >
              <div className="text-3xl">{step.emoji}</div>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The form — the first registered opt-in path. */}
      <section id="inquiry" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold">What are you looking for?</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Fill this out and we&apos;ll text you back shortly.
          </p>
          <InquiryForm defaultLookingFor={about ?? ""} />
        </div>
      </section>

      {/* The consent story, in plain sight — mirrors /sms-consent. */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-xl font-bold">About our text messages</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You&apos;ll only ever receive texts from YouBuyCars through one of
          the three ways below — each one is you choosing to hear from us, and
          messages are always about your vehicle inquiry, appointments, and
          follow-ups.
        </p>
        <ol className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
          <li>
            <strong className="text-slate-800">The form on this page.</strong>{" "}
            You fill it out with your number, and tick the optional consent
            checkbox next to the full disclosure. The box is never pre-checked
            and never required — you can send the form without it, and if you
            do, we won&apos;t text you.
          </li>
          <li>
            <strong className="text-slate-800">Texting us first.</strong> You
            text START — or any message — to {SITE.phoneDisplay}. Starting the
            conversation is your consent to receive our replies about it, and
            replying STOP at any time ends it immediately.
          </li>
          <li>
            <strong className="text-slate-800">In person or on a call.</strong>{" "}
            You give us your number and tell us it&apos;s OK to text you. The
            salesperson records that you agreed, when, and how, before any
            message is sent.{" "}
            <Link href="/sms-consent" className="text-blue-600 underline">
              See exactly how that works →
            </Link>
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
      </section>
    </main>
  );
}
