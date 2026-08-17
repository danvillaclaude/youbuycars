import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { PageHeader } from "../page-header";

export const metadata: Metadata = {
  title: "Contact · YouBuyCars",
  description:
    "Text, call or email YouBuyCars — a real person answers about your next car. Metro Detroit.",
};

/**
 * The contact page — where the Text-START flow LIVES now (16 Aug 2026,
 * the owner's correction: the homepage is search and inventory like
 * CarGurus'; the opt-in conversation starters belong here). Every
 * registered sentence — the START headline, the reply promise, the full
 * disclosure — is verbatim, moved not reworded. /sms-consent remains
 * the registered proof page, untouched.
 */
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="Contact" />

      {/* Text-us-first — the registered opt-in path, in the accent-sky
          dress. */}
      <section className="rounded-3xl bg-sky-50 p-6 sm:p-8">
        <div className="grid items-center gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              The fastest way
            </p>
            <p className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Text <span className="rounded-lg bg-white px-2 text-blue-600 shadow-sm">START</span> to{" "}
              <a
                href={`sms:${SITE.phoneE164}`}
                className="whitespace-nowrap underline decoration-blue-300 underline-offset-4 hover:decoration-blue-600"
              >
                {SITE.phoneDisplay}
              </a>
            </p>
            <p className="mt-2 text-slate-600">
              and a real person will text you back about your next car.
            </p>
            <a
              href={`sms:${SITE.phoneE164}?&body=START`}
              className="mt-5 inline-block rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              💬 Text START now
            </a>
          </div>

          {/* The thread a shopper actually starts — the reply bubble
              reuses the page's own sentence, nothing invented. */}
          <div className="flex justify-center">
            <div className="w-56 rounded-[2rem] border-8 border-slate-900 bg-white p-3 shadow-xl shadow-blue-900/10">
              <p className="text-center text-[10px] font-semibold text-slate-400">
                {SITE.phoneDisplay}
              </p>
              <div className="mt-2 ml-auto w-fit rounded-2xl bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white">
                START
              </div>
              <div className="mt-2 max-w-[85%] rounded-2xl bg-slate-100 px-3.5 py-2 text-xs leading-relaxed text-slate-700">
                A real person will text you back about your next car. 👋
              </div>
              <div className="mt-2 flex w-fit gap-1 rounded-2xl bg-slate-100 px-3.5 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>

        <p className="mt-7 text-xs leading-relaxed text-slate-500">
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

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900">Call or text</h2>
          <p className="mt-1">
            <a
              href={`sms:${SITE.phoneE164}`}
              className="text-lg font-semibold text-blue-600"
            >
              {SITE.phoneDisplay}
            </a>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Texting us first is consent to receive our replies — STOP ends it
            anytime. See{" "}
            <Link href="/sms-consent" className="underline">
              how texting consent works
            </Link>
            .
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900">Email</h2>
          <p className="mt-1">
            <a
              href={`mailto:${SITE.email}`}
              className="font-semibold text-blue-600"
            >
              {SITE.email}
            </a>
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Answered by a real person, usually same day.
          </p>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Asking about a specific car or dealer? Every listing has Text and
        Message buttons, and dealer pages have their own contact form.
      </p>

      <p className="mt-8 text-xs text-slate-400">
        YouBuyCars · {SITE.area}
      </p>
    </main>
  );
}
