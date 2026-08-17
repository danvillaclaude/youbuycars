"use client";

import { useState } from "react";
import { track } from "@/app/track-client";

/**
 * Seller-direct contact, behind one checkbox (16 Aug 2026, the owner's
 * pick: one tick unlocks both buttons). The tick is the buyer's explicit
 * opt-in to hear back from THIS seller — a stronger record than the
 * tap-implies-consent note it replaces, which matters most for CRM
 * dealerships texting back under their own registered campaigns. The
 * platform-line fallback deliberately doesn't use this component: its
 * one-tap flow is the carrier-registered one, word for word.
 */
export function ContactBox({
  sellerName,
  phoneDisplay,
  telHref,
  smsHref,
  listingId,
}: {
  sellerName: string;
  phoneDisplay: string;
  telHref: string;
  smsHref: string;
  listingId: string;
}) {
  const [agreed, setAgreed] = useState(false);

  const btn = (enabled: boolean, solid: boolean) =>
    `rounded-full px-4 py-3 text-center text-sm font-bold ${
      solid
        ? enabled
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "cursor-not-allowed bg-slate-200 text-slate-400"
        : enabled
          ? "border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
          : "cursor-not-allowed border border-slate-200 font-semibold text-slate-300"
    }`;

  function guard(e: React.MouseEvent, kind: "text_tap" | "call_tap") {
    if (!agreed) {
      e.preventDefault();
      return;
    }
    track(listingId, kind);
  }

  return (
    <div id="contact" className="mt-4">
      <label className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
        />
        <span className="text-xs leading-relaxed text-slate-600">
          I agree {sellerName} may text or call me back about this car.
          Message and data rates may apply; reply STOP to any text to stop.
        </span>
      </label>
      <div className="mt-2 grid gap-2">
        <a
          href={smsHref}
          aria-disabled={!agreed}
          onClick={(e) => guard(e, "text_tap")}
          className={btn(agreed, true)}
        >
          💬 Text about this car
        </a>
        <a
          href={telHref}
          aria-disabled={!agreed}
          onClick={(e) => guard(e, "call_tap")}
          className={btn(agreed, false)}
        >
          📞 Call {sellerName} · {phoneDisplay}
        </a>
      </div>
    </div>
  );
}
