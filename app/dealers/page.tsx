import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { TIER_CAPS } from "@/lib/listings";
import { PromoSplit } from "@/app/promo-split";

export const metadata: Metadata = {
  title: "For dealers · YouBuyCars",
  description:
    "Put your inventory in front of Metro Detroit buyers — a free dealer page, listings that feed your CRM, and the iSellCars.ai texting CRM with the Pro listing plan included.",
};

/**
 * The dealer-acquisition page (dossier round 2) — the teardown's B2B
 * Template B: eyebrow → big bold H1 → one-line subhead → single CTA,
 * then a swappable proof body (stat cards + icon-benefit grid). Their
 * dealer site sells subscriptions; this one sells the other product:
 * dealers.cargurus.com is to CarGurus what this page is to iSellCars.ai.
 * Every number on it is a product fact, never a performance claim —
 * there are no invented stats to be caught by.
 */
export default function DealersPage() {
  return (
    <main>
      {/* Template B hero. */}
      <section className="bg-gradient-to-b from-blue-50 to-white px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          For dealers
        </p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          More buyers. Less busywork.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          A public storefront on YouBuyCars, buyers who text instead of
          phone-tag — and a CRM that answers them.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href="https://isellcars.ai"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            Get started with iSellCars.ai
          </a>
          <a
            href={`sms:${SITE.phoneE164}`}
            className="rounded-full border border-slate-300 px-7 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Text us · {SITE.phoneDisplay}
          </a>
        </div>
      </section>

      {/* Proof stats — product facts in big numerals, the PriceVantage
          pattern. Facts, not performance claims. */}
      <section className="bg-slate-50 px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              stat: "$0",
              title: "to put a car on the board",
              body: "A free account lists your first car, reviewed and live — see how the board works before spending a dollar.",
            },
            {
              stat: "1 min",
              title: "from inquiry to your CRM",
              body: "Buyer inquiries and on-site chats land in your iSellCars.ai CRM as real leads within the minute, opt-in status recorded.",
            },
            {
              stat: "$100/mo",
              title: "listing plan — included free",
              body: `Every iSellCars.ai dealership gets the Pro plan (${TIER_CAPS.pro} listings + your dealer page) at no charge.`,
            },
          ].map((c) => (
            <div key={c.stat} className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="text-4xl font-extrabold tracking-tight text-blue-600 tabular-nums">
                {c.stat}
              </div>
              <div className="mt-1 text-sm font-bold text-slate-900">{c.title}</div>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* "Why dealers love it" — the 3-column line-icon grid. */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <h2 className="text-center text-2xl font-bold">
          What your storefront comes with
        </h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          {[
            {
              icon: "🏪",
              title: "A dealer page that's yours",
              body: "Logo, city, about, live inventory, verified customer reviews — at youbuycars.com/sellers/your-name, permanent link.",
            },
            {
              icon: "💬",
              title: "Buyers who actually reach you",
              body: "Text buttons, an inquiry form on your page, on-site chat with no phone needed, and saved-search letters that mail your new cars to watching buyers the day they go live.",
            },
            {
              icon: "🤖",
              title: "A CRM that texts back",
              body: "iSellCars.ai answers leads by text under your reps' names, books appointments, and never says the things a compliance lawyer worries about.",
            },
          ].map((b) => (
            <div key={b.title} className="text-center">
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-3 font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The CRM pitch, in the shared promo module. */}
      <section className="bg-slate-50 px-6 py-14">
        <PromoSplit
          eyebrow="iSellCars.ai"
          headline="The lead texts you. The CRM texts back."
          sub="Every inquiry from your YouBuyCars page becomes a conversation in a text-first CRM built by a car salesperson — AI drafts under your name, a queue that tracks who's owed a reply, and a hot meter that never lies."
          ctaLabel="See iSellCars.ai"
          ctaHref="https://isellcars.ai"
        >
          {/* Product proof: a mini CRM thread. */}
          <div className="w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg shadow-blue-900/5">
            <p className="text-xs font-semibold text-slate-400">
              New lead · YouBuyCars
            </p>
            <div className="mt-2 max-w-[85%] rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-700">
              Is the 2018 Equinox still available? What would payments look
              like?
            </div>
            <div className="ml-auto mt-2 max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-xs text-white">
              It sure is! Payments depend on a few things — want me to send
              over the 2-minute credit app so we can get you real numbers?
            </div>
            <p className="mt-2 text-right text-[10px] font-semibold text-slate-400">
              ✓ drafted by the AI · sent by you
            </p>
          </div>
        </PromoSplit>
      </section>

      {/* Plans pointer — pricing lives with the seller page. */}
      <section className="px-6 py-12 text-center">
        <p className="text-sm text-slate-500">
          Just want more listings without the CRM?{" "}
          <Link href="/sell" className="font-semibold text-blue-600 underline">
            See the listing plans
          </Link>{" "}
          — Free, Pro ${"100"}/mo, Ultimate ${"500"}/mo.
        </p>
      </section>
    </main>
  );
}
