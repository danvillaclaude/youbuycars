"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "ybc:last-search";
const MAX_AGE_DAYS = 30;

/*
 * localStorage read as a proper external store (useSyncExternalStore —
 * the same pattern as the CRM's rail collapse), not setState-in-effect.
 * The snapshot is cached by raw value so React sees a stable result,
 * and the server snapshot is null, so a first paint never mismatches:
 * hydration renders nothing, the client snapshot fills in after.
 */
function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

let lastRaw: string | null | undefined;
let lastParsed: { label: string; qs: string } | null = null;
function readSnapshot(): { label: string; qs: string } | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null; // Blocked storage — behave like a first visit.
  }
  if (raw === lastRaw) return lastParsed;
  lastRaw = raw;
  lastParsed = null;
  if (raw) {
    try {
      const p = JSON.parse(raw) as { label?: string; qs?: string; at?: number };
      const fresh = !p.at || Date.now() - p.at <= MAX_AGE_DAYS * 86_400_000;
      if (p.label && p.qs && fresh) lastParsed = { label: p.label, qs: p.qs };
    } catch {
      // Bad JSON — behave like a first visit.
    }
  }
  return lastParsed;
}

/**
 * The homepage's returning-visitor chip: "Pick up where you left off"
 * with the last search's own words. Renders nothing for a first-time
 * visitor, so the layout is identical either way — the teardown's rule:
 * personalize the content, never the structure.
 */
export function LastSearchChip() {
  const saved = useSyncExternalStore(subscribe, readSnapshot, () => null);

  if (!saved) return null;

  return (
    <div className="mt-4 text-center">
      <Link
        href={`/cars?${saved.qs}`}
        className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
      >
        Pick up where you left off · {saved.label} →
      </Link>
    </div>
  );
}
