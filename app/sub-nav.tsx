"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/cars", label: "Shop" },
  { href: "/sell", label: "Sell" },
  { href: "/compare", label: "Compare" },
  { href: "/research", label: "Research" },
  { href: "/ask", label: "✦ Ask AI", accent: true },
];

/**
 * The hyperlink words under the header — now wearing the you-are-here
 * state (his ask: "it should show what i've clicked"): the current
 * section carries a blue underline bar and blue ink, tab-style. A
 * listing page lights Shop; a guide lights Research.
 */
export function SubNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-slate-100 bg-white px-4 sm:px-6">
      <div className="mx-auto flex h-11 max-w-5xl items-center justify-center gap-5 text-sm font-semibold sm:gap-7">
        {LINKS.map((l) => {
          const active =
            pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`flex h-full items-center border-b-2 ${
                active
                  ? "border-blue-600 text-blue-600"
                  : l.accent
                    ? "border-transparent text-blue-600"
                    : "border-transparent text-slate-800"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
