-- ---------------------------------------------------------------------------
-- 0007 — listing analytics (Phase 2 slice 2, 15 Aug 2026, the owner's
-- greenlight from the mockup round: "your Accord got 47 views this week").
--
-- Event-level rather than counters, so "views this week" and the taps
-- breakdown are the same table read two ways, and a future funnel needs
-- no new writes. The letterbox posture the inquiries table taught:
-- anonymous browsers may INSERT (that's what a view is), nobody anonymous
-- may ever SELECT, and a seller reads only their own listings' events.
-- Views are counted from a client-side beacon, not the server render —
-- Googlebot reads every page for SEO, and a crawler is not a shopper.
-- ---------------------------------------------------------------------------

create table if not exists public.listing_events (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  -- What happened: a page view, a tap on the text/call CTA, or a first
  -- interaction with the payment calculator.
  kind        text not null check (kind in ('view', 'text_tap', 'call_tap', 'calc_run')),
  created_at  timestamptz not null default now()
);

create index if not exists idx_listing_events_listing_time
  on public.listing_events (listing_id, created_at desc);

alter table public.listing_events enable row level security;

-- The letterbox: anyone may drop an event in...
drop policy if exists listing_events_insert on public.listing_events;
create policy listing_events_insert on public.listing_events
  for insert to anon, authenticated
  with check (true);

-- ...and only the listing's own seller (or an admin) may read them back.
drop policy if exists listing_events_select on public.listing_events;
create policy listing_events_select on public.listing_events
  for select to authenticated
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.seller_id = auth.uid()
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
    )
  );
