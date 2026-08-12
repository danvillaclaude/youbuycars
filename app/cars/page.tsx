import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatMileage,
  formatPrice,
  photoUrl,
  type Listing,
  type ListingPhoto,
} from "@/lib/listings";

export const metadata: Metadata = {
  title: "Cars for sale · YouBuyCars",
  description:
    "Browse vehicles for sale in Metro Detroit — every listing reviewed before it goes live. Tell us what you need and we'll text you options.",
};

/** The board: live listings only, filterable. Sold cars keep their URLs
 *  but leave the board (the spec's rule — search shows what's buyable). */
export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<{ make?: string; q?: string; max_price?: string; max_miles?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (params.make) query = query.ilike("make", params.make);
  if (params.q) query = query.or(`model.ilike.%${params.q}%,make.ilike.%${params.q}%,trim_level.ilike.%${params.q}%`);
  if (params.max_price && Number(params.max_price) > 0)
    query = query.lte("price", Number(params.max_price));
  if (params.max_miles && Number(params.max_miles) > 0)
    query = query.lte("mileage", Number(params.max_miles));

  const [{ data: listingData }, { data: makeData }] = await Promise.all([
    query,
    supabase.from("listings").select("make").eq("status", "active"),
  ]);
  const listings = (listingData ?? []) as Listing[];
  const makes = [
    ...new Set(((makeData ?? []) as { make: string }[]).map((m) => m.make)),
  ].sort();

  // First photo per listing, one query.
  const ids = listings.map((l) => l.id);
  const photosByListing = new Map<string, string>();
  if (ids.length > 0) {
    const { data: photoData } = await supabase
      .from("listing_photos")
      .select("listing_id, storage_path, sort_order")
      .in("listing_id", ids)
      .order("sort_order");
    for (const p of (photoData ?? []) as ListingPhoto[]) {
      if (!photosByListing.has(p.listing_id)) {
        photosByListing.set(p.listing_id, p.storage_path);
      }
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">Cars for sale</h1>
      <p className="mt-1 text-sm text-slate-500">
        Every listing is reviewed before it goes live. Don&apos;t see what you
        want?{" "}
        <Link href="/#inquiry" className="text-blue-600 underline">
          Tell us — we&apos;ll find it and text you.
        </Link>
      </p>

      {/* Filters — plain GET form, shareable URLs. */}
      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <label className="block text-xs font-medium text-slate-600">
          Make
          <select
            name="make"
            defaultValue={params.make ?? ""}
            className="mt-1 block rounded-lg border border-slate-300 px-2 py-2 text-sm"
          >
            <option value="">Any</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Model or keyword
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Equinox, F-150…"
            className="mt-1 block w-40 rounded-lg border border-slate-300 px-2 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Max price
          <input
            name="max_price"
            type="number"
            min={0}
            defaultValue={params.max_price ?? ""}
            placeholder="$"
            className="mt-1 block w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600">
          Max miles
          <input
            name="max_miles"
            type="number"
            min={0}
            defaultValue={params.max_miles ?? ""}
            className="mt-1 block w-28 rounded-lg border border-slate-300 px-2 py-2 text-sm"
          />
        </label>
        <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-200 p-10 text-center">
          <p className="font-semibold text-slate-700">
            Nothing on the board matches — yet.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Inventory is growing.{" "}
            <Link href="/#inquiry" className="text-blue-600 underline">
              Tell us what you&apos;re after
            </Link>{" "}
            and a real person will text you options, or{" "}
            <Link href="/sell" className="text-blue-600 underline">
              list your own car
            </Link>
            .
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => {
            const photo = photosByListing.get(l.id);
            return (
              <Link
                key={l.id}
                href={`/cars/${l.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] bg-slate-100">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl(photo)}
                      alt={`${l.year} ${l.make} ${l.model}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      🚗
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold text-slate-900 group-hover:text-blue-600">
                    {l.year} {l.make} {l.model}
                    {l.trim_level ? ` ${l.trim_level}` : ""}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      {formatPrice(l.price)}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatMileage(l.mileage)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
