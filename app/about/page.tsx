import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { PageHeader } from "../page-header";

export const metadata: Metadata = {
  title: "About · YouBuyCars",
  description:
    "YouBuyCars is a personal car-finding service in Metro Detroit, run by a working automotive salesperson — tell us what you need and we text you real options.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <PageHeader title="About YouBuyCars" />

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          YouBuyCars is a car-finding service based in {SITE.area}, run by a
          working automotive sales professional — not a call center, not a
          lead reseller. You tell us what you&apos;re looking for; a real
          person finds vehicles that actually fit and texts them to you.
        </p>
        <p>
          YouBuyCars is an independent Metro Detroit business. It is not
          part of, or affiliated with, any similarly named national
          car-buying company.
        </p>
        <p>
          The idea is simple: buying a car shouldn&apos;t mean an afternoon
          in a showroom and a week of phone tag. Most of the work — narrowing
          options, checking availability, lining up financing questions,
          booking the test drive — fits in a text conversation you can have
          on your own time. The dealership visit becomes the fun part:
          driving the car that&apos;s already pulled up front.
        </p>
        <p>
          We work with buyers across every credit situation. If financing is
          part of your plan, we&apos;ll talk through your situation honestly
          and put your application in front of lenders who work with people
          like you — and we&apos;ll never quote payments, rates, or approvals
          by text, because only a lender can decide those.
        </p>
        <p>
          <strong className="text-slate-800">The marketplace:</strong>{" "}
          local sellers and dealers list their cars on the{" "}
          <Link href="/cars" className="text-blue-600 underline">
            board
          </Link>
          , a real person reviews every listing before it goes live, and
          buyers deal with the seller directly. Selling?{" "}
          <Link href="/sell" className="text-blue-600 underline">
            List yours free
          </Link>
          .
        </p>
        <p>
          Questions? Everything — text, call, email — lives on the{" "}
          <Link href="/contact" className="text-blue-600 underline">
            Contact page
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
