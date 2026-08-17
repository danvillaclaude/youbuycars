"use client";

import { useSyncExternalStore } from "react";
import {
  emptySnapshot,
  savedSnapshot,
  subscribeSaved,
  toggleSaved,
} from "./saved-cars";

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M12 20.5 4.8 13.6C3 11.9 3 9 4.8 7.3c1.7-1.7 4.5-1.7 6.2 0l1 1 1-1c1.7-1.7 4.5-1.7 6.2 0 1.8 1.7 1.8 4.6 0 6.3L12 20.5z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * The card/listing heart — the piece of the teardown's card anatomy we
 * skipped until he asked for the header ("likes"). A circular white
 * button floating over the photo, exactly their shape; filled brand
 * blue once saved. Renders unsaved during SSR/hydration (the server
 * snapshot is empty), fills in client-side — same no-mismatch pattern
 * as the last-search chip.
 */
export function SaveHeart({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const saved = useSyncExternalStore(subscribeSaved, savedSnapshot, emptySnapshot);
  const isSaved = saved.includes(slug);

  return (
    <button
      type="button"
      aria-label={isSaved ? "Remove from saved cars" : "Save this car"}
      aria-pressed={isSaved}
      onClick={(e) => {
        // Hearts live inside card links — the click is the heart's alone.
        e.preventDefault();
        e.stopPropagation();
        toggleSaved(slug);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_0_8px_rgba(0,0,0,0.2)] ${
        isSaved ? "text-blue-600" : "text-slate-500"
      } ${className}`}
    >
      <HeartIcon filled={isSaved} />
    </button>
  );
}

/** The header's heart: icon + live count, linking to /saved. */
export function SavedCount() {
  const saved = useSyncExternalStore(subscribeSaved, savedSnapshot, emptySnapshot);
  return (
    <span className="relative flex items-center text-slate-700">
      <HeartIcon filled={saved.length > 0} />
      {saved.length > 0 && (
        <span className="absolute -right-2 -top-1.5 rounded-full bg-blue-600 px-1.5 text-[10px] font-bold leading-4 text-white tabular-nums">
          {saved.length}
        </span>
      )}
    </span>
  );
}
