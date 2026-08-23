"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The hamburger + slide-over drawer (his ask, from CarGurus' mobile
 * header). Holds the whole map — the mobile header shows only icons,
 * so every text destination lives here. Closes on navigation, Escape,
 * and the overlay; 200ms slide, the drawer's one motion.
 */
export function MenuDrawer({
  signedIn,
  isAdmin,
}: {
  signedIn: boolean;
  isAdmin: boolean;
}) {
  /*
   * Close-on-navigation DERIVED, not effected: the drawer stores the
   * pathname it was opened at, and "open" is simply "still there". A
   * route change flips it closed with no setState-in-effect.
   */
  const pathname = usePathname();
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const open = openedAt === pathname;
  const setOpen = (v: boolean) => setOpenedAt(v ? pathname : null);

  /*
   * A dialog the keyboard can use (23 Aug 2026 audit): the panel is
   * portaled to the END of body, so before this, Tab from the hamburger
   * walked the whole page under the overlay before reaching a single
   * menu link. Focus moves into the panel on open, Tab wraps inside it,
   * and closing hands focus back to the button that opened it. Nothing
   * visible changes.
   */
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenedAt(null);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (!panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      trigger?.focus();
    };
  }, [open]);

  const groups: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: "Shop",
      links: [
        { href: "/cars", label: "Browse cars" },
        { href: "/cars?body=SUV", label: "SUVs" },
        { href: "/cars?body=Truck", label: "Trucks" },
        { href: "/cars?max_price=15000", label: "Under $15k" },
        { href: "/compare", label: "Compare cars" },
        { href: "/saved", label: "Saved cars" },
        { href: "/ask", label: "✦ Ask AI (coming soon)" },
      ],
    },
    {
      title: "Sell",
      links: [
        { href: "/sell", label: "Sell your car" },
        { href: "/dealers", label: "For dealers" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/research", label: "Research & guides" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/sms-consent", label: "How texting consent works" },
      ],
    },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] text-slate-700"
      >
        <span className="h-0.5 w-5 rounded bg-current" />
        <span className="h-0.5 w-5 rounded bg-current" />
        <span className="h-0.5 w-5 rounded bg-current" />
      </button>

      {/* PORTALED to <body> (his report: "the hamburger button isn't
          working"): the sticky header's backdrop-blur makes the header
          the containing block for fixed descendants, so a drawer
          rendered inside it was clipped into the 56px bar. From the
          body, fixed means the viewport again. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[70]">
          {/* Click-to-close only; the ✕ inside is the one "Close menu"
              a screen reader hears. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="overlay-in absolute inset-0 bg-slate-900/40"
          />
          {/* From the LEFT (his call) — the drawer opens from the side
              its button lives on, and SLIDES in (his refinement: it
              popped; premium slides). */}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="drawer-in absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-2xl outline-none"
          >
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">
                You<span className="text-blue-600">Buy</span>Cars
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {groups.map((g) => (
              <div key={g.title} className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  {g.title}
                </p>
                <nav className="mt-1.5 grid">
                  {g.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      /* Close on TAP, not on pathname change (his "not
                         intuitive" catch): query-string links like
                         /cars?body=SUV don't change the pathname, and
                         same-page links change nothing — the derived
                         close never fired and the drawer sat there
                         looking dead. The tap itself is the signal. */
                      onClick={() => setOpenedAt(null)}
                      aria-current={pathname === l.href ? "page" : undefined}
                      className={`rounded-lg px-2 py-2 text-sm font-medium ${
                        pathname === l.href
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </nav>
              </div>
            ))}

            <div className="mt-6 border-t border-slate-100 pt-4">
              {signedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-700"
                  >
                    My listings
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="mt-2 block rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Approvals
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="mt-2 block rounded-full border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
