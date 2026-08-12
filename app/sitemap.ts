import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** Static for now; Phase 1 adds every listing's permanent slug here. */
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/contact", "/sms-consent", "/privacy", "/terms"].map(
    (path) => ({
      url: `${SITE.domain}${path}`,
      lastModified: new Date(),
    }),
  );
}
