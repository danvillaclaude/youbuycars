"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./sub-nav";

/**
 * The desktop half of the nav (17 Aug 2026, his call: "the hamburger
 * menu shouldn't be there [on desktop]... lets go for a CarGurus look"):
 * the same five links the mobile sub-nav row carries, set inside the
 * header beside the wordmark, wearing the same you-are-here underline.
 * Hidden below lg, where the sub-nav row and the drawer take over.
 */
export function HeaderNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-6 text-[15px] font-semibold lg:flex lg:self-stretch">
      {NAV_LINKS.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center self-stretch border-b-2 ${
              active
                ? "border-blue-600 text-blue-600"
                : l.accent
                  ? "border-transparent text-blue-600 hover:text-blue-700"
                  : "border-transparent text-slate-800 hover:text-blue-600"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
