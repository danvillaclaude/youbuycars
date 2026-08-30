-- ---------------------------------------------------------------------------
-- 0023 — support requests: a help letterbox for marketplace users
-- (30 Aug 2026, the owner's spec: sellers get a "Get help" form in their
-- dashboard, buyers get one on /contact, and replies go out by EMAIL
-- from the CRM side — this site only collects the address).
--
-- The letterbox again (0002, 0010 and 0021 are the family): the public
-- keys may INSERT a request and can never read one back. A request
-- carries an email address, so service_role — the owner's CRM bridge —
-- is the ONLY reader. No select, no update, no delete policies exist
-- here on purpose; a "read your own" policy would have to reason about
-- anon-submitted rows first, and nothing on this site needs to read one.
--
-- ALREADY APPLIED via MCP (30 Aug 2026), before this commit deployed.
-- ---------------------------------------------------------------------------

create table if not exists public.support_requests (
  id          uuid primary key default gen_random_uuid(),
  -- Who asked, when a signed-in seller did. Nullable because the buyer
  -- door on /contact has no account behind it; SET NULL so deleting an
  -- account never tears out the record of what support was asked for.
  profile_id  uuid references public.profiles (id) on delete set null,
  name        text not null check (char_length(name) between 1 and 120),
  -- The reply address — the whole reason this table is dark to the
  -- public roles. Shape-checked so a typo'd address fails at submit
  -- time, not when the CRM tries to answer it.
  email       text not null check (
                email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
                and char_length(email) <= 200
              ),
  subject     text not null check (char_length(subject) between 1 and 200),
  body        text not null check (char_length(body) between 1 and 4000),
  -- Flipped to 'closed' by the CRM desk (service role), never from here.
  status      text not null default 'open'
                check (status in ('open','closed')),
  created_at  timestamptz not null default now()
);

-- The CRM's poll asks "what's still open, oldest first" — give it the
-- partial index, same shape as 0010's unforwarded index.
create index if not exists idx_support_requests_open
  on public.support_requests (created_at) where status = 'open';

alter table public.support_requests enable row level security;

-- The letterbox slot: both public roles may post a request in — and may
-- not sign it as somebody else. Null is the buyer door; a signed-in
-- submit may only claim its own profile. The length and shape limits
-- live in the column CHECKs above, so the policy doesn't repeat them.
drop policy if exists support_requests_insert on public.support_requests;
create policy support_requests_insert on public.support_requests
  for insert to anon, authenticated
  with check (profile_id is null or profile_id = auth.uid());
-- ...and that is ALL the policies. No public role ever reads a
-- stranger's email out of this table.

-- Replies, written ONLY by the CRM's service role when the owner
-- answers. The reply goes out as an actual email from the CRM side;
-- this row is the durable record of what was said.
create table if not exists public.support_replies (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.support_requests (id) on delete cascade,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_support_replies_request
  on public.support_replies (request_id, created_at);

-- RLS on, ZERO policies: with row security enabled and no policy the
-- public roles are denied everything, and service_role bypasses RLS as
-- it always does. The revoke is 0018's rule made visible — deny-by-
-- default should show in the grants, not only be implied by an absence.
alter table public.support_replies enable row level security;
revoke all on public.support_replies from anon, authenticated;
