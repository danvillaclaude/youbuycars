import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  display_name: string | null;
  phone: string | null;
  is_admin: boolean;
  tier: "free" | "pro" | "ultimate";
  approved_at: string | null;
  declined_at: string | null;
  suspended_at: string | null;
  about: string | null;
  city: string | null;
  logo_path: string | null;
  /** Seller-wide financing switch (0009) — the master breaker. */
  financing_offered: boolean;
  public_slug: string | null;
}

/** The signed-in seller, or a redirect to login. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("profiles")
    .select(
      "id, display_name, phone, is_admin, tier, approved_at, declined_at, suspended_at, about, city, logo_path, public_slug, financing_offered",
    )
    .eq("id", user.id)
    .maybeSingle();
  const profile = (data as Profile | null) ?? {
    id: user.id,
    display_name: user.email?.split("@")[0] ?? null,
    phone: null,
    is_admin: false,
    tier: "free" as const,
    approved_at: null,
    declined_at: null,
    suspended_at: null,
    about: null,
    city: null,
    logo_path: null,
    financing_offered: true,
    public_slug: null,
  };
  return { supabase, user, profile };
}

/**
 * The gate and the wall (owner's calls, 12 Aug 2026): an account waiting
 * for approval — or declined, or suspended — authenticates fine but gets
 * no further than /pending. Admins pass regardless.
 */
export async function requireApprovedSeller() {
  const session = await requireUser();
  const { profile } = session;
  if (
    !profile.is_admin &&
    (!profile.approved_at || profile.suspended_at || profile.declined_at)
  ) {
    redirect("/pending");
  }
  return session;
}

/** The moderation desk is the owner's alone. */
export async function requireAdmin() {
  const session = await requireUser();
  if (!session.profile.is_admin) redirect("/dashboard");
  return session;
}
