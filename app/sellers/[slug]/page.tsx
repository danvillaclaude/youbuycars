import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth";
import {
  logoUrl,
  type Listing,
  type ListingPhoto,
} from "@/lib/listings";
import { ListingCard } from "@/app/listing-card";
import { ExpandText } from "@/app/expand-text";
import { ReviewForm } from "./review-form";
import { SellerInquiryForm } from "./inquiry-form";

async function loadSeller(slug: string) {
  const supabase = await createClient();
  // RLS only surfaces approved, unsuspended sellers — a suspended dealer
  // page goes dark by policy, not by code remembering to check.
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, display_name, phone, about, city, logo_path, public_slug, tier, financing_offered, is_crm",
    )
    .eq("public_slug", slug)
    .maybeSingle();
  return data as
    | (Pick<
        Profile,
        "id" | "display_name" | "phone" | "about" | "city" | "logo_path" | "public_slug" | "tier" | "financing_offered"
      > & { is_crm: boolean })
    | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seller = await loadSeller(slug);
  return {
    title: seller
      ? `${seller.display_name ?? "Seller"} · YouBuyCars`
      : "Seller · YouBuyCars",
    description: seller?.about?.slice(0, 150) ?? undefined,
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
  const { data: listingData } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", seller.id)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  const listings = (listingData ?? []) as Listing[];

  // Approved reviews only — RLS is the guarantee. Columns deliberately
  // exclude the reviewer's phone; that's the desk's alone (0009).
  const { data: reviewData } = await supabase
    .from("seller_reviews")
    .select("id, reviewer_name, rating, body, created_at")
    .eq("seller_id", seller.id)
    .order("created_at", { ascending: false })
    .limit(50);
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
      <div className="flex flex-wrap items-center gap-5">
        {seller.logo_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl(seller.logo_path)}
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
                <span className="text-sm font-semibold text-amber-500">
                  {"★".repeat(r.rating)}
                  <span className="text-slate-200">{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              {r.body && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {r.body}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-slate-400">
                Verified contact ·{" "}
                {new Date(r.created_at).toLocaleDateString("en-US", {
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
      <p className="mt-3 max-w-2xl text-[11px] text-slate-400">
        Every review is verified against real contact with the seller before
        it appears — no drive-by ratings.
      </p>
    </main>
  );
}
