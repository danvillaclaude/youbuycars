"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { capFor, makeSlug, type Listing } from "@/lib/listings";

const listingSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  trim_level: z.string().trim().max(60).optional().or(z.literal("")),
  vin: z.string().trim().max(20).optional().or(z.literal("")),
  mileage: z.coerce.number().int().min(0).max(2_000_000),
  price: z.coerce.number().int().min(0).max(10_000_000),
  description: z.string().trim().max(5000),
});

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
      error: `You're at your plan's limit of ${cap} listings. Mark one sold (or delete a pending one) to post another.`,
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
      slug: makeSlug(d.year, d.make, d.model),
    })
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true, id: (data as { id: string }).id };
}

/**
 * Edit. The guard trigger sends a live listing back to 'pending' when its
 * substance changes — the admin approved specific words and numbers.
 */
export async function updateListingAction(
  id: string,
  input: Record<string, unknown>,
): Promise<ListingResult> {
  const { supabase } = await requireUser();

  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const d = parsed.data;
  const { error } = await supabase
    .from("listings")
    .update({
      year: d.year,
      make: d.make,
      model: d.model,
      trim_level: d.trim_level || null,
      vin: d.vin || null,
      mileage: d.mileage,
      price: d.price,
      description: d.description,
    })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/admin");
  revalidatePath("/cars");
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
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  return { ok: true };
}

/** Delete — pending/rejected only (RLS enforces); live history is kept. */
export async function deleteListingAction(id: string): Promise<ListingResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
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

  const { error } = await supabase.from("listing_photos").insert(
    paths.slice(0, 12).map((storage_path, i) => ({
      listing_id: listingId,
      storage_path,
      sort_order: (count ?? 0) + i,
    })),
  );
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  return { ok: true };
}

export async function deletePhotoAction(photoId: string): Promise<ListingResult> {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("listing_photos")
    .delete()
    .eq("id", photoId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  revalidatePath("/cars");
  return { ok: true };
}

export type { Listing };
