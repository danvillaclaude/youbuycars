-- ---------------------------------------------------------------------------
-- 0005 — Free drops to THREE listings (the owner's call, 12 Aug 2026,
-- down from the launch five).
--
-- Only the function body changes; every check that calls tier_cap()
-- follows automatically. Sellers already holding 4-5 live/pending
-- listings are deliberately NOT trimmed: the cap gates NEW inserts, so
-- an over-cap seller simply can't add another until they're back under.
-- Nothing a customer already sees comes down.
-- ---------------------------------------------------------------------------

create or replace function public.tier_cap(t text)
returns int
language sql
immutable
as $$
  select case t when 'ultimate' then 200 when 'pro' then 25 else 3 end
$$;
