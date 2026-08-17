/**
 * Payment estimates (Phase 2, 15 Aug 2026 — the owner's pick from the
 * mockups: sliders plus a credit picker). Pure math, shared by the cards'
 * "est./mo" line and the listing page's calculator so the two can never
 * disagree about what a car costs a month.
 *
 * Everything here is an ESTIMATE and the UI says so everywhere it appears:
 * not an offer of credit, not a quote, not an approval. Real amortization,
 * not the sales-floor shorthand — a wrong-by-forty-dollars teaser is the
 * kind of number that walks into a lender meeting and dies loudly.
 */

/** The assumption set behind every card's est./mo — stated in the fine
 *  print wherever a number from it appears. */
export const DEFAULT_ESTIMATE = {
  down: 2000,
  termMonths: 60,
  apr: 9.9,
} as const;

/** The calculator's credit picker. APR bands are deliberately broad,
 *  believable used-car numbers — the lender sets the real one. */
export const CREDIT_BANDS = [
  { label: "Excellent", apr: 6.9 },
  { label: "Good", apr: 9.9 },
  { label: "Fair", apr: 14.9 },
  { label: "Rebuilding", apr: 18.9 },
] as const;

export const TERM_OPTIONS = [36, 48, 60, 72] as const;

/** Standard amortized payment. Zero-rate degrades to straight division. */
export function monthlyPayment(
  principal: number,
  apr: number,
  months: number,
): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = apr / 100 / 12;
  if (r <= 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

/** The cards' number: default assumptions, rounded to the dollar. */
export function estimateMonthly(price: number): number {
  return Math.round(
    monthlyPayment(
      Math.max(0, price - DEFAULT_ESTIMATE.down),
      DEFAULT_ESTIMATE.apr,
      DEFAULT_ESTIMATE.termMonths,
    ),
  );
}

/**
 * The inverse: the highest PRICE whose default-assumption estimate fits
 * a monthly budget — the "$/mo" filter's whole engine. Same constants
 * as estimateMonthly, so filtering by $260/mo shows exactly the cars
 * whose cards SAY $260/mo or less; the two can never disagree.
 */
export function maxPriceForPayment(payment: number): number {
  if (payment <= 0) return 0;
  // The cards ROUND to the dollar, so "under $487/mo" must admit every
  // car whose card SAYS $487 — i.e. exact payment < payment + 0.5.
  const target = payment + 0.49;
  const r = DEFAULT_ESTIMATE.apr / 100 / 12;
  const n = DEFAULT_ESTIMATE.termMonths;
  const principal =
    r <= 0 ? target * n : (target * (1 - Math.pow(1 + r, -n))) / r;
  return Math.floor(principal) + DEFAULT_ESTIMATE.down;
}
