/**
 * What a user may read from a database error (23 Aug 2026 audit).
 *
 * SQLSTATE P0001 is `raise exception` — the guard triggers' deliberate,
 * human sentences ("listing cap reached…", "only an admin can activate…",
 * "slugs are permanent") — and passes through. Everything else (RLS
 * 42501, unique 23505, FK 23503, check 23514, transport) is the engine
 * talking: log it server-side, say something calm.
 */
export function userMessage(
  e: { code?: string; message: string },
  fallback = "Something went wrong — please try again.",
): string {
  if (e.code === "P0001") return e.message;
  console.error("[db]", e.code ?? "-", e.message);
  return fallback;
}
