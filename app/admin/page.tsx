import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import {
  formatMileage,
  formatPrice,
  photoUrl,
  type Listing,
  type ListingPhoto,
  PHOTO_WIDTHS,
} from "@/lib/listings";
import { QueueCard } from "./queue-card";

export const metadata: Metadata = { title: "Approvals · YouBuyCars", robots: { index: false } };

interface SellerName {
  id: string;
  display_name: string | null;
}

/**
 * The moderation desk — the owner's call from day one: nothing goes live
 * until a person says so. Pending listings, oldest first (fairness).
 */
export default async function AdminPage() {
  const { supabase } = await requireAdmin();

  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  const pending = (data ?? []) as Listing[];

  const sellerIds = [...new Set(pending.map((l) => l.seller_id))];
  const listingIds = pending.map((l) => l.id);
  const [{ data: sellerData }, { data: photoData }] = await Promise.all([
    sellerIds.length > 0
      ? supabase.from("profiles").select("id, display_name").in("id", sellerIds)
      : Promise.resolve({ data: [] }),
    listingIds.length > 0
      ? supabase
          .from("listing_photos")
          .select("*")
          .in("listing_id", listingIds)
          .order("sort_order")
      : Promise.resolve({ data: [] }),
  ]);
  const sellers = new Map(
    ((sellerData ?? []) as SellerName[]).map((s) => [s.id, s.display_name]),
  );
  const photosByListing = new Map<string, string[]>();
  for (const p of (photoData ?? []) as ListingPhoto[]) {
    const arr = photosByListing.get(p.listing_id) ?? [];
    arr.push(photoUrl(p.storage_path, PHOTO_WIDTHS.thumb));
    photosByListing.set(p.listing_id, arr);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Approvals</h1>
      <p className="mt-1 text-sm text-slate-500">
        {pending.length === 0
          ? "The queue is empty — everything on the board is yours-approved."
          : `${pending.length} listing${pending.length === 1 ? "" : "s"} waiting, oldest first.`}
      </p>

      <div className="mt-8 space-y-5">
        {pending.map((l) => (
          <QueueCard
            key={l.id}
            listing={l}
            sellerName={sellers.get(l.seller_id) ?? "Unknown seller"}
            photoUrls={photosByListing.get(l.id) ?? []}
            priceLabel={formatPrice(l.price)}
            mileageLabel={formatMileage(l.mileage)}
          />
        ))}
      </div>
    </main>
  );
}
