import type { Metadata } from "next";
import Link from "next/link";
import { fetchPublishedPosts } from "@/lib/research-posts";

// Posts publish from the owner's CRM desk with no deploy; this page
// re-reads on this cadence, so "approve" means live within minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research & Guides — Used Car Buying in Michigan | YouBuyCars",
  description:
    "Honest guides to buying and selling used cars in Metro Detroit — financing explained, the test-drive checklist, trade-in math, and how the paperwork works in Michigan.",
};

/**
 * The research archive's hub (his ask: "I love that cargurus offers
 * research archive") — their Reviews-hub shape: a single-column stack
 * of article cards, title + dek + read time, plus doors to the tools
 * the archive keeps referring to.
 */
export default async function ResearchPage() {
  // Every guide is a research_posts row since migration 0022 moved the
  // original five out of code; newest-first, and the five carry their
  // real Aug 2026 dates so they anchor the list in their original order.
  const entries = await fetchPublishedPosts();
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-bold">Research &amp; guides</h1>
      <p className="mt-1 text-sm text-slate-500">
        Straight answers for buying and selling in Metro Detroit — no
        jargon, no sales pitch.
      </p>

      <div className="mt-8 space-y-4">
        {entries.map((a) => (
          <Link
            key={a.slug}
            href={`/research/${a.slug}`}
            className="block rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300"
          >
            <h2 className="text-lg font-bold text-slate-900">{a.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{a.dek}</p>
            <p className="mt-2 text-xs font-semibold text-blue-600">
              {a.minutes} min read →
            </p>
          </Link>
        ))}
      </div>

      {/* The tools the guides keep pointing at. */}
      <div className="mt-10 rounded-2xl bg-slate-50 p-6">
        <h2 className="text-sm font-bold text-slate-900">The tools</h2>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
          <Link href="/cars" className="font-semibold text-blue-600 hover:underline">
            Browse the board →
          </Link>
          <Link href="/compare" className="font-semibold text-blue-600 hover:underline">
            Compare two cars →
          </Link>
          <Link href="/sell" className="font-semibold text-blue-600 hover:underline">
            List your car free →
          </Link>
        </div>
      </div>
    </main>
  );
}
