-- ---------------------------------------------------------------------------
-- 0001 — inquiries: the landing form's landing place. (Applied live
-- 12 Aug 2026 to project mszemeepfurgomiljdvu via MCP.)
--
-- The consent columns are the point: sms_consent records the checkbox
-- EXACTLY as submitted (unchecked = false = this person is never texted),
-- and consent_language snapshots the disclosure they saw, because a carrier
-- audit asks "what did they agree to", not "what does your site say today".
--
-- RLS is ON; policies live in 0002.
-- ---------------------------------------------------------------------------

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  looking_for text not null,
  sms_consent boolean not null default false,
  consent_language text,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;
