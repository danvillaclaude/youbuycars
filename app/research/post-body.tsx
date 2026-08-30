import Link from "next/link";
import type { PostSection } from "@/lib/research-posts";

/**
 * Renders a research post's sections — since migration 0022 moved the
 * original five guides into research_posts, this is the dress EVERY
 * guide wears, so the classes live here now (they came from
 * articles.tsx, which is gone). [label](href) links become real links
 * (internal via <Link>, michigan.gov and friends via <a>).
 */
export const h2 = "mt-8 text-lg font-bold text-slate-900";
export const p = "mt-3 text-sm leading-relaxed text-slate-600";
// A paragraph that keeps the literal "• " prefix is a checklist row —
// the code guides' <li> spacing, carried over so the test-drive and
// texting checklists render exactly as they always did.
const li = "mt-2 text-sm leading-relaxed text-slate-600";

function renderParagraph(text: string, key: number) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const [, label, href] = m;
    parts.push(
      href.startsWith("http") ? (
        <a key={i++} href={href} className="text-blue-600 underline" target="_blank" rel="noreferrer">
          {label}
        </a>
      ) : (
        <Link key={i++} href={href} className="text-blue-600 underline">
          {label}
        </Link>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return (
    <p key={key} className={text.startsWith("• ") ? li : p}>
      {parts}
    </p>
  );
}

export function PostBody({ sections }: { sections: PostSection[] }) {
  return (
    <>
      {sections.map((s) => (
        <div key={s.heading}>
          <h2 className={h2}>{s.heading}</h2>
          {s.paragraphs.map((para, i) => renderParagraph(para, i))}
        </div>
      ))}
    </>
  );
}
