"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";

/**
 * The "Find us on YouBuyCars" kit (the dealer-page playbook): a copyable
 * snippet for the dealer's own website, and an email prefilled for
 * whoever runs it. The link is OFFERED, never a condition of any plan —
 * exchanged links are Google's definition of link spam, and the wording
 * here stays on the right side of that line.
 */
export function BadgeKit({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState<"badge" | "link" | null>(null);
  const pageUrl = `${SITE.domain}/sellers/${slug}`;
  const badgeSnippet = `<a href="${pageUrl}"><img src="${SITE.domain}/badge.svg" alt="Find ${name} on YouBuyCars" width="196" height="40" style="border:0"></a>`;
  const linkSnippet = `<a href="${pageUrl}">Find ${name} on YouBuyCars</a>`;

  const copy = (kind: "badge" | "link", text: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const mailto = `mailto:?subject=${encodeURIComponent("Add our YouBuyCars badge to the website")}&body=${encodeURIComponent(
    `Hi,\n\nCould you add this to our site (footer, About, or Inventory page — one spot is plenty)? It links to our page on YouBuyCars:\n\n${badgeSnippet}\n\nOr as a plain text link:\n\n${linkSnippet}\n\nThanks!`,
  )}`;

  const box =
    "mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-600";

  return (
    <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-base font-bold text-slate-900">
        Put your page on your website
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        A badge for your site that links to your YouBuyCars page — buyers
        find your inventory, and search engines learn the connection.
        Totally optional.
      </p>

      <div className="mt-4 flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badge.svg" alt="" width={196} height={40} />
        <a
          href={`/sellers/${slug}`}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          Your page →
        </a>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold text-slate-700">The badge</span>
        <textarea readOnly rows={2} value={badgeSnippet} className={box} onFocus={(e) => e.currentTarget.select()} />
      </label>
      <label className="mt-2 block">
        <span className="text-xs font-semibold text-slate-700">Or a plain link</span>
        <textarea readOnly rows={1} value={linkSnippet} className={box} onFocus={(e) => e.currentTarget.select()} />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => copy("badge", badgeSnippet)}
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          {copied === "badge" ? "Copied ✓" : "Copy the badge"}
        </button>
        <button
          type="button"
          onClick={() => copy("link", linkSnippet)}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          {copied === "link" ? "Copied ✓" : "Copy the link"}
        </button>
        <a
          href={mailto}
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Email this to my web person
        </a>
      </div>
    </section>
  );
}
