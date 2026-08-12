import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — SERVER ONLY (server actions and route handlers).
 * The inquiries table keeps RLS on with no policies, so the public can't
 * read anything back; this client is the only writer. Never import this
 * into a client component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing — see .env.example.");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
