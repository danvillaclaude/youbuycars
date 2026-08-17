import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { SITE } from "@/lib/site";
import { SiteHeader } from "./site-header";
import "./globals.css";

// The teardown's face is Graphik — commercial. Inter is its named free
// lookalike (tall x-height, confident at display sizes); self-hosted at
// build by next/font, so no runtime font request ever leaves the page.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.domain),
  title: "YouBuyCars — Find your next car, the easy way",
  description:
    "Tell us what you're looking for and we'll text you real options — no pushy calls, no sitting at a dealership all day. Serving Metro Detroit, Michigan.",
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
        {children}
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
          <nav className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/cars" className="hover:text-slate-800">
              Browse cars
            </Link>
            <Link href="/sell" className="hover:text-slate-800">
              Sell your car
            </Link>
            <Link href="/about" className="hover:text-slate-800">
              About
            </Link>
            <Link href="/contact" className="hover:text-slate-800">
              Contact
            </Link>
            <Link href="/sms-consent" className="hover:text-slate-800">
              How texting consent works
            </Link>
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-800">
              Terms &amp; Conditions
            </Link>
          </nav>
          <p>
            © {new Date().getFullYear()} {SITE.name} · {SITE.area}
          </p>
        </footer>
      </body>
    </html>
  );
}
