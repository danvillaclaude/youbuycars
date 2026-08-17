import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, type Listing } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Site index · YouBuyCars",
  description:
    "Every page on YouBuyCars — cars for sale, sellers, and how the site works.",
};

/**
 * The human-readable site index (his ask, 16 Aug 2026: "an index page
 * in the footer to help crawlers"). The XML sitemap (app/sitemap.ts)
 * tells crawlers what exists; THIS page links it all from one place a
 * crawler reaches in a single hop from any footer — flattening crawl
 * depth and giving every listing and seller page a permanent internal
 * link. Sold listings are deliberately here too: their URLs live
 * forever by design, and the authority they've earned should stay
 * reachable, not orphaned.
 */
export default async function SiteIndexPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select("*")
    .in("status", ["active", "sold"])
    .order("created_at", { ascending: false })
    .limit(500);
  const listings = (data ?? []) as Listing[];
  const active = listings.filter((l) => l.status === "active");
  const sold = listings.filter((l) => l.status === "sold");
  const makes = [...new Set(active.map((l) => l.make))].sort();
  const bodyStyles = [
    ...new Set(active.map((l) => l.body_style).filter(Boolean)),
  ].sort() as string[];

  const { data: sellerData } = await supabase
    .from("profiles")
    .select("display_name, public_slug")
    .not("public_slug", "is", null)
    .order("display_name");
  const sellers = (sellerData ?? []) as {
    display_name: string | null;
    public_slug: string;
  }[];

  const title = (l: Listing) =>
    `${l.year} ${l.make} ${l.model}${l.trim_level ? ` ${l.trim_level}` : ""}`;
  const h2 = "mt-10 text-lg font-bold text-slate-900";
  const list = "mt-3 grid gap-1.5 text-sm sm:grid-cols-2 lg:grid-cols-3";
  const link = "text-blue-700 hover:underline";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold">Site index</h1>
      <p className="mt-1 text-sm text-slate-500">
        Everything on YouBuyCars, one page.
      </p>

      <h2 className={h2}>Pages</h2>
      <nav className={list}>
        {[
          { href: "/", label: "Home" },
          { href: "/cars", label: "Cars for sale" },
          { href: "/compare", label: "Compare cars" },
          { href: "/research", label: "Research & guides" },
          { href: "/sell", label: "Sell your car" },
          { href: "/dealers", label: "For dealers" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
          { href: "/sms-consent", label: "How texting consent works" },
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms & Conditions" },
        ].map((p) => (
          <Link key={p.href} href={p.href} className={link}>
            {p.label}
          </Link>
        ))}
      </nav>

      {makes.length > 0 && (
        <>
          <h2 className={h2}>Browse by make</h2>
          <nav className={list}>
            {makes.map((m) => (
              <Link
                key={m}
                href={`/cars?make=${encodeURIComponent(m)}`}
                className={link}
              >
                {m} for sale
              </Link>
            ))}
          </nav>
        </>
      )}

      {bodyStyles.length > 0 && (
        <>
          <h2 className={h2}>Browse by style</h2>
          <nav className={list}>
            {bodyStyles.map((b) => (
              <Link
                key={b}
                href={`/cars?body=${encodeURIComponent(b)}`}
                className={link}
              >
                Used {b}s for sale
              </Link>
            ))}
          </nav>
        </>
      )}

      {active.length > 0 && (
        <>
          <h2 className={h2}>Cars for sale</h2>
          <nav className={list}>
            {active.map((l) => (
              <Link key={l.id} href={`/cars/${l.slug}`} className={link}>
                {title(l)} — {formatPrice(l.price)}
              </Link>
            ))}
          </nav>
        </>
      )}

      {sellers.length > 0 && (
        <>
          <h2 className={h2}>Sellers</h2>
          <nav className={list}>
            {sellers.map((s) => (
              <Link
                key={s.public_slug}
                href={`/sellers/${s.public_slug}`}
                className={link}
              >
                {s.display_name ?? "YouBuyCars seller"}
              </Link>
            ))}
          </nav>
        </>
      )}

      {sold.length > 0 && (
        <>
          <h2 className={h2}>Recently sold</h2>
          <p className="mt-1 text-xs text-slate-400">
            Sold cars keep their pages — prices and details stay visible for
            reference.
          </p>
          <nav className={list}>
            {sold.map((l) => (
              <Link key={l.id} href={`/cars/${l.slug}`} className={link}>
                {title(l)} <span className="text-slate-400">(sold)</span>
              </Link>
            ))}
          </nav>
        </>
      )}
    </main>
  );
}
