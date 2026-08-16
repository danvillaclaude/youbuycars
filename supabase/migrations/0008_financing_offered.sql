-- ---------------------------------------------------------------------------
-- 0008 — the financing switch, per listing (15 Aug 2026, the owner:
-- "the seller may not want to offer financing"). When off, the listing
-- shows no est./mo and no payment calculator — a cash-only car must not
-- wear a monthly payment it doesn't offer.
--
-- Default TRUE: every existing listing keeps today's behaviour, and the
-- form's checkbox is the opt-out. Deliberately NOT in the re-pend
-- trigger's watched columns: the toggle changes presentation, not the
-- approved words and numbers.
-- ---------------------------------------------------------------------------

alter table public.listings
  add column financing_offered boolean not null default true;
comment on column public.listings.financing_offered is
  'Per-listing switch (0008): whether the listing shows the est./mo and payment calculator. Off = cash-only presentation.';
