-- ---------------------------------------------------------------------------
-- 0011 — the seller's email, on the profile (16 Aug 2026): inquiry email
-- delivery needs an address, and auth.users is unreachable from an app
-- that deliberately holds no service key. Backfilled here (migrations run
-- as postgres), kept fresh by trigger, and NEVER exposed publicly — the
-- column is readable only by its own profile, same as the inquiries.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists email text;
comment on column public.profiles.email is
  'Delivery address for inquiry emails (0011). Synced from auth.users by trigger; never selected on any public page.';

update public.profiles p
  set email = u.email
  from auth.users u
  where u.id = p.id and p.email is distinct from u.email;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

drop trigger if exists sync_profile_email on auth.users;
create trigger sync_profile_email
  after insert or update of email on auth.users
  for each row execute function public.sync_profile_email();
