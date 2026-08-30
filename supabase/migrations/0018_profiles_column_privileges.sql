-- APPLIED to production 30 Aug 2026 (via MCP, at the owner's "can we do
-- this??"). Verified: tier/approved_at UPDATE and email/reviewer_phone
-- SELECT all false for public roles; own-profile edits and public reads
-- kept. Safe to re-run.
-- 0018: governance columns go read-only to the public roles, and the
-- email column actually goes dark (23 Aug 2026 overnight audit).
--
-- Verified live before writing this: has_column_privilege('authenticated',
-- 'public.profiles','tier','UPDATE') = true, same for approved_at — so any
-- signed-in seller could `update profiles set tier='ultimate',
-- approved_at=now(), suspended_at=null where id=auth.uid()` from the
-- browser console with the public key. The RLS policy only stops
-- is_admin. And has_column_privilege('anon','public.profiles','email',
-- 'SELECT') was STILL true: 0012's column-level REVOKE was a no-op,
-- because a column REVOKE does nothing while the table-level GRANT
-- stands. The fix is the other way round — revoke at the table, grant
-- back per column. service_role (the CRM bridge, which is what approves,
-- tiers and suspends) is untouched. The app never selects * from
-- profiles and only ever updates the seven columns granted below.

revoke update on public.profiles from anon, authenticated;
grant update (display_name, phone, city, about, logo_path, public_slug, financing_offered)
  on public.profiles to authenticated;

revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, phone, is_admin, created_at, tier, approved_at,
  declined_at, suspended_at, about, city, logo_path, public_slug, is_crm,
  crm_org_id, financing_offered, is_buyer)
  on public.profiles to anon, authenticated;

-- Verify after running — the first four must be false, the last two true:
-- select has_column_privilege('authenticated','public.profiles','tier','UPDATE'),
--        has_column_privilege('authenticated','public.profiles','approved_at','UPDATE'),
--        has_column_privilege('anon','public.profiles','email','SELECT'),
--        has_column_privilege('authenticated','public.profiles','email','SELECT'),
--        has_column_privilege('authenticated','public.profiles','phone','UPDATE'),
--        has_column_privilege('anon','public.profiles','display_name','SELECT');

-- seller_reviews: the same no-op, the same fix. reviewer_phone exists so
-- the owner's desk can ask "did this number actually deal with them" —
-- the app never selects it publicly, but the public key could. Verified
-- live: has_column_privilege('anon','public.seller_reviews',
-- 'reviewer_phone','SELECT') was true. Deny the table, grant the public
-- columns. RULE FROM HERE ON: a new public-readable column on profiles or
-- seller_reviews needs an explicit GRANT here — deny-by-default is the point.
revoke select on public.seller_reviews from anon, authenticated;
grant select (id, seller_id, listing_id, reviewer_name, rating, body, status, decided_at, created_at)
  on public.seller_reviews to anon, authenticated;

-- Buckets: both accepted any file of any size from any signed-in account.
-- A size cap and an image allowlist (the formats the render/image
-- transformer and every browser can paint — a HEIC used to upload and
-- then show as a broken tile).
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif','image/gif']
 where id = 'listing-photos';
update storage.buckets
   set file_size_limit = 3145728,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif']
 where id = 'dealer-logos';

-- Verify: both must be false.
-- select has_column_privilege('anon','public.seller_reviews','reviewer_phone','SELECT'),
--        has_column_privilege('authenticated','public.seller_reviews','reviewer_phone','SELECT');
