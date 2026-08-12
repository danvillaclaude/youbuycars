import type { Metadata } from "next";
import Link from "next/link";
import { requireApprovedSeller } from "@/lib/auth";
import {
  capFor,
  formatMileage,
  formatPrice,
  STATUS_LABELS,
  type Listing,
} from "@/lib/listings";
import { DashboardRowButtons } from "./row-buttons";

export const metadata: Metadata = { title: "My listings · YouBuyCars" };

const STATUS_STYLES: Record<Listing["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  active: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-700",
  sold: "bg-slate-200 text-slate-600",
};

export default async function DashboardPage() {
  const { supabase, user, profile } = await requireApprovedSeller();

  const { data } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });
  const listings = (data ?? []) as Listing[];
  const liveCount = listings.filter((l) =>
    ["pending", "active"].includes(l.status),
  ).length;

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My listings</h1>
          <p className="mt-1 text-sm text-slate-500">
            {profile.display_name ?? "Seller"} · {liveCount} of {capFor(profile.tier)}{" "}
            slots used · {profile.tier} plan
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/profile"
            className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            My dealer page
          </Link>
          <Link
            href="/dashboard/new"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + List a car
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-200 p-10 text-center">
          <p className="font-semibold text-slate-700">No listings yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Post your first car — it takes about two minutes.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {listings.map((l) => (
            <div
              key={l.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {l.year} {l.make} {l.model}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[l.status]}`}
                  >
                    {STATUS_LABELS[l.status]}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  {formatPrice(l.price)} · {formatMileage(l.mileage)}
                  {l.status === "rejected" && l.rejected_reason
                    ? ` · Reason: ${l.rejected_reason}`
                    : ""}
                </div>
              </div>
              <DashboardRowButtons listing={l} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
