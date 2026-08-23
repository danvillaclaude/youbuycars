"use client";

import { useRef, useState } from "react";
import {
  CREDIT_BANDS,
  DEFAULT_ESTIMATE,
  monthlyPayment,
  TERM_OPTIONS,
} from "@/lib/payments";
import { track } from "@/app/track-client";

/**
 * The finance calculator (Phase 2, the owner's spec from the mockup round:
 * down-payment slider, term, and a "how's your credit?" picker that moves
 * the assumed APR band). Lives on every listing page.
 *
 * Compliance posture, deliberate and visible: every word around the number
 * says ESTIMATE — never an offer, a quote, or an approval — and the only
 * call to action is a text to the seller. The math is real amortization
 * from lib/payments.ts, the same module the cards' est./mo uses.
 */
export function PaymentCalculator({
  price,
  smsHref,
  ctaLabel = "💬 Text the seller about financing",
  listingId,
}: {
  price: number;
  /** Where the CTA lands: the seller's contact box, or on-site chat. */
  smsHref: string;
  /** Worded for the path — Text for seller-direct, Message for chat. */
  ctaLabel?: string;
  /** For analytics (0007): one calc_run per session's first touch. */
  listingId?: string;
}) {
  const [down, setDown] = useState(Math.min(DEFAULT_ESTIMATE.down, price));
  const [term, setTerm] = useState<number>(DEFAULT_ESTIMATE.termMonths);
  const [apr, setApr] = useState<number>(DEFAULT_ESTIMATE.apr);

  // First real interaction = one calc_run event, and only one — the
  // slider alone emits dozens of input events per drag.
  const ranRef = useRef(false);
  function touched() {
    if (ranRef.current || !listingId) return;
    ranRef.current = true;
    track(listingId, "calc_run");
  }

  const maxDown = Math.max(0, Math.min(Math.round(price * 0.5), 20000));
  const monthly = Math.round(monthlyPayment(Math.max(0, price - down), apr, term));

  const chip = (on: boolean) =>
    `rounded-full border px-2 py-1.5 text-xs font-semibold ${
      on
        ? "border-blue-600 bg-blue-50 text-blue-700"
        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
    }`;

  return (
    <section id="calculator" className="mt-10 max-w-md scroll-mt-28 lg:scroll-mt-32 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">
        Estimate your payment
      </h2>
      <div aria-live="polite" className="mt-2 text-4xl font-extrabold tracking-tight text-green-700 tabular-nums">
        ${monthly.toLocaleString("en-US")}
        <span className="text-base font-semibold text-slate-400">/mo</span>
      </div>

      <label htmlFor="calc-down" className="mt-5 block text-xs font-semibold text-slate-700">
        Down payment —{" "}
        <span className="tabular-nums">${down.toLocaleString("en-US")}</span>
      </label>
      <input
        id="calc-down"
        type="range"
        min={0}
        max={maxDown}
        step={250}
        value={down}
        onChange={(e) => {
          touched();
          setDown(Number(e.target.value));
        }}
        className="mt-1 w-full accent-blue-600"
      />
      <div className="flex justify-between text-[11px] text-slate-500 tabular-nums">
        <span>$0</span>
        <span>${maxDown.toLocaleString("en-US")}</span>
      </div>

      <div id="calc-term" className="mt-4 text-xs font-semibold text-slate-700">Term</div>
      <div role="group" aria-labelledby="calc-term" className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {TERM_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              touched();
              setTerm(n);
            }}
            aria-pressed={term === n}
            className={chip(term === n)}
          >
            {n} mo
          </button>
        ))}
      </div>

      <div id="calc-credit" className="mt-4 text-xs font-semibold text-slate-700">
        How&apos;s your credit?
      </div>
      <div role="group" aria-labelledby="calc-credit" className="mt-1 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {CREDIT_BANDS.map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={() => {
              touched();
              setApr(b.apr);
            }}
            aria-pressed={apr === b.apr}
            className={chip(apr === b.apr)}
          >
            {b.label}
          </button>
        ))}
      </div>

      <a
        href={smsHref}
        onClick={() => listingId && track(listingId, "text_tap")}
        className="mt-5 block rounded-full bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-blue-700"
      >
        {ctaLabel}
      </a>

      <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
        Estimate only — not an offer of credit, a quote, or an approval. Your
        rate and payment are set by a lender after an application. Taxes,
        title and fees not included. Assumed APR{" "}
        <span className="tabular-nums">{apr.toFixed(1)}%</span> based on the
        credit range you picked.
      </p>
    </section>
  );
}
