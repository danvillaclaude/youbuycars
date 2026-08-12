import type { Metadata } from "next";
import Link from "next/link";
import { LISTING_CAP } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Sell your car · YouBuyCars",
  description:
    "List your vehicle on YouBuyCars for free — up to five active listings, every one reviewed before it goes live.",
};

export default function SellPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold">Sell your car on YouBuyCars</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Free to list. You post the car, we review it, and it goes live to
        buyers across Metro Detroit — no strangers with lowball texts, no
        listing fees.
      </p>

      <ol className="mt-8 space-y-5 text-sm leading-relaxed text-slate-600">
        <li>
          <strong className="text-slate-900">1. Create your account.</strong>{" "}
          Just a name, email and password — you can list up to {LISTING_CAP}{" "}
          vehicles at a time.
        </li>
        <li>
          <strong className="text-slate-900">2. Post the car.</strong> Year,
          make, model, miles, price, photos. VIN is optional — listings with
          one build more trust.
        </li>
        <li>
          <strong className="text-slate-900">3. We review it.</strong> A real
          person checks every listing before it goes live, so the board stays
          clean and buyers trust what they see. Usually same day.
        </li>
        <li>
          <strong className="text-slate-900">4. Buyers reach out.</strong>{" "}
          Interested buyers contact us, and we connect them with your car.
          Mark it sold whenever it sells — the listing stays up as sold, which
          helps the next one.
        </li>
      </ol>

      <div className="mt-10 flex gap-3">
        <Link
          href="/signup"
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Create your free account
        </Link>
        <Link
          href="/login"
          className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          I already have one
        </Link>
      </div>
    </main>
  );
}
