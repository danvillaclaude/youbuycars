import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client on the PUBLISHABLE key. The inquiries table
 * is a letterbox: RLS grants anon INSERT and nothing else (migration
 * 0002), so this client can post a lead in and can never read one out.
 * No service-role secret exists in this app on purpose — there's nothing
 * here worth stealing a key for.
 */
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing — see .env.example.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
