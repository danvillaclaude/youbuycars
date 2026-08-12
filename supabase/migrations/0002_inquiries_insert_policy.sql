-- ---------------------------------------------------------------------------
-- 0002 — the letterbox policy: the anon key may INSERT an inquiry and do
-- nothing else. No select, no update, no delete — a submitted inquiry is
-- readable only from the dashboard (and later, the seller/admin UI with
-- real auth). This is what lets the public form run on the publishable key
-- with no service-role secret in the web app at all. (Applied live
-- 12 Aug 2026.)
-- ---------------------------------------------------------------------------

create policy "public can submit an inquiry"
  on public.inquiries
  for insert
  to anon
  with check (true);
