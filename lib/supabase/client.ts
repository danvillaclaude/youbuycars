import { createBrowserClient } from "@supabase/ssr";

/** Browser client — auth flows and photo uploads. Public keys only. */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
