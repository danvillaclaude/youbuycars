"use server";

import { createClient } from "@/lib/supabase/server";
import { describeSearch, searchTerm, type SearchFilters } from "@/lib/listings";
import { maxPriceForPayment } from "@/lib/payments";

/**
 * Save-a-search (0014, from the CarGurus teardown study): the buyer
 * leaves an email and the filters they're looking at; a daily letter
 * arrives when new matching cars go live. The insert is the letterbox
 * pattern — anon may post, nobody public may read — and the sender runs
 * on the CRM's cron, not here.
 */
export async function saveSearchAction(
  filters: SearchFilters,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const cleanEmail = email.trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cleanEmail) || cleanEmail.length > 200) {
    return { ok: false, error: "That email doesn't look right." };
  }

  // Rebuild the row from the raw filters — never trust a label or a
  // number shape the browser could have edited into nonsense.
  const maxPayment = numberOrNull(filters.max_payment);
  const givenMaxPrice = numberOrNull(filters.max_price);
  /*
   * The $/mo budget converts to a price cap AT SAVE TIME with the same
   * assumptions as the cards, and lands in max_price — so the CRM's
   * alert sender matches on price like always and needs no change.
   * max_payment survives separately purely for the label's sake.
   */
  const paymentCap = maxPayment ? maxPriceForPayment(maxPayment) : null;
  const effectiveMaxPrice =
    givenMaxPrice && paymentCap
      ? Math.min(givenMaxPrice, paymentCap)
      : (givenMaxPrice ?? paymentCap);
  const row = {
    email: cleanEmail,
    make: filters.make?.slice(0, 60) || null,
    // Sanitised like the board query: the CRM alert sender puts this
    // straight into an or() filter.
    q: searchTerm(filters.q).slice(0, 80) || null,
    body_style: filters.body_style?.slice(0, 40) || null,
    year_min: numberOrNull(filters.year_min),
    year_max: numberOrNull(filters.year_max),
    max_price: effectiveMaxPrice,
    max_payment: maxPayment,
    max_miles: numberOrNull(filters.max_miles),
    financing: Boolean(filters.financing),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("saved_searches").insert({
    ...row,
    label: describeSearch(row).slice(0, 160),
  });
  if (error) {
    return { ok: false, error: "Couldn't save that — try again in a minute." };
  }
  return { ok: true };
}

function numberOrNull(v: number | null | undefined): number | null {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}
