"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessageAction } from "../actions";

interface Msg {
  id: string;
  sender: string;
  body: string;
  created_at: string;
}

/**
 * The chat surface (0013). Server-rendered messages arrive as props; a
 * quiet 6-second refresh keeps the other side's words appearing without
 * websockets — honest enough for car shopping, free of infrastructure.
 * Sends are optimistic: the bubble paints now, the server row replaces it
 * on the next refresh (matched by body, the inbox echo's own rule).
 */
export function ChatThread({
  chatId,
  me,
  initialMessages,
}: {
  chatId: string;
  me: "buyer" | "seller";
  initialMessages: Msg[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [echo, setEcho] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // The quiet poll — and the echo clears when its real row shows up.
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 6000);
    return () => clearInterval(t);
  }, [router]);
  if (echo && initialMessages.some((m) => m.sender === me && m.body === echo)) {
    setEcho(null);
  }

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [initialMessages.length, echo]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setText("");
    setEcho(body);
    setBusy(true);
    setError(null);
    const res = await sendChatMessageAction({ chat_id: chatId, body });
    setBusy(false);
    if (!res.ok) {
      setEcho(null);
      setText(body);
      setError(res.error ?? "Couldn't send that.");
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto py-4">
        {initialMessages.length === 0 && !echo && (
          <p className="py-10 text-center text-sm text-slate-500">
            Say hello — ask about the car, the price, a time to see it.
          </p>
        )}
        {initialMessages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.sender === me
                ? "ml-auto bg-blue-600 text-white"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {m.body}
          </div>
        ))}
        {echo && (
          <div className="ml-auto max-w-[85%] rounded-2xl bg-blue-600/70 px-4 py-2.5 text-sm leading-relaxed text-white">
            {echo}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {error && (
        <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <form onSubmit={send} className="flex gap-2 border-t border-slate-100 pt-3">
        <input
          aria-label="Message"
          autoComplete="off"
          enterKeyHint="send"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm"
        />
        <button
          disabled={busy || !text.trim()}
          className="rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </>
  );
}
