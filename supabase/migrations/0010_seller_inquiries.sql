-- ---------------------------------------------------------------------------
-- 0010 — per-seller inquiries (16 Aug 2026, the owner's spec from the
-- question round: the form lives on DEALER PAGES, and a CRM dealership's
-- submissions arrive in their CRM as real leads).
--
-- The letterbox again: anonymous buyers INSERT, the seller SELECTs their
-- own, nobody else reads anything. Delivery to a CRM happens from the
-- CRM's side — it already holds this project's service key, and this
-- app deliberately holds no key of the CRM's — by polling unforwarded
-- rows and stamping forwarded_at. Consent is the form's own checkbox,
-- never pre-checked, never required, recorded verbatim as a boolean.
-- ---------------------------------------------------------------------------

create table if not exists public.seller_inquiries (
  id            uuid primary key default gen_random_uuid(),
  seller_id     uuid not null references public.profiles (id) on delete cascade,
  name          text not null,
  phone         text not null,
  looking_for   text not null default '',
  -- The buyer's texting opt-in to THIS seller: the checkbox's state.
  sms_consent   boolean not null default false,
  -- Stamped by the CRM's puller once the lead exists over there.
  forwarded_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_seller_inquiries_seller
  on public.seller_inquiries (seller_id, created_at desc);
create index if not exists idx_seller_inquiries_unforwarded
  on public.seller_inquiries (created_at) where forwarded_at is null;

alter table public.seller_inquiries enable row level security;

drop policy if exists seller_inquiries_insert on public.seller_inquiries;
create policy seller_inquiries_insert on public.seller_inquiries
  for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 80
    and char_length(phone) between 7 and 30
    and char_length(looking_for) <= 1000
  );

drop policy if exists seller_inquiries_select on public.seller_inquiries;
create policy seller_inquiries_select on public.seller_inquiries
  for select to authenticated
  using (seller_id = auth.uid());
