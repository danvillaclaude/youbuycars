/**
 * Marketplace domain tests — run with `npx tsx scripts/test-marketplace.ts`.
 * Pure-function checks; the database's guard trigger is exercised live.
 */
import {
  formatMileage,
  formatPrice,
  LISTING_CAP,
  makeSlug,
  slugify,
  STATUS_LABELS,
} from "../lib/listings";

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

// The cap is the agreed number; the DB trigger hardcodes 5 to match.
check("LISTING_CAP is the agreed 5", LISTING_CAP === 5);

console.log(`${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
