-- 0016 — the $/mo filter's memory (16-17 Aug 2026): a saved search
-- remembers the monthly budget for its LABEL; matching uses max_price,
-- which the save action computes from the payment at save time with the
-- same assumptions as the cards. The CRM's alert sender needs no change.
alter table public.saved_searches
  add column if not exists max_payment int;
