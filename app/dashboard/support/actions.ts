"use server";

import { z } from "zod";
import { requireApprovedSeller } from "@/lib/auth";
import { userMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().trim().min(1, "Tell us your name.").max(120),
  subject: z.string().trim().min(1, "A few words on what this is about.").max(200),
  body: z.string().trim().min(1, "Tell us what's going on.").max(4000),
});

/**
 * The seller door on the support letterbox (0023). The email is NEVER
 * taken from the form: the reply goes to the address the account signed
 * in with, read server-side from auth — so a signed-in request can't
 * point the reply at a stranger. profile_id ties the request to the
 * seller, and the letterbox policy only lets a session claim its own
 * (the RLS is the security; this action is just the polite path to it).
 */
export async function sendSupportRequestAction(input: {
  name: string;
  subject: string;
  body: string;
}): Promise<{ ok: boolean; error?: string }> {
  const { supabase, user } = await requireApprovedSeller();
  const email = user.email ?? "";
  if (!email) {
    return {
      ok: false,
      error: "Your account has no email on it — use the form on /contact instead.",
    };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the form and retry.",
    };
  }

  const { error } = await supabase.from("support_requests").insert({
    profile_id: user.id,
    name: parsed.data.name,
    email,
    subject: parsed.data.subject,
    body: parsed.data.body,
  });
  if (error) return { ok: false, error: userMessage(error) };
  return { ok: true };
}
