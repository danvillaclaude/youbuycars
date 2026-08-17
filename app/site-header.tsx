import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/site";

/**
 * The storefront's masthead, on every page. Server-rendered: it knows
 * whether you're signed in, and whether you're the admin (the Approvals
 * link is the owner's alone).
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
    <header className="border-b border-slate-200 bg-white">
      {/* One row at EVERY width (his report: the phone header wrapped
          into a two-line mess). Mobile gets short labels; Sign in lives
          in the footer below sm — the row must never wrap. */}
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-5 sm:px-6">
        <Link href="/" className="shrink-0 text-lg font-bold text-slate-900">
          You<span className="text-blue-600">Buy</span>Cars
        </Link>
        <nav className="flex flex-1 items-center gap-3 whitespace-nowrap text-sm font-medium text-slate-600 sm:gap-4">
          <Link href="/cars" className="hover:text-slate-900">
            <span className="sm:hidden">Browse</span>
            <span className="hidden sm:inline">Browse cars</span>
          </Link>
          <Link href="/sell" className="hover:text-slate-900">
            <span className="sm:hidden">Sell</span>
            <span className="hidden sm:inline">Sell your car</span>
          </Link>
          <Link href="/compare" className="hidden hover:text-slate-900 sm:block">
            Compare
          </Link>
          <span className="flex-1" />
          {isAdmin && (
            <Link href="/admin" className="hidden hover:text-slate-900 sm:block">
              Approvals
            </Link>
          )}
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700"
            >
              <span className="sm:hidden">Listings</span>
              <span className="hidden sm:inline">My listings</span>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden hover:text-slate-900 sm:block">
                Sign in
              </Link>
              {/* Concept A's masthead CTA — the storefront's whole pitch
                  in one button, the same line every page already texts. */}
              <a
                href={`sms:${SITE.phoneE164}`}
                className="rounded-full bg-blue-600 px-4 py-1.5 text-white hover:bg-blue-700"
              >
                Text us
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
