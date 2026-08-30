"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * The site-wide half of analytics (0021): one row per page per browser
 * session, the same fire-and-forget rules as the listing beacon —
 * crawlers run none of this, errors are never a shopper's problem. The
 * referrer travels only when it's another SITE (an entry, not an
 * internal hop), which is what makes the owner's referrer chart read as
 * "where visitors come from" instead of navigation noise.
 */
function sessionKey(): string {
  try {
    const existing = sessionStorage.getItem("ybc-sid");
    if (existing) return existing;
    const fresh = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    sessionStorage.setItem("ybc-sid", fresh);
    return fresh;
  } catch {
    return "no-storage-" + Math.random().toString(36).slice(2, 10);
  }
}

export function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    try {
      const dedupe = `ybc-pv-${pathname}`;
      try {
        if (sessionStorage.getItem(dedupe)) return;
        sessionStorage.setItem(dedupe, "1");
      } catch {
        // Storage blocked — count it anyway.
      }
      let referrer_host: string | null = null;
      try {
        if (document.referrer) {
          const host = new URL(document.referrer).hostname;
          if (host && host !== location.hostname) referrer_host = host.slice(0, 100);
        }
      } catch {
        referrer_host = null;
      }
      const payload = JSON.stringify({
        kind: "page_view",
        path: pathname.slice(0, 200),
        referrer_host,
        session_key: sessionKey(),
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
      } else {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    } catch {
      // Never a shopper's problem.
    }
  }, [pathname]);
  return null;
}
