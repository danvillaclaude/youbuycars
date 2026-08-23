/**
 * Listing domain logic — pure functions and types, tested in
 * scripts/test-marketplace.ts. Anything with a database in it lives in the
 * server actions instead.
 */

export interface Listing {
  id: string;
  seller_id: string;
  year: number;
  make: string;
  model: string;
  trim_level: string | null;
  vin: string | null;
  mileage: number;
  price: number;
  description: string;
  /** The financing switch (0008): off hides the est./mo and calculator. */
  financing_offered: boolean;
  /*
   * The CarGurus eight (0015): body style is required by the WIZARD for
   * new posts (it powers the tiles and filters); everything else is
   * optional and simply doesn't render when null. All nullable at the
   * DB — pre-0015 rows must not break. Spec edits deliberately do NOT
   * re-pend a live listing: adding facts must not knock a car off the
   * board, or nobody backfills.
   */
  body_style: string | null;
  exterior_color: string | null;
  interior_color: string | null;
  drivetrain: string | null;
  transmission: string | null;
  fuel_type: string | null;
  engine: string | null;
  condition: string | null;
  status: "pending" | "active" | "rejected" | "sold";
  slug: string;
  rejected_reason: string | null;
  approved_at: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
}

/*
 * The closed vocabularies, mirrored by CHECK constraints in 0015 — the
 * same pin-two-lists-together shape as the CRM's memory categories;
 * test-marketplace.ts asserts the lists are non-empty and stable-ish so
 * a drift fails a test before it fails an insert. Colors are a UI list
 * only (the DB accepts any short text): the select offers these, but
 * "Pearl White" typed by an admin doesn't bounce.
 */
export const BODY_STYLES = [
  "SUV", "Sedan", "Truck", "Coupe", "Hatchback", "Minivan", "Van",
  "Convertible", "Wagon",
] as const;
export const DRIVETRAINS = ["FWD", "RWD", "AWD", "4WD"] as const;
export const TRANSMISSIONS = ["Automatic", "Manual"] as const;
export const FUEL_TYPES = [
  "Gas", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric",
] as const;
export const CONDITIONS = ["Excellent", "Good", "Fair"] as const;
export const COLOR_OPTIONS = [
  "Black", "White", "Silver", "Gray", "Blue", "Red", "Burgundy", "Brown",
  "Beige", "Gold", "Green", "Orange", "Yellow", "Purple",
] as const;

/** A listing's price-history row (0015) — written only by the DB trigger. */
export interface PriceChange {
  id: string;
  listing_id: string;
  old_price: number;
  new_price: number;
  changed_at: string;
}

export interface ListingPhoto {
  id: string;
  listing_id: string;
  storage_path: string;
  sort_order: number;
}

/**
 * The tier ladder (owner's pricing, 12 Aug 2026): Free rides 5, Pro is
 * $100/month for 25, Ultimate is $500/month for 200 — and every iSellCars
 * CRM dealership gets Pro included free through its linked account.
 * The DB's tier_cap() enforces the same numbers; these exist so the UI
 * can explain a refusal before it happens.
 */
export type Tier = "free" | "pro" | "ultimate";

export const TIER_CAPS: Record<Tier, number> = {
  // 1 since 12 Aug 2026 (the owner's call, settled the same evening it
  // briefly sat at 3; launched at 5). Free is for selling YOUR car —
  // more than one live listing is a business, and businesses have plans.
  // The DB's tier_cap() moved with it — migration 0006 — so the two
  // can't disagree without a listing insert failing loudly.
  free: 1,
  pro: 25,
  ultimate: 200,
};

export const TIER_PRICES: Record<Tier, string> = {
  free: "Free",
  pro: "$100/mo",
  ultimate: "$500/mo",
};

export function capFor(tier: string | null | undefined): number {
  return TIER_CAPS[(tier as Tier) ?? "free"] ?? TIER_CAPS.free;
}

/** Kept for the free tier's sake; prefer capFor(tier). */
export const LISTING_CAP = TIER_CAPS.free;

/** Lowercase, dashes, nothing weird — the URL-safe half of a slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/**
 * The permanent slug: year-make-model plus a short random suffix so two
 * 2018 Equinoxes never collide. Generated ONCE at creation; the database
 * trigger refuses any later change — sold listings keep their URL forever
 * (the spec's SEO rule: authority survives the sale).
 */
export function makeSlug(
  year: number,
  make: string,
  model: string,
  random: () => number = Math.random,
): string {
  let suffix = "";
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789"; // No 0/O/1/l/i lookalikes.
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[Math.floor(random() * alphabet.length)];
  }
  return [year, slugify(make), slugify(model), suffix].filter(Boolean).join("-");
}

/** $12,500 — no cents; a car price with cents reads like a mistake. */
export function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

export function formatMileage(mileage: number): string {
  return `${mileage.toLocaleString("en-US")} mi`;
}

/** The public URL for a photo in the public listing-photos bucket. */
/**
 * Storage URLs, SIZED (23 Aug 2026 overnight pass). The browse board was
 * pulling every card photo at its full upload size — one live card
 * measured 3.57 MB, served no-cache — nine to a grid. Supabase's image
 * transform endpoint (/render/image/...?width=) hands the same photo back
 * at 216 KB for a 640px card, cached an hour, WebP when the browser
 * accepts it. Every <img> now asks for the width it actually paints;
 * omit width only where the original is genuinely wanted (nowhere, today).
 * Height follows the aspect automatically; quality 75 is indistinguishable
 * on a car photo and a third the bytes of the default.
 */
function storageUrl(bucket: string, storagePath: string, width?: number): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!width) return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
  return `${base}/storage/v1/render/image/public/${bucket}/${storagePath}?width=${width}&quality=75`;
}

/** The public URL for a listing photo, at the painted width. */
export function photoUrl(storagePath: string, width?: number): string {
  return storageUrl("listing-photos", storagePath, width);
}

/** The public URL for a dealer logo, at the painted width. */
export function logoUrl(storagePath: string, width?: number): string {
  return storageUrl("dealer-logos", storagePath, width);
}

/** The widths the site paints at — one place, so a card and its OG card
 *  can never disagree. Retina-doubled where it shows. */
export const PHOTO_WIDTHS = {
  card: 720,
  gallery: 1600,
  thumb: 320,
  bar: 160,
  compare: 800,
  og: 1200,
  logo: 160,
} as const;

/**
 * The browse board's filter set — one shape shared by the /cars rail,
 * the saved-search row (0014), and the CRM-side alert sender. Adding a
 * filter means adding it in all three places; the shared type is what
 * makes forgetting one a compile error instead of a silent mismatch.
 */
export interface SearchFilters {
  make?: string | null;
  q?: string | null;
  body_style?: string | null;
  year_min?: number | null;
  year_max?: number | null;
  max_price?: number | null;
  /** Monthly budget — converts to a price cap via lib/payments. */
  max_payment?: number | null;
  max_miles?: number | null;
  financing?: boolean;
}

/**
 * "Chevrolet · under $15,000 · financing offered" — the saved-search
 * label, built once at save time and stored, so the alert letter can say
 * what it's watching without re-deriving it later.
 */
export function describeSearch(f: SearchFilters): string {
  const parts: string[] = [];
  if (f.make) parts.push(f.make);
  if (f.body_style) parts.push(`${f.body_style}s`);
  if (f.q) parts.push(`“${f.q}”`);
  if (f.year_min && f.year_max) parts.push(`${f.year_min}–${f.year_max}`);
  else if (f.year_min) parts.push(`${f.year_min} or newer`);
  else if (f.year_max) parts.push(`${f.year_max} or older`);
  if (f.max_payment)
    parts.push(`under $${f.max_payment.toLocaleString("en-US")}/mo`);
  else if (f.max_price)
    parts.push(`under $${f.max_price.toLocaleString("en-US")}`);
  if (f.max_miles)
    parts.push(`under ${f.max_miles.toLocaleString("en-US")} mi`);
  if (f.financing) parts.push("financing offered");
  return parts.length > 0 ? parts.join(" · ") : "all cars";
}

/**
 * The search term as a VALUE (23 Aug 2026 audit). It rides inside
 * PostgREST's or() grammar, where , ( ) and " are OPERATORS — a comma
 * split "ford, xlt" into extra filters, a parenthesis closed the group
 * early, and a crafted q injected its own filter (proven live). The
 * four reserved characters become spaces; % and _ stay a buyer's to use.
 * Returns "" when nothing searchable is left.
 */
export function searchTerm(q: string | null | undefined): string {
  return (q ?? "").replace(/[,()"]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * The canonical URL for a board view: the structured filters in ONE
 * fixed order, so ?make=Ford&body=suv and ?body=suv&make=Ford resolve
 * to a single page. Sort is a preference and q is a query — neither
 * makes a different page, so both drop. Keys are the URL's own names.
 */
export const CANONICAL_KEYS = [
  "make", "body", "year_min", "year_max", "max_price", "max_payment",
  "max_miles", "financing",
] as const;
export function canonicalFor(
  p: Partial<Record<(typeof CANONICAL_KEYS)[number], string | undefined>>,
): string {
  const qs = new URLSearchParams();
  for (const k of CANONICAL_KEYS) {
    const v = p[k];
    if (v) qs.set(k, v);
  }
  const s = qs.toString();
  return s ? `/cars?${s}` : "/cars";
}

/** What a status chip says and wears, one place. */
export const STATUS_LABELS: Record<Listing["status"], string> = {
  pending: "Waiting for approval",
  active: "Live",
  rejected: "Not approved",
  sold: "Sold",
};
