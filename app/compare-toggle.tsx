"use client";

import { useSyncExternalStore } from "react";
import {
  compareSnapshot,
  emptyCompareSnapshot,
  subscribeCompare,
  toggleCompare,
} from "./compare-store";

/**
 * The card's compare pick — a small circular ⇄ under the heart. Filled
 * brand-blue while picked; the floating tray does the rest.
 */
export function CompareToggle({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const picked = useSyncExternalStore(
    subscribeCompare,
    compareSnapshot,
    emptyCompareSnapshot,
  );
  const isPicked = picked.includes(slug);

  return (
    <button
      type="button"
      aria-label={isPicked ? "Remove from compare" : "Add to compare"}
      aria-pressed={isPicked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleCompare(slug);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shadow-[0_0_8px_rgba(0,0,0,0.2)] ${
        isPicked ? "bg-blue-600 text-white" : "bg-white text-slate-500"
      } ${className}`}
    >
      ⇄
    </button>
  );
}
