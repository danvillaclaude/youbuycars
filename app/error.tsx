"use client";

import Link from "next/link";

/**
 * The root error boundary (23 Aug 2026 overnight pass). Without one a
 * thrown render error blanked the page. This keeps the chrome (it renders
 * inside the layout), says plainly that something broke on our side, and
 * offers the two honest exits: try the same page again, or go browse.
 */
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-3xl font-bold text-slate-900">
        Something went wrong on our side
      </h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">
        The page hit an error while loading. Trying again usually fixes it.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Try again
        </button>
        <Link
          href="/cars"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Browse cars
        </Link>
      </div>
    </main>
  );
}
