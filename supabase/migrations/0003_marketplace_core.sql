-- ---------------------------------------------------------------------------
-- 0003 — Phase 1: the marketplace's bones (sellers, listings, photos).
--
-- The owner's spec (Drive, 11 Aug 2026) + three decisions (12 Aug 2026):
-- moderation queue ON from day one (a listing is born 'pending' and only an
-- admin makes it 'active'), free cap of FIVE active+pending listings per
-- seller (enforced server-side AND by trigger — the spec's own rule: never
-- frontend-only), VIN optional. Slugs are permanent: a sold listing keeps
-- its URL and renders as sold, never a 404 (the spec's SEO rule).
-- ---------------------------------------------------------------------------

-- Sellers. One row per auth user, created by trigger on signup.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone text,
  -- The owner. SQL-set only, same discipline as the CRM's is_owner.
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Security-definer so RLS policies can ask without recursing into profiles.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
$$;

create policy "own profile read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid() and is_admin = false or public.is_admin());

-- The listings themselves.
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  year int not null check (year between 1900 and 2100),
  make text not null check (length(trim(make)) > 0),
  model text not null check (length(trim(model)) > 0),
  trim_level text,
  vin text, -- Optional by the owner's call; credibility, not a gate.
  mileage int not null check (mileage >= 0),
  price int not null check (price >= 0),
  description text not null default '',
  -- pending → active (admin approves) → sold (seller marks). rejected is
  -- the admin's no. There is no path where a seller makes their own
  -- listing active — the trigger below enforces what the UI promises.
  status text not null default 'pending'
    check (status in ('pending', 'active', 'rejected', 'sold')),
  -- Permanent, SEO-friendly, survives the sale. Never regenerated.
  slug text not null unique,
  rejected_reason text,
  approved_at timestamptz,
  sold_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_idx on public.listings (status);
create index listings_seller_idx on public.listings (seller_id);
create index listings_make_idx on public.listings (lower(make));

alter table public.listings enable row level security;

-- The public sees live inventory and sold history (permanent URLs);
-- sellers see their own whatever the state; the admin sees everything.
create policy "public reads live and sold" on public.listings
  for select using (status in ('active', 'sold'));
create policy "seller reads own" on public.listings
  for select using (seller_id = auth.uid());
create policy "admin reads all" on public.listings
  for select using (public.is_admin());
create policy "seller inserts own" on public.listings
  for insert with check (seller_id = auth.uid());
create policy "seller updates own" on public.listings
  for update using (seller_id = auth.uid());
create policy "admin updates any" on public.listings
  for update using (public.is_admin());
create policy "seller deletes own pending" on public.listings
  for delete using (seller_id = auth.uid() and status in ('pending', 'rejected'));
create policy "admin deletes any" on public.listings
  for delete using (public.is_admin());

/*
 * The guardrail trigger — RLS says WHO may write, this says WHAT they may
 * write. Three rules, all mirroring the CRM's governance instincts:
 *   1. Only an admin makes a listing 'active' (the moderation queue).
 *   2. A seller editing the substance of a LIVE listing sends it back to
 *      'pending' — the admin approved specific words and numbers, not the
 *      listing forever (the same rule as the CRM's role proposals).
 *   3. The cap: five pending+active per seller, counted at the door.
 */
create or replace function public.listings_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  live_count int;
begin
  if tg_op = 'INSERT' then
    if new.status <> 'pending' and not public.is_admin() then
      new.status := 'pending';
    end if;
    select count(*) into live_count from public.listings
      where seller_id = new.seller_id and status in ('pending', 'active');
    if live_count >= 5 and not public.is_admin() then
      raise exception 'listing cap reached (5 active or pending per seller)';
    end if;
    return new;
  end if;

  -- UPDATE
  if not public.is_admin() then
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

create trigger listings_guard_trigger
  before insert or update on public.listings
  for each row execute function public.listings_guard();

-- Photos: rows here, files in storage (bucket below).
create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index listing_photos_listing_idx on public.listing_photos (listing_id);

alter table public.listing_photos enable row level security;

create policy "photos follow their listing" on public.listing_photos
  for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (l.status in ('active', 'sold') or l.seller_id = auth.uid() or public.is_admin())
    )
  );
create policy "seller manages own photos" on public.listing_photos
  for all using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.seller_id = auth.uid()
    )
  );
create policy "admin manages any photos" on public.listing_photos
  for all using (public.is_admin());

-- The photo bucket: public to view (it's a marketplace), and each seller
-- writes only inside a folder named by their own user id.
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "public views listing photos" on storage.objects
  for select using (bucket_id = 'listing-photos');
create policy "seller uploads to own folder" on storage.objects
  for insert with check (
    bucket_id = 'listing-photos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "seller deletes from own folder" on storage.objects
  for delete using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
