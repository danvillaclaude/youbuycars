"use client";

import { useState } from "react";

/**
 * Progressive disclosure for seller-authored text — the teardown's
 * dealer-block pattern (three stacked truncations, each with its own
 * "show more"). Long text starts clipped at a word boundary; short text
 * renders plain with no button at all.
 */
export function ExpandText({
  text,
  limit = 400,
  moreLabel = "Show more",
  className,
}: {
  text: string;
  limit?: number;
  moreLabel?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (text.length <= limit) {
    return <p className={className}>{text}</p>;
  }

  const cut = text.slice(0, limit);
  const clipped = cut.slice(0, cut.lastIndexOf(" ") > limit / 2 ? cut.lastIndexOf(" ") : limit);

  return (
    <div>
      <p className={className}>{open ? text : `${clipped}…`}</p>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1.5 text-sm font-semibold text-blue-600 hover:underline"
      >
        {open ? "Show less" : moreLabel}
      </button>
    </div>
  );
}
