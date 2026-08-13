-- ---------------------------------------------------------------------------
-- 0006 — Free settles at ONE listing (the owner's call, 12 Aug 2026,
-- revising the same evening's drop to three; launched at five).
--
-- The reasoning: Free is for a person selling their own car. More than
-- one live listing at a time is a business, and businesses have plans.
--
-- Same shape as 0005: only the function body changes, every check that
-- calls tier_cap() follows. Sellers already over the cap keep what's
-- live — the cap gates NEW inserts only, so nothing a customer already
-- sees comes down.
-- ---------------------------------------------------------------------------

create or replace function public.tier_cap(t text)
returns int
language sql
immutable
as $$
  select case t when 'ultimate' then 200 when 'pro' then 25 else 1 end
$$;
