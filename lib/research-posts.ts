import { createServerClient } from "@/lib/supabase-server";

/**
 * Research posts as DATA (migration 0019; 29 Aug 2026, the owner's ask:
 * "a Posts section... so I can approve posts before they go live").
 * A guide used to be JSX in articles.tsx, so publishing meant a deploy;
 * now a post is a row the owner's CRM desk flips to published, and the
 * site reads it here. Since migration 0022 the table is the ONLY
 * source — the five original guides moved in as published rows with
 * their real Aug 2026 dates, and articles.tsx is gone.
 *
 * Sections carry plain text with [label](href) markdown links; the
 * renderer (app/research/post-body.tsx) turns them into the same JSX
 * the code guides use. Pages that call these export `revalidate`, so
 * an approval shows on the site within minutes, no deploy.
 */
export interface PostSection {
  heading: string;
  paragraphs: string[];
}

export interface ResearchPost {
  id: string;
  slug: string;
  title: string;
  dek: string;
  minutes: number;
  sections: PostSection[];
  status: "draft" | "published";
  published_at: string | null;
}

export async function fetchPublishedPosts(): Promise<ResearchPost[]> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("research_posts")
    .select("id, slug, title, dek, minutes, sections, status, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data ?? []) as ResearchPost[];
}

/** Any status: a draft renders at its URL with a banner and noindex. */
export async function fetchPostBySlug(slug: string): Promise<ResearchPost | null> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("research_posts")
    .select("id, slug, title, dek, minutes, sections, status, published_at")
    .eq("slug", slug)
    .maybeSingle();
  return (data as ResearchPost | null) ?? null;
}
