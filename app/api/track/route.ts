import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * The analytics letterbox (0007). One POST per event from the browser —
 * views, CTA taps, calculator runs. Client-side on purpose: crawlers
 * reading pages for SEO don't run beacons, so the counts stay about
 * shoppers.
 *
 * Deliberately answers 204 to everything after validation: an analytics
 * endpoint that returns errors teaches the console to nag users about
 * our bookkeeping, and there is nothing a browser could do about it.
 */
const KINDS = new Set(["view", "text_tap", "call_tap", "calc_run"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      listing_id?: string;
      kind?: string;
    };
    const listingId = String(body.listing_id ?? "");
    const kind = String(body.kind ?? "");
    if (UUID.test(listingId) && KINDS.has(kind)) {
      const supabase = await createClient();
      // A junk listing id dies on the FK; RLS allows nothing but inserts.
      await supabase
        .from("listing_events")
        .insert({ listing_id: listingId, kind });
    }
  } catch {
    // Malformed JSON, dead listing, network noise — all the same silence.
  }
  return new NextResponse(null, { status: 204 });
}
