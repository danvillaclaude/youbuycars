-- 0019: research posts become data (29 Aug 2026, the owner's ask: "add a
-- Posts section to the isellcars.ai owner youbuycars channel so I can
-- approve posts before they go live"). A guide used to be code — JSX in
-- app/research/articles.tsx — so publishing one meant a deploy. Now a
-- post is a row: the CRM's owner desk lists drafts and flips status via
-- the service role; the site reads published rows into /research and the
-- sitemap, and renders drafts at their URL with a banner and noindex so
-- the owner can read before approving.
--
-- ALREADY APPLIED to production 29 Aug 2026 (via MCP). Kept here so the
-- migrations folder stays the schema's full story.

create table if not exists public.research_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  dek text not null,
  minutes int not null default 5,
  -- [{heading, paragraphs: ["text with [label](/path) links"]}]
  sections jsonb not null,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.research_posts enable row level security;
drop policy if exists research_posts_read on public.research_posts;
create policy research_posts_read on public.research_posts
  for select to anon, authenticated using (true);
-- No insert/update/delete policies: the owner's CRM desk writes via the
-- service role; the site only reads. Drafts are world-readable by link,
-- matching the code-draft behaviour they replace (the page adds noindex).
