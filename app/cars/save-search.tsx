"use client";

import { useState, useTransition } from "react";
import type { SearchFilters } from "@/lib/listings";
import { saveSearchAction } from "./actions";

/**
 * The "Save search" control from the teardown's results page, wired to
 * something real: an email field appears, one submit, and the daily
 * alert letter takes it from there. No account, no password — the
 * unsubscribe link in every letter is the whole management story.
 */
export function SaveSearch({
  filters,
  label,
}: {
  filters: SearchFilters;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return (
      <span className="text-xs font-semibold text-green-700">
        ✓ Watching {label} — new matches land in your inbox.
      </span>
    );
  }

  if (!open) {
    return (
      /* Their weight: Save search is a REAL button, heart and all —
         it's the retention engine, it doesn't whisper. */
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
      >
        ♡ Save search
      </button>
    );
  }

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          setNote(null);
          const res = await saveSearchAction(filters, email);
          if (res.ok) setDone(true);
          else setNote(res.error ?? "Couldn't save that.");
        });
      }}
    >
      <input
        type="email"
        name="email"
        aria-label="Your email address"
        autoComplete="email"
        inputMode="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-48 rounded-full border border-slate-300 px-3.5 py-1.5 text-xs"
      />
      <button
        disabled={pending}
        className="rounded-full bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Email me new matches"}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-xs text-slate-400 hover:text-slate-600"
      >
        Cancel
      </button>
      {note && <span role="alert" className="text-xs text-red-600">{note}</span>}
      <span className="w-full text-[11px] text-slate-500">
        A daily email when new cars match — every letter has an
        unsubscribe link. Nothing else, ever.
      </span>
    </form>
  );
}
