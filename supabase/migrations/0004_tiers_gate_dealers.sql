-- ---------------------------------------------------------------------------
-- 0004 — tiers, the signup gate, suspension, and public dealer pages.
--
-- The owner's design (12 Aug 2026, three question rounds):
--   TIERS: free = 5 listings, pro = 25 ($100/mo), ultimate = 200 ($500/mo).
--   CRM dealerships get Pro FREE via a linked account (is_crm + crm_org_id);
--   payments wire up when Stripe exists — until then tier changes are the
--   owner's hand in Members.
--   THE GATE: public signups are requests. approved_at NULL = waiting at
--   the wall (can authenticate, gets nowhere); declined_at set = blocked
--   but KEPT, so a change of heart can still approve later.
--   SUSPENSION: reversible, never a delete. Login walled, listings hidden
--   from the board instantly, dealer page dark — reinstate and it all
--   comes back.
--   DEALER PAGES: /sellers/[slug] — name, phone, about, city, logo, live
--   listings. Public by design for approved, unsuspended sellers.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column tier text not null default 'free'
    check (tier in ('free', 'pro', 'ultimate')),
  add column approved_at timestamptz,
  add column declined_at timestamptz,
  add column suspended_at timestamptz,
  add column about text,
  add column city text,
  add column logo_path text,
  add column public_slug text unique,
  add column is_crm boolean not null default false,
  add column crm_org_id uuid;

create index profiles_crm_org_idx on public.profiles (crm_org_id);

-- One place answers "how many cars does this tier allow".
create or replace function public.tier_cap(t text)
returns int
language sql
immutable
as $$
  select case t when 'ultimate' then 200 when 'pro' then 25 else 5 end
$$;

-- Public dealer pages: the world may read APPROVED, UNSUSPENDED sellers.
-- (The phone is deliberately public — it's on the dealer page by design.)
create policy "public reads approved sellers" on public.profiles
  for select using (approved_at is not null and suspended_at is null);

-- A suspended seller's inventory leaves the board instantly, without
-- touching the listings themselves — reinstatement is a profile update.
drop policy "public reads live and sold" on public.listings;
create policy "public reads live and sold" on public.listings
  for select using (
    status in ('active', 'sold')
    and exists (
      select 1 from public.profiles p
      where p.id = seller_id and p.suspended_at is null
    )
  );

/*
 * The guard grows up (replaces 0003's):
 *   - Cap by TIER, enforced for everyone except a signed-in admin —
 *     including the CRM's service-role writes, so a Pro dealership's 26th
 *     car bounces no matter which door it came through.
 *   - Activation: a signed-in admin OR the service role (the CRM owner
 *     channel authorizes on its own side before it touches this table).
 *   - The un-approved and the suspended cannot write at all.
 *   - Re-pend-on-edit applies to SELLERS editing live listings; the CRM
 *     does its own re-pend in code (service role edits pass through).
 *   - Slugs stay permanent for absolutely everyone.
 */
create or replace function public.listings_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  live_count int;
  seller_tier text;
  seller_ok boolean;
  privileged boolean;
begin
  privileged := public.is_admin() or auth.role() = 'service_role';

  select tier, (approved_at is not null and suspended_at is null)
    into seller_tier, seller_ok
    from public.profiles where id = new.seller_id;

  if tg_op = 'INSERT' then
    if not privileged then
      if not coalesce(seller_ok, false) then
        raise exception 'this account cannot post listings';
      end if;
      if new.status <> 'pending' then
        new.status := 'pending';
      end if;
    end if;
    if not public.is_admin() then
      select count(*) into live_count from public.listings
        where seller_id = new.seller_id and status in ('pending', 'active');
      if live_count >= public.tier_cap(coalesce(seller_tier, 'free')) then
        raise exception 'listing cap reached (% for this plan)',
          public.tier_cap(coalesce(seller_tier, 'free'));
      end if;
    end if;
    return new;
  end if;

  -- UPDATE
  if not privileged then
    if new.status = 'active' and old.status <> 'active' then
      raise exception 'only an admin can activate a listing';
    end if;
    if old.status = 'active' and new.status = 'active' and (
      new.year <> old.year or new.make <> old.make or new.model <> old.model
      or coalesce(new.trim_level, '') <> coalesce(old.trim_level, '')
      or coalesce(new.vin, '') <> coalesce(old.vin, '')
      or new.mileage <> old.mileage or new.price <> old.price
      or new.description <> old.description
    ) then
      new.status := 'pending';
      new.approved_at := null;
    end if;
  end if;
  if new.slug <> old.slug then
    raise exception 'slugs are permanent';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

-- The dealer-logos bucket, public like listing photos; sellers write only
-- their own folder, the service role (CRM) writes anywhere.
insert into storage.buckets (id, name, public)
values ('dealer-logos', 'dealer-logos', true)
on conflict (id) do nothing;

create policy "public views dealer logos" on storage.objects
  for select using (bucket_id = 'dealer-logos');
create policy "seller uploads own logo" on storage.objects
  for insert with check (
    bucket_id = 'dealer-logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "seller replaces own logo" on storage.objects
  for update using (
    bucket_id = 'dealer-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "seller deletes own logo" on storage.objects
  for delete using (
    bucket_id = 'dealer-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
