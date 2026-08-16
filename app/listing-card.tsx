import Link from "next/link";
import { formatMileage, formatPrice, photoUrl, type Listing } from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";

/**
 * The Concept A card ("Showroom Daylight", the owner's pick from the Phase 2
 * mockups): price leads, the green est./mo rides beside it, title and specs
 * under, seller line at the foot. One component for the browse board and the
 * seller pages, so the marketplace has exactly one idea of what a car card
 * looks like.
 *
 * What's deliberately NOT here yet: deal badges. A "Great deal" chip needs
 * comparable-price math to stand on, and the board is too small to compare
 * against honestly — a badge with no math behind it is a claim that bites.
 */
export function ListingCard({
  listing: l,
  photoPath,
  sellerName,
  sellerCity,
}: {
  listing: Listing;
  photoPath: string | null;
  sellerName?: string | null;
  sellerCity?: string | null;
}) {
  const title = `${l.year} ${l.make} ${l.model}${l.trim_level ? ` ${l.trim_level}` : ""}`;
  const sellerLine = [sellerName, sellerCity].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/cars/${l.slug}`}
      className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/3] bg-slate-100">
        {photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(photoPath)}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            🚗
          </div>
        )}
      </div>
      <div className="px-4 pb-4 pt-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 tabular-nums">
            {formatPrice(l.price)}
          </span>
          {/* Only when the seller actually offers financing (0008) — a
              cash-only car must not wear a monthly payment. */}
          {l.financing_offered && (
            <span className="text-xs font-semibold text-green-700 tabular-nums">
              ${estimateMonthly(l.price).toLocaleString("en-US")}/mo est.
            </span>
          )}
        </div>
        <div className="mt-0.5 text-sm font-semibold text-slate-900 group-hover:text-blue-700">
          {title}
        </div>
        <div className="mt-0.5 text-xs text-slate-500">
          {formatMileage(l.mileage)}
          {l.vin ? " · VIN on file" : ""}
        </div>
        {sellerLine && (
          <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            {sellerLine}
          </div>
        )}
      </div>
    </Link>
  );
}
