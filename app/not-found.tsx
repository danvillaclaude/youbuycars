import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found · YouBuyCars",
  robots: { index: false },
};

/**
 * The branded 404 (23 Aug 2026 overnight pass). There was none — a
 * mistyped URL, a removed listing or a stale link landed on Next's bare
 * default page with no header, no footer and no way back. Listings
 * themselves never 404 (sold cars render SOLD on their permanent slug),
 * so this is for everything else; the one door that matters is Browse.
 */
export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
        404
      </p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">
        We couldn&apos;t find that page
      </h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">
        The link may be out of date, or the page moved. The cars are still
        here.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/cars"
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Browse cars
        </Link>
        <Link
          href="/"
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
