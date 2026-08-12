import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { PageHeader } from "../page-header";

export const metadata: Metadata = {
  title: "Contact · YouBuyCars",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="Contact" />

      <div className="space-y-5 text-sm leading-relaxed text-slate-600">
        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900">Text us</h2>
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
        </div>

        <div className="rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900">Prefer a form?</h2>
          <p className="mt-1">
            The{" "}
            <Link href="/#inquiry" className="text-blue-600 underline">
              inquiry form
            </Link>{" "}
            on the home page reaches the same person — usually within the
            hour during business hours.
          </p>
        </div>

        <p className="text-xs text-slate-400">
          YouBuyCars · {SITE.area}
        </p>
      </div>
    </main>
  );
}
