"use client";

import { useState, useTransition } from "react";
import { submitDealerInterest } from "../actions";

/**
 * The walkthrough form — /dealers' own capture, so a dealer raising a hand
 * never has to bounce to another site first. B2B on purpose: no SMS-consent
 * checkbox exists here because none is being asked for; the line under the
 * button says exactly what happens instead (a call or an email).
 */
export function DealerInterestForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">
          Got it — talk soon!
        </p>
        <p className="mt-1 text-sm text-green-700">
          A real person (the one who built this) will reach out by phone or
          email to walk you through the storefront and the CRM.
        </p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await submitDealerInterest({
        dealership: String(fd.get("dealership") ?? ""),
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        message: String(fd.get("message") ?? ""),
        website: String(fd.get("website") ?? ""),
      });
      if (!res.ok) {
        setError(res.error ?? "Something went wrong — please try again.");
        return;
      }
      setSent(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 text-left">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Dealership name
          </span>
          <input
            name="dealership"
            required
            maxLength={160}
            autoComplete="organization"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Your name
          </span>
          <input
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Phone number
          </span>
          <input
            name="phone"
            required
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Email <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Anything we should know?{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          placeholder="How many cars you carry, what you use today, what you want out of it…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
        />
      </label>

      {/* Honeypot — off-screen for humans, irresistible to bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <button
        disabled={pending}
        className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : "Book my walkthrough"}
      </button>
      <p className="text-xs text-slate-500">
        We reach out by phone or email about the platform — this form never
        signs you up for marketing texts.
      </p>
    </form>
  );
}
