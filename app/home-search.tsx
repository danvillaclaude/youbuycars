"use client";

import Link from "next/link";
import { useState } from "react";
import { DEFAULT_ESTIMATE } from "@/lib/payments";

/**
 * The homepage search panel (29 Aug 2026, his redesign — "look at the
 * body"): three tabs over one white card. Shop cars and Search by
 * payment are plain GET forms onto /cars — the same URLs the board
 * filters by, so a homepage search IS a board view. Sell is a door,
 * not a form. Every select is fed live inventory by the server
 * component, so no option ever names a make or model with nothing
 * behind it (the no-empty-doors rule).
 */
export function HomeSearch({
  makes,
  models,
}: {
  makes: string[];
  models: string[];
}) {
  const [tab, setTab] = useState<"shop" | "payment" | "sell">("shop");

  const tabBtn = (active: boolean) =>
    `rounded-full px-4 py-2 text-sm font-bold transition-none ${
      active
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100"
    }`;
  const selectCls =
    "w-full rounded-full border-0 bg-slate-50 px-3.5 py-3 text-sm font-medium text-slate-700";

  const note = `Estimates assume $${DEFAULT_ESTIMATE.down.toLocaleString("en-US")} down, ${DEFAULT_ESTIMATE.termMonths} months, ${DEFAULT_ESTIMATE.apr}% APR — estimates only, never an offer of credit.`;

  return (
    <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-lg shadow-blue-900/5">
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => setTab("shop")} aria-pressed={tab === "shop"} className={tabBtn(tab === "shop")}>
          Shop cars
        </button>
        <button type="button" onClick={() => setTab("payment")} aria-pressed={tab === "payment"} className={tabBtn(tab === "payment")}>
          By payment
        </button>
        <button type="button" onClick={() => setTab("sell")} aria-pressed={tab === "sell"} className={tabBtn(tab === "sell")}>
          Sell your car
        </button>
        <span className="ml-auto hidden items-center gap-1 pr-2 text-xs font-semibold text-slate-500 sm:flex">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path d="M8 14s5-4.6 5-8a5 5 0 1 0-10 0c0 3.4 5 8 5 8Z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="8" cy="6" r="1.7" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          Metro Detroit, MI
        </span>
      </div>

      {tab === "shop" && (
        <form
          action="/cars"
          method="get"
          role="search"
          aria-label="Search used cars"
          className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        >
          <select name="make" aria-label="Make" defaultValue="" className={`${selectCls} lg:col-span-1`}>
            <option value="">Any make</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select name="q" aria-label="Model" defaultValue="" className={`${selectCls} lg:col-span-1`}>
            <option value="">Any model</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <select name="max_price" aria-label="Maximum price" defaultValue="" className={`${selectCls} lg:col-span-1`}>
            <option value="">Any price</option>
            {[5000, 10000, 15000, 20000, 25000].map((p) => (
              <option key={p} value={p}>
                {`Under $${(p / 1000).toFixed(0)}k`}
              </option>
            ))}
          </select>
          <select name="year_min" aria-label="Minimum year" defaultValue="" className={`${selectCls} lg:col-span-1`}>
            <option value="">Any year</option>
            {[2005, 2010, 2015, 2020].map((y) => (
              <option key={y} value={y}>
                {`${y} or newer`}
              </option>
            ))}
          </select>
          <select name="max_miles" aria-label="Maximum mileage" defaultValue="" className={`${selectCls} lg:col-span-1`}>
            <option value="">Any miles</option>
            {[50000, 100000, 150000].map((m) => (
              <option key={m} value={m}>
                {`Under ${m / 1000}k mi`}
              </option>
            ))}
          </select>
          <button className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 lg:col-span-1">
            Search
          </button>
        </form>
      )}

      {tab === "payment" && (
        <form
          action="/cars"
          method="get"
          role="search"
          aria-label="Search by monthly payment"
          className="mt-3"
        >
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <select name="max_payment" aria-label="Maximum monthly payment" defaultValue="300" className={selectCls}>
              {[150, 200, 250, 300, 400, 500].map((p) => (
                <option key={p} value={p}>
                  {`Up to $${p}/mo`}
                </option>
              ))}
            </select>
            <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Show cars in my budget
            </button>
          </div>
          {/* The same assumptions as every est./mo on the site — one
              source (DEFAULT_ESTIMATE), so this line can never drift. */}
          <p className="mt-2 px-1 text-[11px] text-slate-500">{note}</p>
        </form>
      )}

      {tab === "sell" && (
        <div className="mt-3 flex flex-col items-start gap-3 px-1 pb-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Free to list your own car. A real person reviews it, it goes live
            to Metro Detroit buyers, and buyers text you directly.
          </p>
          <Link
            href="/sell"
            className="shrink-0 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            {"List your car — free"}
          </Link>
        </div>
      )}
    </div>
  );
}
