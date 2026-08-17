-- ---------------------------------------------------------------------------
-- 0015 — vehicle specs + price history (16 Aug 2026, his greenlight on
-- the CarGurus-depth round; his four calls: the full eight fields /
-- body style required at the APP level, rest optional / backfill the
-- live four / price DROPS get chips, increases stay quiet).
--
-- SPECS: eight columns, all nullable at the DB (existing rows must not
-- break; "body style required" is the wizard's law for NEW posts, not
-- the table's). Closed vocabularies get CHECK constraints mirroring the
-- lists in lib/listings.ts — the same pin-two-lists-together shape as
-- the CRM's memory categories, tested so a drift fails loudly. Colors
-- and engine stay free text with length caps: the UI offers a list,
-- the DB doesn't argue about "Pearl White".
--
-- Spec columns are DELIBERATELY absent from listings_guard()'s re-pend
-- list: adding facts to a live listing must not knock it off the board,
-- or nobody backfills. The substance list (words and numbers the admin
-- approved) is unchanged.
--
-- PRICE HISTORY: an AFTER UPDATE trigger is the only writer — any path
-- that changes a price (seller edit, admin desk, SQL) leaves a row, and
-- no app code has to remember to. Public read: price history is public
-- information (CarGurus shows it under the gauge). No INSERT/UPDATE/
-- DELETE policies exist at all; the security-definer trigger writes.
-- ---------------------------------------------------------------------------

alter table public.listings
  add column if not exists body_style     text
    check (body_style is null or body_style in
      ('SUV','Sedan','Truck','Coupe','Hatchback','Minivan','Van','Convertible','Wagon')),
  add column if not exists exterior_color text
    check (exterior_color is null or char_length(exterior_color) <= 40),
  add column if not exists interior_color text
    check (interior_color is null or char_length(interior_color) <= 40),
  add column if not exists drivetrain     text
    check (drivetrain is null or drivetrain in ('FWD','RWD','AWD','4WD')),
  add column if not exists transmission   text
    check (transmission is null or transmission in ('Automatic','Manual')),
  add column if not exists fuel_type      text
    check (fuel_type is null or fuel_type in
      ('Gas','Diesel','Hybrid','Plug-in Hybrid','Electric')),
  add column if not exists engine         text
    check (engine is null or char_length(engine) <= 80),
  add column if not exists condition      text
    check (condition is null or condition in ('Excellent','Good','Fair'));

create index if not exists idx_listings_body_style
  on public.listings (body_style) where status = 'active';

-- Saved searches learn the body-style filter (0014's table).
alter table public.saved_searches
  add column if not exists body_style text;

-- ── Price history ──────────────────────────────────────────────────────────

create table if not exists public.price_changes (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null references public.listings (id) on delete cascade,
  old_price   int not null,
  new_price   int not null,
  changed_at  timestamptz not null default now()
);

create index if not exists idx_price_changes_listing
  on public.price_changes (listing_id, changed_at desc);

alter table public.price_changes enable row level security;

drop policy if exists price_changes_read on public.price_changes;
create policy price_changes_read on public.price_changes
  for select to anon, authenticated
  using (true);
-- No write policies: the trigger below is the only writer.

create or replace function public.listings_price_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.price is distinct from old.price then
    insert into public.price_changes (listing_id, old_price, new_price)
      values (new.id, old.price, new.price);
  end if;
  return new;
end;
$$;

drop trigger if exists listings_price_log_trigger on public.listings;
create trigger listings_price_log_trigger
  after update on public.listings
  for each row execute function public.listings_price_log();
