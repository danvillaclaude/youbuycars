import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * robots.txt (23 Aug 2026 overnight pass): there was none — crawlers got
 * a 404 and assumed "everything", which is nearly right but leaves the
 * private desks (dashboard, admin, messages) crawlable and never points
 * at the sitemap. Public pages stay fully open; sold listings included,
 * by the spec's permanent-slug rule.
 *
 * Login, signup, saved, messages and pending are NOT listed: each is
 * linked from every page, and a Disallow stops the crawler READING the
 * noindex they carry — so the URL gets indexed from anchor text alone,
 * with no title. Letting them be crawled is what makes the noindex work.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/alerts/unsubscribe", "/api/"],
      },
    ],
    sitemap: `${SITE.domain}/sitemap.xml`,
  };
}
