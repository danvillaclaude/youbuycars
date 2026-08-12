# YouBuyCars

The public face of YouBuyCars (youbuycars.com): today a compliance-complete
landing site — inquiry form, texting-consent documentation, privacy/terms —
and the foundation the vehicle marketplace (see the Product Spec and Build
Roadmap in the Drive folder) grows on.

**Stack:** Next.js 16 (App Router, TS) · Tailwind v4 · Supabase (project
`mszemeepfurgomiljdvu`, us-east-2) · Vercel.

## The one rule

The compliance copy on `/` (the consent checkbox block, the Text-START
disclosure, the three opt-in paths), `/sms-consent`, `/privacy` and
`/terms` is **registered with mobile carriers** via the A2P 10DLC campaign
(see `A2P-RESUBMISSION.md`). Changing those words means updating the
campaign registration too — never reword them casually.

## Map

- `app/page.tsx` — landing: hero, Text-START band, form, consent story
- `app/sms-consent/` — the proof page carriers verify (error 30909's fix)
- `app/privacy/`, `app/terms/` — ported verbatim from the original site
- `app/about/`, `app/contact/` — the business's face
- `app/actions.ts` — the form's server action → `inquiries` table
- `lib/site.ts` — every business fact (phone, email) lives here once
- `supabase/migrations/` — applied live via MCP; kept here as the record

## Local dev

```bash
npm install
npm run dev   # port 3100 (3000 belongs to the iSellCars CRM)
```

`.env.local` needs only the PUBLIC Supabase pair (see `.env.example`) —
there is deliberately no service-role key in this app: the inquiries table
is a letterbox (anon INSERT only, migration 0002).
