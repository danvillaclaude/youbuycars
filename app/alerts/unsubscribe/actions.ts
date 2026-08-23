"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The state change lives behind a POST (23 Aug 2026 audit): the letter's
 * link used to unsubscribe on the GET, and mail-link scanners — Outlook
 * Safe Links, Gmail prefetch, corporate proxies — open every link on
 * delivery, silently turning alerts off before anyone read the letter.
 * The uuid is still the whole credential (0014); the RPC is still
 * security-definer and one-row-by-primary-key. supabase-js resolves with
 * { error } rather than throwing, so failure is carried in the URL and
 * the page never says "it's off" when it isn't.
 */
export async function unsubscribeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/alerts/unsubscribe");
  const supabase = await createClient();
  const { error } = await supabase.rpc("unsubscribe_saved_search", { search_id: id });
  redirect(`/alerts/unsubscribe?id=${id}&${error ? "failed=1" : "done=1"}`);
}
