-- ---------------------------------------------------------------------------
-- 0009 — the seller-wide financing switch, and dealership ratings
-- (15 Aug 2026, both the owner's calls).
--
-- FINANCING, PER SELLER: "sellers should be able to turn financing
-- completely off for their profiles." Effective financing on a listing =
-- profile switch AND listing switch — the profile is the master breaker,
-- the per-listing box (0008) stays the fine dial.
--
-- RATINGS, HIS APPROVED SPEC: anyone may SUBMIT a review of a seller
-- (name + phone + stars + words), but NOTHING shows until the platform
-- owner's desk approves it — and the desk's job is to check the reviewer
-- actually contacted that seller. Verification is human judgment until
-- buyer accounts exist; the letterbox posture keeps the rest honest:
-- anonymous browsers INSERT, the public reads ONLY approved rows, and
-- the reviewer's phone is never in any public read.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column financing_offered boolean not null default true;
comment on column public.profiles.financing_offered is
  'Seller-wide financing switch (0009): off hides est./mo and the calculator on ALL their listings, whatever each listing''s own switch says.';

create table if not exists public.seller_reviews (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.profiles (id) on delete cascade,
  -- Optional: which car the deal was about, if the reviewer says.
  listing_id      uuid references public.listings (id) on delete set null,
  reviewer_name   text not null,
  -- For the desk's verification only — never selected publicly.
  reviewer_phone  text not null,
  rating          integer not null check (rating between 1 and 5),
  body            text not null default '',
  status          text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  decided_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists idx_seller_reviews_seller
  on public.seller_reviews (seller_id, status, created_at desc);

alter table public.seller_reviews enable row level security;

-- The letterbox: anyone may submit...
drop policy if exists seller_reviews_insert on public.seller_reviews;
create policy seller_reviews_insert on public.seller_reviews
  for insert to anon, authenticated
  with check (status = 'pending' and char_length(reviewer_name) between 1 and 80
    and char_length(body) <= 1000);

-- ...the world reads only what the desk approved. The reviewer's phone
-- rides the row, so PUBLIC reads must go through the columns the pages
-- actually select — RLS can't hide a column, so the pages own that rule
-- and the CRM desk (service role) is the only reader of the phone.
drop policy if exists seller_reviews_select on public.seller_reviews;
create policy seller_reviews_select on public.seller_reviews
  for select to anon, authenticated
  using (status = 'approved');
