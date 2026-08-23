import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import Link from "next/link";
import { requireApprovedSeller } from "@/lib/auth";

export const metadata: Metadata = { title: "Inquiries · YouBuyCars", robots: { index: false } };

interface Inquiry {
  id: string;
  name: string;
  phone: string;
  looking_for: string;
  sms_consent: boolean;
  forwarded_at: string | null;
  created_at: string;
}

/**
 * The seller's inquiry inbox (0010): everything buyers sent through the
 * form on their dealer page. For CRM dealerships the same inquiry is
 * already a lead in their CRM (the "in your CRM" chip); for everyone
 * else this page IS the delivery until email lands.
 */
export default async function InquiriesPage() {
  const { supabase, user } = await requireApprovedSeller();

  const { data } = await supabase
    .from("seller_inquiries")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  const inquiries = (data ?? []) as Inquiry[];

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-bold">Inquiries</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 underline">
          ← My listings
        </Link>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        What buyers sent through the form on your dealer page.
      </p>

      {inquiries.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 p-10 text-center">
          <p className="font-semibold text-slate-700">Nothing yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Share your dealer page — inquiries land here the moment a buyer
            sends one.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {inquiries.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-semibold text-slate-900">{q.name}</span>
                <span className="text-sm text-slate-500">{q.phone}</span>
                {q.sms_consent ? (
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-800">
                    OK to text
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                    call first — no text opt-in
                  </span>
                )}
                {q.forwarded_at && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                    in your CRM
                  </span>
                )}
                <span className="ml-auto text-[11px] text-slate-500">
                  {new Date(q.created_at).toLocaleString("en-US", {
                    timeZone: SITE.timeZone,
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              {q.looking_for && (
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {q.looking_for}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
