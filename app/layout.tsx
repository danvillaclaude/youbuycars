import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { SITE } from "@/lib/site";
import { SiteHeader } from "./site-header";
import { BackToTop } from "./back-to-top";
import "./globals.css";

// The teardown's face is Graphik — commercial. Inter is its named free
// lookalike (tall x-height, confident at display sizes); self-hosted at
// build by next/font, so no runtime font request ever leaves the page.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  // The keyword layer (his ask, 16 Aug 2026): the industry's search
  // terms, stated honestly — used cars for sale, the metro, the body
  // styles, buy AND sell. Inner pages override with their own titles.
  title: "Used Cars for Sale in Metro Detroit | YouBuyCars",
  description:
    "Buy and sell used cars in Metro Detroit, Michigan — SUVs, trucks and sedans from local dealers and sellers. Reviewed listings, payment estimates, price drops, and sellers you contact directly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-dvh bg-white text-slate-900`}>
        <SiteHeader />
        {/* The sub-nav row (his spec, copying CarGurus): hyperlink words
            under the floating header, at the top of the page — it
            scrolls AWAY with the page, deliberately not sticky. */}
        <nav className="border-b border-slate-100 bg-white px-4 sm:px-6">
          <div className="mx-auto flex h-11 max-w-5xl items-center gap-7 text-sm font-semibold text-slate-800">
            <Link href="/cars">Shop</Link>
            <Link href="/sell">Sell</Link>
            <Link href="/compare">Compare</Link>
            <Link href="/ask" className="text-blue-600">
              ✦ Ask AI
            </Link>
          </div>
        </nav>
        {children}
        <BackToTop />
        {/* The teardown's footer: dark, full-bleed, accordion groups that
            start COLLAPSED even on desktop (their pattern, copied as a
            choice — nothing pre-expanded, nothing shouting). Every link
            the old footer carried survives inside a group. */}
        <footer className="bg-slate-900 px-6 py-10 text-sm text-slate-300">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <span className="text-lg font-bold text-white">
                You<span className="text-blue-500">Buy</span>Cars
              </span>
              {/* No number here — the platform line lives on /contact
                  alone; the marketplace's job is seller contact. */}
              <Link
                href="/contact"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Contact us
              </Link>
            </div>

            <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Shop",
                  links: [
                    { href: "/cars", label: "Browse cars" },
                    { href: "/cars?max_price=15000", label: "Under $15k" },
                    { href: "/compare", label: "Compare cars" },
                  ],
                },
                {
                  title: "Sell",
                  links: [
                    { href: "/sell", label: "Sell your car" },
                    { href: "/dealers", label: "For dealers" },
                    { href: "/login", label: "Seller sign in" },
                  ],
                },
                {
                  title: "Company",
                  links: [
                    { href: "/about", label: "About" },
                    { href: "/contact", label: "Contact" },
                  ],
                },
                {
                  title: "Legal & texting",
                  links: [
                    { href: "/sms-consent", label: "How texting consent works" },
                    { href: "/privacy", label: "Privacy Policy" },
                    { href: "/terms", label: "Terms & Conditions" },
                  ],
                },
              ].map((group) => (
                <details key={group.title} className="border-b border-slate-800 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white [&::-webkit-details-marker]:hidden">
                    {group.title} <span className="text-slate-600">▾</span>
                  </summary>
                  <nav className="mt-2 grid gap-1.5 pb-1">
                    {group.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="text-slate-400 hover:text-white"
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>
                </details>
              ))}
            </div>

            <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
              <span>
                © {new Date().getFullYear()} {SITE.name} · {SITE.area}
              </span>
              {/* The crawler's front door (his ask): one hop from every
                  page to every page. */}
              <Link href="/site-map" className="hover:text-white">
                Site index
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
