import type { Metadata } from "next";
import Link from "next/link";
import { requireApprovedSeller } from "@/lib/auth";
import { SellerSupportForm } from "./support-form";

export const metadata: Metadata = { title: "Get help · YouBuyCars", robots: { index: false } };

/**
 * The seller door on the support letterbox (0023). One form, no ticket
 * numbers, no status page: the request lands in the owner's CRM and the
 * answer comes back as an email — which is why the address shown here is
 * the account's own, read-only.
 */
export default async function SupportPage() {
  const { user, profile } = await requireApprovedSeller();
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Get help</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 underline">
          ← My listings
        </Link>
      </div>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Your account, a listing, billing, something broken — ask, and a real
        person replies by email.
      </p>
      <SellerSupportForm
        defaultName={profile.display_name ?? ""}
        email={user.email ?? ""}
      />
    </main>
  );
}
