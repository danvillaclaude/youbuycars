"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { submitInquiry } from "./actions";

/**
 * The lead form. The consent checkbox is UNCHECKED by default and never
 * required — both facts are load-bearing for A2P review (error 30925),
 * so don't "improve" either one.
 */
export function InquiryForm({
  defaultLookingFor = "",
}: {
  /** Prefilled from a listing page's "Ask by form" link. */
  defaultLookingFor?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [consent, setConsent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">
          Got it — thank you!
        </p>
        <p className="mt-1 text-sm text-green-700">
          {consent
            ? "A real person will text you back shortly."
            : "We received your inquiry. Since you didn't opt in to texting, we won't text you — but your request is in our hands."}
        </p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await submitInquiry({
        name: String(fd.get("name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        email: String(fd.get("email") ?? ""),
        looking_for: String(fd.get("looking_for") ?? ""),
        sms_consent: fd.get("sms_consent") === "on",
        website: String(fd.get("website") ?? ""),
      });
      if (!res.ok) {
        setError(res.error ?? "Something went wrong — please try again.");
        return;
      }
      setConsent(fd.get("sms_consent") === "on");
      setSent(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

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

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          What are you looking for?
        </span>
        <textarea
          name="looking_for"
          required
          rows={3}
          defaultValue={defaultLookingFor}
          placeholder="Year, make, model, budget — or just describe what you need."
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

      <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        {/* Unchecked by default, never required — A2P rules 30925/30924. */}
        <input type="checkbox" name="sms_consent" className="mt-0.5" />
        <span className="text-xs leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-700">Optional.</span> I
          agree to receive text messages from YouBuyCars about vehicles,
          appointments, and financing. Consent is not a condition of purchase
          and you can send this form without it. Message &amp; data rates may
          apply; message frequency varies. Reply STOP to opt out. See our{" "}
          <Link href="/privacy" className="text-blue-600 underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="text-blue-600 underline">
            Terms
          </Link>
          .
        </span>
      </label>

      <button
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Sending…" : "Text me options"}
      </button>
    </form>
  );
}
