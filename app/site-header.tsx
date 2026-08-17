import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SavedCount } from "./save-heart";
import { MenuDrawer } from "./menu-drawer";
import { HeaderNav } from "./header-nav";

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.5-3 4-4.5 7-4.5s5.5 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The storefront's masthead — his exact spec, refined twice the same
 * evening: "a floating nav header with a hamburger menu, likes and
 * login buttons... the youbuycars logo in the center and the hamburger
 * menu button on the left. basically a copycat of cargurus floating
 * header nav." So it is on MOBILE: sticky, hamburger left, logo
 * absolutely centered, heart + person right; the drawer IS the nav.
 *
 * DESKTOP (lg+) grew up in the 17 Aug pass — his report: "It looks too
 * narrow and the hamburger menu shouldn't be there. The header looks
 * too small as well." CarGurus only hamburgers on mobile, so at lg+ the
 * header goes taller, the wordmark sits left at display size, the five
 * nav links move inline (header-nav.tsx), and the hamburger is gone.
 * Server-rendered: it knows whether you're signed in, and whether
 * you're the admin.
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
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-[68px]">
        {/* Left: hamburger on mobile; wordmark + links on desktop. */}
        <div className="flex items-center gap-8 lg:self-stretch">
          <div className="lg:hidden">
            <MenuDrawer signedIn={Boolean(user)} isAdmin={isAdmin} />
          </div>

          {/* The wordmark: absolutely centered on mobile so the sides
              can't push it around; seated left at display size on lg+. */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-900 lg:static lg:transform-none lg:text-2xl"
          >
            You<span className="text-blue-600">Buy</span>Cars
          </Link>

          <HeaderNav />
        </div>

        {/* Right: likes and login. */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/saved"
            aria-label="Saved cars"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-50"
          >
            <SavedCount />
          </Link>
          <Link
            href={user ? "/dashboard" : "/login"}
            aria-label={user ? "My listings" : "Sign in"}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-50"
          >
            <PersonIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
