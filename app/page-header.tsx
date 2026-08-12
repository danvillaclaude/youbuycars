import Link from "next/link";

/** The subpage masthead: wordmark home link over a page title. */
export function PageHeader({ title }: { title: string }) {
  return (
    <header className="mb-8">
      <Link href="/" className="text-lg font-bold text-slate-900">
        You<span className="text-blue-600">Buy</span>Cars
      </Link>
      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
    </header>
  );
}
