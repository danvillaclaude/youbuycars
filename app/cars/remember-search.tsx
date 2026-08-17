"use client";

import { useEffect } from "react";

/**
 * The teardown's personalization technique, at its shallowest useful
 * depth: remember the last real search (filters actually set — a bare
 * /cars visit isn't a search worth resuming) so the homepage can offer
 * it back. localStorage, no account, no server — swap the content,
 * never the layout.
 */
export function RememberSearch({ label, qs }: { label: string; qs: string }) {
  useEffect(() => {
    if (!qs) return;
    try {
      localStorage.setItem(
        "ybc:last-search",
        JSON.stringify({ label, qs, at: Date.now() }),
      );
    } catch {
      // Private mode with storage blocked — personalization just doesn't happen.
    }
  }, [label, qs]);
  return null;
}
