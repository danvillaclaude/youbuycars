"use server";

import { z } from "zod";
import { createServerClient } from "@/lib/supabase-server";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[\d\s()+.-]{7,20}$/, "That phone number doesn't look right."),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  looking_for: z
    .string()
    .trim()
    .min(2, "Tell us a little about what you want.")
    .max(2000),
  sms_consent: z.boolean(),
});

export interface InquiryResult {
  ok: boolean;
  error?: string;
}

/**
 * The landing form. Consent is OPTIONAL and stored exactly as given —
 * an unticked box means this inquiry gets no text, full stop; we keep the
 * lead anyway and reach out however else we can. The IP/user agent are
 * NOT stored: the consent record that matters (checkbox state + timestamp
 * + what the disclosure said) is, which is what a carrier audit asks for.
 */
export async function submitInquiry(input: {
  name: string;
  phone: string;
  email: string;
  looking_for: string;
  sms_consent: boolean;
  website: string; // Honeypot — humans never see it, bots fill it.
}): Promise<InquiryResult> {
  if (input.website) return { ok: true }; // Silently drop bot spam.

  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form and retry.",
    };
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("inquiries").insert({
    name: parsed.data.name,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    looking_for: parsed.data.looking_for,
    sms_consent: parsed.data.sms_consent,
    consent_language:
      parsed.data.sms_consent
        ? "I agree to receive text messages from YouBuyCars about vehicles, appointments, and financing. Consent is not a condition of purchase and you can send this form without it. Message & data rates may apply; message frequency varies. Reply STOP to opt out."
        : null,
  });
  if (error) {
    return { ok: false, error: "Something went wrong — please try again." };
  }

  /*
   * Forward into the CRM, best-effort: the Supabase row above is the
   * durable record; this is what makes the inquiry ring the inbox with
   * the full capture flow (lead, thread message, follow-up enrollment,
   * speed-to-lead greeting). A CRM hiccup must never turn a captured
   * inquiry into a user-facing error, so failures only log.
   */
  const crmUrl = process.env.CRM_INQUIRY_URL;
  const crmSecret = process.env.CRM_INQUIRY_SECRET;
  if (crmUrl && crmSecret) {
    try {
      await fetch(crmUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${crmSecret}`,
        },
        body: JSON.stringify({
          name: parsed.data.name,
          phone: parsed.data.phone,
          message:
            parsed.data.looking_for +
            (parsed.data.email ? `\nEmail: ${parsed.data.email}` : ""),
          consented: parsed.data.sms_consent,
        }),
      });
    } catch (e) {
      console.error("CRM forward failed (inquiry kept):", e);
    }
  }
  return { ok: true };
}
