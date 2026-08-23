"use server";

import { userMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

interface Result {
  ok: boolean;
  error?: string;
}

/** The yes. RLS + the guard trigger make this the ONLY road to 'active'. */
export async function approveListingAction(id: string): Promise<Result> {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("listings")
    .update({
      status: "active",
      approved_at: new Date().toISOString(),
      rejected_reason: null,
    })
    .eq("id", id);
  if (error) return { ok: false, error: userMessage(error) };
  revalidatePath("/admin");
  revalidatePath("/cars");
  return { ok: true };
}

/** The no — always with a reason the seller can read and fix. */
export async function rejectListingAction(
  id: string,
  reason: string,
): Promise<Result> {
  const { supabase } = await requireAdmin();
  const clean = reason.trim().slice(0, 300);
  if (!clean) return { ok: false, error: "Give the seller a reason." };
  const { error } = await supabase
    .from("listings")
    .update({ status: "rejected", rejected_reason: clean })
    .eq("id", id);
  if (error) return { ok: false, error: userMessage(error) };
  revalidatePath("/admin");
  return { ok: true };
}
