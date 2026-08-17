import Link from "next/link";

/**
 * The teardown's half-and-half promo module: a light-blue rounded card
 * (eyebrow + headline + one sentence + pill CTA) paired with product
 * proof on the other half. CarGurus uses lifestyle photos with UI chips
 * composited on top; we don't have a photo library, so the proof half
 * is a clean CSS product mock (`children`) — same trick as the demo
 * explainer card. The pattern recurs on their homepage three times;
 * reuse this rather than redrawing it.
 */
export function PromoSplit({
  eyebrow,
  headline,
  sub,
  ctaLabel,
  ctaHref,
  flip = false,
  children,
}: {
  eyebrow: string;
  headline: string;
  sub: string;
  ctaLabel: string;
  ctaHref: string;
  /** Card on the right instead of the left. */
  flip?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-6 sm:grid-cols-2">
      <div
        className={`rounded-3xl bg-blue-50 p-8 sm:p-10 ${flip ? "sm:order-2" : ""}`}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
          {headline}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{sub}</p>
        <Link
          href={ctaHref}
          className="mt-5 inline-block rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          {ctaLabel}
        </Link>
      </div>
      <div className={`flex justify-center ${flip ? "sm:order-1" : ""}`}>
        {children}
      </div>
    </div>
  );
}
