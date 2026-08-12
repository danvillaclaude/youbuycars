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
      .select("display_name, public_slug")
      .eq("id", listing.seller_id)
      .maybeSingle(),
  ]);
  return {
    listing,
    photos: (photoData ?? []) as ListingPhoto[],
    seller: sellerData as { display_name: string | null; public_slug: string | null } | null,
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

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/cars" className="text-sm text-slate-400 hover:text-slate-600">
        ← All cars
      </Link>

      {sold && (
        <div className="mt-4 rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
          This one&apos;s sold — but we can find you another.{" "}
          <Link href="/#inquiry" className="text-blue-600 underline">
            Tell us what you&apos;re after
          </Link>
          .
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {formatMileage(listing.mileage)}
            {listing.vin ? ` · VIN ${listing.vin}` : ""}
            {seller?.public_slug && (
              <>
                {" · Sold by "}
                <Link
                  href={`/sellers/${seller.public_slug}`}
                  className="text-blue-600 underline"
                >
                  {seller.display_name ?? "a YouBuyCars seller"}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="text-3xl font-bold text-slate-900">
          {formatPrice(listing.price)}
        </div>
      </div>

      {/* Gallery — first photo big, the rest in a strip. */}
      <div className="mt-6 overflow-hidden rounded-2xl bg-slate-100">
        {photos.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(photos[0].storage_path)}
            alt={name}
            className="aspect-[16/10] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[16/10] items-center justify-center text-6xl">
            🚗
          </div>
        )}
      </div>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {photos.slice(1).map((p) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={p.id}
              src={photoUrl(p.storage_path)}
              alt=""
              className="aspect-[4/3] w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {listing.description && (
        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {listing.description}
        </p>
      )}

      {!sold && (
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`sms:${SITE.phoneE164}?&body=${askAbout}`}
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Text us about this car
          </a>
          <Link
            href={`/?about=${askAbout}#inquiry`}
            className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ask by form instead
          </Link>
        </div>
      )}
      {!sold && (
        <p className="mt-3 text-xs text-slate-400">
          Texting us first is your consent to receive our replies — reply STOP
          anytime.{" "}
          <Link href="/sms-consent" className="underline">
            How texting consent works.
          </Link>
        </p>
      )}
    </main>
  );
}
