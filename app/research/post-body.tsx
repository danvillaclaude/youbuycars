import Link from "next/link";
import { h2, p } from "./articles";
import type { PostSection } from "@/lib/research-posts";

/**
 * Renders a database post's sections in exactly the dress the code
 * guides wear — same h2/p classes, [label](href) links become real
 * links (internal via <Link>, michigan.gov and friends via <a>).
 */
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
    <p key={key} className={p}>
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
