"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * The magic-link door (0013, the owner's pick: "email magic-link — no
 * password ever"). The metadata marks the account is_buyer at birth, so
 * the seller-approval machinery never notices them.
 */
export function BuyerSignIn({
  sellerId,
  listingId,
}: {
  sellerId: string;
  listingId: string | null;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const params = new URLSearchParams({ seller: sellerId });
    if (listingId) params.set("listing", listingId);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        data: { is_buyer: true },
        emailRedirectTo: `${window.location.origin}/messages/start?${params}`,
      },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  if (sent) {
    return (
      <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
        Check your email — the sign-in link brings you right back here.
      </p>
    );
  }

  return (
    <form onSubmit={send} className="space-y-3">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
      />
      <button
        disabled={busy}
        className="w-full rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
