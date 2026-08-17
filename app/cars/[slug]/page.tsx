import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import { cache } from "react";
import {
  formatMileage,
  formatPrice,
  photoUrl,
  type Listing,
  type ListingPhoto,
  type PriceChange,
} from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";
import { PaymentCalculator } from "./payment-calculator";
import { TrackView } from "@/app/track-client";
import { ContactBox } from "./contact-box";
import { Gallery } from "./gallery";
import { SummaryBar } from "./summary-bar";
import { ExpandText } from "@/app/expand-text";
import { SaveHeart } from "@/app/save-heart";

async function loadListing(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("slug", slug)
    .in("status", ["active", "sold"])
    .maybeSingle();
  const listing = data as Listing | null;
  if (!listing) return null;
  const [{ data: photoData }, { data: sellerData }, { data: changeData }] =
    await Promise.all([
      supabase
        .from("listing_photos")
        .select("*")
        .eq("listing_id", listing.id)
        .order("sort_order"),
      supabase
        .from("profiles")
        .select("display_name, public_slug, phone, city, financing_offered")
        .eq("id", listing.seller_id)
        .maybeSingle(),
      // Price history (0015) — trigger-written, public by policy.
      supabase
        .from("price_changes")
        .select("*")
        .eq("listing_id", listing.id)
        .order("changed_at", { ascending: false })
        .limit(10),
    ]);
  return {
    listing,
    photos: (photoData ?? []) as ListingPhoto[],
    seller: sellerData as {
      display_name: string | null;
      public_slug: string | null;
      phone: string | null;
      city: string | null;
      financing_offered: boolean;
    } | null,
    priceChanges: (changeData ?? []) as PriceChange[],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadListing(slug);
  if (!found) return { title: "Listing · YouBuyCars" };
  const { listing } = found;
  const name = `${listing.year} ${listing.make} ${listing.model}`;
  return {
    title: `${name} — ${formatPrice(listing.price)} · YouBuyCars`,
    description: `${name}, ${formatMileage(listing.mileage)}, ${formatPrice(listing.price)} — for sale on YouBuyCars, Metro Detroit.`,
  };
}

/**
 * The listing page. Its URL is PERMANENT: a sold car renders with a SOLD
 * banner instead of vanishing, so every link ever shared keeps working
 * and the page keeps its search authority (the spec's SEO rule).
 */
// One clock read per request (react-hooks/purity).
const now = cache(() => Date.now());

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await loadListing(slug);
  if (!found) notFound();
  const { listing, photos, seller, priceChanges } = found;
  const name = `${listing.year} ${listing.make} ${listing.model}${listing.trim_level ? ` ${listing.trim_level}` : ""}`;
  const sold = listing.status === "sold";
  // The master breaker AND the listing's own box (0008/0009).
  const financed = listing.financing_offered && (seller?.financing_offered ?? true);

  /*
   * Market-velocity facts (0015, drops-only by his call): the latest
   * price change gets a chip ONLY when it fell — an increase is
   * recorded but never badged. Days-on-board runs from approval (when
   * the car actually went live), falling back to creation.
   */
  const latestChange = priceChanges[0] ?? null;
  const drop =
    latestChange && latestChange.new_price < latestChange.old_price
      ? latestChange.old_price - latestChange.new_price
      : null;
  const listedDays = Math.max(
    0,
    Math.floor(
      (now() - new Date(listing.approved_at ?? listing.created_at).getTime()) /
        86_400_000,
    ),
  );

  // schema.org Vehicle — the structured data the spec wants on every
  // listing from day one.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    vehicleModelDate: String(listing.year),
    brand: { "@type": "Brand", name: listing.make },
    model: listing.model,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: listing.mileage,
      unitCode: "SMI",
    },
    ...(listing.vin ? { vehicleIdentificationNumber: listing.vin } : {}),
    image: photos.map((p) => photoUrl(p.storage_path)),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "USD",
      availability: sold
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url: `${SITE.domain}/cars/${listing.slug}`,
    },
  };

  const askAbout = encodeURIComponent(
    `I'm interested in the ${name} (${SITE.domain}/cars/${listing.slug})`,
  );
  /*
   * Contact routing (re-cut 16 Aug 2026, the owner's rule: the platform
   * number lives on /contact ALONE — buyers contact SELLERS). A seller
   * with a published number gets the consent-gated Text/Call box; a
   * seller without one gets the on-site chat as the front door. No
   * listing ever points at the YouBuyCars line anymore.
   */
  const sellerTel = seller?.phone ? seller.phone.replace(/[^\d+]/g, "") : null;
  const smsHref = sellerTel ? `sms:${sellerTel}?&body=${askAbout}` : null;
  const messageHref = `/messages/start?seller=${listing.seller_id}&listing=${listing.id}`;

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Analytics (0007): a beacon, so crawlers reading for SEO count
          for nothing. Sold pages don't count views — nobody's shopping. */}
      {!sold && <TrackView listingId={listing.id} />}

      <Link href="/cars" className="text-sm text-slate-400 hover:text-slate-600">
        ← All cars
      </Link>

      {sold && (
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          This one&apos;s sold — but we can find you another.{" "}
          <Link href="/contact" className="text-blue-600 underline">
            Tell us what you&apos;re after
          </Link>
          .
        </div>
      )}

      {/* Concept A ("Showroom Daylight", the owner's pick): gallery left,
          buy box right — price, the green est./mo, the two contact CTAs
          and the seller card in one glanceable column. */}
      <div className="mt-4 grid gap-7 lg:grid-cols-[3fr_2fr]">
        <div>
          {photos.length > 0 ? (
            /* Gallery + lightbox (the teardown's counter-chip → modal
               pattern) — thumbnails swap the main image in place. */
            <Gallery
              photos={photos.map((p) => ({
                id: p.id,
                url: photoUrl(p.storage_path),
              }))}
              name={name}
              price={formatPrice(listing.price)}
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-slate-100 text-6xl">
              🚗
            </div>
          )}
        </div>

        <div className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-bold text-slate-900">{name}</h1>
            <SaveHeart slug={listing.slug} className="-mr-1 -mt-1 shrink-0" />
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatMileage(listing.mileage)}
            {listing.vin ? ` · VIN ${listing.vin}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
              {formatPrice(listing.price)}
            </span>
            {!sold && drop && (
              <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700 tabular-nums">
                ↓ ${drop.toLocaleString("en-US")} price drop
              </span>
            )}
          </div>
          {!sold && (
            /* The velocity line — the honest half of their market chips. */
            <p className="mt-1.5 text-xs text-slate-400 tabular-nums" suppressHydrationWarning>
              Listed {listedDays === 0 ? "today" : `${listedDays} day${listedDays === 1 ? "" : "s"} ago`}
              {" · "}
              {priceChanges.length === 0
                ? "No price changes"
                : `${priceChanges.length} price change${priceChanges.length === 1 ? "" : "s"}`}
            </p>
          )}
          {!sold && financed && (
            <p className="mt-1.5 text-sm font-semibold text-green-700 tabular-nums">
              ${estimateMonthly(listing.price).toLocaleString("en-US")}/mo est. ·{" "}
              <a href="#calculator" className="font-medium text-blue-600 underline">
                work the numbers ↓
              </a>
            </p>
          )}

          {!sold &&
            (sellerTel && smsHref ? (
              <>
                {/* Seller-direct: one checkbox unlocks both (the owner's
                   pick) — the explicit opt-in record. */}
                <ContactBox
                  sellerName={seller?.display_name ?? "the seller"}
                  phoneDisplay={seller?.phone ?? ""}
                  telHref={`tel:${sellerTel}`}
                  smsHref={smsHref}
                  listingId={listing.id}
                />
                <Link
                  href={messageHref}
                  className="mt-2 block rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100"
                >
                  💬 Message on-site — no phone needed
                </Link>
              </>
            ) : (
              /* No published seller line: on-site chat IS the front door
                 (16 Aug 2026 — no listing points at the platform number). */
              <div className="mt-4 grid gap-2">
                <Link
                  href={messageHref}
                  className="rounded-full bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                >
                  💬 Message the seller — no phone needed
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Other ways to reach us
                </Link>
              </div>
            ))}

          {seller?.public_slug && (
            <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-extrabold text-blue-700">
                {(seller.display_name ?? "S").charAt(0).toUpperCase()}
              </span>
              <span className="text-xs text-slate-500">
                <Link
                  href={`/sellers/${seller.public_slug}`}
                  className="font-semibold text-slate-900 hover:text-blue-700"
                >
                  {seller.display_name ?? "A YouBuyCars seller"}
                </Link>
                {seller.city ? <> · {seller.city}</> : null}
                <br />
                <Link
                  href={`/sellers/${seller.public_slug}`}
                  className="text-blue-600 underline"
                >
                  See all their cars
                </Link>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* The sticky summary bar arms here: once the buy box above scrolls
          away, the name/price/CTA follow the reader down the page. */}
      {!sold && (
        <SummaryBar
          name={name}
          mileage={formatMileage(listing.mileage)}
          price={formatPrice(listing.price)}
          monthly={
            financed
              ? `$${estimateMonthly(listing.price).toLocaleString("en-US")}/mo est.`
              : null
          }
          photoUrl={photos.length > 0 ? photoUrl(photos[0].storage_path) : null}
          contactHref={sellerTel ? "#contact" : messageHref}
          contactLabel={sellerTel ? "💬 Text" : "💬 Message"}
        />
      )}

      {listing.description && (
        <div className="mt-8 max-w-3xl">
          <ExpandText
            text={listing.description}
            limit={450}
            moreLabel="Show full description"
            className="whitespace-pre-line text-sm leading-relaxed text-slate-600"
          />
        </div>
      )}

      {/* Features grid + Overview table (0015) — the teardown's two spec
          sections, sized to our data. Null specs simply don't render;
          a fully-specced car reads like their page, a thin one stays
          clean instead of wearing a column of dashes. */}
      <section className="mt-10 max-w-3xl">
        <h2 className="text-base font-bold text-slate-900">Features</h2>
        <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3">
          {(
            [
              ["Mileage", formatMileage(listing.mileage)],
              ["Body style", listing.body_style],
              ["Drivetrain", listing.drivetrain],
              ["Transmission", listing.transmission],
              ["Fuel type", listing.fuel_type],
              ["Exterior color", listing.exterior_color],
              ["Interior color", listing.interior_color],
              ["Engine", listing.engine],
              ["Condition", listing.condition],
            ] as const
          )
            .filter(([, v]) => v)
            .map(([label, value]) => (
              <div key={label}>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-800">
                  {value}
                </div>
              </div>
            ))}
        </div>

        <h2 className="mt-10 text-base font-bold text-slate-900">Overview</h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          {(
            [
              ["Make", listing.make],
              ["Model", listing.model],
              ["Year", String(listing.year)],
              ["Trim", listing.trim_level],
              ["Body style", listing.body_style],
              ["Exterior color", listing.exterior_color],
              ["Interior color", listing.interior_color],
              ["Mileage", formatMileage(listing.mileage)],
              ["Condition", listing.condition],
              ["VIN", listing.vin],
            ] as const
          )
            .filter(([, v]) => v)
            .map(([label, value], i) => (
              <div
                key={label}
                className={`grid grid-cols-[130px_1fr] gap-2 px-4 py-2.5 text-sm sm:grid-cols-[160px_1fr] ${
                  i % 2 === 0 ? "bg-slate-50" : "bg-white"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {label}
                </div>
                <div className="font-medium text-slate-800">{value}</div>
              </div>
            ))}
        </div>
      </section>

      {/* The financing switch (0008): a seller who doesn't offer it shows
          no calculator — the contact buttons are the whole pitch. */}
      {!sold && financed && (
        <PaymentCalculator
          price={listing.price}
          smsHref={sellerTel ? "#contact" : messageHref}
          ctaLabel={
            sellerTel
              ? "💬 Text the seller about financing"
              : "💬 Message the seller about financing"
          }
          listingId={listing.id}
        />
      )}
    </main>
  );
}
