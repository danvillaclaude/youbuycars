import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Unsubscribe · YouBuyCars",
  robots: { index: false },
};

/**
 * The alert letter's one-click out (0014). The uuid in the link is the
 * whole credential — it only ever travels inside the email — and the
 * security-definer RPC it calls touches exactly one row. Idempotent by
 * design: a second click lands on the same calm page.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const valid =
    id != null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  if (valid) {
    const supabase = await createClient();
    await supabase.rpc("unsubscribe_saved_search", { search_id: id });
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      {valid ? (
        <>
          <h1 className="text-2xl font-bold">That alert is off.</h1>
          <p className="mt-3 text-sm text-slate-500">
            No more letters for that search. Change your mind? Save it again
            any time from the browse page.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold">That link doesn&apos;t work.</h1>
          <p className="mt-3 text-sm text-slate-500">
            The unsubscribe link looks incomplete — try clicking it straight
            from the email again.
          </p>
        </>
      )}
      <Link
        href="/cars"
        className="mt-8 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
      >
        Browse cars
      </Link>
    </main>
  );
}
