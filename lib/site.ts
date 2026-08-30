/**
 * The one place the business facts live. Every page reads these — the
 * compliance pages, the campaign registration and the footer must never
 * disagree about a phone number.
 */
export const SITE = {
  name: "YouBuyCars",
  domain: "https://youbuycars.com",
  phoneDisplay: "(313) 546-8313",
  phoneE164: "+13135468313",
  // hello@ is a Namecheap forwarder to the owner's Gmail (set up 30 Aug
  // 2026). Don't swap in a raw Gmail here — this address renders on the
  // compliance pages and in the Organization JSON-LD, where the brand's
  // own domain is what keeps the story consistent.
  email: "hello@youbuycars.com",
  area: "Metro Detroit, Michigan",
  /** Every server-rendered time is shown in the market's zone, not Vercel's UTC. */
  timeZone: "America/Detroit",
} as const;

/**
 * The exact words a salesperson uses for verbal/in-person consent.
 * Published on /sms-consent — the URL the A2P campaign points reviewers
 * at — and mirrored by the CRM's consent-recording flow. If this script
 * changes, the campaign registration's opt-in description changes with it.
 */
export const VERBAL_CONSENT_SCRIPT =
  "Is it okay if I text you at this number about your vehicle, " +
  "appointments, and follow-ups? Texting is optional — it's never a " +
  "condition of buying a car. Message and data rates may apply, message " +
  "frequency varies, and you can reply STOP at any time to stop, or HELP " +
  "for help.";
