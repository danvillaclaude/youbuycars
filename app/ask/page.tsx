import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ask AI · YouBuyCars",
  description:
    "Describe the car you want in your own words — AI search is coming to YouBuyCars.",
};

/**
 * The Ask-AI door (his sub-nav ask names it "our future ask ai agent").
 * A teaser until the real surface is built — wearing a taste of the
 * AI-surface language the teardown prescribes (soft pastel wash,
 * minimal chrome, deliberately unlike the marketplace's tokens), so
 * the destination already feels like what it will become.
 */
export default function AskPage() {
  return (
    <main className="bg-gradient-to-br from-sky-50 via-white to-blue-50 px-6 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
        ✦ Coming soon
      </p>
      <h1 className="mx-auto mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        Ask for a car in your own words.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-slate-600">
        &ldquo;Something reliable under $15k for a first driver&rdquo; — and
        real cars from the board, not a form. That&apos;s what this page is
        becoming.
      </p>

      {/* The input, previewed — looks live, honestly disabled. */}
      <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-full border border-blue-200 bg-white p-2 pl-5 text-left shadow-lg shadow-blue-900/5">
        <span className="flex-1 text-sm text-slate-500">
          Describe the car you want…
        </span>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-500">
          Soon
        </span>
      </div>

      <div className="mt-10">
        <Link
          href="/cars"
          className="rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Browse the board for now
        </Link>
        <p className="mt-4 text-xs text-slate-500">
          Or save a search on the board and we&apos;ll email you when new
          matches arrive — that part works today.
        </p>
      </div>
    </main>
  );
}
