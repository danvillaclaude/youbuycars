import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Messages · YouBuyCars", robots: { index: false } };

interface ChatRow {
  id: string;
  buyer_id: string;
  seller_id: string;
  listing_id: string | null;
  last_message_at: string;
}

/** Every conversation you're in — buyer or seller, same page (0013). */
export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: chatData } = await supabase
    .from("chats")
    .select("*")
    .order("last_message_at", { ascending: false })
    .limit(100);
  const chats = (chatData ?? []) as ChatRow[];

  const otherIds = [
    ...new Set(
      chats.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id)),
    ),
  ];
  const namesById = new Map<string, string>();
  if (otherIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", otherIds);
    for (const p of (profs ?? []) as {
      id: string;
      display_name: string | null;
    }[]) {
      namesById.set(p.id, p.display_name ?? "Someone");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">Messages</h1>
      {chats.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">
          No conversations yet — find a car and message its seller.{" "}
          <Link href="/cars" className="text-blue-600 underline">
            Browse cars →
          </Link>
        </p>
      ) : (
        <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {chats.map((c) => (
            <Link
              key={c.id}
              href={`/messages/${c.id}`}
              className="flex items-baseline justify-between px-5 py-4 hover:bg-slate-50"
            >
              <span className="font-semibold text-slate-900">
                {namesById.get(
                  c.buyer_id === user.id ? c.seller_id : c.buyer_id,
                ) ?? "Conversation"}
              </span>
              <span className="text-xs text-slate-500">
                {new Date(c.last_message_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
