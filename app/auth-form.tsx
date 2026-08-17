"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * One form, two modes. Auth happens in the browser against Supabase (the
 * public pair; the ssr package syncs the session cookie), so there are no
 * credentials passing through our own server at all.
 */
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    params.get("confirmed") ? "Email confirmed — sign in below." : null,
  );
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const displayName = String(fd.get("display_name") ?? "").trim();

    setBusy(true);
    setError(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        },
      });
      setBusy(false);
      if (error) return setError(error.message);
      setNotice(
        "Almost there — confirm your email, then sign in. A real person reviews every new seller account; you can post as soon as you're approved.",
      );
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) return setError(error.message);
    router.push(params.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          {notice}
        </p>
      )}

      {mode === "signup" && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Your name (shown to buyers)
          </span>
          <input
            name="display_name"
            required
            maxLength={80}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-600 focus:outline-none"
        />
      </label>

      <button
        disabled={busy}
        className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-xs text-slate-400">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="text-blue-600 underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
