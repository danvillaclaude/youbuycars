import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { PageHeader } from "../page-header";

export const metadata: Metadata = {
  title: "Terms & Conditions · YouBuyCars",
};

/** Ported VERBATIM from the original landing site (August 2026) — see the
 *  note atop privacy/page.tsx; the same registration caution applies. */
export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="Terms & Conditions" />
      <p className="text-xs text-slate-400">Last updated: August 2026</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          These Terms &amp; Conditions govern your communications with
          YouBuyCars (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;), including text messages you exchange with us.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          SMS messaging program
        </h2>
        <p>
          By providing your mobile number and agreeing to be contacted, you
          consent to receive text messages from us related to your inquiries,
          vehicles of interest, appointments, follow-ups, and — if you ask us
          to help arrange it — financing, including questions about your
          situation and any documents a lender needs.
        </p>
        <p>
          Agreeing to texts is optional and is never a condition of buying a
          vehicle or of applying for financing. You can decline and still
          work with us by phone or in person.
        </p>
        <p>
          Texts about financing are part of a conversation, not an offer. We
          don&apos;t quote payments, rates, or approvals by text — only a
          lender decides those, and we&apos;ll go through the actual numbers
          with you directly.
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Message frequency varies based on our conversation with you.</li>
          <li>Message and data rates may apply.</li>
          <li>
            Reply STOP at any time to unsubscribe. Reply HELP for help, or
            contact us at the email below.
          </li>
          <li>Carriers are not liable for delayed or undelivered messages.</li>
        </ul>

        <h2 className="text-lg font-bold text-slate-900">
          Consent &amp; opt-out
        </h2>
        <p>
          Consent to receive text messages is not a condition of any
          purchase. You may opt out at any time by replying STOP; you will
          receive a confirmation and no further messages unless you opt back
          in by replying START.
        </p>

        <h2 className="text-lg font-bold text-slate-900">Use of service</h2>
        <p>
          Our communications are provided to help you learn about vehicles
          and schedule visits. Information shared in text conversations (such
          as availability) is subject to change and is not a binding offer.
          Pricing, financing, and final terms are confirmed in person.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          No warranty; limitation of liability
        </h2>
        <p>
          Our messaging service is provided &ldquo;as is.&rdquo; To the
          extent permitted by law, we are not liable for any damages arising
          from your use of, or inability to use, our messaging
          communications.
        </p>

        <h2 className="text-lg font-bold text-slate-900">Contact us</h2>
        <p>Questions about these Terms? Contact us at {SITE.email}.</p>
      </div>
    </main>
  );
}
