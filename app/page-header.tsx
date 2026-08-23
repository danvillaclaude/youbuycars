/**
 * The subpage title block. The wordmark home link that used to sit here
 * was made redundant by the global masthead (site-header.tsx) — two home
 * links 140px apart (23 Aug 2026 audit).
 */
export function PageHeader({ title }: { title: string }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
    </header>
  );
}
