import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  formatMileage,
  formatPrice,
  photoUrl,
  type Listing,
  type ListingPhoto,
  PHOTO_WIDTHS,
} from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";

export const metadata: Metadata = {
  title: "Compare cars · YouBuyCars",
  description:
    "Put two Metro Detroit cars side by side — price, payment, miles, and the seller behind each one.",
};

/**
 * The compare tool (dossier round 2): two equal columns over a
 * zebra-striped spec table — the teardown's Compare Cars page, sized to
 * a board our scale. Their entry is progressive make/model/year
 * dropdowns because they compare MODELS across a million listings;
 * ours picks two actual cars off the board, which is the honest version
 * of the same question at inventory our size. Plain GET, shareable URL.
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const { a, b } = await searchParams;
  const supabase = await createClient();

  const { data: listingData } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  const listings = (listingData ?? []) as Listing[];

  const title = (l: Listing) =>
    `${l.year} ${l.make} ${l.model}${l.trim_level ? ` ${l.trim_level}` : ""}`;

  const carA = listings.find((l) => l.slug === a) ?? null;
  const carB = listings.find((l) => l.slug === b) ?? null;
  const both = carA && carB && carA.id !== carB.id ? ([carA, carB] as const) : null;

  // Covers + sellers + ratings for the two chosen cars only.
  const photoByListing = new Map<string, string>();
  const sellerById = new Map<
    string,
    { name: string | null; city: string | null; financing: boolean; slug: string | null }
  >();
  const ratingBySeller = new Map<string, { avg: number; count: number }>();
  if (both) {
    const ids = both.map((l) => l.id);
    const sellerIds = [...new Set(both.map((l) => l.seller_id))];
    const [{ data: photoData }, { data: sellerData }, { data: reviewData }] =
      await Promise.all([
        supabase
          .from("listing_photos")
          .select("listing_id, storage_path, sort_order")
          .in("listing_id", ids)
          .order("sort_order"),
        supabase
          .from("profiles")
          .select("id, display_name, city, financing_offered, public_slug")
          .in("id", sellerIds),
        supabase
          .from("seller_reviews")
          .select("seller_id, rating")
          .in("seller_id", sellerIds),
      ]);
    for (const p of (photoData ?? []) as ListingPhoto[]) {
      if (!photoByListing.has(p.listing_id))
        photoByListing.set(p.listing_id, p.storage_path);
    }
    for (const s of (sellerData ?? []) as {
      id: string;
      display_name: string | null;
      city: string | null;
      financing_offered: boolean;
      public_slug: string | null;
    }[]) {
      sellerById.set(s.id, {
        name: s.display_name,
        city: s.city,
        financing: s.financing_offered,
        slug: s.public_slug,
      });
    }
    const sums = new Map<string, { total: number; count: number }>();
    for (const r of (reviewData ?? []) as { seller_id: string; rating: number }[]) {
      const cur = sums.get(r.seller_id) ?? { total: 0, count: 0 };
      cur.total += r.rating;
      cur.count++;
      sums.set(r.seller_id, cur);
    }
    for (const [id, v] of sums)
      ratingBySeller.set(id, { avg: v.total / v.count, count: v.count });
  }

  const financedFor = (l: Listing) =>
    l.financing_offered && (sellerById.get(l.seller_id)?.financing ?? true);

  // The zebra spec rows — label + one cell per car.
  const rows: { label: string; cells: [string, string] }[] = both
    ? [
        {
          label: "Price",
          cells: [formatPrice(both[0].price), formatPrice(both[1].price)],
        },
        {
          label: "Est. payment",
          cells: both.map((l) =>
            financedFor(l)
              ? `$${estimateMonthly(l.price).toLocaleString("en-US")}/mo`
              : "Cash sale",
          ) as [string, string],
        },
        { label: "Year", cells: [String(both[0].year), String(both[1].year)] },
        {
          label: "Mileage",
          cells: [formatMileage(both[0].mileage), formatMileage(both[1].mileage)],
        },
        {
          label: "Trim",
          cells: both.map((l) => l.trim_level ?? "—") as [string, string],
        },
        // The spec rows (0015) — the comparison earns its table.
        {
          label: "Body style",
          cells: both.map((l) => l.body_style ?? "—") as [string, string],
        },
        {
          label: "Drivetrain",
          cells: both.map((l) => l.drivetrain ?? "—") as [string, string],
        },
        {
          label: "Transmission",
          cells: both.map((l) => l.transmission ?? "—") as [string, string],
        },
        {
          label: "Fuel type",
          cells: both.map((l) => l.fuel_type ?? "—") as [string, string],
        },
        {
          label: "Color",
          cells: both.map((l) => l.exterior_color ?? "—") as [string, string],
        },
        {
          label: "Condition",
          cells: both.map((l) => l.condition ?? "—") as [string, string],
        },
        {
          label: "VIN on file",
          cells: both.map((l) => (l.vin ? "Yes" : "—")) as [string, string],
        },
        {
          label: "Seller",
          cells: both.map((l) => {
            const s = sellerById.get(l.seller_id);
            return [s?.name, s?.city].filter(Boolean).join(" · ") || "—";
          }) as [string, string],
        },
        {
          label: "Seller rating",
          cells: both.map((l) => {
            const r = ratingBySeller.get(l.seller_id);
            return r ? `★ ${r.avg.toFixed(1)} (${r.count})` : "No reviews yet";
          }) as [string, string],
        },
      ]
    : [];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Compare cars</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick two off the board and see them side by side.
      </p>

      {/* Entry form — stays put above the results so swapping a car is
          one select away, never a fresh start. */}
      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        {(
          [
            { name: "a", label: "Car 1", value: a },
            { name: "b", label: "Car 2", value: b },
          ] as const
        ).map((f) => (
          <label key={f.name} className="block text-xs font-medium text-slate-600">
            {f.label}
            <select
              name={f.name}
              defaultValue={f.value ?? ""}
              className="mt-1 block w-56 rounded-lg border border-slate-300 px-2.5 py-2 text-sm"
            >
              <option value="">Choose a car…</option>
              {listings.map((l) => (
                <option key={l.id} value={l.slug}>
                  {title(l)} — {formatPrice(l.price)}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700">
          Compare
        </button>
      </form>

      {both ? (
        <div className="mt-8">
          {/* The two car headers — photo, name, price, door to the page. */}
          <div className="grid grid-cols-2 gap-4">
            {both.map((l) => {
              const cover = photoByListing.get(l.id);
              return (
                <Link
                  key={l.id}
                  href={`/cars/${l.slug}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-slate-300"
                >
                  <div className="aspect-[4/3] bg-slate-100">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={photoUrl(cover, PHOTO_WIDTHS.compare)}
                        alt={title(l)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        🚗
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {title(l)}
                    </div>
                    <div className="text-lg font-extrabold text-slate-900 tabular-nums">
                      {formatPrice(l.price)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* The zebra table — the teardown's row-level striping. */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[110px_1fr_1fr] gap-2 px-4 py-3 text-sm sm:grid-cols-[160px_1fr_1fr] ${
                  i % 2 === 0 ? "bg-slate-50" : "bg-white"
                }`}
              >
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {row.label}
                </div>
                <div className="font-medium text-slate-800 tabular-nums">
                  {row.cells[0]}
                </div>
                <div className="font-medium text-slate-800 tabular-nums">
                  {row.cells[1]}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            Payment estimates use the same assumptions as the rest of the
            site — estimates only, never an offer of credit. Open either car
            to run your own numbers.
          </p>
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center text-sm text-slate-500">
          {a || b
            ? "Pick two different cars and hit Compare."
            : "Choose two cars above — or start from the board and come back."}{" "}
          <Link href="/cars" className="text-blue-600 underline">
            Browse the board →
          </Link>
        </div>
      )}
    </main>
  );
}
