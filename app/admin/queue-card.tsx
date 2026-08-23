"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Listing } from "@/lib/listings";
import { approveListingAction, rejectListingAction } from "./actions";

export function QueueCard({
  listing,
  sellerName,
  photoUrls,
  priceLabel,
  mileageLabel,
}: {
  listing: Listing;
  sellerName: string;
  photoUrls: string[];
  priceLabel: string;
  mileageLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function approve() {
    startTransition(async () => {
      const res = await approveListingAction(listing.id);
      if (!res.ok) setError(res.error ?? "Couldn't approve.");
      router.refresh();
    });
  }

  function reject() {
    startTransition(async () => {
      const res = await rejectListingAction(listing.id, reason);
      if (!res.ok) {
        setError(res.error ?? "Couldn't reject.");
        return;
      }
      setRejecting(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      {error && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">
            {listing.year} {listing.make} {listing.model}
            {listing.trim_level ? ` ${listing.trim_level}` : ""}
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {priceLabel} · {mileageLabel}
            {listing.vin ? ` · VIN ${listing.vin}` : " · no VIN"}
            {" · by "}
            {sellerName}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={approve}
            disabled={pending}
            className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
          <button
            onClick={() => setRejecting((r) => !r)}
            disabled={pending}
            className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject…
          </button>
        </div>
      </div>

      {photoUrls.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {photoUrls.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="h-24 w-32 shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {listing.description && (
        <p className="mt-3 whitespace-pre-line text-sm text-slate-600">
          {listing.description}
        </p>
      )}

      {rejecting && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-red-50 p-3">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell the seller why — they see this word for word"
            maxLength={300}
            className="min-w-0 flex-1 rounded-lg border border-red-200 px-3 py-2 text-xs"
          />
          <button
            onClick={reject}
            disabled={pending || !reason.trim()}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reject listing
          </button>
        </div>
      )}
    </div>
  );
}
