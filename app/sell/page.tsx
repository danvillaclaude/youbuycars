import type { Metadata } from "next";
import Link from "next/link";
import { TIER_CAPS } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Sell your car · YouBuyCars",
  description:
    "List your vehicle on YouBuyCars for free — one active listing, reviewed before it goes live.",
};

/**
 * Re-dressed (dossier round 2) to the teardown's Sell-My-Car entry
 * template: dark hero with a floating white card carrying the CTAs,
 * offer-chip product proof, then the numbered-circle list (the
 * insurance page's plainer pattern — right for explainer content) and
 * the plans ladder unchanged.
 */
export default function SellPage() {
  return (
    <main>
      {/* Dark hero + floating card — the template's signature. */}
      <section className="bg-slate-900 px-6 pb-24 pt-14 text-center">
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Sell your car without the circus.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-300">
          Free to list. A real person reviews it, it goes live to Metro
          Detroit buyers, and your phone number never sits on a classifieds
          board.
        </p>
      </section>

      <section className="px-6">
        <div className="mx-auto -mt-14 max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-900/10">
          <p className="text-sm font-semibold text-slate-900">
            Ready when you are — two ways in:
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/signup"
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
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
          <p className="mt-3 text-xs text-slate-500">
            A real person approves every new seller — usually same day.
          </p>
        </div>
      </section>

      {/* The numbered-circle list — the teardown's explainer pattern. */}
      <section className="mx-auto max-w-2xl px-6 py-14">
        <h2 className="text-xl font-bold">How selling works</h2>
        <ol className="mt-6 space-y-6">
          {[
            {
              title: "Create your account.",
              body: "Just a name, email and password. A real person approves every new seller — usually same day.",
            },
            {
              title: "Post the car.",
              body: "Year, make, model, miles, price, photos. The form walks you through it section by section, and VIN is optional — listings with one build more trust.",
            },
            {
              title: "We review it.",
              body: "A real person checks every listing before it goes live, so the board stays clean and buyers trust what they see. Usually same day.",
            },
            {
              title: "Buyers reach out.",
              body: "Interested buyers contact us, and we connect them with your car. Mark it sold whenever it sells — the listing stays up as sold, which helps the next one.",
            },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-slate-600">
                <strong className="text-slate-900">{step.title}</strong>{" "}
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* The tier ladder — the owner's pricing, 12 Aug 2026. */}
      <section className="bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold">Plans</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-500">Free</div>
              <div className="mt-1 text-2xl font-bold">$0</div>
              <p className="mt-2 text-sm text-slate-600">
                {/* Singular on purpose — the cap is {TIER_CAPS.free}, and
                    "up to 1 listings" would read like a bug. */}
                One active listing. Perfect for selling your own car.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-blue-600 bg-white p-5">
              <div className="text-sm font-semibold text-blue-600">Pro</div>
              <div className="mt-1 text-2xl font-bold">
                $100<span className="text-sm font-normal text-slate-500">/mo</span>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-sm font-semibold text-slate-500">Ultimate</div>
              <div className="mt-1 text-2xl font-bold">
                $500<span className="text-sm font-normal text-slate-500">/mo</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Up to {TIER_CAPS.ultimate} active listings — full-lot scale,
                with the dealer page included.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            To upgrade to Pro or Ultimate, contact us at the email on the{" "}
            <Link href="/contact" className="underline">
              Contact page
            </Link>{" "}
            — online checkout is coming. Selling cars for a living?{" "}
            <Link href="/dealers" className="text-blue-600 underline">
              See what dealers get →
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
