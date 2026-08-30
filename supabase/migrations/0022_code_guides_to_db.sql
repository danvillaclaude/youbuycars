-- 0022: the five code guides move into the database (29 Aug 2026).
-- Since 0019 a guide is a row in research_posts; the original five were
-- still JSX in app/research/articles.tsx, so the site read two sources.
-- This migration makes the table the ONLY source: the five are inserted
-- as PUBLISHED rows with their slugs and titles byte-identical to the
-- code versions, so no URL changes and nothing 404s.
--
-- The prose is transcribed VERBATIM from articles.tsx (written under
-- the archive's rules: no invented statistics, no fee amounts, no legal
-- advice) — JSX entities decoded to the characters they rendered
-- (&apos; &ldquo; &rdquo;), multi-line JSX text collapsed to the single
-- spaces React rendered, and the test-drive/texting checklists' <li>
-- rows carried as paragraphs keeping their literal bullet prefix ("• "),
-- which the renderer (app/research/post-body.tsx) styles with the same
-- tighter spacing the <li> rows had. No links existed in these five, so
-- no [label](href) encoding was needed.
--
-- published_at is the real date: all five shipped in commit 648974b
-- ("The research archive opens", Sun Aug 16 23:47:51 2026 -0400). The
-- one-second decrements below are not data — they only pin the hub's
-- display order (fetchPublishedPosts sorts newest-first) to the order
-- the ARTICLES array always listed them in.
--
-- ALREADY APPLIED via MCP (30 Aug 2026), before this commit deployed —
-- the deploy-order requirement below is satisfied.
-- Apply by running this file against production (operator's step; the
-- deploy that deletes articles.tsx should land with or after it, or the
-- five guides vanish from the site until the rows exist).

insert into public.research_posts (slug, title, dek, minutes, sections, status, published_at) values
(
  'how-to-buy-a-used-car-in-michigan',
  'How to buy a used car in Michigan, start to finish',
  'Budget, find, vet, deal, paperwork — the whole road in one page, written for Metro Detroit.',
  6,
  $sect$[
{"heading":"1. Set the budget by the month, not the sticker","paragraphs":["Most people pay monthly, so start there: what payment fits your life, at a term you can live with? Every financed listing on YouBuyCars has a payment calculator — set your down payment, term, and credit range, and work backward to the price bracket that actually fits. Remember the number on the windshield isn't the whole cost: Michigan sales tax, title and registration, and your insurance change all ride along."]},
{"heading":"2. Find candidates without living on your phone","paragraphs":["Browse the board with real filters — body style, year, price, mileage — and when the right car isn't there yet, save the search with your email. You'll get one letter when a match goes live, the day it's approved. Heart the maybes and they'll wait for you on your saved list."]},
{"heading":"3. Vet the car, not the ad","paragraphs":["Ask for the VIN (listings that show one are a good sign) and run a history report. Look for a clean title, how many owners, and whether accident damage was reported. Then drive it — see the test-drive checklist in this archive — and if you're serious, a pre-purchase inspection at an independent shop is the cheapest insurance you'll ever buy."]},
{"heading":"4. Deal directly with the seller","paragraphs":["Every listing here connects you straight to whoever's selling it — text, call, or message on-site. Agree on the price, what's included, and how you'll pay before you show up. A serious seller will hold a car briefly for a scheduled test drive; nobody serious asks for money to “hold” a car you haven't seen."]},
{"heading":"5. The paperwork","paragraphs":["In Michigan, the title transfer and registration happen through the Secretary of State. The seller signs the title over to you; you handle the transfer, pay sales tax on the purchase, and you'll need Michigan no-fault insurance in place before you drive it on a plate of your own. Buying from a dealer? They usually handle the paperwork for you and roll the fees into the deal — ask for the out-the-door number so there are no surprises."]}
]$sect$::jsonb,
  'published',
  timestamptz '2026-08-16 23:47:51-04'
),
(
  'used-car-financing-explained',
  'Used-car financing, explained like a person',
  'APR, term, down payment, credit tiers — what actually moves your monthly payment.',
  5,
  $sect$[
{"heading":"The three dials","paragraphs":["A car payment is three dials: the amount financed (price minus your down payment and any trade), the APR (the yearly cost of borrowing), and the term (how many months). Turn any one and the payment moves. A longer term lowers the monthly number but raises the total you pay — 72 months costs more than 48 for the same car, every time."]},
{"heading":"Why credit changes the number","paragraphs":["Lenders price risk. Stronger credit usually means a lower APR; rebuilding credit means a higher one. That's why the calculator on every financed listing here asks how your credit is — it moves the assumed APR band so the estimate is honest for you, not for someone else. None of it is an offer of credit: your real rate comes from a lender after an application."]},
{"heading":"Down payments do double duty","paragraphs":["Money down shrinks the financed amount and it makes you a better risk on paper — both help. It also protects you from being upside down (owing more than the car is worth) in the early years, when depreciation moves fastest."]},
{"heading":"Get real numbers before you fall in love","paragraphs":["Run the calculator on any listing, then talk to the seller about financing — dealers here can take a credit application by text and come back with real numbers. Walking in already knowing your bracket is the strongest position a buyer has."]}
]$sect$::jsonb,
  'published',
  timestamptz '2026-08-16 23:47:50-04'
),
(
  'test-drive-checklist',
  'The test-drive checklist',
  'Fifteen minutes, no tools, and most problem cars tell on themselves.',
  4,
  $sect$[
{"heading":"Before you turn the key","paragraphs":["Come when the engine is cold — a cold start is the most honest thing a used car does. Look under it for fresh drips, check the tires for even wear (uneven wear whispers about alignment or suspension), and open everything: doors, trunk, hood, fuel door. Check that the VIN on the dash matches the title and the ad."]},
{"heading":"The cold start","paragraphs":["Listen for long cranking, rattles that fade as it warms, or smoke on startup. Watch the dash: every warning light should come on with the key and then go OFF. A check-engine light that never illuminates at all can mean the bulb was pulled — that's a walk-away sign."]},
{"heading":"On the road","paragraphs":["• Brake firmly once from speed on an empty stretch — pulling, pulsing, or grinding is money.","• Let the wheel go light-handed on a straight road: the car should track straight.","• Take a highway ramp — listen for wheel-bearing hum and feel for shudder on acceleration.","• Work everything electric: windows, locks, seats, cameras, climate on both hot and cold."]},
{"heading":"Then let a pro finish it","paragraphs":["If the car passes your fifteen minutes, a pre-purchase inspection at an independent shop settles the rest. A seller who won't allow one has answered your question a different way."]}
]$sect$::jsonb,
  'published',
  timestamptz '2026-08-16 23:47:49-04'
),
(
  'trade-in-vs-selling-yourself',
  'Trade it in, or sell it yourself?',
  'The honest math between convenience and top dollar — and Michigan''s trade-in tax angle.',
  4,
  $sect$[
{"heading":"What trading in buys you","paragraphs":["One trip, no strangers, no listing photos, and the car's value comes straight off your next deal. Michigan also gives a sales-tax credit on trade-ins — you're taxed on the difference rather than the full price of the new car, up to a yearly cap — which quietly narrows the gap between a trade offer and a private-sale price. Ask the dealer to show the tax credit in the numbers."]},
{"heading":"What selling yourself buys you","paragraphs":["Usually a better price — retail instead of wholesale. The cost is your time: photos, messages, test drives with strangers, and the paperwork. If the spread is small after the tax credit, the trade often wins on effort alone. If the spread is thousands, the weekend of work can be the best-paying job you'll do all year."]},
{"heading":"A third road","paragraphs":["List it free on YouBuyCars. One active listing costs nothing, a real person reviews it before it goes live, and buyers reach you by text or on-site message — your number never sits on a classifieds board. You get private-sale money with less of the private-sale circus."]}
]$sect$::jsonb,
  'published',
  timestamptz '2026-08-16 23:47:48-04'
),
(
  'how-texting-a-dealer-works',
  'How texting a dealer works (and why it beats phone tag)',
  'What happens when you text about a car, what the rules are, and how to stay in control.',
  3,
  $sect$[
{"heading":"Why text at all","paragraphs":["A text answers when you're free, not when the phone rings. You get numbers in writing, links to the actual car, and a record of what was said — no hold music, no “let me check with my manager, call back at five.”"]},
{"heading":"You're in control, by law and by design","paragraphs":["Texting is consent-based: a business can text you about your inquiry because you started the conversation or agreed to it — and the word STOP ends it, immediately, any time you send it. On YouBuyCars, contacting a seller is always your move first: tap Text, send a message on-site, or tick the consent box on a dealer page form. Nothing is pre-checked, and nothing is required."]},
{"heading":"What to ask over text","paragraphs":["• “Is it still available?” — the classic, and still the right opener.","• “Any accidents or title issues? Can you send the VIN?”","• “What's the out-the-door price?” — the number with tax and fees in it.","• “When can I drive it?” — a serious seller answers with a time."]}
]$sect$::jsonb,
  'published',
  timestamptz '2026-08-16 23:47:47-04'
)
on conflict (slug) do nothing;
