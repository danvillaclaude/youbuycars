import type { NextConfig } from "next";

/**
 * One host (23 Aug 2026 SEO plan): www.youbuycars.com and the Vercel
 * aliases all served the full site with 200 and no redirect, so a search
 * engine could index the brand under any of them. Everything permanent-
 * redirects to the apex. Preview deployments (unique *.vercel.app hosts)
 * are left alone on purpose; only the two standing aliases are named.
 */
const CANONICAL_HOST = "youbuycars.com";
const OTHER_HOSTS = [
  "www.youbuycars.com",
  "youbuycars.vercel.app",
  "youbuycars-git-main-i-sell-cars.vercel.app",
];

const nextConfig: NextConfig = {
  async redirects() {
    return OTHER_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `https://${CANONICAL_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
