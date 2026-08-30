-- APPLIED to production 30 Aug 2026 (via MCP, at the owner's "can we do
-- this??"). Kept for the schema's record; safe to re-run (idempotent).
-- 0017: the inbox learns to reorder (23 Aug 2026 overnight audit).
--
-- chats has SELECT and INSERT policies and nothing else, so the app's
-- `update chats set last_message_at = now()` after every send matched
-- ZERO rows under RLS — silently, as RLS does. Every thread kept its
-- creation time forever: the inbox never reordered and the date beside
-- each thread was the day it was opened, not the last word.
--
-- The fix is a trigger, not an UPDATE policy: nobody should be able to
-- rewrite buyer_id, seller_id or listing_id on a chat, and a policy
-- wide enough to stamp one column is wide enough to touch them all.
-- The database stamps the column itself, from the message's own
-- created_at, so the two can never disagree.

create or replace function public.touch_chat_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chats
     set last_message_at = new.created_at
   where id = new.chat_id
     and last_message_at < new.created_at;
  return new;
end;
$$;

drop trigger if exists chat_messages_touch_chat on public.chat_messages;
create trigger chat_messages_touch_chat
  after insert on public.chat_messages
  for each row execute function public.touch_chat_last_message();

-- Backfill: any thread whose stamp fell behind its newest message.
update public.chats c
   set last_message_at = m.latest
  from (
    select chat_id, max(created_at) as latest
      from public.chat_messages
     group by chat_id
  ) m
 where m.chat_id = c.id
   and c.last_message_at < m.latest;
