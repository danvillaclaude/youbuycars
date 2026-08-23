import Link from "next/link";
import {
  formatMileage,
  formatPrice,
  photoUrl,
  PHOTO_WIDTHS,
  type Listing,
} from "@/lib/listings";
import { estimateMonthly } from "@/lib/payments";
import { SaveHeart } from "@/app/save-heart";
import { CompareToggle } from "@/app/compare-toggle";

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
  sellerFinancing = true,
  sellerRating = null,
  priceDrop = null,
  priority = false,
}: {
  listing: Listing;
  photoPath: string | null;
  sellerName?: string | null;
  sellerCity?: string | null;
  /** The seller-wide master breaker (0009) — off beats the listing's own. */
  sellerFinancing?: boolean;
  /** Approved-review average, when the seller has any (0009). */
  sellerRating?: { avg: number; count: number } | null;
  /** Latest price change when it FELL (0015) — increases never badge. */
  priceDrop?: number | null;
  /**
   * Above the fold? React 19 turns every eager <img> into an SSR
   * <link rel=preload>, so a 24-card board used to preload 24 photos
   * before any of them painted. The board marks its first row; the
   * rest load when they scroll near.
   */
  priority?: boolean;
}) {
  const title = `${l.year} ${l.make} ${l.model}${l.trim_level ? ` ${l.trim_level}` : ""}`;
  const sellerLine = [sellerName, sellerCity].filter(Boolean).join(" · ");

  return (
    /*
     * A div, not a link (23 Aug 2026 audit): the whole card WAS one <a>
     * with the Save and Compare <button>s inside it — interactive content
     * inside interactive content, which HTML forbids and screen readers
     * flatten into a single link named "title, title, Save this car,
     * Add to compare, $14,500…". The title link below stretches over
     * the card with an ::after, so every pixel still navigates; the two
     * buttons sit above it at z-10 and are announced as themselves.
     * Hover restraint is the teardown's rule, not an omission: cards
     * get one instant border step, no shadow bloom, no photo zoom.
     */
    <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-slate-300">
      <div className="relative aspect-[4/3] bg-slate-100">
        {/* The teardown's card anatomy, completed: the circular save
            heart floating over the photo — and the compare pick under
            it, so choosing happens where the cars are seen. */}
        <SaveHeart slug={l.slug} className="absolute right-2 top-2 z-10" />
        <CompareToggle slug={l.slug} className="absolute right-2 top-[52px] z-10" />
        {photoPath ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl(photoPath, PHOTO_WIDTHS.card)}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="flex h-full items-center justify-center text-4xl">
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
          {l.financing_offered && sellerFinancing && (
            <span className="text-xs font-semibold text-green-700 tabular-nums">
              ${estimateMonthly(l.price).toLocaleString("en-US")}/mo est.
            </span>
          )}
        </div>
        {priceDrop != null && priceDrop > 0 && (
          <div className="mt-1">
            <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700 tabular-nums">
              ↓ ${priceDrop.toLocaleString("en-US")} price drop
            </span>
          </div>
        )}
        <Link
          href={`/cars/${l.slug}`}
          className="mt-0.5 block text-sm font-semibold text-slate-900 after:absolute after:inset-0 after:content-[''] group-hover:text-blue-700"
        >
          {title}
        </Link>
        <div className="mt-0.5 text-xs text-slate-500">
          {formatMileage(l.mileage)}
          {l.vin ? " · VIN on file" : ""}
        </div>
        {(sellerLine || sellerRating) && (
          <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            {sellerRating && (
              <span className="mr-1.5 font-semibold text-amber-500">
                ★ {sellerRating.avg.toFixed(1)}
                <span className="font-normal text-slate-400"> ({sellerRating.count})</span>
              </span>
            )}
            {sellerLine}
          </div>
        )}
      </div>
    </div>
  );
}
