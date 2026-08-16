-- ---------------------------------------------------------------------------
-- 0012 — the email column goes dark to the public roles (16 Aug 2026).
-- RLS filters rows, not columns: profiles are anon-readable by design
-- (dealer pages), which would have made 0011's email column a harvest
-- endpoint. Column privilege is the right tool — anon and authenticated
-- lose SELECT on it, PostgREST's * expansion skips it for them, and the
-- service role (the CRM's puller, the only intended reader) is untouched.
-- ---------------------------------------------------------------------------

revoke select (email) on public.profiles from anon, authenticated;
