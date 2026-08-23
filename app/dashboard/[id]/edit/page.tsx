import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireApprovedSeller } from "@/lib/auth";
import type { Listing, ListingPhoto } from "@/lib/listings";
import { ListingForm } from "../../listing-form";

export const metadata: Metadata = { title: "Edit listing · YouBuyCars", robots: { index: false } };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireApprovedSeller();

  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();
  const listing = data as Listing | null;
  if (!listing) notFound();

  const { data: photoData } = await supabase
    .from("listing_photos")
    .select("*")
    .eq("listing_id", listing.id)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">
        Edit: {listing.year} {listing.make} {listing.model}
      </h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Its link never changes: /cars/{listing.slug}
      </p>
      <ListingForm
        listing={listing}
        photos={(photoData ?? []) as ListingPhoto[]}
        userId={user.id}
      />
    </main>
  );
}
