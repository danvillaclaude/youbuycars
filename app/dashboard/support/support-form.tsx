"use client";

import { useState, useTransition } from "react";
import { sendSupportRequestAction } from "./actions";

/**
 * The seller's help form. Name arrives prefilled from the profile and
 * stays editable; the email is shown read-only because the action takes
 * it from auth server-side — what you see is exactly where the reply
 * lands, and no typing can redirect it.
 */
export function SellerSupportForm({
  defaultName,
  email,
}: {
  defaultName: string;
  email: string;
}) {
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
          {`A real person will reply by email to ${email}, usually same day.`}
        </p>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await sendSupportRequestAction({
        name: String(fd.get("name") ?? ""),
        subject: String(fd.get("subject") ?? ""),
        body: String(fd.get("body") ?? ""),
      });
      if (!res.ok) {
        setError(res.error ?? "Something went wrong — please try again.");
        return;
      }
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
            defaultValue={defaultName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Email <span className="font-normal text-slate-400">(where we reply)</span>
          </span>
          <input
            value={email}
            readOnly
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
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
          rows={5}
          maxLength={4000}
          placeholder="The more detail the better — which listing, which page, what you expected…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
        />
      </label>

      <button
        disabled={pending}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send it"}
      </button>
    </form>
  );
}
