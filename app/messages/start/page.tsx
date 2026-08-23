import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { startChatAction } from "../actions";
import { BuyerSignIn } from "./buyer-sign-in";

export const metadata: Metadata = { title: "Message the seller · YouBuyCars", robots: { index: false } };

/**
 * The front door to a conversation (0013). Signed in, it opens (or finds)
 * your chat with the seller and lands you in it. Signed out, it asks for
 * an email and sends the magic link straight back HERE — same URL, same
 * params — so the link click finishes what the button started.
 */
export default async function StartChatPage({
  searchParams,
}: {
  searchParams: Promise<{ seller?: string; listing?: string }>;
}) {
  const { seller = "", listing = "" } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sellerData } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("id", seller)
    .maybeSingle();
  const sellerProfile = sellerData as {
    id: string;
    display_name: string | null;
  } | null;

  if (!sellerProfile) {
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="font-semibold text-slate-700">
          That seller page doesn&apos;t exist.
        </p>
      </main>
    );
  }

  if (user) {
    // Server-side: open or find, then redirect into the thread. The
    // action only RETURNS when it couldn't — a seller on their own page,
    // an insert the policy refused — and a silent null here was a blank
    // page with no way back (23 Aug 2026 audit). Say what happened.
    const res = await startChatAction(sellerProfile.id, listing || null);
    return (
      <main className="mx-auto max-w-md px-6 py-16 text-center">
        <p className="font-semibold text-slate-700">
          {res.error ?? "Couldn't open that conversation."}
        </p>
        <Link
          href="/cars"
          className="mt-6 inline-block rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Browse cars
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">
        Message {sellerProfile.display_name ?? "the seller"}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter your email and we&apos;ll send you a sign-in link — no password,
        no account setup. The link brings you straight back to this
        conversation.
      </p>
      <div className="mt-6">
        <BuyerSignIn sellerId={sellerProfile.id} listingId={listing || null} />
      </div>
    </main>
  );
}
