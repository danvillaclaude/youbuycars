-- ---------------------------------------------------------------------------
-- 0024 — Free moves back to THREE listings (the owner's call, 1 Sep 2026).
--
-- Reversing the 0006 drop to one. The reasoning changed with the stage: an
-- early marketplace needs inventory more than it needs to draw a hard line
-- at private-vs-business, so the free tier is more generous while supply is
-- being built. Three is enough to try the marketplace, not enough to run a
-- business on — Pro (25) is still where a real seller lives.
--
-- Same shape as 0005/0006: only the function body changes, and every check
-- that calls tier_cap() follows. Loosening a cap never fails a live listing;
-- it only lets sellers who were at one now post more.
-- ---------------------------------------------------------------------------

create or replace function public.tier_cap(t text)
returns int
language sql
immutable
as $$
  select case t when 'ultimate' then 200 when 'pro' then 25 else 3 end
$$;

-- The trade-in guide (a published research_posts row, seeded in 0022) named
-- the old cap in passing: "One active listing costs nothing". Drop the count
-- so the guide can't understate the free tier — and won't need touching if
-- the cap ever moves again. Targeted string swap inside the JSON.
update public.research_posts
set sections = replace(
  sections::text,
  'One active listing costs nothing',
  'Listing your car costs nothing'
)::jsonb
where sections::text like '%One active listing costs nothing%';
