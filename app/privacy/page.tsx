import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { PageHeader } from "../page-header";

export const metadata: Metadata = {
  title: "Privacy Policy · YouBuyCars",
};

/**
 * Ported VERBATIM from the original landing site (August 2026) — this text
 * is registered with the A2P campaign. Don't reword it casually; the
 * no-sharing clause and the SMS section are what reviewers check for.
 */
export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="Privacy Policy" />
      <p className="text-xs text-slate-400">Last updated: August 2026</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          This Privacy Policy explains how YouBuyCars (&ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collects, uses, and protects
          information when you communicate with us, including by text message
          (SMS/MMS).
        </p>
        <p className="font-medium text-slate-800">
          No mobile information (including your phone number) or SMS/text
          messaging opt-in consent will be sold, rented, or shared with any
          third parties or affiliates for their own marketing or promotional
          purposes.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          Information we collect
        </h2>
        <p>
          We collect the information you provide directly to us — such as
          your name, phone number, email address, and details about the
          vehicles or services you&apos;re interested in — when you contact
          us, submit an inquiry, or provide your information in person.
        </p>
        <p>
          If you ask us to help arrange financing, we also collect what you
          tell us about your situation — for example your employment, how
          long you&apos;ve been there, the amount you plan to put down, your
          trade-in and anything still owed on it, how you describe your own
          credit, and where you bank. You choose what to share, and you can
          decline any of it and still work with us.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          How we use your information
        </h2>
        <p>
          We use your information to respond to your questions, communicate
          with you about vehicles and appointments, follow up on your
          interest, and provide customer service. We may use text messaging
          to carry on these conversations with you.
        </p>
        <p>
          Where you&apos;ve asked us to, we also use it to work out financing
          options and to submit a credit application on your behalf. We
          don&apos;t make lending decisions ourselves — lenders do — and
          nothing we say by text is an offer, an approval, or a rate.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          Mobile information &amp; SMS
        </h2>
        <p>
          No mobile information (including your phone number) or SMS opt-in
          consent will be sold, rented, or shared with any third parties or
          affiliates for their own marketing or promotional purposes. This
          information is used solely to communicate with you as part of our
          service.
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            You provide consent to receive text messages by contacting us
            first, submitting your number, or verbally agreeing to be
            contacted.
          </li>
          <li>Message frequency varies based on our conversation with you.</li>
          <li>Message and data rates may apply.</li>
          <li>
            You can opt out at any time by replying STOP. Reply HELP for
            help.
          </li>
        </ul>
        <p>
          If you opt out by replying STOP, we will stop sending you text
          messages. You can opt back in at any time by replying START.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          Sharing of information
        </h2>
        <p>
          We do not sell, rent, or share your mobile phone number or your
          SMS/text messaging opt-in consent with any third parties or
          affiliates for their own marketing or promotional purposes. This
          applies without exception.
        </p>
        <p>
          We also do not sell your other personal information. The parties
          who handle it are the service providers that operate this messaging
          and customer management system on our behalf (for example, our text
          message delivery provider). They may use it solely to deliver the
          service to you and are not permitted to use it for their own
          marketing. We may also disclose information where required by law.
        </p>
        <p>
          If you ask us to arrange financing, we send the information needed
          for a credit application to the lender or lenders we submit it to.
          That is the only way they can consider it, and we do it only when
          you&apos;ve asked us to. Those lenders handle your information
          under their own privacy policies. This does not change anything
          above: your mobile number and your SMS consent are still never
          sold, rented, or shared with anyone for marketing, including
          lenders.
        </p>

        <h2 className="text-lg font-bold text-slate-900">
          Marketplace accounts &amp; listings
        </h2>
        <p>
          If you create a seller account to list a vehicle, we collect your
          name, email address, password (stored only in encrypted form by
          our authentication provider), and the details and photos of the
          vehicles you list. Listings you publish — including photos, the
          vehicle&apos;s details, and any VIN you choose to include — are
          public by design. Your email address is never shown publicly. You
          can delete pending listings yourself at any time, and you can ask
          us to close your account by contacting the email below. None of
          this changes anything in the sections above: account information
          is never sold, and your mobile number and SMS consent are never
          shared with anyone for marketing.
        </p>

        <h2 className="text-lg font-bold text-slate-900">Data security</h2>
        <p>
          We take reasonable measures to protect your information. No method
          of transmission or storage is completely secure, but we work to
          safeguard your data using industry-standard practices.
        </p>

        <h2 className="text-lg font-bold text-slate-900">Contact us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at{" "}
          {SITE.email}.
        </p>
      </div>
    </main>
  );
}
