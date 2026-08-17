"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/listings";
import { deleteListingAction, markSoldAction } from "./actions";

export function DashboardRowButtons({ listing }: { listing: Listing }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 items-center gap-2">
      {listing.status === "active" && (
        <>
          <Link
            href={`/cars/${listing.slug}`}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            View
          </Link>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await markSoldAction(listing.id);
                router.refresh();
              })
            }
            className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Mark sold
          </button>
        </>
      )}
      {listing.status !== "sold" && (
        <Link
          href={`/dashboard/${listing.id}/edit`}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Edit
        </Link>
      )}
      {["pending", "rejected"].includes(listing.status) && (
        <button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteListingAction(listing.id);
              router.refresh();
            })
          }
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      )}
    </div>
  );
}
