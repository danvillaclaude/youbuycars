import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavedCount } from "./save-heart";
import { MenuDrawer } from "./menu-drawer";

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The storefront's masthead — FLOATING now (his ask, from CarGurus'
 * mobile header: "a floating nav header with a hamburger menu, likes
 * and login buttons. I really want that"): sticky at every width.
 * Mobile is icons only — heart, person, hamburger — with every text
 * destination living in the drawer; desktop keeps the text links
 * beside the same icons. Server-rendered: it knows whether you're
 * signed in, and whether you're the admin.
 */
export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = Boolean((data as { is_admin: boolean } | null)?.is_admin);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4 sm:gap-5 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold text-slate-900">
          You<span className="text-blue-600">Buy</span>Cars
        </Link>

        <nav className="hidden flex-1 items-center gap-4 whitespace-nowrap text-sm font-medium text-slate-600 sm:flex">
          <Link href="/cars" className="hover:text-slate-900">
            Browse cars
          </Link>
          <Link href="/sell" className="hover:text-slate-900">
            Sell your car
          </Link>
          <Link href="/compare" className="hover:text-slate-900">
            Compare
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-slate-900">
              Approvals
            </Link>
          )}
        </nav>
        <span className="flex-1 sm:hidden" />

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {/* Likes — the saved-cars shortlist, count live. */}
          <Link
            href="/saved"
            aria-label="Saved cars"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-50"
          >
            <SavedCount />
          </Link>
          {/* Login — or the dashboard once you're in. */}
          <Link
            href={user ? "/dashboard" : "/login"}
            aria-label={user ? "My listings" : "Sign in"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-50"
          >
            <PersonIcon />
          </Link>
          <MenuDrawer signedIn={Boolean(user)} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
