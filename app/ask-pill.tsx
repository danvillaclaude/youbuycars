import Link from "next/link";

/**
 * The persistent Ask-AI pill (17 Aug 2026, from the fresh CarGurus
 * look: their "Ask Guru" bubble rides every page, bottom-right). Ours
 * opens /ask — the teaser today, the real assistant when it lands. It
 * REPLACED the back-to-top arrow outright, the owner's call: one
 * floating thing per corner, and this one earns the spot.
 */
export function AskPill() {
  return (
    <Link
      href="/ask"
      className="fixed bottom-4 right-4 z-40 rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800"
    >
      ✦ Ask AI
    </Link>
  );
}
