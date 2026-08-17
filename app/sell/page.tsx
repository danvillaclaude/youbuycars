import type { Metadata } from "next";
import Link from "next/link";
import { TIER_CAPS } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Sell your car · YouBuyCars",
  description:
    "List your vehicle on YouBuyCars for free — one active listing, reviewed before it goes live.",
};

export default function SellPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Sell your car on YouBuyCars</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Free to list. You post the car, we review it, and it goes live to
        buyers across Metro Detroit — no strangers with lowball texts, no
        listing fees.
      </p>

      <ol className="mt-8 space-y-5 text-sm leading-relaxed text-slate-600">
        <li>
          <strong className="text-slate-900">1. Create your account.</strong>{" "}
          Just a name, email and password. A real person approves every new
          seller — usually same day.
        </li>
        <li>
          <strong className="text-slate-900">2. Post the car.</strong> Year,
          make, model, miles, price, photos. VIN is optional — listings with
          one build more trust.
        </li>
        <li>
          <strong className="text-slate-900">3. We review it.</strong> A real
          person checks every listing before it goes live, so the board stays
          clean and buyers trust what they see. Usually same day.
        </li>
        <li>
          <strong className="text-slate-900">4. Buyers reach out.</strong>{" "}
          Interested buyers contact us, and we connect them with your car.
          Mark it sold whenever it sells — the listing stays up as sold, which
          helps the next one.
        </li>
      </ol>

      {/* The tier ladder — the owner's pricing, 12 Aug 2026. */}
      <h2 className="mt-12 text-xl font-bold">Plans</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="text-sm font-semibold text-slate-500">Free</div>
          <div className="mt-1 text-2xl font-bold">$0</div>
          <p className="mt-2 text-sm text-slate-600">
            {/* Singular on purpose — the cap is {TIER_CAPS.free}, and
                "up to 1 listings" would read like a bug. */}
            One active listing. Perfect for selling your own car.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-blue-600 p-5">
          <div className="text-sm font-semibold text-blue-600">Pro</div>
          <div className="mt-1 text-2xl font-bold">
            $100<span className="text-sm font-normal text-slate-400">/mo</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Up to {TIER_CAPS.pro} active listings, plus your own public
            dealer page with logo and inventory.
          </p>
          <p className="mt-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700">
            Included free with the{" "}
            <a
              href="https://isellcars.ai"
              className="underline"
              target="_blank"
              rel="noreferrer"
            >
              iSellCars.ai CRM
            </a>
            .
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="text-sm font-semibold text-slate-500">Ultimate</div>
          <div className="mt-1 text-2xl font-bold">
            $500<span className="text-sm font-normal text-slate-400">/mo</span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Up to {TIER_CAPS.ultimate} active listings — full-lot scale, with
            the dealer page included.
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        To upgrade to Pro or Ultimate, contact us at the email on the{" "}
        <Link href="/contact" className="underline">
          Contact page
        </Link>{" "}
        — online checkout is coming.
      </p>

      <div className="mt-10 flex gap-3">
        <Link
          href="/signup"
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create your free account
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          I already have one
        </Link>
      </div>
    </main>
  );
}
