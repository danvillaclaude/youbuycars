import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/auth";
import {
  logoUrl,
  type Listing,
  type ListingPhoto,
} from "@/lib/listings";
import { ListingCard } from "@/app/listing-card";

async function loadSeller(slug: string) {
  const supabase = await createClient();
  // RLS only surfaces approved, unsuspended sellers — a suspended dealer
  // page goes dark by policy, not by code remembering to check.
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, display_name, phone, about, city, logo_path, public_slug, tier",
    )
    .eq("public_slug", slug)
    .maybeSingle();
  return data as Pick<
    Profile,
    "id" | "display_name" | "phone" | "about" | "city" | "logo_path" | "public_slug" | "tier"
  > | null;
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
    <main className="mx-auto max-w-5xl px-6 py-10">
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
            {seller.city ? `${seller.city} · ` : ""}
            {listings.length} car{listings.length === 1 ? "" : "s"} for sale
            {seller.phone ? ` · ${seller.phone}` : ""}
          </p>
        </div>
      </div>

      {seller.about && (
        <p className="mt-6 max-w-3xl whitespace-pre-line text-sm leading-relaxed text-slate-600">
          {seller.about}
        </p>
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
            />
          ))}
        </div>
      )}
    </main>
  );
}
