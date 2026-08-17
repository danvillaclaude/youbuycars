import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "../articles";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) return { title: "Research · YouBuyCars" };
  return {
    title: `${article.title} | YouBuyCars Research`,
    description: article.dek,
  };
}

/** One template for every guide — the teardown's lesson, applied. */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/research"
        className="text-sm text-slate-400 hover:text-slate-600"
      >
        ← Research &amp; guides
      </Link>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
        {article.title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">
        {article.dek} · {article.minutes} min read
      </p>

      <article>{article.body}</article>

      <div className="mt-12 rounded-2xl bg-blue-50 p-6 text-center">
        <p className="font-bold text-slate-900">Ready to look at real cars?</p>
        <Link
          href="/cars"
          className="mt-3 inline-block rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white hover:bg-blue-700"
        >
          Browse the board
        </Link>
      </div>
    </main>
  );
}
