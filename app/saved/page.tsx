import type { Metadata } from "next";
import { SavedList } from "./saved-list";

export const metadata: Metadata = {
  title: "Saved cars · YouBuyCars",
  robots: { index: false },
};

/** The heart's landing page. Device-local by design — see saved-cars.ts. */
export default function SavedPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-2xl font-bold">Saved cars</h1>
      <p className="mt-1 text-sm text-slate-500">
        Your shortlist lives on this device — no account needed. Tap a heart
        anywhere to add or remove a car.
      </p>
      <SavedList />
    </main>
  );
}
