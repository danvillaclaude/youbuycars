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
  email: "isolduacar@gmail.com",
  area: "Metro Detroit, Michigan",
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
