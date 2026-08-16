import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatThread } from "./chat-thread";

export const metadata: Metadata = { title: "Messages · YouBuyCars" };

/**
 * One conversation (0013). RLS scopes everything — a stranger's chat id
 * simply loads nothing. For a CRM dealership the seller side is usually
 * their CRM talking over the bridge; the buyer never knows the difference.
 */
export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/messages`);

  const { data: chatData } = await supabase
    .from("chats")
    .select("id, buyer_id, seller_id, listing_id")
    .eq("id", id)
    .maybeSingle();
  const chat = chatData as {
    id: string;
    buyer_id: string;
    seller_id: string;
    listing_id: string | null;
  } | null;
  if (!chat) notFound();

  const me = user.id === chat.buyer_id ? "buyer" : "seller";
  const otherId = me === "buyer" ? chat.seller_id : chat.buyer_id;

  const [{ data: otherData }, { data: messageData }, { data: listingData }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("display_name, public_slug")
        .eq("id", otherId)
        .maybeSingle(),
      supabase
        .from("chat_messages")
        .select("id, sender, body, created_at")
        .eq("chat_id", id)
        .order("created_at", { ascending: true })
        .limit(500),
      chat.listing_id
        ? supabase
            .from("listings")
            .select("year, make, model, slug, status")
            .eq("id", chat.listing_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  const other = otherData as {
    display_name: string | null;
    public_slug: string | null;
  } | null;
  const listing = listingData as {
    year: number;
    make: string;
    model: string;
    slug: string;
    status: string;
  } | null;

  return (
    <main className="mx-auto flex h-[calc(100dvh-57px)] max-w-2xl flex-col px-4 py-4">
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
        <div>
          <h1 className="text-lg font-bold">
            {other?.display_name ?? (me === "buyer" ? "Seller" : "Buyer")}
          </h1>
          {listing && (
            <Link
              href={`/cars/${listing.slug}`}
              className="text-xs text-blue-600 underline"
            >
              about the {listing.year} {listing.make} {listing.model}
            </Link>
          )}
        </div>
        <Link href="/messages" className="text-sm text-slate-400">
          ← All messages
        </Link>
      </div>

      <ChatThread
        chatId={chat.id}
        me={me}
        initialMessages={
          (messageData ?? []) as {
            id: string;
            sender: string;
            body: string;
            created_at: string;
          }[]
        }
      />
    </main>
  );
}
