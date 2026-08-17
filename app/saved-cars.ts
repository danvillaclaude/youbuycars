"use client";

/**
 * The saved-cars store (16 Aug 2026, his ask for the CarGurus header:
 * "hamburger menu, likes and login buttons"). Device-local by design —
 * hearts live in localStorage like the last-search chip, so nobody is
 * forced into an account to keep a shortlist. Slugs, not ids: they're
 * permanent by DB law and URL-ready.
 *
 * Same-tab updates need the custom event: the browser's 'storage' event
 * only fires in OTHER tabs, and a heart that doesn't update the header
 * count until reload reads as broken.
 */

const KEY = "ybc:saved-cars";
const EVENT = "ybc:saved-changed";

export function getSavedSlugs(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

export function toggleSaved(slug: string): void {
  const current = getSavedSlugs();
  const next = current.includes(slug)
    ? current.filter((s) => s !== slug)
    : [...current, slug].slice(-100);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    return; // Blocked storage — the heart just doesn't stick.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeSaved(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/*
 * Snapshot caching for useSyncExternalStore: React needs a STABLE value
 * while nothing changed, and a fresh array every call is an update loop.
 */
let lastRaw: string | null | undefined;
let lastList: string[] = [];
export function savedSnapshot(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return lastList;
  }
  if (raw !== lastRaw) {
    lastRaw = raw;
    lastList = getSavedSlugs();
  }
  return lastList;
}

export function emptySnapshot(): string[] {
  return lastEmpty;
}
const lastEmpty: string[] = [];
