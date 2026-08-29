/**
 * The research archive's content, as data (his ask, 16 Aug 2026: "I
 * love that cargurus offers research archive"). One template renders
 * every article — the teardown's build-the-template lesson — and this
 * file is where a new guide gets added.
 *
 * WRITING RULES, load-bearing: every guide is honest and general —
 * no invented statistics, no fee amounts that drift out of date, no
 * legal advice. Michigan facts stay at the level that doesn't rot
 * (the Secretary of State handles titles; insurance before you drive).
 */

export interface Article {
  slug: string;
  title: string;
  dek: string;
  minutes: number;
  /**
   * A draft renders at its URL with a banner and noindex, and is listed
   * nowhere — so the owner can read it in place before it goes live
   * (his rule for the Michigan cluster). Publishing = moving the object
   * from draft-articles.tsx into ARTICLES and dropping this flag.
   */
  draft?: boolean;
  body: React.ReactNode;
}

export const h2 = "mt-8 text-lg font-bold text-slate-900";
export const p = "mt-3 text-sm leading-relaxed text-slate-600";
const li = "mt-2 text-sm leading-relaxed text-slate-600";

export const ARTICLES: Article[] = [
  {
    slug: "how-to-buy-a-used-car-in-michigan",
    title: "How to buy a used car in Michigan, start to finish",
    dek: "Budget, find, vet, deal, paperwork — the whole road in one page, written for Metro Detroit.",
    minutes: 6,
    body: (
      <>
        <h2 className={h2}>1. Set the budget by the month, not the sticker</h2>
        <p className={p}>
          Most people pay monthly, so start there: what payment fits your
          life, at a term you can live with? Every financed listing on
          YouBuyCars has a payment calculator — set your down payment, term,
          and credit range, and work backward to the price bracket that
          actually fits. Remember the number on the windshield isn&apos;t the
          whole cost: Michigan sales tax, title and registration, and your
          insurance change all ride along.
        </p>
        <h2 className={h2}>2. Find candidates without living on your phone</h2>
        <p className={p}>
          Browse the board with real filters — body style, year, price,
          mileage — and when the right car isn&apos;t there yet, save the
          search with your email. You&apos;ll get one letter when a match
          goes live, the day it&apos;s approved. Heart the maybes and
          they&apos;ll wait for you on your saved list.
        </p>
        <h2 className={h2}>3. Vet the car, not the ad</h2>
        <p className={p}>
          Ask for the VIN (listings that show one are a good sign) and run a
          history report. Look for a clean title, how many owners, and
          whether accident damage was reported. Then drive it — see the
          test-drive checklist in this archive — and if you&apos;re serious,
          a pre-purchase inspection at an independent shop is the cheapest
          insurance you&apos;ll ever buy.
        </p>
        <h2 className={h2}>4. Deal directly with the seller</h2>
        <p className={p}>
          Every listing here connects you straight to whoever&apos;s selling
          it — text, call, or message on-site. Agree on the price, what&apos;s
          included, and how you&apos;ll pay before you show up. A serious
          seller will hold a car briefly for a scheduled test drive; nobody
          serious asks for money to &ldquo;hold&rdquo; a car you haven&apos;t
          seen.
        </p>
        <h2 className={h2}>5. The paperwork</h2>
        <p className={p}>
          In Michigan, the title transfer and registration happen through the
          Secretary of State. The seller signs the title over to you; you
          handle the transfer, pay sales tax on the purchase, and you&apos;ll
          need Michigan no-fault insurance in place before you drive it on a
          plate of your own. Buying from a dealer? They usually handle the
          paperwork for you and roll the fees into the deal — ask for the
          out-the-door number so there are no surprises.
        </p>
      </>
    ),
  },
  {
    slug: "used-car-financing-explained",
    title: "Used-car financing, explained like a person",
    dek: "APR, term, down payment, credit tiers — what actually moves your monthly payment.",
    minutes: 5,
    body: (
      <>
        <h2 className={h2}>The three dials</h2>
        <p className={p}>
          A car payment is three dials: the amount financed (price minus your
          down payment and any trade), the APR (the yearly cost of borrowing),
          and the term (how many months). Turn any one and the payment moves.
          A longer term lowers the monthly number but raises the total you
          pay — 72 months costs more than 48 for the same car, every time.
        </p>
        <h2 className={h2}>Why credit changes the number</h2>
        <p className={p}>
          Lenders price risk. Stronger credit usually means a lower APR;
          rebuilding credit means a higher one. That&apos;s why the
          calculator on every financed listing here asks how your credit is —
          it moves the assumed APR band so the estimate is honest for you,
          not for someone else. None of it is an offer of credit: your real
          rate comes from a lender after an application.
        </p>
        <h2 className={h2}>Down payments do double duty</h2>
        <p className={p}>
          Money down shrinks the financed amount and it makes you a better
          risk on paper — both help. It also protects you from being upside
          down (owing more than the car is worth) in the early years, when
          depreciation moves fastest.
        </p>
        <h2 className={h2}>Get real numbers before you fall in love</h2>
        <p className={p}>
          Run the calculator on any listing, then talk to the seller about
          financing — dealers here can take a credit application by text and
          come back with real numbers. Walking in already knowing your
          bracket is the strongest position a buyer has.
        </p>
      </>
    ),
  },
  {
    slug: "test-drive-checklist",
    title: "The test-drive checklist",
    dek: "Fifteen minutes, no tools, and most problem cars tell on themselves.",
    minutes: 4,
    body: (
      <>
        <h2 className={h2}>Before you turn the key</h2>
        <p className={p}>
          Come when the engine is cold — a cold start is the most honest
          thing a used car does. Look under it for fresh drips, check the
          tires for even wear (uneven wear whispers about alignment or
          suspension), and open everything: doors, trunk, hood, fuel door.
          Check that the VIN on the dash matches the title and the ad.
        </p>
        <h2 className={h2}>The cold start</h2>
        <p className={p}>
          Listen for long cranking, rattles that fade as it warms, or smoke
          on startup. Watch the dash: every warning light should come on with
          the key and then go OFF. A check-engine light that never
          illuminates at all can mean the bulb was pulled — that&apos;s a
          walk-away sign.
        </p>
        <h2 className={h2}>On the road</h2>
        <ul>
          <li className={li}>
            • Brake firmly once from speed on an empty stretch — pulling,
            pulsing, or grinding is money.
          </li>
          <li className={li}>
            • Let the wheel go light-handed on a straight road: the car
            should track straight.
          </li>
          <li className={li}>
            • Take a highway ramp — listen for wheel-bearing hum and feel for
            shudder on acceleration.
          </li>
          <li className={li}>
            • Work everything electric: windows, locks, seats, cameras,
            climate on both hot and cold.
          </li>
        </ul>
        <h2 className={h2}>Then let a pro finish it</h2>
        <p className={p}>
          If the car passes your fifteen minutes, a pre-purchase inspection
          at an independent shop settles the rest. A seller who won&apos;t
          allow one has answered your question a different way.
        </p>
      </>
    ),
  },
  {
    slug: "trade-in-vs-selling-yourself",
    title: "Trade it in, or sell it yourself?",
    dek: "The honest math between convenience and top dollar — and Michigan's trade-in tax angle.",
    minutes: 4,
    body: (
      <>
        <h2 className={h2}>What trading in buys you</h2>
        <p className={p}>
          One trip, no strangers, no listing photos, and the car&apos;s value
          comes straight off your next deal. Michigan also gives a sales-tax
          credit on trade-ins — you&apos;re taxed on the difference rather
          than the full price of the new car, up to a yearly cap — which
          quietly narrows the gap between a trade offer and a private-sale
          price. Ask the dealer to show the tax credit in the numbers.
        </p>
        <h2 className={h2}>What selling yourself buys you</h2>
        <p className={p}>
          Usually a better price — retail instead of wholesale. The cost is
          your time: photos, messages, test drives with strangers, and the
          paperwork. If the spread is small after the tax credit, the trade
          often wins on effort alone. If the spread is thousands, the
          weekend of work can be the best-paying job you&apos;ll do all year.
        </p>
        <h2 className={h2}>A third road</h2>
        <p className={p}>
          List it free on YouBuyCars. One active listing costs nothing, a
          real person reviews it before it goes live, and buyers reach you
          by text or on-site message — your number never sits on a
          classifieds board. You get private-sale money with less of the
          private-sale circus.
        </p>
      </>
    ),
  },
  {
    slug: "how-texting-a-dealer-works",
    title: "How texting a dealer works (and why it beats phone tag)",
    dek: "What happens when you text about a car, what the rules are, and how to stay in control.",
    minutes: 3,
    body: (
      <>
        <h2 className={h2}>Why text at all</h2>
        <p className={p}>
          A text answers when you&apos;re free, not when the phone rings. You
          get numbers in writing, links to the actual car, and a record of
          what was said — no hold music, no &ldquo;let me check with my
          manager, call back at five.&rdquo;
        </p>
        <h2 className={h2}>You&apos;re in control, by law and by design</h2>
        <p className={p}>
          Texting is consent-based: a business can text you about your
          inquiry because you started the conversation or agreed to it — and
          the word STOP ends it, immediately, any time you send it. On
          YouBuyCars, contacting a seller is always your move first: tap
          Text, send a message on-site, or tick the consent box on a dealer
          page form. Nothing is pre-checked, and nothing is required.
        </p>
        <h2 className={h2}>What to ask over text</h2>
        <ul>
          <li className={li}>• &ldquo;Is it still available?&rdquo; — the classic, and still the right opener.</li>
          <li className={li}>• &ldquo;Any accidents or title issues? Can you send the VIN?&rdquo;</li>
          <li className={li}>• &ldquo;What&apos;s the out-the-door price?&rdquo; — the number with tax and fees in it.</li>
          <li className={li}>• &ldquo;When can I drive it?&rdquo; — a serious seller answers with a time.</li>
        </ul>
      </>
    ),
  },
];
