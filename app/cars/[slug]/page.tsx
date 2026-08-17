import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";
import {
  formatMileage,
  formatPrice,
  photoUrl,
  type Listing,
  type ListingPhoto,
} from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";
import { PaymentCalculator } from "./payment-calculator";
import { TrackedContact, TrackView } from "@/app/track-client";
import { ContactBox } from "./contact-box";
import { Gallery } from "./gallery";
import { SummaryBar } from "./summary-bar";
import { ExpandText } from "@/app/expand-text";

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
  const [{ data: photoData }, { data: sellerData }] = await Promise.all([
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
export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const found = await loadListing(slug);
  if (!found) notFound();
  const { listing, photos, seller } = found;
  const name = `${listing.year} ${listing.make} ${listing.model}${listing.trim_level ? ` ${listing.trim_level}` : ""}`;
  const sold = listing.status === "sold";
  // The master breaker AND the listing's own box (0008/0009).
  const financed = listing.financing_offered && (seller?.financing_offered ?? true);

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
   * Contact routing (15 Aug 2026, the owner's ask): the SELLER's own
   * number when they've published one — with the YouBuyCars line as the
   * fallback. Buyer-initiated contact carries its own consent; the note
   * under the buttons says so plainly, and the registered platform-line
   * wording stays verbatim on the fallback path.
   */
  const sellerTel = seller?.phone ? seller.phone.replace(/[^\d+]/g, "") : null;
  const smsHref = sellerTel
    ? `sms:${sellerTel}?&body=${askAbout}`
    : `sms:${SITE.phoneE164}?&body=${askAbout}`;

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
          <h1 className="text-xl font-bold text-slate-900">{name}</h1>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatMileage(listing.mileage)}
            {listing.vin ? ` · VIN ${listing.vin}` : ""}
          </p>
          <div className="mt-3 text-[32px] font-extrabold leading-none tracking-tight text-slate-900 tabular-nums">
            {formatPrice(listing.price)}
          </div>
          {!sold && financed && (
            <p className="mt-1.5 text-sm font-semibold text-green-700 tabular-nums">
              ${estimateMonthly(listing.price).toLocaleString("en-US")}/mo est. ·{" "}
              <a href="#calculator" className="font-medium text-blue-600 underline">
                work the numbers ↓
              </a>
            </p>
          )}

          {!sold &&
            (sellerTel ? (
              /* Seller-direct: one checkbox unlocks both (the owner's
                 pick) — the explicit opt-in record. */
              <ContactBox
                sellerName={seller?.display_name ?? "the seller"}
                phoneDisplay={seller?.phone ?? ""}
                telHref={`tel:${sellerTel}`}
                smsHref={smsHref}
                listingId={listing.id}
              />
            ) : (
              /* Platform fallback: the carrier-registered one-tap flow,
                 untouched. */
              <div className="mt-4 grid gap-2">
                <TrackedContact
                  href={smsHref}
                  listingId={listing.id}
                  kind="text_tap"
                  className="rounded-full bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
                >
                  💬 Text about this car
                </TrackedContact>
                <Link
                  href="/contact"
                  className="rounded-full border border-slate-300 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Other ways to reach us
                </Link>
              </div>
            ))}

          {!sold &&
            (sellerTel ? null : (
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                Texting us first is your consent to receive our replies — reply
                STOP anytime.{" "}
                <Link href="/sms-consent" className="underline">
                  How texting consent works.
                </Link>
              </p>
            ))}

          {!sold && (
            <Link
              href={`/messages/start?seller=${listing.seller_id}&listing=${listing.id}`}
              className="mt-2 block rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-sm font-semibold text-blue-700 hover:bg-blue-100"
            >
              💬 Message on-site — no phone needed
            </Link>
          )}

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
          contactHref={sellerTel ? "#contact" : smsHref}
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

      {/* The financing switch (0008): a seller who doesn't offer it shows
          no calculator — the contact buttons are the whole pitch. */}
      {!sold && financed && (
        <PaymentCalculator
          price={listing.price}
          smsHref={sellerTel ? "#contact" : smsHref}
          listingId={listing.id}
        />
      )}
    </main>
  );
}
