"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * Messaging actions (0013). RLS is the real gate on every one of these:
 * a chat only inserts with the caller as its buyer, and a message only
 * inserts as the side the caller actually is.
 */

/** Find (or open) the caller's chat with a seller and go there. */
export async function startChatAction(
  sellerId: string,
  listingId: string | null,
): Promise<{ ok: boolean; error?: string } | never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };
  if (user.id === sellerId) {
    return { ok: false, error: "That's your own page." };
  }

  const { data: existing } = await supabase
    .from("chats")
    .select("id")
    .eq("buyer_id", user.id)
    .eq("seller_id", sellerId)
    .limit(1)
    .maybeSingle();
  let chatId = (existing as { id: string } | null)?.id ?? null;

  if (!chatId) {
    const { data, error } = await supabase
      .from("chats")
      .insert({
        buyer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId,
      })
      .select("id")
      .single();
    if (error) return { ok: false, error: "Couldn't open the conversation." };
    chatId = (data as { id: string }).id;
  }
  redirect(`/messages/${chatId}`);
}

const messageSchema = z.object({
  chat_id: z.string().uuid(),
  body: z.string().trim().min(1, "Say something first.").max(2000),
});

export async function sendChatMessageAction(
  input: Record<string, unknown>,
): Promise<{ ok: boolean; error?: string }> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Check the message.",
    };
  }
  const d = parsed.data;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  // Which side is speaking — derived, never client-claimed.
  const { data: chatData } = await supabase
    .from("chats")
    .select("id, buyer_id, seller_id")
    .eq("id", d.chat_id)
    .maybeSingle();
  const chat = chatData as {
    id: string;
    buyer_id: string;
    seller_id: string;
  } | null;
  if (!chat) return { ok: false, error: "That conversation is gone." };
  const sender =
    user.id === chat.buyer_id
      ? "buyer"
      : user.id === chat.seller_id
        ? "seller"
        : null;
  if (!sender) return { ok: false, error: "Not your conversation." };

  const { error } = await supabase.from("chat_messages").insert({
    chat_id: d.chat_id,
    sender,
    body: d.body,
    /*
     * A seller typing HERE (marketplace dashboard) is already answering —
     * the CRM doesn't need to mirror their own words back, so it's
     * pre-stamped. Buyer messages stay unstamped for the puller.
     */
    ...(sender === "seller" ? { crm_synced_at: new Date().toISOString() } : {}),
  });
  if (error) return { ok: false, error: "Couldn't send that." };

  await supabase
    .from("chats")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", d.chat_id);

  revalidatePath(`/messages/${d.chat_id}`);
  return { ok: true };
}
