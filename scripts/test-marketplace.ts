/**
 * Marketplace domain tests — run with `npx tsx scripts/test-marketplace.ts`.
 * Pure-function checks; the database's guard trigger is exercised live.
 */
import {
  BODY_STYLES,
  canonicalBody,
  canonicalFor,
  canonicalMake,
  capFor,
  METRO_DETROIT_CITIES,
  CONDITIONS,
  describeSearch,
  photoUrl,
  searchTerm,
  DRIVETRAINS,
  formatMileage,
  formatPrice,
  FUEL_TYPES,
  LISTING_CAP,
  makeSlug,
  slugify,
  STATUS_LABELS,
  TIER_CAPS,
  TRANSMISSIONS,
} from "../lib/listings";
import { estimateMonthly, maxPriceForPayment } from "../lib/payments";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean) {
  if (cond) passed++;
  else {
    failed++;
    console.error(`FAIL: ${name}`);
  }
}

// slugify: URL-safe, no edge junk.
check("slugify lowercases", slugify("Chevrolet") === "chevrolet");
check("slugify dashes spaces", slugify("Grand Cherokee") === "grand-cherokee");
check("slugify strips punctuation", slugify("F-150 (XLT)!") === "f-150-xlt");
check("slugify trims edge dashes", slugify("--Civic--") === "civic");
check("slugify caps length", slugify("x".repeat(100)).length <= 40);
check("slugify empty is empty", slugify("!!!") === "");

// makeSlug: deterministic shape with injected randomness.
const fixed = makeSlug(2018, "Chevrolet", "Equinox", () => 0.5);
check("makeSlug shape", /^2018-chevrolet-equinox-[a-z2-9]{6}$/.test(fixed));
check(
  "makeSlug deterministic with seeded random",
  fixed === makeSlug(2018, "Chevrolet", "Equinox", () => 0.5),
);
check(
  "makeSlug differs across randomness",
  makeSlug(2018, "Chevrolet", "Equinox", () => 0.1) !==
    makeSlug(2018, "Chevrolet", "Equinox", () => 0.9),
);
// The suffix alphabet bans lookalikes — no 0, O, 1, l, i.
const suffixes = Array.from({ length: 200 }, () =>
  makeSlug(2020, "Ford", "Escape").split("-").pop()!,
).join("");
check("suffix alphabet bans lookalikes", !/[01oli]/.test(suffixes));

// Money and miles read like a dealer wrote them.
check("formatPrice groups thousands", formatPrice(12500) === "$12,500");
check("formatPrice zero", formatPrice(0) === "$0");
check("formatMileage", formatMileage(84210) === "84,210 mi");

// Every status has a human label — a chip with a raw enum is a bug.
for (const status of ["pending", "active", "rejected", "sold"] as const) {
  check(`STATUS_LABELS covers ${status}`, Boolean(STATUS_LABELS[status]));
}

// The tier ladder — the DB's tier_cap() mirrors these numbers exactly.
// Free moved 5 → 3 → 1 on 12 Aug 2026 (the owner's call; migration 0006);
// these pins lagged at 5 and failed silently until 16 Aug. Pin the OWNER's
// number, and change it only when he changes it.
check("LISTING_CAP is the free cap", LISTING_CAP === TIER_CAPS.free);
check("free cap 1 (one car is a person; two is a business)", TIER_CAPS.free === 1);
check("pro cap 25 (the $100 plan)", TIER_CAPS.pro === 25);
check("ultimate cap 200 (the $500 plan)", TIER_CAPS.ultimate === 200);
check("capFor defaults to free", capFor(null) === 1 && capFor("nonsense") === 1);
check("capFor reads tiers", capFor("pro") === 25 && capFor("ultimate") === 200);

// describeSearch — the saved-search label a buyer reads in their inbox.
check("describeSearch empty is 'all cars'", describeSearch({}) === "all cars");
check(
  "describeSearch composes filters in reading order",
  describeSearch({ make: "Chevrolet", max_price: 15000 }) ===
    "Chevrolet · under $15,000",
);
check(
  "describeSearch year range",
  describeSearch({ year_min: 2018, year_max: 2022 }) === "2018–2022",
);
check(
  "describeSearch open-ended years",
  describeSearch({ year_min: 2020 }) === "2020 or newer" &&
    describeSearch({ year_max: 2015 }) === "2015 or older",
);
check(
  "describeSearch keyword wears quotes, miles group thousands",
  describeSearch({ q: "F-150", max_miles: 80000 }) ===
    "“F-150” · under 80,000 mi",
);
check(
  "describeSearch financing reads as offered",
  describeSearch({ financing: true }) === "financing offered",
);
check(
  "describeSearch body style pluralizes and leads after make",
  describeSearch({ make: "Ford", body_style: "SUV", max_price: 20000 }) ===
    "Ford · SUVs · under $20,000",
);

/*
 * The spec vocabularies (0015) — these lists are mirrored by CHECK
 * constraints in the database. Removing or renaming a value here without
 * a migration means an insert that the UI offered and the DB refuses;
 * these pins make that drift a test failure instead of a runtime one.
 */
check("BODY_STYLES holds the board's nine", BODY_STYLES.length === 9);
for (const v of ["SUV", "Sedan", "Truck"] as const) {
  check(`BODY_STYLES keeps ${v} (tiles depend on it)`, BODY_STYLES.includes(v));
}
check("DRIVETRAINS is the four", DRIVETRAINS.length === 4);
check("TRANSMISSIONS is the two", TRANSMISSIONS.length === 2);
check("FUEL_TYPES is the five", FUEL_TYPES.length === 5);
check("CONDITIONS is the three", CONDITIONS.length === 3);

/*
 * The $/mo filter's inverse (0016): maxPriceForPayment must be the true
 * inverse of estimateMonthly under the same assumptions — filtering by
 * a card's own est./mo must always include that car, and a dollar more
 * of price must push the estimate over the budget.
 */
for (const price of [5000, 14500, 24995, 62000]) {
  const est = estimateMonthly(price);
  const cap = maxPriceForPayment(est);
  check(`payment inverse admits its own card ($${price})`, cap >= price);
  check(
    `payment inverse is tight ($${price})`,
    estimateMonthly(cap + 100) > est,
  );
}
check("payment inverse of zero is zero", maxPriceForPayment(0) === 0);

// searchTerm — the search box is a VALUE, never PostgREST filter syntax
// (23 Aug 2026 audit: "ford, xlt" split into filters; a crafted q
// injected its own). The "lexus" pin is the one that matters: a lost
// backslash once turned \s+ into s+ and stripped every letter s.
check("searchTerm passes a plain term through", searchTerm("Equinox") === "Equinox");
check("searchTerm keeps every letter — lexus stays lexus", searchTerm("lexus") === "lexus");
check("searchTerm strips the or() operators", searchTerm("zzzz,model.ilike.%Edge") === "zzzz model.ilike.%Edge");
check("searchTerm turns a comma into a space", searchTerm("ford, xlt") === "ford xlt");
check("searchTerm drops parentheses and quotes", searchTerm('("F-150")') === "F-150");
check("searchTerm keeps ilike wildcards for the buyer", searchTerm("F_150%") === "F_150%");
check("searchTerm of only operators is empty", searchTerm(',()"') === "");
check("searchTerm of nothing is empty", searchTerm(null) === "");

// photoUrl — the resize endpoint needs BOTH dimensions and contain, or it
// keeps the original height and crops the width to a vertical slice (his
// 23 Aug 07:00 report: "the thumbnails are too zoomed in").
{
  const u = photoUrl("seller/listing/a.jpg", 720);
  check("photoUrl goes through the render endpoint", u.includes("/storage/v1/render/image/public/listing-photos/"));
  check("photoUrl asks for width AND a matching height", u.includes("width=720") && u.includes("height=720"));
  check("photoUrl fits, never crops, server-side", u.includes("resize=contain"));
  check("photoUrl without a size is the original object", photoUrl("seller/listing/a.jpg").includes("/storage/v1/object/public/"));
}

// The vocabulary (23 Aug 2026): one spelling per make, body and city.
check("canonicalMake maps the nickname", canonicalMake("chevy") === "Chevrolet");
check("canonicalMake fixes the case", canonicalMake("FORD") === "Ford");
check("canonicalMake ignores hyphen/space drift", canonicalMake("mercedes benz") === "Mercedes-Benz");
check("canonicalMake keeps an unknown make, spelled like a name", canonicalMake("koenigsegg") === "Koenigsegg");
check("canonicalMake of nothing is empty", canonicalMake("  ") === "");
check("canonicalBody fixes the case", canonicalBody("suv") === "SUV");
check("canonicalBody refuses an unknown style", canonicalBody("spaceship") === null);
check("canonicalFor spells the make and body one way", canonicalFor({ make: "ford", body: "suv" }) === "/cars?make=Ford&body=SUV");
check("city list has no duplicates", new Set(METRO_DETROIT_CITIES).size === METRO_DETROIT_CITIES.length);
check("city list is alphabetical", [...METRO_DETROIT_CITIES].every((c, i, a) => i === 0 || a[i - 1].localeCompare(c) < 0));

// canonicalFor — one URL per board view.
check("canonicalFor bare board is /cars", canonicalFor({}) === "/cars");
check(
  "canonicalFor orders filters regardless of request order",
  canonicalFor({ body: "SUV", make: "Ford" }) === "/cars?make=Ford&body=SUV",
);
check(
  "canonicalFor drops sort and q",
  canonicalFor({ make: "Ford", sort: "price_asc", q: "xlt" } as Parameters<typeof canonicalFor>[0]) ===
    "/cars?make=Ford",
);
check("canonicalFor skips empty values", canonicalFor({ make: "", body: "SUV" }) === "/cars?body=SUV");

console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
