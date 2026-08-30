"use client";

import { useState, useTransition } from "react";
import { submitSupportRequest } from "../actions";

/**
 * The buyer door on the support letterbox (0023): anyone on /contact can
 * file a request without an account. The email is required because it is
 * the only way back — replies come by email from a real person, and the
 * confirmation says so in those words.
 */
export function SupportForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">
          Got it — your request is in.
        </p>
        <p className="mt-1 text-sm text-green-700">
          A real person will reply by email, usually same day.
        </p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await submitSupportRequest({
        name: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        body: String(fd.get("body") ?? ""),
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
            Email <span className="font-normal text-slate-400">(where we reply)</span>
          </span>
          <input
            name="email"
            required
            type="email"
            maxLength={200}
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Subject
        </span>
        <input
          name="subject"
          required
          maxLength={200}
          placeholder="A few words on what this is about"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          What&apos;s going on?
        </span>
        <textarea
          name="body"
          required
          rows={4}
          maxLength={4000}
          placeholder="The more detail the better — which page, which car, what you expected…"
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
        {pending ? "Sending…" : "Send it"}
      </button>
      <p className="text-xs text-slate-500">
        We reply by email — this form never signs you up for texts.
      </p>
    </form>
  );
}
