"use client";

import { useState } from "react";
import { submitReviewAction } from "./actions";

/**
 * Rate-this-dealer (0009). The form says the quiet part out loud: reviews
 * are checked against real contact before they show, which is both the
 * anti-astroturf line and the reason it asks for the phone number.
 */
export function ReviewForm({ sellerId }: { sellerId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (rating === 0) {
      setError("Pick a star rating first.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await submitReviewAction({
      seller_id: sellerId,
      reviewer_name: fd.get("reviewer_name"),
      reviewer_phone: fd.get("reviewer_phone"),
      rating,
      body: fd.get("body"),
    });
    setBusy(false);
    if (res.ok) setSent(true);
    else setError(res.error ?? "Couldn't send that.");
  }

  if (sent) {
    return (
      <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
        Thanks — your review is in. It shows once it&apos;s verified against
        real contact with this seller, usually within a day.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        ⭐ Rate this dealer
      </button>
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
      <div>
        <span className="block text-xs font-semibold text-slate-700">
          Your rating
        </span>
        <div className="mt-1 flex gap-1 text-2xl">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              className={n <= rating ? "text-amber-400" : "text-slate-200"}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">
          Your name
        </span>
        <input
          name="reviewer_name"
          required
          maxLength={80}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">
          The number you contacted them from
        </span>
        <input
          name="reviewer_phone"
          required
          maxLength={30}
          placeholder="(555) 555-5555"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-[11px] text-slate-400">
          Used only to verify you really dealt with this seller — never shown
          publicly, never used for marketing.
        </span>
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-700">
          How did it go?
        </span>
        <textarea
          name="body"
          rows={3}
          maxLength={1000}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </label>
      <button
        disabled={busy}
        className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
