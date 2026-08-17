-- ---------------------------------------------------------------------------
-- 0014 — saved searches (16 Aug 2026, from the CarGurus teardown study:
-- a "Save search" button is only worth pressing if something actually
-- comes back — so this one comes back as a daily letter when new
-- matching cars go live).
--
-- The letterbox again: anonymous buyers INSERT, no public role ever
-- SELECTs — an email address is write-only from the browser's side of
-- the wall. The daily sender runs on the CRM's cron with this project's
-- service key (the same one-directional custody as inquiries and chats;
-- this app holds no key of the CRM's).
--
-- Unsubscribe is a SECURITY DEFINER function, not a policy: knowing the
-- row's uuid IS the credential — it only ever travels inside the alert
-- email — and the function touches exactly one row by primary key. An
-- anon UPDATE/DELETE policy would hand PostgREST a bulk verb; this
-- hands it one door with one key.
-- ---------------------------------------------------------------------------

create table if not exists public.saved_searches (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  -- The filter set, mirroring /cars params. Columns rather than jsonb:
  -- the set is fixed by the page, and the sender queries them directly.
  make          text,
  q             text,
  year_min      int,
  year_max      int,
  max_price     int,
  max_miles     int,
  financing     boolean not null default false,
  -- Built once at save time ("Chevrolet · under $15,000") so the letter
  -- can say what it's watching without re-deriving it.
  label         text not null default 'all cars',
  -- Watermark: only listings APPROVED after this get mailed. Approval is
  -- the moment a listing goes live — a created_at watermark would lose
  -- any car that sat in the review queue across a scan.
  last_checked_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_saved_searches_live
  on public.saved_searches (created_at) where unsubscribed_at is null;

alter table public.saved_searches enable row level security;

drop policy if exists saved_searches_insert on public.saved_searches;
create policy saved_searches_insert on public.saved_searches
  for insert to anon, authenticated
  with check (
    email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    and char_length(email) <= 200
    and char_length(coalesce(make, '')) <= 60
    and char_length(coalesce(q, '')) <= 80
    and char_length(label) <= 160
  );
-- Deliberately no SELECT policy for anon/authenticated.

create or replace function public.unsubscribe_saved_search(search_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  update public.saved_searches
     set unsubscribed_at = now()
   where id = search_id
     and unsubscribed_at is null
  returning true;
$$;

revoke all on function public.unsubscribe_saved_search(uuid) from public;
grant execute on function public.unsubscribe_saved_search(uuid)
  to anon, authenticated;
