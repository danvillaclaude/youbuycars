import type { Metadata } from "next";
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
  const { profile } = await requireUser();

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
