import type { Metadata } from "next";
import Link from "next/link";
import { SITE, VERBAL_CONSENT_SCRIPT } from "@/lib/site";
import { PageHeader } from "../page-header";

export const metadata: Metadata = {
  title: "How we collect texting consent · YouBuyCars",
  description:
    "Every way a person can agree to receive text messages from YouBuyCars, including the exact script and record we keep for in-person consent.",
};

/**
 * THE PROOF PAGE. This URL exists because carrier reviewers must be able
 * to verify every opt-in path a campaign registers — including the one
 * that happens face to face, where there is no form for them to look at
 * (A2P error 30909). It documents the exact script, the record kept, and
 * the enforcement, and the campaign registration points here by name.
 */
export default function SmsConsentPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="How we collect texting consent" />

      <p className="text-sm leading-relaxed text-slate-600">
        YouBuyCars only texts people who chose to hear from us. There are
        exactly three ways that choice can happen, and every one of them is
        recorded before the first message is sent. This page documents each
        path in full — including the in-person one — so anyone, including
        mobile carriers reviewing our messaging program, can verify how
        consent is obtained.
      </p>

      <h2 className="mt-10 text-lg font-bold">1. The website form</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Our <Link href="/" className="text-blue-600 underline">home page</Link>{" "}
        has an inquiry form with an SMS consent checkbox. The box is{" "}
        <strong>unchecked by default</strong>, is <strong>never required</strong>{" "}
        — the form submits fine without it, and an unticked box means no
        texts, period — and sits directly beside the full disclosure:
        what messages are about, that consent is not a condition of purchase,
        that message and data rates may apply, that frequency varies, and
        that STOP opts out. We store the checkbox state, the consent language
        shown, and the timestamp with the inquiry.
      </p>

      <h2 className="mt-8 text-lg font-bold">2. Texting us first</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Anyone can text START — or any message — to {SITE.phoneDisplay}. A
        person who starts a conversation is consenting to receive our replies
        about it. The number and the disclosure are published on the{" "}
        <Link href="/" className="text-blue-600 underline">home page</Link>.
        Replying STOP at any time ends the conversation immediately and is
        honored automatically — no human in the loop, no exceptions.
      </p>

      <h2 className="mt-8 text-lg font-bold">3. In person or on a call</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Car sales happens face to face. When a customer at the dealership or
        on the phone wants updates by text, the salesperson asks for consent
        using this script, word for word:
      </p>
      <blockquote className="mt-4 rounded-xl border-l-4 border-blue-600 bg-slate-50 p-5 text-sm italic leading-relaxed text-slate-700">
        &ldquo;{VERBAL_CONSENT_SCRIPT}&rdquo;
      </blockquote>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        Only if the customer says yes does the salesperson record the consent
        in our customer system, and the record carries:
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-600">
        <li>the customer&apos;s name and mobile number,</li>
        <li>the date and time consent was given,</li>
        <li>
          the method — <em>verbal, in person</em> or <em>verbal, on a call</em>,
        </li>
        <li>the name of the salesperson who took it, attached permanently.</li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-slate-600">
        This isn&apos;t a policy that relies on memory —{" "}
        <strong>it&apos;s enforced by software</strong>. Our messaging system
        refuses to send a text to any number that has no consent record, no
        matter who is typing, and a STOP reply from any customer blocks all
        further messages instantly and permanently until they opt back in
        with START.
      </p>

      <h2 className="mt-8 text-lg font-bold">What every path has in common</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-sm text-slate-600">
        <li>Consent is never a condition of buying a vehicle.</li>
        <li>Message frequency varies; message and data rates may apply.</li>
        <li>Reply STOP at any time to opt out, HELP for help.</li>
        <li>
          Mobile numbers and SMS consent are never sold, rented, or shared
          with third parties or affiliates for marketing —{" "}
          <Link href="/privacy" className="text-blue-600 underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/terms" className="text-blue-600 underline">
            Terms &amp; Conditions
          </Link>
          .
        </li>
      </ul>

      <p className="mt-8 text-xs text-slate-400">
        Questions about this program? Contact {SITE.email}.
      </p>
    </main>
  );
}
