/**
 * The browse board's skeleton (23 Aug 2026 overnight pass): the server
 * fetch is fast but not instant, and a blank column under the header
 * read as a broken page. Nine card-shaped placeholders in the board's
 * own grid — same aspect, same radius — so the layout doesn't jump when
 * the real cards land. Pulse is the one motion, and it respects
 * reduced-motion via the motion-reduce variant.
 */
export default function CarsLoading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8" aria-busy="true">
      <div className="h-8 w-56 animate-pulse motion-reduce:animate-none rounded-full bg-slate-200" />
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[230px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100" />
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            >
              <div className="aspect-[4/3] animate-pulse motion-reduce:animate-none bg-slate-100" />
              <div className="space-y-2 p-4">
                <div className="h-5 w-24 animate-pulse motion-reduce:animate-none rounded-full bg-slate-200" />
                <div className="h-4 w-40 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100" />
                <div className="h-3 w-28 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
