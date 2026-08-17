"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenedAt(null);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
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
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/sms-consent", label: "How texting consent works" },
      ],
    },
  ];

  return (
    <>
      <button
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

      {open && (
        <div className="fixed inset-0 z-[70]">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white p-5 shadow-2xl transition-transform duration-200">
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
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                  {g.title}
                </p>
                <nav className="mt-1.5 grid">
                  {g.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
        </div>
      )}
    </>
  );
}
