import Link from "next/link";
import { SITE } from "@/lib/site";

/**
 * One breadcrumb trail, two readers (23 Aug 2026 SEO plan): the visible
 * row a person follows back up, and the BreadcrumbList JSON-LD a crawler
 * reads — rendered from the SAME array, so they can never disagree. The
 * last item is the current page and is not a link.
 */
export function Breadcrumbs({
  items,
  className = "",
}: {
  items: { name: string; href?: string }[];
  className?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.href ? { item: `${SITE.domain}${it.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-500">
        {items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${it.name}-${i}`} className="flex items-center gap-x-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-slate-300">
                  ›
                </span>
              )}
              {last || !it.href ? (
                <span aria-current={last ? "page" : undefined} className="text-slate-700">
                  {it.name}
                </span>
              ) : (
                <Link href={it.href} className="hover:text-slate-700 hover:underline">
                  {it.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
