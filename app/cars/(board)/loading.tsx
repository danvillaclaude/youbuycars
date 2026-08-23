/**
 * The browse board's skeleton (23 Aug 2026 overnight pass): the server
 * fetch is fast but not instant, and a blank column under the header
 * read as a broken page. It mirrors the page's two shells — the navy
 * band and the white sheet rounding up over it — so nothing jumps when
 * the real cards land; the first version was white-on-white and the
 * band snapped in afterwards. Pulse is the one motion, and it respects
 * reduced-motion via the motion-reduce variant.
 *
 * It lives in the (board) route group ON PURPOSE: a loading.tsx at
 * app/cars/ also wrapped app/cars/[slug], so every listing page streamed
 * this board skeleton first, and a slug that doesn't exist answered
 * HTTP 200 with the skeleton before notFound() could say 404 — a soft
 * 404 crawlers index. The group scopes the boundary to /cars alone.
 */
export default function CarsLoading() {
  return (
    <main aria-busy="true">
      <section className="bg-slate-900 px-4 pb-14 pt-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="h-3 w-64 animate-pulse motion-reduce:animate-none rounded-full bg-slate-700" />
          <div className="mt-3 h-9 w-80 max-w-full animate-pulse motion-reduce:animate-none rounded-full bg-slate-700" />
          <div className="mt-5 h-12 max-w-xl animate-pulse motion-reduce:animate-none rounded-full bg-white/90" />
        </div>
      </section>
      <div className="mx-auto -mt-6 max-w-7xl rounded-t-3xl bg-white px-4 pb-10 pt-7 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[230px_1fr]">
          <div className="hidden space-y-3 lg:block">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-10 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100" />
            ))}
          </div>
          <div>
            <div className="h-7 w-40 animate-pulse motion-reduce:animate-none rounded-full bg-slate-200" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <div className="aspect-[4/3] animate-pulse motion-reduce:animate-none bg-slate-100" />
                  <div className="space-y-2 p-3.5">
                    <div className="h-5 w-24 animate-pulse motion-reduce:animate-none rounded-full bg-slate-200" />
                    <div className="h-4 w-40 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100" />
                    <div className="h-3 w-28 animate-pulse motion-reduce:animate-none rounded-full bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
