import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE } from "@/lib/site";
import { citySlug, isMetroDetroitCity } from "@/lib/listings";

/**
 * Static pages plus every listing's permanent slug — active AND sold,
 * because sold URLs stay alive by design (the spec's SEO rule). Plain
 * anon client: sitemaps run outside a request, so no cookies to carry.
 *
 * LIVE and HONEST (23 Aug 2026 SEO plan). It used to be a build-time
 * snapshot, so a listing approved between deploys was missing until
 * someone pushed code; it regenerates hourly now and on every approve,
 * sold and edit (revalidatePath in the actions). And 19 of its 25 rows
 * stamped lastmod=now on every build — Google says a sitemap with
 * fabricated dates gets the field discounted for the WHOLE file,
 * including the six honest listing dates. Static pages now carry no
 * lastmod at all; a seller page's is the newest edit among its cars.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    "",
    "/cars",
    "/compare",
    "/sell",
    "/dealers",
    "/research",
    // Guide URLs come from the research_posts query below — the code
    // ARTICLES source is gone (migration 0022 moved the five into rows).
    "/ask",
    "/site-map",
    "/about",
    "/contact",
    "/sms-consent",
    "/privacy",
    "/terms",
  ].map((path) => ({ url: `${SITE.domain}${path}` }));

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const [{ data }, { data: sellerData }, { data: postData }, { data: cityData }] = await Promise.all([
      supabase
        .from("listings")
        .select("slug, updated_at, seller_id")
        .in("status", ["active", "sold"]),
      supabase
        .from("profiles")
        .select("id, public_slug")
        .not("public_slug", "is", null),
      supabase
        .from("research_posts")
        .select("slug, published_at")
        .eq("status", "published"),
      // The city doors (30 Aug 2026): announce only cities with a live
      // car — an empty city page is noindex and doesn't belong here.
      supabase
        .from("listings")
        .select("updated_at, profiles(city)")
        .eq("status", "active"),
    ]);
    const postPages = ((postData ?? []) as { slug: string; published_at: string | null }[]).map(
      (a) => ({
        url: `${SITE.domain}/research/${a.slug}`,
        ...(a.published_at ? { lastModified: new Date(a.published_at) } : {}),
      }),
    );
    const rows = (data ?? []) as { slug: string; updated_at: string; seller_id: string }[];
    const listingPages = rows.map((l) => ({
      url: `${SITE.domain}/cars/${l.slug}`,
      lastModified: new Date(l.updated_at),
    }));
    // A seller page changes when one of its cars does.
    const newestBySeller = new Map<string, string>();
    for (const l of rows) {
      const prev = newestBySeller.get(l.seller_id);
      if (!prev || l.updated_at > prev) newestBySeller.set(l.seller_id, l.updated_at);
    }
    const sellerPages = ((sellerData ?? []) as { id: string; public_slug: string }[]).map(
      (s) => {
        const newest = newestBySeller.get(s.id);
        return {
          url: `${SITE.domain}/sellers/${s.public_slug}`,
          ...(newest ? { lastModified: new Date(newest) } : {}),
        };
      },
    );
    // One entry per city with live inventory; lastmod = its newest edit.
    const newestByCity = new Map<string, string>();
    // PostgREST returns the to-one embed as an object; the generated type
    // guesses an array — normalize both shapes rather than argue with it.
    for (const row of (cityData ?? []) as unknown as {
      updated_at: string;
      profiles: { city: string | null } | { city: string | null }[] | null;
    }[]) {
      const p = row.profiles;
      const city = Array.isArray(p) ? (p[0]?.city ?? null) : (p?.city ?? null);
      if (!isMetroDetroitCity(city)) continue;
      const prev = newestByCity.get(city!);
      if (!prev || row.updated_at > prev) newestByCity.set(city!, row.updated_at);
    }
    const cityPages = [...newestByCity.entries()].map(([city, newest]) => ({
      url: `${SITE.domain}/cars/city/${citySlug(city)}`,
      lastModified: new Date(newest),
    }));

    return [
      ...staticPages,
      ...cityPages,
      ...postPages,
      ...listingPages,
      ...sellerPages,
    ];
  } catch {
    return staticPages;
  }
}
