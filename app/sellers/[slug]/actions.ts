"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * The review letterbox (0009, the owner's approved spec): anyone may
 * submit, NOTHING shows until his desk approves — and the desk's job is
 * to check the number actually contacted that seller. The phone is for
 * that check alone; no public page ever selects it.
 */
const reviewSchema = z.object({
  seller_id: z.string().uuid(),
  reviewer_name: z.string().trim().min(1, "Tell the seller who you are.").max(80),
  reviewer_phone: z
    .string()
    .trim()
    .min(7, "The number you contacted them from — it's how the review gets verified.")
    .max(30),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim().max(1000),
});

export async function submitReviewAction(
  input: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form.",
    };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const { error } = await supabase.from("seller_reviews").insert({
    seller_id: d.seller_id,
    reviewer_name: d.reviewer_name,
    reviewer_phone: d.reviewer_phone,
    rating: d.rating,
    body: d.body,
  });
  // A dead seller id dies on the FK — same silence either way, the
  // letterbox owes nobody a diagnostic.
  if (error) return { ok: false, error: "Couldn't send that — try again." };
  return { ok: true };
}
