import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface Profile {
  id: string;
  display_name: string | null;
  phone: string | null;
  is_admin: boolean;
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
    .select("id, display_name, phone, is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const profile = (data as Profile | null) ?? {
    id: user.id,
    display_name: user.email?.split("@")[0] ?? null,
    phone: null,
    is_admin: false,
  };
  return { supabase, user, profile };
}

/** The moderation desk is the owner's alone. */
export async function requireAdmin() {
  const session = await requireUser();
  if (!session.profile.is_admin) redirect("/dashboard");
  return session;
}
