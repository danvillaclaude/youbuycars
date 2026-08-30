"use server";

import { userMessage } from "@/lib/errors";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireApprovedSeller } from "@/lib/auth";
import { METRO_DETROIT_CITIES, slugify } from "@/lib/listings";

const schema = z.object({
  display_name: z.string().trim().min(1, "Buyers need a name.").max(80),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  // From the list, so a city is always spelled one way and never
  // "South East, Michigan" (which printed into a page title).
  city: z.enum(METRO_DETROIT_CITIES).optional().or(z.literal("")),
  about: z.string().trim().max(2000).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  logo_path: z.string().max(200).optional(),
  financing_offered: z.boolean().default(true),
});

/**
 * The dealer's own site, held to one shape (0020's CHECK wants https://):
 * scheme added when missing, http upgraded, junk rejected quietly to
 * null rather than bouncing the whole profile save.
 */
function normalizeWebsite(raw: string | undefined): string | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  const withScheme = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  const httpsUrl = withScheme.replace(/^http:\/\//i, "https://");
  try {
    const u = new URL(httpsUrl);
    if (!u.hostname.includes(".")) return null;
    return u.toString().replace(/\/$/, "").slice(0, 200);
  } catch {
    return null;
  }
}

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
      website: normalizeWebsite(d.website),
      ...(d.logo_path ? { logo_path: d.logo_path } : {}),
      public_slug,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: userMessage(error) };

  revalidatePath("/dashboard/profile");
  revalidatePath(`/sellers/${public_slug}`);
  return { ok: true };
}
