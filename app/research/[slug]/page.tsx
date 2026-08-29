import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES } from "../articles";
import { DRAFT_ARTICLES } from "../draft-articles";
import { Breadcrumbs } from "@/app/breadcrumbs";

/** Live guides are listed and indexed; drafts render only at their URL. */
function findArticle(slug: string) {
  return ARTICLES.find((a) => a.slug === slug) ?? DRAFT_ARTICLES.find((a) => a.slug === slug);
}

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) return { title: "Page not found · YouBuyCars", robots: { index: false } };
  return {
    title: `${article.title} | YouBuyCars Research`,
    description: article.dek,
    alternates: { canonical: `/research/${article.slug}` },
    ...(article.draft ? { robots: { index: false } } : {}),
  };
}

/** One template for every guide — the teardown's lesson, applied. */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticle(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      {article.draft && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          Draft — not published yet. This page is listed nowhere and marked
          noindex; it goes live once you approve it.
        </p>
      )}
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Research & guides", href: "/research" },
          { name: article.title },
        ]}
      />
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
