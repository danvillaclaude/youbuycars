"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireApprovedSeller } from "@/lib/auth";
import { slugify } from "@/lib/listings";

const schema = z.object({
  display_name: z.string().trim().min(1, "Buyers need a name.").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  about: z.string().trim().max(2000).optional().or(z.literal("")),
  logo_path: z.string().max(200).optional(),
  financing_offered: z.boolean().default(true),
});

export async function saveProfileAction(
  input: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user, profile } = await requireApprovedSeller();

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const d = parsed.data;
  if (d.logo_path && !d.logo_path.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Bad logo path." };
  }

  // The public slug is minted on first save and never regenerated — dealer
  // page URLs are as permanent as listing URLs.
  const public_slug =
    profile.public_slug ??
    `${slugify(d.display_name) || "seller"}-${Math.random().toString(36).slice(2, 6)}`;

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: d.display_name,
      phone: d.phone || null,
      city: d.city || null,
      about: d.about || null,
      financing_offered: d.financing_offered,
      ...(d.logo_path ? { logo_path: d.logo_path } : {}),
      public_slug,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/profile");
  revalidatePath(`/sellers/${public_slug}`);
  return { ok: true };
}
