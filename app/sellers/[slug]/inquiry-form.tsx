"use client";

import { useState } from "react";
import { submitInquiryAction } from "./actions";

/**
 * The per-seller inquiry form (0010, the owner's spec: dealer pages
 * only). Submissions land on the seller's own dashboard — and for a CRM
 * dealership, in their CRM as a real lead within the minute.
 *
 * The consent checkbox follows the house pattern the homepage form
 * taught: never pre-checked, never required — send without it and the
 * seller simply may not text you first.
 */
export function SellerInquiryForm({
  sellerId,
  sellerName,
}: {
  sellerId: string;
  sellerName: string;
}) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    const res = await submitInquiryAction({
      seller_id: sellerId,
      name: fd.get("name"),
      phone: fd.get("phone"),
      looking_for: fd.get("looking_for"),
      sms_consent: fd.get("sms_consent") != null,
    });
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error ?? "Couldn't send that.");
  }

  if (sent) {
    return (
      <p className="max-w-md rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
        Sent — {sellerName} has your inquiry and will get back to you.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-md space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Your name
          </span>
          <input
            name="name"
            required
            maxLength={80}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-700">
            Your cell
          </span>
          <input
            name="phone"
            required
            maxLength={30}
            placeholder="(555) 555-5555"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">
          What are you looking for?
        </span>
        <textarea
          name="looking_for"
          rows={3}
          maxLength={1000}
          placeholder="A car on their lot, a budget, a trade — whatever helps."
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="flex items-start gap-2">
        <input
          type="checkbox"
          name="sms_consent"
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        <span className="text-[11px] leading-relaxed text-slate-500">
          I agree {sellerName} may text me about my inquiry. Consent is not a
          condition of purchase; message frequency varies; message and data
          rates may apply; reply STOP to opt out at any time. This box is
          optional — you can send without it.
        </span>
      </label>
      <button
        disabled={busy}
        className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Sending…" : `Send to ${sellerName}`}
      </button>
    </form>
  );
}
