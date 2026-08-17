"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  clearCompare,
  compareSnapshot,
  emptyCompareSnapshot,
  subscribeCompare,
} from "./compare-store";

/**
 * The floating compare tray: appears once a car is picked, bottom
 * center — clear of the Ask-AI pill's corner (the teardown's floating-
 * widget collision warning, taken seriously). Two picks arm the
 * Compare button, which is just a link into the page that already
 * knows what to do with a and b.
 */
export function CompareTray() {
  const picked = useSyncExternalStore(
    subscribeCompare,
    compareSnapshot,
    emptyCompareSnapshot,
  );

  if (picked.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-slate-200 bg-white py-2 pl-5 pr-2 shadow-xl shadow-slate-900/15">
      <span className="text-sm font-semibold text-slate-700 tabular-nums">
        {picked.length === 1 ? "Pick one more to compare" : "2 cars picked"}
      </span>
      {picked.length === 2 ? (
        <Link
          href={`/compare?a=${encodeURIComponent(picked[0])}&b=${encodeURIComponent(picked[1])}`}
          className="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-bold text-white hover:bg-blue-700"
        >
          Compare ⇄
        </Link>
      ) : null}
      <button
        type="button"
        onClick={clearCompare}
        aria-label="Clear compare picks"
        className="rounded-full px-2 py-1.5 text-sm text-slate-400 hover:text-slate-600"
      >
        ✕
      </button>
    </div>
  );
}
