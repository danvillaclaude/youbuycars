"use client";

/**
 * The compare picks (17 Aug 2026, from the fresh CarGurus look: their
 * results page lets you pick cars for comparison where you SEE them).
 * Device-local like the hearts; capped at two — /compare is a
 * two-column table, and the cap IS the design. Picking a third swaps
 * out the oldest.
 */

const KEY = "ybc:compare";
const EVENT = "ybc:compare-changed";

export function getCompareSlugs(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed)
      ? parsed.filter((s) => typeof s === "string").slice(0, 2)
      : [];
  } catch {
    return [];
  }
}

export function toggleCompare(slug: string): void {
  const current = getCompareSlugs();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug].slice(-2);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function clearCompare(): void {
  try {
    localStorage.setItem(KEY, "[]");
  } catch {
    return;
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeCompare(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/* Stable snapshots for useSyncExternalStore — same pattern as hearts. */
let lastRaw: string | null | undefined;
let lastList: string[] = [];
export function compareSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return lastList;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastList = getCompareSlugs();
  }
  return lastList;
}

const empty: string[] = [];
export function emptyCompareSnapshot(): string[] {
  return empty;
}
