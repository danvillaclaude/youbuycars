-- ---------------------------------------------------------------------------
-- 0013 — buyer↔seller messaging (16 Aug 2026, the owner's spec from the
-- question round: buyers are EMAIL MAGIC-LINK accounts, and for a CRM
-- dealership the conversation goes full two-way over the bridge).
--
-- THE BUYER FLAG FIRST: every new auth user gets a profiles row from
-- handle_new_user, which until now meant every signup entered the
-- SELLER approval queue. A buyer clicking a magic link must not appear
-- on the owner's Signups desk as a pending dealer — is_buyer marks them
-- at birth from the sign-in metadata, the desk filters them out, and
-- nothing about the seller gate changes.
--
-- CHATS: one row per buyer↔seller pair (optionally anchored to the
-- listing that started it). Participants read and write their own side;
-- nobody else reads anything. crm_synced_at on messages is the CRM
-- puller's stamp — the same forwarded_at pattern the inquiries taught.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column is_buyer boolean not null default false;
comment on column public.profiles.is_buyer is
  'Magic-link buyer account (0013): never enters the seller approval queue, never listed on the Signups desk.';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, is_buyer)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data ->> 'is_buyer')::boolean, false)
  );
  return new;
end;
$$;

create table if not exists public.chats (
  id               uuid primary key default gen_random_uuid(),
  seller_id        uuid not null references public.profiles (id) on delete cascade,
  buyer_id         uuid not null references public.profiles (id) on delete cascade,
  listing_id       uuid references public.listings (id) on delete set null,
  last_message_at  timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index if not exists idx_chats_seller on public.chats (seller_id, last_message_at desc);
create index if not exists idx_chats_buyer on public.chats (buyer_id, last_message_at desc);

create table if not exists public.chat_messages (
  id             uuid primary key default gen_random_uuid(),
  chat_id        uuid not null references public.chats (id) on delete cascade,
  sender         text not null check (sender in ('buyer', 'seller')),
  body           text not null check (char_length(body) between 1 and 2000),
  -- The CRM puller's stamp on buyer messages; seller messages written BY
  -- the CRM over the bridge arrive pre-stamped so the puller skips them.
  crm_synced_at  timestamptz,
  created_at     timestamptz not null default now()
);

create index if not exists idx_chat_messages_chat
  on public.chat_messages (chat_id, created_at);
create index if not exists idx_chat_messages_unsynced
  on public.chat_messages (created_at) where crm_synced_at is null and sender = 'buyer';

alter table public.chats enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists chats_select on public.chats;
create policy chats_select on public.chats
  for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

-- A buyer starts a chat with a seller; sellers never cold-open one.
drop policy if exists chats_insert on public.chats;
create policy chats_insert on public.chats
  for insert to authenticated
  with check (buyer_id = auth.uid());

drop policy if exists chat_messages_select on public.chat_messages;
create policy chat_messages_select on public.chat_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- You may only speak AS the side you are.
drop policy if exists chat_messages_insert on public.chat_messages;
create policy chat_messages_insert on public.chat_messages
  for insert to authenticated
  with check (
    exists (
      select 1 from public.chats c
      where c.id = chat_id
        and ((sender = 'buyer' and c.buyer_id = auth.uid())
          or (sender = 'seller' and c.seller_id = auth.uid()))
    )
  );
