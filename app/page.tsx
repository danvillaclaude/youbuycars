import Link from "next/link";
import { SITE } from "@/lib/site";
import { InquiryForm } from "./inquiry-form";

/**
 * The front door — and the A2P campaign's primary Call-to-Action URL.
 * Every compliance sentence on this page is registered with carriers;
 * change the words here and the campaign registration must change too.
 */
export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-slate-950 px-6 pb-20 pt-14 text-center text-white">
        <p className="text-2xl font-bold">
          You<span className="text-blue-500">Buy</span>Cars
        </p>
        <h1 className="mx-auto mt-10 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
          Find your next car without the runaround.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
          Tell us what you&apos;re looking for and we&apos;ll text you real
          options — no pushy calls, no sitting at a dealership all day.
        </p>
        <a
          href="#inquiry"
          className="mt-8 inline-block rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          Tell us what you&apos;re looking for
        </a>
      </section>

      {/* Text-us-first — the second registered opt-in path. */}
      <section className="bg-blue-600 px-6 py-12 text-center text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
          Prefer to skip the form?
        </p>
        <p className="mt-3 text-3xl font-bold sm:text-4xl">
          Text <span className="rounded-lg bg-blue-500 px-2">START</span> to{" "}
          <a href={`sms:${SITE.phoneE164}`} className="underline">
            {SITE.phoneDisplay}
          </a>
        </p>
        <p className="mt-2 text-blue-100">
          and a real person will text you back about your next car.
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-blue-200">
          By texting START (or any message) to {SITE.phoneDisplay}, you agree
          to receive text messages from YouBuyCars about your vehicle inquiry,
          appointments, and follow-ups. Consent is not a condition of
          purchase. Message frequency varies. Message and data rates may
          apply. Reply STOP to opt out at any time, or HELP for help. See our{" "}
          <Link href="/privacy" className="underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            {
              emoji: "📝",
              title: "1. Tell us what you want",
              body: "Year, make, model, budget — or just describe what you need.",
            },
            {
              emoji: "💬",
              title: "2. We text you back",
              body: "A real person texts you options that actually fit. No phone tag.",
            },
            {
              emoji: "🔑",
              title: "3. Come drive it",
              body: "Like what you see? We'll have it pulled up and ready for you.",
            },
          ].map((step) => (
            <div key={step.title} className="text-center">
              <div className="text-3xl">{step.emoji}</div>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The form — the first registered opt-in path. */}
      <section id="inquiry" className="bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-bold">What are you looking for?</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Fill this out and we&apos;ll text you back shortly.
          </p>
          <InquiryForm />
        </div>
      </section>

      {/* The consent story, in plain sight — mirrors /sms-consent. */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-xl font-bold">About our text messages</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          You&apos;ll only ever receive texts from YouBuyCars through one of
          the three ways below — each one is you choosing to hear from us, and
          messages are always about your vehicle inquiry, appointments, and
          follow-ups.
        </p>
        <ol className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
          <li>
            <strong className="text-slate-800">The form on this page.</strong>{" "}
            You fill it out with your number, and tick the optional consent
            checkbox next to the full disclosure. The box is never pre-checked
            and never required — you can send the form without it, and if you
            do, we won&apos;t text you.
          </li>
          <li>
            <strong className="text-slate-800">Texting us first.</strong> You
            text START — or any message — to {SITE.phoneDisplay}. Starting the
            conversation is your consent to receive our replies about it, and
            replying STOP at any time ends it immediately.
          </li>
          <li>
            <strong className="text-slate-800">In person or on a call.</strong>{" "}
            You give us your number and tell us it&apos;s OK to text you. The
            salesperson records that you agreed, when, and how, before any
            message is sent.{" "}
            <Link href="/sms-consent" className="text-blue-600 underline">
              See exactly how that works →
            </Link>
          </li>
        </ol>
        <ul className="mt-6 space-y-1 text-xs text-slate-500">
          <li>Message frequency varies based on our conversation.</li>
          <li>Message and data rates may apply.</li>
          <li>Reply STOP at any time to opt out, or HELP for help.</li>
          <li>
            We never sell or share your mobile number or SMS consent with
            third parties or affiliates for marketing.
          </li>
        </ul>
      </section>
    </main>
  );
}
