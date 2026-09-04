import { cache } from "react";
import { SITE } from "@/lib/site";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth";
import {
  logoUrl,
  type Listing,
  type ListingPhoto,
  PHOTO_WIDTHS,
} from "@/lib/listings";
import { ListingCard } from "@/app/listing-card";
import { ExpandText } from "@/app/expand-text";
import { ReviewForm } from "./review-form";
import { SellerInquiryForm } from "./inquiry-form";

// cache(): generateMetadata and the page both load the seller.
const loadSeller = cache(async function loadSeller(slug: string) {
  const supabase = await createClient();
  // RLS only surfaces approved, unsuspended sellers — a suspended dealer
  // page goes dark by policy, not by code remembering to check.
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, display_name, phone, about, city, logo_path, public_slug, tier, financing_offered, is_crm, website",
    )
    .eq("public_slug", slug)
    .maybeSingle();
  return data as
    | (Pick<
        Profile,
        "id" | "display_name" | "phone" | "about" | "city" | "logo_path" | "public_slug" | "tier" | "financing_offered" | "website"
      > & { is_crm: boolean })
    | null;
});

/** Trim to ~155 chars on a word boundary, never mid-word. */
function blurb(text: string | null | undefined): string | undefined {
  const t = (text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  if (t.length <= 155) return t;
  const cut = t.slice(0, 155);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = await loadSeller(slug);
  const name = seller?.display_name ?? "Seller";
  // Sellers type their city free-form, and some already wrote the
  // state ("South East, Michigan") — append it only when it's absent.
  const city = seller?.city?.trim();
  const where = !city
    ? "Metro Detroit"
    : /michigan|\bMI\b/i.test(city)
      ? city
      : `${city}, MI`;
  const title = seller
    ? `${name} — Used Cars for Sale in ${where} | YouBuyCars`
    : "Seller | YouBuyCars";
  const description =
    blurb(seller?.about) ??
    `Browse ${name}'s used cars for sale in ${where} on YouBuyCars — reviewed listings, payment estimates and a seller you contact directly.`;
  return {
    title,
    description,
    // Storefront links get shared; a self-canonical keeps appended
    // tracking params from minting duplicates, and the logo makes the
    // unfurl a card instead of a blank.
    alternates: { canonical: `/sellers/${slug}` },
    openGraph: {
      type: "website",
      siteName: "YouBuyCars",
      locale: "en_US",
      title,
      description,
      images: seller?.logo_path
        ? [{ url: logoUrl(seller.logo_path, PHOTO_WIDTHS.og) }]
        : [],
    },
  };
}

/** The public dealer page — part of what Pro buys, and every CRM
 *  dealership's free storefront on the marketplace. */
export default async function SellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const seller = await loadSeller(slug);
  if (!seller) notFound();

  const supabase = await createClient();
  // Listings and reviews depend only on the seller id — one round trip.
  // Approved reviews only — RLS is the guarantee. Columns deliberately
  // exclude the reviewer's phone; that's the desk's alone (0009).
  const [{ data: listingData }, { data: reviewData }] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("seller_id", seller.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("seller_reviews")
      .select("id, reviewer_name, rating, body, created_at")
      .eq("seller_id", seller.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  const listings = (listingData ?? []) as Listing[];
  const reviews = (reviewData ?? []) as {
    id: string;
    reviewer_name: string;
    rating: number;
    body: string;
    created_at: string;
  }[];
  const avg =
    reviews.length > 0
      ? reviews.reduce((t, r) => t + r.rating, 0) / reviews.length
      : null;

  const photosByListing = new Map<string, string>();
  if (listings.length > 0) {
    const { data: photoData } = await supabase
      .from("listing_photos")
      .select("listing_id, storage_path, sort_order")
      .in("listing_id", listings.map((l) => l.id))
      .order("sort_order");
    for (const p of (photoData ?? []) as ListingPhoto[]) {
      if (!photosByListing.has(p.listing_id)) {
        photosByListing.set(p.listing_id, p.storage_path);
      }
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      {/* Entity markup for DEALERS only (the kit): a private person selling
          their own few cars is not an AutoDealer. Deliberately NO AggregateRating —
          with the platform's own person as the only seller, review markup
          is Google's "self-serving" case; revisit when third-party
          dealers with real reviews exist. */}
      {(seller.is_crm || seller.tier !== "free") && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "AutoDealer",
              name: seller.display_name ?? "Seller",
              url: `${SITE.domain}/sellers/${seller.public_slug}`,
              ...(seller.logo_path
                ? { image: logoUrl(seller.logo_path, PHOTO_WIDTHS.logo) }
                : {}),
              ...(seller.city
                ? {
                    address: {
                      "@type": "PostalAddress",
                      addressLocality: seller.city,
                      addressRegion: "MI",
                    },
                  }
                : {}),
              ...(seller.website ? { sameAs: [seller.website] } : {}),
            }),
          }}
        />
      )}
      <div className="flex flex-wrap items-center gap-5">
        {seller.logo_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl(seller.logo_path, PHOTO_WIDTHS.logo)}
            alt=""
            className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
            🏪
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold">{seller.display_name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {avg != null && (
              <span className="mr-1.5 font-semibold text-amber-500">
                ★ {avg.toFixed(1)}
                <span className="font-normal text-slate-400">
                  {" "}({reviews.length})
                </span>
              </span>
            )}
            {seller.city ? `${seller.city} · ` : ""}
            {listings.length} car{listings.length === 1 ? "" : "s"} for sale
            {seller.phone ? ` · ${seller.phone}` : ""}
          </p>
          {seller.website && (
            /* nofollow on purpose: an outbound link every seller can set
               must not pass authority, or the field becomes a target. */
            <a
              href={seller.website}
              target="_blank"
              rel="nofollow noopener"
              className="mt-1 inline-block text-sm font-semibold text-blue-600 hover:underline"
            >
              Visit website →
            </a>
          )}
        </div>
      </div>

      <Link
        href={`/messages/start?seller=${seller.id}`}
        className="mt-5 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
      >
        💬 Message {seller.display_name ?? "this seller"}
      </Link>

      {seller.about && (
        <div className="mt-6 max-w-3xl">
          {/* Seller-authored text gets the teardown's truncate-and-reveal
              treatment, so a long back-story can't bury the inventory. */}
          <ExpandText
            text={seller.about}
            limit={350}
            className="whitespace-pre-line text-sm leading-relaxed text-slate-600"
          />
        </div>
      )}

      <h2 className="mt-10 text-lg font-bold">Inventory</h2>
      {listings.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          Nothing live right now — check back soon.
        </p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              photoPath={photosByListing.get(l.id) ?? null}
              sellerCity={seller.city}
              sellerFinancing={seller.financing_offered}
            />
          ))}
        </div>
      )}

      {/* The seller's own funnel (0010): lands on their dashboard, and in
          a CRM dealership's CRM as a real lead within the minute. Gated
          (16 Aug 2026, the owner's call): the inquiry form is a paying
          feature — dealers and Pro/Ultimate accounts only. Free sellers
          keep the on-site Message button above. */}
      {(seller.is_crm || seller.tier !== "free") && (
        <>
          <h2 className="mt-12 text-lg font-bold">
            Ask {seller.display_name ?? "this seller"} about a car
          </h2>
          <div className="mt-3">
            <SellerInquiryForm
              sellerId={seller.id}
              sellerName={seller.display_name ?? "this seller"}
            />
          </div>
        </>
      )}

      {/* Ratings (0009): approved reviews, then the door to add one. */}
      <h2 className="mt-12 text-lg font-bold">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">
          No reviews yet — dealt with {seller.display_name ?? "this seller"}?
          Be the first.
        </p>
      ) : (
        <div className="mt-4 max-w-2xl space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  {r.reviewer_name}
                </span>
                <span
                  role="img"
                  aria-label={`${r.rating} out of 5 stars`}
                  className="text-sm font-semibold text-amber-500"
                >
                  <span aria-hidden="true">{"★".repeat(r.rating)}</span>
                  <span aria-hidden="true" className="text-slate-200">
                    {"★".repeat(5 - r.rating)}
                  </span>
                </span>
              </div>
              {r.body && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {r.body}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-slate-500">
                Verified contact ·{" "}
                {new Date(r.created_at).toLocaleDateString("en-US", {
                  timeZone: SITE.timeZone,
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5">
        <ReviewForm sellerId={seller.id} />
      </div>
      <p className="mt-3 max-w-2xl text-[11px] text-slate-500">
        Every review is verified against real contact with the seller before
        it appears — no drive-by ratings.
      </p>
    </main>
  );
}
