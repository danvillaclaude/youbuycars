import Link from "next/link";
import { h2, p, type Article } from "./articles";

/**
 * THE MICHIGAN PAPERWORK CLUSTER — DRAFTS (23 Aug 2026 SEO plan, his
 * greenlight with one condition: he reads each before it goes live).
 *
 * Every guide here has draft: true. A draft renders at its real URL with
 * a banner and robots noindex, is absent from /research, the site index
 * and the sitemap, and links nowhere from the live site — so he can read
 * each page in place. PUBLISHING ONE = move its object into ARTICLES in
 * articles.tsx and delete it here (drop the draft flag). Written under
 * the archive's rules: no dollar amounts, no day-count deadlines, no
 * legal advice — where a number matters, the page points at
 * michigan.gov/sos instead of asserting one.
 *
 * Fact-checked against michigan.gov/sos where reachable; two phrasings
 * were deliberately kept soft for his read: the dealer trade-in tax
 * credit is described as "a cap set by statute that rises yearly"
 * (never the current figure), and every deadline says "the SOS site
 * says how long".
 */
export const DRAFT_ARTICLES: Article[] = [
  {
    slug: "michigan-title-transfer-private-sale",
    title: "Michigan title transfer after a private sale: what to bring to the Secretary of State",
    dek: "What the buyer and the seller each do at the Michigan Secretary of State after a private car sale, what to bring, and the slips that cost a second trip.",
    minutes: 5,
    draft: true,
    body: (
      <>
        <h2 className={h2}>{"1. Read the title together before any money moves"}</h2>
        <p className={p}>
          {"A Michigan title transfer starts on the hood of the car, with both of you reading the title before any money moves. It must be the original, not a photocopy, and its VIN must match the one on the dash. If more than one owner is named, every one of them signs. And nothing on a title gets fixed with a pen: a cross-out or a patch of white-out invalidates it, and the seller has to order a duplicate and start over."}
        </p>
        <p className={p}>
          {"A private sale in Michigan is as-is unless a written warranty says otherwise, so inspect before this moment, never after. New to the whole process? Start with "}
          <Link href="/research/how-to-buy-a-used-car-in-michigan" className="text-blue-600 underline">{"how to buy a used car in Michigan"}</Link>
          {"."}
        </p>
        <h2 className={h2}>{"2. What the seller does"}</h2>
        <p className={p}>
          {"The seller fills in the seller's portion of the title: name, address and signature, the buyer's name and address, the date and price, and the odometer reading exactly as the dash shows it. That mileage is certified under federal law, so no rounding and no guessing, and the SOS says it generally can't be corrected afterward."}
        </p>
        <p className={p}>
          {"Then take the plate off before the buyer drives away. In Michigan the plate belongs to you, not the car: move it to your next vehicle or destroy it, but never lend it, since the SOS warns that tickets a buyer collects on your plate can come back to you. Keep a copy of the signed title and a record of the sale for a long while (the SOS site says how long): by the SOS's own account, a seller with proof of sale isn't on the hook if the buyer never transfers the title."}
        </p>
        <p className={p}>
          {"The SOS recommends the seller go to the office with the buyer, and it's worth offering. Listing on "}
          <Link href="/sell" className="text-blue-600 underline">{"YouBuyCars"}</Link>
          {"? Say so in the ad; \"will meet at the SOS\" is the most reassuring line a private seller can write."}
        </p>
        <h2 className={h2}>{"3. What the buyer brings"}</h2>
        <p className={p}>
          {"Five things. The signed title. Your Michigan driver's license or state ID, because anyone whose name goes on the title has to be there in person, or send someone with the SOS Appointment of Agent form. Proof of Michigan no-fault insurance on this car; call your insurer with the VIN before you go, not from the parking lot. A way to pay (offices take cash, check, money order and cards). And the registration or plate number for any plate you're transferring."}
        </p>
        <p className={p}>
          {"The money covers a title fee, Michigan's 6% sales tax, and either a plate transfer or a fresh registration. Write the real price on the title: the state taxes the purchase price or fair market value, whichever is greater, so a low number buys nothing but questions. Book the visit online through the "}
          <a href="https://www.michigan.gov/sos" className="text-blue-600 underline" target="_blank" rel="noreferrer">{"Secretary of State"}</a>
          {"."}
        </p>
        <h2 className={h2}>{"4. What a lien means, and why it has to be gone"}</h2>
        <p className={p}>
          {"A lien is a lender's claim on the car: someone loaned money against it, and the title names them. Until that lender signs off, the seller can't pass clean ownership and the SOS won't transfer the title. The release can be the termination section on the title, the lender's signed \"paid\" stamp, a separate lien termination statement with the VIN on it, or a letter on the lender's letterhead saying the loan is satisfied."}
        </p>
        <p className={p}>
          {"If the lender holds the title electronically, there's no paper title to hand over until the loan is released, so the seller finishes with the bank first and waits for the paper. If you're financing the purchase, your lender is recorded on the new title as the secured party and may hold it until you've paid it off."}
        </p>
        <h2 className={h2}>{"5. Plates, and the drive home"}</h2>
        <p className={p}>
          {"Plates go with people in Michigan, not with cars. The seller keeps theirs; you transfer a plate you already own or buy a new one at the counter. Michigan allows a very short grace period to drive a freshly bought car home without a plate, by the most direct route, with the signed title and proof of insurance in the car; the SOS site spells out how long. Once your plate and tab are issued, they go on right away."}
        </p>
        <h2 className={h2}>{"6. The window, the late fee, and the title in the mail"}</h2>
        <p className={p}>
          {"You have a short window after the sale to title and register the car in your name; the SOS site says exactly how long, and a late fee applies past it. It runs from the sale date, so do it the same week. The new title comes by mail; check it for typos when it arrives, because they're easier to fix now than on the day you sell. Need the paper the same day? Every SOS office offers an instant title for an extra fee, with every owner present."}
        </p>
        <p className={p}>
          {"For the simplest sales (one person to one person, a Michigan paper title, both with Michigan licenses and online SOS accounts, no loan on the buyer's side) the transfer can now be done online, approved by the SOS within a few days. Anything with a co-owner, a lien, or a financed buyer is an office visit."}
        </p>
        <h2 className={h2}>{"7. The mistakes that send people back"}</h2>
        <p className={p}>
          {"Almost every second trip comes from one of these: a co-owner who didn't sign; an odometer line left blank, rounded, or filled in from memory; a cross-out or white-out; a lien paid off years ago but never released on paper; insurance still on your old car; a photocopy instead of the original. And a seller whose title is \"in the mail\": in Michigan you need a title to sell a car, so a missing one means the seller orders a duplicate first and you wait, with nothing paid until it's in hand."}
        </p>
        <p className={p}>
          {"Find the car on "}
          <Link href="/cars" className="text-blue-600 underline">{"the board"}</Link>
          {", agree the price in writing, read the title together, and the office visit becomes the easy part."}
        </p>
      </>
    ),
  },
  {
    slug: "michigan-sales-tax-on-a-used-car",
    title: "Michigan sales tax on a used car: dealer, private sale, or out of state",
    dek: "Who collects Michigan's 6% tax on a used car, what it's charged on, how the dealer trade-in credit works, and what to ask for before you sign.",
    minutes: 5,
    draft: true,
    body: (
      <>
        <h2 className={h2}>{"1. The rate is 6%, whoever you buy from"}</h2>
        <p className={p}>
          {"Michigan taxes a vehicle purchase at 6%. From a dealer it's called sales tax; from a private seller it's called use tax. Same rate, same money; what changes is who collects it and when. The rate is set by statute, so it's the one line of the deal you can work out before anyone hands you a pen."}
        </p>
        <p className={p}>
          {"It's the biggest of the three things that ride along with the price: tax, a title fee, and registration. Michigan has no safety inspection and no emissions test for passenger cars, so nothing else stands between the handshake and the Secretary of State counter."}
        </p>
        <h2 className={h2}>{"2. From a dealer: they collect it"}</h2>
        <p className={p}>
          {"A licensed Michigan dealer collects the tax at the sale and sends it to the state, and nearly every dealer files your title and registration for you too. The tax is charged on the full purchase price, and the dealer's documentary fee counts as part of that price, so it gets taxed as well."}
        </p>
        <p className={p}>
          {"So the cleanest way to see what you're paying is to ask for the breakdown before you sign, not after: price, doc fee, tax, title, plate, each on its own line."}
        </p>
        <h2 className={h2}>{"3. The trade-in credit, and why it only exists at a dealer"}</h2>
        <p className={p}>
          {"When a dealer takes your old car in trade on the same deal, Michigan taxes the difference, not the full price: the agreed trade-in value comes off the taxable amount, up to a cap set by statute that rises every year. The credit is worth 6% of whatever trade value it covers, which narrows the gap between a trade offer and a private-sale price — the honest math is in "}
          <Link href="/research/trade-in-vs-selling-yourself" className="text-blue-600 underline">{"Trade it in, or sell it yourself?"}</Link>
          {"."}
        </p>
        <p className={p}>
          {"It belongs to dealer sales only: a private seller who takes your old car as part payment doesn't earn it, and the tax runs on the full value. Ask the dealer to show the credit as its own line."}
        </p>
        <h2 className={h2}>{"4. From a private seller: you pay it at the SOS"}</h2>
        <p className={p}>
          {"When you buy from a person, nobody collects tax at the kitchen table. You pay it at a Secretary of State office when you transfer the title and register the car, along with the title fee and your plate. Bring the signed-over title with the odometer reading filled in, your ID, and proof of Michigan no-fault insurance — the SOS won't register a car without it."}
        </p>
        <p className={p}>
          {"You have a short window after the sale to do this, with a late fee past it; the "}
          <a href="https://www.michigan.gov/sos" className="text-blue-600 underline" target="_blank" rel="noreferrer">{"SOS site"}</a>
          {" says how long. The seller keeps their plate, so you'll transfer one of your own or buy new. If the two of you can go to the office together, do."}
        </p>
        <h2 className={h2}>{"5. What the state thinks the car is worth"}</h2>
        <p className={p}>
          {"Here's the part most people don't know: on a private sale, the tax is charged on the purchase price or the car's retail value, whichever is greater. Treasury checks the price you report against a published pricing guide, and if your number sits well below it, a letter can follow asking for tax on the difference. A gift between people who aren't close relatives is taxed on the guide value, not on zero."}
        </p>
        <p className={p}>
          {"If you genuinely got a deal because the car needed work, keep the evidence: a bill of sale that states the price and describes the condition, repair estimates, or a written appraisal from a shop — those are what Treasury will consider. Writing down a number that isn't the real one doesn't save anything and can bring penalties; paying on the real price and keeping your paperwork costs nothing extra."}
        </p>
        <p className={p}>
          {"Transfers between close family — spouse, parent, child, sibling, grandparent, and most in-laws — are exempt. The SOS lists exactly who qualifies; cousins, aunts and uncles aren't on it."}
        </p>
        <h2 className={h2}>{"6. Bought it in another state? Michigan still wants its 6%"}</h2>
        <p className={p}>
          {"If you find the right car in Ohio or Indiana and bring it home, you'll title it in Michigan and pay Michigan's use tax when you do. Whether the other state collects anything at the sale depends on that state; if it did, Michigan generally credits what you paid, up to its own 6%, as long as that state returns the favor for Michigan buyers — most do, not all."}
        </p>
        <p className={p}>
          {"Bring the bill of sale and proof of any tax paid, and the counter works out what's still owed. The retail-value check above applies here too, since an out-of-state dealer isn't a Michigan-licensed one. What you don't need is an inspection first; Michigan doesn't require one."}
        </p>
        <h2 className={h2}>{"7. Ask for the out-the-door number"}</h2>
        <p className={p}>
          {"Whoever is selling, ask one question before you agree to anything: \"What's the out-the-door price?\" — the number with tax, title, registration and every fee inside it. A dealer can put it in writing — a text is fine — and it should reconcile line by line: price, doc fee, 6% on the taxable amount after any trade-in credit, title, plate."}
        </p>
        <p className={p}>
          {"A private seller can't quote the tax, but you can: 6% of the price (or of the guide value, if that's higher), plus the title fee and whatever your plate costs — the SOS site has a calculator for that part. Do that math before you fall for a listing on the "}
          <Link href="/cars" className="text-blue-600 underline">{"board"}</Link>
          {"; the windshield number is where the cost starts, and the out-the-door number is what you actually pay."}
        </p>
      </>
    ),
  },
  {
    slug: "how-to-sell-a-car-privately-in-michigan",
    title: "How to sell a car privately in Michigan: the seller's checklist",
    dek: "The title, the lien, your plate, the record of sale, insurance and getting paid: what a Michigan private seller has to do before the keys change hands.",
    minutes: 5,
    draft: true,
    body: (
      <>
        <h2 className={h2}>{"1. Start with the title in your hand"}</h2>
        <p className={p}>
          {"In Michigan the title is the sale, so find it before you list the car. Read the front: is your name on it the way it should be, can every owner listed be there to sign, and is a lienholder printed on it? If you still owe on the car, the lender holds the title (often electronically) and it won't be released until the loan is paid."}
        </p>
        <p className={p}>
          {"There are two clean ways through a lien. Pay the loan off first and wait for the release and the title to arrive, or close the sale somewhere the payoff can happen at the same time — the lender's branch, or a bank that can send the payoff and document it. The Secretary of State accepts a lien release in a few forms — a dated, signed “paid” stamp on the title itself, or a separate termination statement or letter from the lender that lists the VIN — so ask your lender which one they give."}
        </p>
        <h2 className={h2}>{"2. Find the buyer"}</h2>
        <p className={p}>
          {"A private sale pays retail instead of wholesale, and the cost is your time — "}
          <Link href="/research/trade-in-vs-selling-yourself" className="text-blue-600 underline">{"trade it in, or sell it yourself?"}</Link>
          {" walks through that math, including Michigan's trade-in tax credit. If the spread says sell, the checklist on this page is the whole job."}
        </p>
        <p className={p}>
          {"If you'd rather not put your number on a classifieds board, a "}
          <Link href="/sell" className="text-blue-600 underline">{"listing on YouBuyCars"}</Link>
          {" is free for one car and buyers reach you by text or on-site message."}
        </p>
        <h2 className={h2}>{"3. Meet safely and get paid in a way that clears"}</h2>
        <p className={p}>
          {"Meet in daylight somewhere public — several Metro Detroit police departments keep a marked safe-exchange spot in their lot (Sterling Heights is one) — and bring someone with you. Ask to see a driver's license before the test drive, ride along, and make sure the name on the license is the name going on the title."}
        </p>
        <p className={p}>
          {"For payment, cash counted at your bank or a cashier's check you watch the teller print beats anything mailed, wired or sent through an app. A cashier's check the buyer brings from home is exactly the one you can't verify on the spot. Don't sign the title until the money is real; once it's signed, the car is theirs."}
        </p>
        <h2 className={h2}>{"4. Fill in the title completely, with the buyer watching"}</h2>
        <p className={p}>
          {"The seller's section of a Michigan title asks for the buyer's name and address, the selling price, the date, the odometer reading and your signature. Fill in every line in ink while the buyer is standing there, and have them sign on the buyer's line. The odometer reading is a federal disclosure, not a formality: write what the dash shows, and if your title has no space for it the SOS has a separate odometer statement."}
        </p>
        <p className={p}>
          {"Never hand over a title with the buyer's side blank. An open title can be passed from hand to hand without ever being put in anyone's name, and the whole time, the car is still yours on paper while a stranger drives it."}
        </p>
        <h2 className={h2}>{"5. Your plate stays with you"}</h2>
        <p className={p}>
          {"Michigan plates belong to the person, not the car. Take yours off before the buyer drives away — the one exception the SOS makes is a transfer to immediate family. You can move the plate to your next car, and if you're done with it, the SOS suggests bending or cutting it so nobody else can use it. The buyer either transfers a plate of their own or buys a new one when they register; that's their side of the counter, not yours."}
        </p>
        <h2 className={h2}>{"6. Write a record of sale, and keep your copy"}</h2>
        <p className={p}>
          {"The title proves who owns the car; a bill of sale proves what happened and when. One page does it: year, make, model, VIN, odometer reading, price, date, both names and addresses, the words \"sold as-is\", and two signatures. The SOS doesn't ask for one on a titled car — the filled-in title is what they read — so this page is for you, not for them. A private sale in Michigan is as-is unless something in writing says otherwise, so if you promise a repair to close the deal, either write it down or don't promise it."}
        </p>
        <p className={p}>
          {"Make two copies and keep yours, along with a photo of the signed-over title. Until the buyer finishes the transfer, the title record is still in your name, and the SOS's own advice is that a seller who can prove the sale is in a far better position if the buyer never gets around to it. Your copy is that proof when a parking ticket or an impound notice shows up months later. The SOS says how long to keep it; keep it longer."}
        </p>
        <h2 className={h2}>{"7. Finish the transfer before you cancel insurance"}</h2>
        <p className={p}>
          {"The buyer has a short window after the sale to title and register the car — the "}
          <a href="https://www.michigan.gov/sos" className="text-blue-600 underline" target="_blank" rel="noreferrer">{"SOS site"}</a>
          {" says how long — and pays Michigan's 6% tax on the price when they do. The SOS recommends the two of you go to a branch office together and finish it in one visit; there's an online transfer too, with a step for each of you. Going together is the seller's insurance that the transfer actually happens."}
        </p>
        <p className={p}>
          {"Keep your policy on the car until the transfer is done and the car is off your name, not the moment you're paid, and then call your agent — you may want to move the coverage to your next car rather than cancel outright. Michigan no-fault insurance has to be in place before the buyer drives on their own plate, so a buyer who asks to \"just use your plate for the weekend\" is asking you to carry their risk."}
        </p>
      </>
    ),
  },
  {
    slug: "private-seller-vs-dealer-michigan",
    title: "Buying a used car from a private seller vs a dealer in Michigan",
    dek: "Price, paperwork, the trade-in tax credit, financing, as-is and recourse: an even-handed look at both sides of a Michigan used-car deal.",
    minutes: 5,
    draft: true,
    body: (
      <>
        <h2 className={h2}>{"1. Price: what the gap is actually paying for"}</h2>
        <p className={p}>
          {"A private seller usually asks less for the same car. They have no lot, no staff and no reconditioning bill to recover, so the number starts closer to what the car is worth to a person than to a business. A dealer's price carries more than the car: they've often fixed what was wrong, detailed it, pulled the history, and they'll handle the paperwork and financing for you. Neither price is wrong; they're buying different things, and this guide is about what sits in the gap. The "}
          <Link href="/cars" className="text-blue-600 underline">{"board"}</Link>
          {" lists dealers and private sellers side by side, so you can see that gap on real cars."}
        </p>
        <h2 className={h2}>{"2. Paperwork: who walks it to the Secretary of State"}</h2>
        <p className={p}>
          {"Buying from a dealer, the dealer is required to apply for your title and registration: you sign, they file it with the "}
          <a href="https://www.michigan.gov/sos" className="text-blue-600 underline" target="_blank" rel="noreferrer">{"Secretary of State"}</a>
          {", and your plate comes along in the same stack. From a private seller, the job is yours and theirs: the seller signs the title over with the odometer reading recorded, and you take it to an SOS office to put it in your name. The SOS recommends going in together, and offers an online transfer when both of you have Michigan IDs and the car has a paper title. Either way there's a short window after the sale to get it done; the SOS site says how long."}
        </p>
        <p className={p}>
          {"On both sides, the plate belongs to the person, not the car: the seller keeps theirs and you transfer one you already own or buy new. And Michigan no-fault insurance has to be in place before you drive it on your own plate."}
        </p>
        <h2 className={h2}>{"3. Sales tax, and the trade-in credit only a dealer can give"}</h2>
        <p className={p}>
          {"Michigan taxes a vehicle purchase at 6% either way. A dealer collects it in the deal; in a private sale you pay it at the SOS when you transfer the title, figured on the price or the vehicle's retail value, whichever is higher. The real difference is the trade-in: trade a car at a dealer and Michigan gives you a credit on the trade-in value, so you're taxed on the difference, with a cap set by statute that has been rising yearly. There's no version of that in a private sale; you sell your old car separately and pay tax on the full price of the one you buy. If you've got a car to move, "}
          <Link href="/research/trade-in-vs-selling-yourself" className="text-blue-600 underline">{"Trade it in, or sell it yourself?"}</Link>
          {" walks through that math."}
        </p>
        <h2 className={h2}>{"4. Financing: who can lend against the car"}</h2>
        <p className={p}>
          {"A dealer can arrange financing on the spot, building the deal around a payment you can live with; that's most of why people who need a loan end up on a lot. A private seller can't lend you anything, so you bring your own, usually from a bank or credit union, and it's easier to have that approved before you go looking than after. One wrinkle on the private side: if the seller still owes on the car, the lender holds the title, and that loan has to be paid off before it can be signed over to you. Agree with the seller on exactly how that happens before any money moves."}
        </p>
        <h2 className={h2}>{"5. “As-is” lives on both sides"}</h2>
        <p className={p}>
          {"Here's the part people get backwards: a used car is as-is from a private seller, and it's usually as-is from a dealer too, unless a written warranty says otherwise. The difference is that a dealer has to tell you in writing. Federal rules put a Buyer's Guide sticker in the window of every used car on a dealer's lot; it either says \"As Is — No Dealer Warranty\" or spells out what the dealer's warranty covers, and it becomes part of your contract. A private seller owes you no sticker, and \"it runs great\" said out loud is not a warranty. On either side, any coverage that does exist, factory warranty with time left or a service contract, is worth confirming in writing before you pay."}
        </p>
        <h2 className={h2}>{"6. Inspection: Michigan won't do it for you"}</h2>
        <p className={p}>
          {"Michigan has no state safety inspection and no emissions test for passenger cars, so nobody official has looked at the car before you. A dealer's reconditioning is real work, but it's the seller's inspection, not yours. A pre-purchase inspection at an independent shop is the equalizer, and a dealer who won't allow one has told you the same thing a private seller who won't allow one has. Run the "}
          <Link href="/research/test-drive-checklist" className="text-blue-600 underline">{"test-drive checklist"}</Link>
          {" first, ask for the VIN and a history report, and let the shop settle what you can't."}
        </p>
        <h2 className={h2}>{"7. Recourse: who stands behind the deal"}</h2>
        <p className={p}>
          {"A Michigan dealer is licensed by the Secretary of State, which takes complaints about vehicle sales and can investigate and discipline a dealership. That isn't a warranty, but it's a door to knock on if the paperwork never shows up or the car wasn't what was promised. A private sale has no regulator behind it; if the car wasn't what you were told, your options are the ones any two private parties have, and they're slow. That's why the inspection matters more on that side, not less. Michigan's Lemon Law is a new-vehicle law that reaches a used car only narrowly, while the manufacturer's warranty still applies, so don't count on it from either seller; the Attorney General's consumer protection office explains where it does. Can't tell which side wins on a specific car? "}
          <Link href="/contact" className="text-blue-600 underline">{"Ask"}</Link>
          {"; the marketplace lists both, and we don't have a side."}
        </p>
      </>
    ),
  },
  {
    slug: "michigan-vehicle-inspection-emissions-test",
    title: "Does Michigan require a vehicle inspection or emissions test?",
    dek: "Michigan has no safety inspection and no emissions test for passenger cars, so the checking is on you. What to look at, and when to pay a shop.",
    minutes: 5,
    draft: true,
    body: (
      <>
        <h2 className={h2}>{"1. The short answer: no, and no"}</h2>
        <p className={p}>
          {"Michigan has no periodic safety inspection for passenger cars, and no emissions test. There is nothing to pass before you register a car or renew a plate, no sticker in the windshield, no station to visit. Titles and registration go through the Secretary of State, and the SOS handles the paperwork, not the car. Nobody from the state looks at the brakes, the tires, or the tailpipe, at any age or mileage."}
        </p>
        <p className={p}>
          {"That is genuinely convenient if you own a car. It's a different story if you're buying one."}
        </p>
        <h2 className={h2}>{"2. What that means when you're the buyer"}</h2>
        <p className={p}>
          {"In states with an inspection, a current sticker is a floor: somebody checked that the brakes, lights, and tires were at least legal on some date. Michigan has no floor. A car can change hands with bald tires, a check-engine light glowing, and a frame you could push a screwdriver through, and none of that stops the sale. Private sales here are as-is unless a written warranty says otherwise; the SOS's own advice is that as-is means no warranty, and any repair a seller promises should be in writing before you pay. So the checking a state inspector would do is yours to do, and the good news is that most of it takes no tools."}
        </p>
        <h2 className={h2}>{"3. What to check yourself"}</h2>
        <p className={p}>
          {"Start with the "}
          <Link href="/research/test-drive-checklist" className="text-blue-600 underline">{"test-drive checklist"}</Link>
          {": a cold start, every dash light on with the key and then off, one firm brake from speed, hands light on the wheel on a straight road. Then do the paperwork checks the SOS tells every buyer to do: the VIN on the dash and door jamb matches the title and the ad, the odometer reading on the title matches the dash, and the seller is holding the original title, not a photocopy, with no salvage or rebuilt brand the ad forgot to mention. Run a history report on that VIN; listings on "}
          <Link href="/cars" className="text-blue-600 underline">{"the board"}</Link>
          {" that show one up front are a good sign."}
        </p>
        <p className={p}>
          {"Then add the Michigan check: rust. Road salt eats cars from underneath, so bring a flashlight and look at the rocker panels below the doors, behind the rear wheels, the subframe, and the brake and fuel lines. Surface rust on bolts is normal here; flaking, holes, or a brake line that looks like a stick of chalk are not."}
        </p>
        <h2 className={h2}>{"4. The check-engine light, with no test to fail"}</h2>
        <p className={p}>
          {"No emissions test doesn't mean the check-engine light stopped meaning anything; it means the state won't make anyone fix it, so a seller doesn't have to. The light is a stored code, and a cheap OBD-II reader, or any shop, reads it in a minute. The subtler tell is a light that was cleared right before you came: the car's self-tests take some driving to run again, and a reader shows them as \"not ready,\" which is a reason to ask what was reset and why. And a warning light that never comes on at all with the key has usually had its bulb pulled. That one is a walk-away sign."}
        </p>
        <h2 className={h2}>{"5. When to pay an independent shop"}</h2>
        <p className={p}>
          {"A pre-purchase inspection is an hour or so of a mechanic's time with the car up on a lift, at a shop you choose: not the seller's cousin, and not the dealer's own service bay, which is not independent. They see what a driveway can't show you: the underside, play in the suspension, where leaks start, the state of the brakes and lines, tire age, and the full set of stored codes. The SOS suggests one before any used-car purchase, and it's right."}
        </p>
        <p className={p}>
          {"Pay for it whenever you're spending real money, when the car carries a rebuilt or salvage brand, when its history has a gap you can't explain, or when the seller gets twitchy at the question. A seller who refuses has answered your question a different way."}
        </p>
        <h2 className={h2}>{"6. The one inspection Michigan does run"}</h2>
        <p className={p}>
          {"There is one exception to the no-inspection rule, and it's worth knowing because it shows up in listings. A car with a salvage title, one an insurer wrote off, can't legally be driven on the road until it passes an inspection by a certified salvage vehicle inspector and the SOS issues a title marked Rebuilt Salvage. That inspection verifies where the repair parts came from and that the car meets Michigan's equipment and safety rules. It is not a judgment on how well the repair was done, and the brand stays on the title for good. A rebuilt car can be a fair deal at the right price; it should also always go to the shop in section 5."}
        </p>
        <h2 className={h2}>{"7. Before you drive it home"}</h2>
        <p className={p}>
          {"Passing no inspection doesn't mean skipping the paperwork. The seller keeps their license plate, because plates belong to the person, not the car, so you'll transfer one of yours or buy a new one, and you need Michigan no-fault insurance in place before you drive on it. Then you have a short window to get the title transferred and the car registered; the "}
          <a href="https://www.michigan.gov/sos" className="text-blue-600 underline" target="_blank" rel="noreferrer">{"Secretary of State site"}</a>
          {" says how long and what to bring. Do the checking first, and that last trip is the easy part."}
        </p>
      </>
    ),
  },
  {
    slug: "michigan-lemon-law-used-cars-as-is",
    title: "Michigan lemon law and used cars: what \"as-is\" really means",
    dek: "The Lemon Law is for new cars, private sales are as-is, and a written warranty changes everything. What a Michigan used-car buyer really has.",
    minutes: 5,
    draft: true,
    body: (
      <>
        <h2 className={h2}>{"1. Start with the word itself"}</h2>
        <p className={p}>
          {"\"As-is\" means what it sounds like: the car is yours once the deal is done, with whatever is wrong with it, known or not. In Michigan a sale between two private people is as-is by default — no warranty unless the seller writes one down — and the Secretary of State's own advice is that a seller's promise to fix something belongs in writing. Nobody has inspected the car for you, either: Michigan has no state safety inspection and no emissions test for passenger cars. That isn't a reason to avoid private sales. It's a reason to do your looking before you pay."}
        </p>
        <h2 className={h2}>{"2. What the Lemon Law actually covers"}</h2>
        <p className={p}>
          {"Michigan's Lemon Law (the New Motor Vehicle Warranties Act, MCL 257.1401 and following) is about new vehicles. It makes the manufacturer — not the dealer, and never a private seller — repair a defect that impairs the car's use or value, and if a reasonable number of repair attempts fail, take the car back for a refund or a comparable replacement. The clock runs from the day the car was first delivered to its original buyer. The Attorney General's consumer protection pages spell out what counts as a reasonable number of attempts; read it there rather than in any summary, including this one."}
        </p>
        <h2 className={h2}>{"3. The narrow door for used cars"}</h2>
        <p className={p}>
          {"There is one way a used car fits. It must still be under the manufacturer's express warranty when you buy it, and the problem must be reported to the manufacturer or an authorized dealer within that warranty's term or one year from the original delivery date, whichever comes first. In practice that means a nearly new car still inside its first year since it was first sold. A five-year-old car with an expired warranty has no Lemon Law claim, and neither does one bought privately once that first year has passed. If you're buying something that young, ask for the warranty booklet and confirm the dates against the VIN before you decide."}
        </p>
        <h2 className={h2}>{"4. The Buyers Guide sticker at a dealer"}</h2>
        <p className={p}>
          {"A licensed dealer answers to a federal rule as well: the FTC's Used Car Rule puts a Buyers Guide in the window of every used car on the lot. It has two boxes, \"As Is — No Dealer Warranty\" and \"Dealer Warranty,\" and if the warranty box is checked it says which systems are covered, for how long, and what share of the repair bill the dealer pays. Leave the as-is box unchecked and the law reads an implied promise into the sale that the car will at least run; checking it waives that promise, which is why the box exists."}
        </p>
        <p className={p}>
          {"Two things make that sticker outrank the rest of the paperwork. It overrides the sales contract where the two disagree, and it is where any spoken promise — \"we'll fix that rattle\" — has to be written down to count. The SOS lists it among the copies a dealer should hand you at signing, alongside any written warranty and the previous owner's title, which the dealer must let you examine."}
        </p>
        <h2 className={h2}>{"5. What a written warranty changes, and what it doesn't"}</h2>
        <p className={p}>
          {"A dealer warranty, even a limited one on the drivetrain for a few months, turns \"your problem\" into \"a covered repair\" for whatever it names, and brings in the Magnuson-Moss Warranty Act, the federal law that governs written warranties. An unexpired factory warranty travels with the car no matter who sells it, so a private sale can still carry real coverage; verify the dates with a franchised dealer using the VIN. A service contract, often sold as an \"extended warranty,\" is not a warranty at all. It's a contract with whoever sold it, with its own terms, deductibles and claim process, worth exactly what it says and who stands behind it. Read the document, not the brochure."}
        </p>
        <h2 className={h2}>{"6. What recourse realistically exists"}</h2>
        <p className={p}>
          {"Know this before you buy, because afterward the list is short. If there's a warranty, follow its instructions, keep every work order, and escalate to the manufacturer when the dealer can't fix it. If a dealer misled you or the paperwork went sideways — the title never arrives, the sticker and the contract disagree — the Secretary of State takes dealer complaints directly, and the Attorney General's consumer protection team handles the rest. As-is is not a license to lie: a seller who misstates the mileage (federal odometer law reaches private sellers too), hides a salvage brand, or says something false to close the sale is in different territory, and small claims court exists for disputes over money."}
        </p>
        <p className={p}>
          {"But for a private, as-is sale where nobody lied and the transmission simply failed in month two, there is usually no one to call. Michigan gives no cooling-off period on a vehicle purchase either; the SOS says it plainly — the sales contract is binding."}
        </p>
        <h2 className={h2}>{"7. So the real protection is before the handshake"}</h2>
        <p className={p}>
          {"That is why the best used-car advice in Michigan is boring. Run the VIN through a history report (the SOS points buyers to the federal NMVTIS database), match the VIN on the dash to the title, look for a brand or a lien, start it cold, and pay an independent shop for a pre-purchase inspection. The "}
          <Link href="/research/test-drive-checklist" className="text-blue-600 underline">{"test-drive checklist"}</Link>
          {" is the fifteen-minute version; a seller who won't allow an inspection has answered your question. When you're ready to look, the board is at "}
          <Link href="/cars" className="text-blue-600 underline">{"/cars"}</Link>
          {"; if you're the one selling, "}
          <Link href="/sell" className="text-blue-600 underline">{"list it free"}</Link>
          {" and put anything you promise in writing too. For titles, plates, and how long you have to transfer, the "}
          <a href="https://www.michigan.gov/sos" className="text-blue-600 underline" target="_blank" rel="noreferrer">{"Secretary of State's site"}</a>
          {" is the source."}
        </p>
      </>
    ),
  },
];
