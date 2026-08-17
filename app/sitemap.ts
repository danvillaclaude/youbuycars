import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";

/**
 * Static pages plus every listing's permanent slug — active AND sold,
 * because sold URLs stay alive by design (the spec's SEO rule). Plain
 * anon client: sitemaps run outside a request, so no cookies to carry.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/cars",
    "/compare",
    "/sell",
    "/dealers",
    "/about",
    "/contact",
    "/sms-consent",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${SITE.domain}${path}`,
    lastModified: new Date(),
  }));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const [{ data }, { data: sellerData }] = await Promise.all([
      supabase
        .from("listings")
        .select("slug, updated_at")
        .in("status", ["active", "sold"]),
      supabase
        .from("profiles")
        .select("public_slug")
        .not("public_slug", "is", null),
    ]);
    const listingPages = ((data ?? []) as { slug: string; updated_at: string }[]).map(
      (l) => ({
        url: `${SITE.domain}/cars/${l.slug}`,
        lastModified: new Date(l.updated_at),
      }),
    );
    const sellerPages = ((sellerData ?? []) as { public_slug: string }[]).map(
      (s) => ({
        url: `${SITE.domain}/sellers/${s.public_slug}`,
        lastModified: new Date(),
      }),
    );
    return [...staticPages, ...listingPages, ...sellerPages];
  } catch {
    return staticPages;
  }
}
