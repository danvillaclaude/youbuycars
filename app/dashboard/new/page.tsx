import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ListingForm } from "../listing-form";

export const metadata: Metadata = { title: "List a car · YouBuyCars" };

export default async function NewListingPage() {
  const { user } = await requireUser();
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">List a car</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Fill it out honestly — a reviewed board is why buyers trust it.
      </p>
      <ListingForm userId={user.id} />
    </main>
  );
}
