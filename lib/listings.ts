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
  status: "pending" | "active" | "rejected" | "sold";
  slug: string;
  rejected_reason: string | null;
  approved_at: string | null;
  sold_at: string | null;
  created_at: string;
  updated_at: string;
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
  // 3 since 12 Aug 2026 (the owner's call, down from the launch 5). The
  // DB's tier_cap() moved with it — migration 0005 — so the two can't
  // disagree without a listing insert failing loudly.
  free: 3,
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
export function photoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-photos/${storagePath}`;
}

/** The public URL for a dealer logo. */
export function logoUrl(storagePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dealer-logos/${storagePath}`;
}

/** What a status chip says and wears, one place. */
export const STATUS_LABELS: Record<Listing["status"], string> = {
  pending: "Waiting for approval",
  active: "Live",
  rejected: "Not approved",
  sold: "Sold",
};
