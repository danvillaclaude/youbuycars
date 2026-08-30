-- 0020: the dealer's own website (30 Aug 2026, the dealer-page kit).
-- Shown on the dealer page as a nofollow link and carried in the
-- AutoDealer JSON-LD's sameAs. The CHECK holds the one shape the app
-- writes (normalizeWebsite: scheme added, http upgraded to https).
-- The grants follow 0018's deny-by-default rule: a new public column
-- needs its explicit GRANT, and here it is.
--
-- ALREADY APPLIED to production 30 Aug 2026 (via MCP).

alter table public.profiles add column if not exists website text
  check (website is null or (char_length(website) <= 200 and website like 'https://%'));
grant update (display_name, phone, city, about, logo_path, public_slug, financing_offered, website)
  on public.profiles to authenticated;
grant select (id, display_name, phone, is_admin, created_at, tier, approved_at,
  declined_at, suspended_at, about, city, logo_path, public_slug, is_crm,
  crm_org_id, financing_offered, is_buyer, website)
  on public.profiles to anon, authenticated;
