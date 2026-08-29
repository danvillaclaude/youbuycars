"use server";

import { userMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import {
  BODY_STYLES,
  capFor,
  CONDITIONS,
  canonicalMake,
  MAX_PHOTOS,
  DRIVETRAINS,
  FUEL_TYPES,
  makeSlug,
  TRANSMISSIONS,
  type Listing,
} from "@/lib/listings";

const listingSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  // Spelled from the list (canonicalMake): "chevy" is stored as Chevrolet.
  make: z.string().trim().min(1).max(60).transform(canonicalMake),
  model: z.string().trim().min(1).max(60),
  trim_level: z.string().trim().max(60).optional().or(z.literal("")),
  // Uppercased: a phone keyboard's lowercase VIN used to publish as typed.
  vin: z.string().trim().toUpperCase().max(20).optional().or(z.literal("")),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
  price: z.coerce.number().int().min(0).max(10_000_000),
  // 5,500: slightly above Facebook Marketplace's 5,000 (the owner's rule),
  // so a description pasted from FBMP always fits with room to spare.
  description: z.string().trim().max(5500),
  // The CarGurus eight (0015). Body style required — it powers the
  // tiles and filters, and the wizard enforces it too; the DB's CHECK
  // constraints hold the same vocabularies, so a mismatch bounces
  // loudly rather than storing junk. The rest are optional.
  body_style: z.enum(BODY_STYLES),
  exterior_color: z.string().trim().max(40).optional().or(z.literal("")),
  interior_color: z.string().trim().max(40).optional().or(z.literal("")),
  drivetrain: z.enum(DRIVETRAINS).optional().or(z.literal("")),
  transmission: z.enum(TRANSMISSIONS).optional().or(z.literal("")),
  fuel_type: z.enum(FUEL_TYPES).optional().or(z.literal("")),
  engine: z.string().trim().max(80).optional().or(z.literal("")),
  condition: z.enum(CONDITIONS).optional().or(z.literal("")),
  // The financing switch (0008): checkbox absence is a plain false.
  financing_offered: z.boolean().default(true),
});

/** The spec columns as a row fragment — empty strings become NULLs. */
function specColumns(d: z.infer<typeof listingSchema>) {
  return {
    body_style: d.body_style,
    exterior_color: d.exterior_color || null,
    interior_color: d.interior_color || null,
    drivetrain: d.drivetrain || null,
    transmission: d.transmission || null,
    fuel_type: d.fuel_type || null,
    engine: d.engine || null,
    condition: d.condition || null,
  };
}

export interface ListingResult {
  ok: boolean;
  error?: string;
  id?: string;
}

/**
 * Create: born 'pending' — the guard trigger enforces that and the cap
 * even if this code lied. The slug is minted here, once, forever.
 */
export async function createListingAction(
  input: Record<string, unknown>,
): Promise<ListingResult> {
  const { supabase, user, profile } = await requireUser();

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("seller_id", user.id)
    .in("status", ["pending", "active"]);
  const cap = capFor(profile.tier);
  if ((count ?? 0) >= cap) {
    return {
      ok: false,
      error: `You're at your plan's limit of ${cap} listing${cap === 1 ? "" : "s"}. Mark one sold (or delete a pending one) to post another.`,
    };
  }

  const d = parsed.data;
  const { data, error } = await supabase
    .from("listings")
    .insert({
      seller_id: user.id,
      year: d.year,
      make: d.make,
      model: d.model,
      trim_level: d.trim_level || null,
      vin: d.vin || null,
      mileage: d.mileage,
      price: d.price,
      description: d.description,
      ...specColumns(d),
      financing_offered: d.financing_offered,
      slug: makeSlug(d.year, d.make, d.model),
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: userMessage(error) };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true, id: (data as { id: string }).id };
}

/**
 * Edit. The guard trigger sends a live listing back to 'pending' when its
 * substance changes — the admin approved specific words and numbers.
 * Saving a REJECTED listing is a resubmission (23 Aug 2026 audit): it
 * goes back in the queue with the reason cleared — before this it stayed
 * "Not approved" forever, whatever the seller fixed. Rejected rows sit
 * outside the cap and the trigger only counts at INSERT, so the cap is
 * re-checked here.
 */
export async function updateListingAction(
  id: string,
  input: Record<string, unknown>,
): Promise<ListingResult> {
  const { supabase, user, profile } = await requireUser();

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const d = parsed.data;

  const { data: cur } = await supabase
    .from("listings")
    .select("status")
    .eq("id", id)
    .eq("seller_id", user.id)
    .maybeSingle();
  if (!cur) return { ok: false, error: "That listing isn't yours." };
  const resubmit = (cur as { status: string }).status === "rejected";
  if (resubmit) {
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("seller_id", user.id)
      .in("status", ["pending", "active"]);
    const cap = capFor(profile.tier);
    if ((count ?? 0) >= cap) {
      return {
        ok: false,
        error: `You're at your plan's limit of ${cap} listing${cap === 1 ? "" : "s"}. Mark one sold (or delete a pending one) to resubmit this one.`,
      };
    }
  }

  const { error } = await supabase
    .from("listings")
    .update({
      ...(resubmit ? { status: "pending", rejected_reason: null } : {}),
      year: d.year,
      make: d.make,
      model: d.model,
      trim_level: d.trim_level || null,
      vin: d.vin || null,
      mileage: d.mileage,
      price: d.price,
      description: d.description,
      ...specColumns(d),
      financing_offered: d.financing_offered,
    })
    .eq("id", id);
  if (error) return { ok: false, error: userMessage(error) };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/cars");
  revalidatePath("/sitemap.xml");
  return { ok: true, id };
}

/** Sold — the good ending. The URL lives on; the board lets it go. */
export async function markSoldAction(id: string): Promise<ListingResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("listings")
    .update({ status: "sold", sold_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "active");
  if (error) return { ok: false, error: userMessage(error) };
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}

/** Delete — pending/rejected only (RLS enforces); live history is kept. */
export async function deleteListingAction(id: string): Promise<ListingResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return { ok: false, error: userMessage(error) };
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true };
}

/** Photo bookkeeping: the FILES go up from the browser (straight to
 *  storage, no server hop); the rows land here afterward. */
export async function recordPhotosAction(
  listingId: string,
  paths: string[],
): Promise<ListingResult> {
  const { supabase, user } = await requireUser();
  if (paths.length === 0) return { ok: true };
  if (paths.some((p) => !p.startsWith(`${user.id}/`))) {
    return { ok: false, error: "Bad photo path." };
  }

  const { count } = await supabase
    .from("listing_photos")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  // Per LISTING, not per batch (23 Aug 2026 audit): slice(0, 12) on each
  // call let a 10-photo listing take 5 more. Anything past the cap is
  // already in storage — take it back out so the bucket never holds a
  // file no row points at.
  const room = Math.max(0, MAX_PHOTOS - (count ?? 0));
  const extra = paths.slice(room);
  if (extra.length > 0) {
    await supabase.storage.from("listing-photos").remove(extra);
  }
  if (room === 0) {
    return { ok: false, error: `A listing holds up to ${MAX_PHOTOS} photos.` };
  }

  const { error } = await supabase.from("listing_photos").insert(
    paths.slice(0, room).map((storage_path, i) => ({
      listing_id: listingId,
      storage_path,
      sort_order: (count ?? 0) + i,
    })),
  );
  if (error) return { ok: false, error: userMessage(error) };
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}

export async function deletePhotoAction(photoId: string): Promise<ListingResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", photoId);
  if (error) return { ok: false, error: userMessage(error) };
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  revalidatePath("/sitemap.xml");
  return { ok: true };
}

export type { Listing };
