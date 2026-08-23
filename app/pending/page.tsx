import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { SITE } from "@/lib/site";
import { SignOutButton } from "../sign-out-button";

export const metadata: Metadata = { title: "Account status · YouBuyCars", robots: { index: false } };

/**
 * The wall (owner's call: hard gate). Waiting, declined and suspended
 * accounts all land here — authenticated, told the truth, and going no
 * further. Approval flips this to a working dashboard with no other change.
 */
export default async function PendingPage() {
  const { supabase, profile } = await requireUser();

  // A BUYER (magic-link account, 0013) is never in the seller queue, but
  // the header's person icon sends every signed-in user to /dashboard,
  // whose gate sends the unapproved here — so a buyer read "your seller
  // account is waiting for approval" about an account that isn't one.
  // Their desk is the inbox.
  const { data: flags } = await supabase
    .from("profiles")
    .select("is_buyer")
    .eq("id", profile.id)
    .maybeSingle();
  if ((flags as { is_buyer: boolean } | null)?.is_buyer && !profile.approved_at) {
    redirect("/messages");
  }

  const state = profile.suspended_at
    ? {
        title: "Your account is suspended",
        body: `Your listings are hidden and posting is disabled. If you think this is a mistake, contact ${SITE.email}.`,
      }
    : profile.declined_at
      ? {
          title: "Your seller request wasn't approved",
          body: `Your request was reviewed and not approved at this time. Questions? Contact ${SITE.email}.`,
        }
      : {
          title: "Your seller account is waiting for approval",
          body: "A real person reviews every new seller — usually same day. You'll be able to post the moment you're approved.",
        };

  return (
    <main className="mx-auto max-w-md px-6 py-20 text-center">
      <div className="text-4xl">🕐</div>
      <h1 className="mt-4 text-2xl font-bold">{state.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{state.body}</p>
      <div className="mt-8">
        <SignOutButton />
      </div>
    </main>
  );
}
