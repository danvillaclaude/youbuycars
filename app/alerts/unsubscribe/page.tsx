import type { Metadata } from "next";
import Link from "next/link";
import { unsubscribeAction } from "./actions";

export const metadata: Metadata = {
  title: "Unsubscribe · YouBuyCars",
  robots: { index: false },
};

/**
 * The alert letter's out (0014). The uuid in the link is the whole
 * credential — it only ever travels inside the email — and the
 * security-definer RPC it calls touches exactly one row. Idempotent by
 * design: a second click lands on the same calm page. The click itself
 * is a POST (see actions.ts) so a mail scanner's GET can't unsubscribe
 * on delivery; the page confirms, then the button does it.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; done?: string; failed?: string }>;
}) {
  const { id, done, failed } = await searchParams;
  const valid =
    id != null &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  return (
    <main className="mx-auto max-w-xl px-6 py-20 text-center">
      {valid && done ? (
        <>
          <h1 className="text-2xl font-bold">That alert is off.</h1>
          <p className="mt-3 text-sm text-slate-500">
            No more letters for that search. Change your mind? Save it again
            any time from the browse page.
          </p>
        </>
      ) : valid && failed ? (
        <>
          <h1 className="text-2xl font-bold">
            We couldn&apos;t turn that alert off just now.
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Nothing changed on our side — try again in a minute.
          </p>
          <form action={unsubscribeAction} className="mt-6">
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Try again
            </button>
          </form>
        </>
      ) : valid ? (
        <>
          <h1 className="text-2xl font-bold">Stop these alert letters?</h1>
          <p className="mt-3 text-sm text-slate-500">
            One tap and that saved search goes quiet. You can save it again
            any time from the browse page.
          </p>
          <form action={unsubscribeAction} className="mt-6">
            <input type="hidden" name="id" value={id} />
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Turn this alert off
            </button>
          </form>
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
