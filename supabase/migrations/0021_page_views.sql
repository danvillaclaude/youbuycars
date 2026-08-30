-- 0021: site-wide page views (30 Aug 2026, the owner's analytics desks in
-- the CRM). Same letterbox posture as listing_events (0007): the browser
-- INSERTs one row per page per session, nobody public SELECTs, and the
-- owner's CRM reads via the service role. Crawlers run no beacons, so
-- the counts stay about people.
--
-- ALREADY APPLIED to production 30 Aug 2026 (via MCP).

create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) <= 200),
  referrer_host text check (referrer_host is null or char_length(referrer_host) <= 100),
  session_key text not null check (char_length(session_key) between 8 and 40),
  created_at timestamptz not null default now()
);
create index if not exists page_views_created_at on public.page_views (created_at);
alter table public.page_views enable row level security;
drop policy if exists page_views_insert on public.page_views;
create policy page_views_insert on public.page_views
  for insert to anon, authenticated with check (true);
