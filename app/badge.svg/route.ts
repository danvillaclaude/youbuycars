/**
 * The dealer badge (29-30 Aug 2026 SEO plan, "the dealer-page kit"): a
 * small SVG a dealership pastes on its own site, linking back to its
 * YouBuyCars page. Served from our origin so the snippet has no third
 * party in it; cached long because it changes never. Offered, never
 * required — a link exchanged for the free plan is Google's definition
 * of link spam, so the kit's wording keeps it optional.
 */
export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="196" height="40" viewBox="0 0 196 40" role="img" aria-label="Find us on YouBuyCars">
  <rect width="196" height="40" rx="20" fill="#0f172a"/>
  <text x="18" y="25" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="13" fill="#94a3b8">Find us on</text>
  <text x="86" y="25" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff">You<tspan fill="#3b82f6">Buy</tspan>Cars</text>
</svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
