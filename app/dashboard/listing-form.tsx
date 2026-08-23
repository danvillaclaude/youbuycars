"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  BODY_STYLES,
  COLOR_OPTIONS,
  CONDITIONS,
  DRIVETRAINS,
  FUEL_TYPES,
  photoUrl,
  TRANSMISSIONS,
  type Listing,
  type ListingPhoto,
  PHOTO_WIDTHS,
} from "@/lib/listings";
import {
  createListingAction,
  deletePhotoAction,
  recordPhotosAction,
  updateListingAction,
} from "./actions";

/**
 * Create and edit share this form — rebuilt (16 Aug 2026) to the
 * CarGurus Sell-My-Car wizard pattern, the teardown's "worth copying
 * wholesale": collapsible accordion sections, each header wearing a
 * status pill (green "✓ Completed" / red "⚠ Errors" / gray "Required"
 * or "Optional"), inline red text under the one specific failing field
 * rather than a banner alone, auto-scroll back to the first problem on
 * submit, and persuasion copy living inside the form where it helps.
 *
 * Mechanics are unchanged underneath: photos go browser → storage
 * directly (the seller's own folder; RLS enforces it), then rows are
 * recorded through a server action. On edit of a LIVE listing, the
 * warning below tells the truth: substance changes send it back for
 * re-approval.
 */

type SectionKey = "basics" | "numbers" | "specs" | "photos" | "story";

const SECTIONS: {
  key: SectionKey;
  title: string;
  sub: string;
  required: boolean;
}[] = [
  { key: "basics", title: "The basics", sub: "Year, make, model", required: true },
  { key: "numbers", title: "Miles & price", sub: "The two numbers every buyer checks first", required: true },
  { key: "specs", title: "The specs", sub: "Body style, colors, drivetrain — what the filters find", required: true },
  { key: "photos", title: "Photos", sub: "Up to 12 — the first one is the cover", required: false },
  { key: "story", title: "Description & extras", sub: "The story, the VIN, financing", required: false },
];

/** Which fields live in which section — drives pills and scroll-to. */
const SECTION_FIELDS: Record<SectionKey, string[]> = {
  basics: ["year", "make", "model", "trim_level"],
  numbers: ["mileage", "price"],
  specs: [
    "body_style", "exterior_color", "interior_color", "drivetrain",
    "transmission", "fuel_type", "engine", "condition",
  ],
  photos: [],
  story: ["description", "vin", "financing_offered"],
};

function validate(fd: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const year = Number(fd.get("year"));
  if (!fd.get("year") || !Number.isInteger(year) || year < 1900 || year > 2100)
    errors.year = "Enter the model year.";
  if (!String(fd.get("make") ?? "").trim()) errors.make = "Enter the make.";
  if (!String(fd.get("model") ?? "").trim()) errors.model = "Enter the model.";
  const mileage = Number(fd.get("mileage"));
  if (fd.get("mileage") === "" || !Number.isFinite(mileage) || mileage < 0)
    errors.mileage = "Enter the mileage.";
  const price = Number(fd.get("price"));
  if (!fd.get("price") || !Number.isFinite(price) || price <= 0)
    errors.price = "Enter an asking price.";
  // Body style is the one required spec (his call): it's what the
  // homepage tiles and the body-style filter run on.
  if (!fd.get("body_style")) errors.body_style = "Pick the body style.";
  return errors;
}

export function ListingForm({
  listing,
  photos = [],
  userId,
}: {
  listing?: Listing;
  photos?: ListingPhoto[];
  userId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  /*
   * The pills' view of the form, refreshed from the form's own onInput —
   * state, never a ref read during render (react-hooks/refs is right:
   * render must not peek at the DOM). Before the first keystroke it's
   * null and the pills fall back to what the `listing` prop implies.
   */
  const [live, setLive] = useState<{
    v: Record<string, string>;
    photosPicked: boolean;
    hasStory: boolean;
  } | null>(null);
  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    basics: !listing,
    numbers: false,
    // An old listing with no body style opens straight onto the ask.
    specs: Boolean(listing && !listing.body_style),
    photos: false,
    story: false,
  });

  function refreshLive(form: HTMLFormElement) {
    const fd = new FormData(form);
    setLive({
      v: validate(fd),
      photosPicked: (fd.getAll("photos") as File[]).some((f) => f && f.size > 0),
      hasStory: String(fd.get("description") ?? "").trim().length > 0,
    });
  }

  const GREEN = "bg-green-50 text-green-700 border-green-200";
  const GRAY = "bg-slate-50 text-slate-500 border-slate-200";

  /** The pill on a section header — the wizard's status language. */
  function pillFor(key: SectionKey): { label: string; cls: string } {
    if (SECTION_FIELDS[key].some((f) => errors[f]))
      return { label: "⚠ Errors", cls: "bg-red-50 text-red-700 border-red-200" };
    if (key === "basics") {
      const done = live
        ? !live.v.year && !live.v.make && !live.v.model
        : Boolean(listing);
      return done
        ? { label: "✓ Completed", cls: GREEN }
        : { label: "Required", cls: GRAY };
    }
    if (key === "numbers") {
      const done = live ? !live.v.mileage && !live.v.price : Boolean(listing);
      return done
        ? { label: "✓ Completed", cls: GREEN }
        : { label: "Required", cls: GRAY };
    }
    if (key === "specs") {
      const done = live ? !live.v.body_style : Boolean(listing?.body_style);
      return done
        ? { label: "✓ Completed", cls: GREEN }
        : { label: "Required", cls: GRAY };
    }
    if (key === "photos") {
      return photos.length > 0 || (live?.photosPicked ?? false)
        ? { label: "✓ Completed", cls: GREEN }
        : { label: "Optional", cls: GRAY };
    }
    const hasStory = live ? live.hasStory : Boolean(listing?.description);
    return hasStory
      ? { label: "✓ Completed", cls: GREEN }
      : { label: "Optional", cls: GRAY };
  }

  async function uploadPhotos(listingId: string, files: File[]) {
    if (files.length === 0) return;
    const supabase = createClient();
    const paths: string[] = [];
    for (const [i, file] of files.entries()) {
      setUploadNote(`Uploading photo ${i + 1} of ${files.length}…`);
      const clean = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
      const path = `${userId}/${listingId}/${Date.now()}-${i}-${clean}`;
      const { error } = await supabase.storage
        .from("listing-photos")
        .upload(path, file, { contentType: file.type });
      if (error) throw new Error(`Photo upload failed: ${error.message}`);
      paths.push(path);
    }
    const rec = await recordPhotosAction(listingId, paths);
    if (!rec.ok) throw new Error(rec.error);
    setUploadNote(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // The wizard's validation move: section pills go red, the specific
    // field gets its line, and the page scrolls back to the first problem.
    const found = validate(fd);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const badSections = SECTIONS.filter((s) =>
        SECTION_FIELDS[s.key].some((f) => found[f]),
      );
      setOpen((o) => {
        const next = { ...o };
        for (const s of badSections) next[s.key] = true;
        return next;
      });
      document
        .getElementById(`section-${badSections[0]?.key}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const input = {
      year: fd.get("year"),
      make: fd.get("make"),
      model: fd.get("model"),
      trim_level: fd.get("trim_level"),
      vin: fd.get("vin"),
      mileage: fd.get("mileage"),
      price: fd.get("price"),
      description: fd.get("description"),
      /*
       * The CarGurus eight (0015). These were RENDERED but never READ —
       * every Submit since 16 Aug returned zod's raw "Invalid option:
       * expected one of..." because body_style is required server-side.
       * Caught by the 23 Aug overnight audit; the payload now carries
       * exactly what the form shows.
       */
      body_style: fd.get("body_style"),
      exterior_color: fd.get("exterior_color"),
      interior_color: fd.get("interior_color"),
      drivetrain: fd.get("drivetrain"),
      transmission: fd.get("transmission"),
      fuel_type: fd.get("fuel_type"),
      engine: fd.get("engine"),
      condition: fd.get("condition"),
      financing_offered: fd.get("financing_offered") != null,
    };
    const files = (fd.getAll("photos") as File[]).filter((f) => f && f.size > 0);

    setBusy(true);
    setError(null);
    try {
      const res = listing
        ? await updateListingAction(listing.id, input)
        : await createListingAction(input);
      if (!res.ok || !res.id) {
        setError(res.error ?? "Something went wrong.");
        setBusy(false);
        return;
      }
      await uploadPhotos(res.id, files);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function removePhoto(photoId: string) {
    await deletePhotoAction(photoId);
    router.refresh();
  }

  const inputCls = (field: string) =>
    `w-full rounded-lg border px-3 py-2.5 text-sm ${
      errors[field] ? "border-red-400" : "border-slate-300"
    }`;
  const fieldError = (field: string) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
    ) : null;

  // A render HELPER, deliberately not a nested component: a component
  // defined inside the render function gets a new identity every render,
  // which unmounts its subtree — and these uncontrolled inputs would lose
  // their values on every keystroke (onInput re-renders for the pills).
  function section(k: SectionKey, children: React.ReactNode) {
    const meta = SECTIONS.find((s) => s.key === k)!;
    const pill = pillFor(k);
    return (
      <div
        id={`section-${k}`}
        className="scroll-mt-4 rounded-2xl border border-slate-200 bg-white"
      >
        <button
          type="button"
          onClick={() => setOpen((o) => ({ ...o, [k]: !o[k] }))}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span>
            <span className="block text-sm font-bold text-slate-900">
              {meta.title}
            </span>
            <span className="block text-xs text-slate-500">{meta.sub}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${pill.cls}`}
            >
              {pill.label}
            </span>
            <span
              className={`text-slate-400 transition-transform duration-200 ease-in-out ${
                open[k] ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </span>
        </button>
        {/* hidden, never unmounted — closed sections keep their values. */}
        <div className={open[k] ? "space-y-4 px-4 pb-4" : "hidden"}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      onInput={(e) => refreshLive(e.currentTarget)}
      noValidate
      className="space-y-3"
    >
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      {listing?.status === "active" && (
        <p className="rounded-lg bg-amber-50 px-4 py-2 text-xs text-amber-800">
          This listing is live. Changing its details sends it back for
          review before the changes show — buyers keep seeing the approved
          version in the meantime.
        </p>
      )}

      {section("basics", <>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Year</span>
            <input name="year" type="number" min={1900} max={2100}
              defaultValue={listing?.year ?? ""} className={inputCls("year")} />
            {fieldError("year")}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Make</span>
            <input name="make" maxLength={60} placeholder="Chevrolet"
              defaultValue={listing?.make ?? ""} className={inputCls("make")} />
            {fieldError("make")}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Model</span>
            <input name="model" maxLength={60} placeholder="Equinox"
              defaultValue={listing?.model ?? ""} className={inputCls("model")} />
            {fieldError("model")}
          </label>
        </div>
        <label className="block sm:max-w-xs">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Trim <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input name="trim_level" maxLength={60} placeholder="LT, XLT, Limited…"
            defaultValue={listing?.trim_level ?? ""} className={inputCls("trim_level")} />
        </label>
      </>)}

      {section("numbers", <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Mileage</span>
            <input name="mileage" type="number" min={0}
              defaultValue={listing?.mileage ?? ""} className={inputCls("mileage")} />
            {fieldError("mileage")}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Price (USD)</span>
            <input name="price" type="number" min={0}
              defaultValue={listing?.price ?? ""} className={inputCls("price")} />
            {fieldError("price")}
          </label>
        </div>
      </>)}

      {section("specs", <>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Body style</span>
            <select name="body_style" defaultValue={listing?.body_style ?? ""}
              className={inputCls("body_style")}>
              <option value="">Choose…</option>
              {BODY_STYLES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {fieldError("body_style")}
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Drivetrain <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <select name="drivetrain" defaultValue={listing?.drivetrain ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">Not sure</option>
              {DRIVETRAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Exterior color <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <select name="exterior_color" defaultValue={listing?.exterior_color ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">Choose…</option>
              {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Interior color <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <select name="interior_color" defaultValue={listing?.interior_color ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">Choose…</option>
              {COLOR_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Transmission <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <select name="transmission" defaultValue={listing?.transmission ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">Not sure</option>
              {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Fuel type <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <select name="fuel_type" defaultValue={listing?.fuel_type ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">Not sure</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Condition <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <select name="condition" defaultValue={listing?.condition ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
              <option value="">Choose…</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Engine <span className="font-normal text-slate-400">(optional — 2.0L Turbo I4, 5.7L V8…)</span>
          </span>
          <input name="engine" maxLength={80}
            defaultValue={listing?.engine ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
      </>)}

      {section("photos", <>
        {/* Persuasion copy inside the form, the teardown's trick — used
            where it actually moves the needle, not as decoration. */}
        <p className="text-xs leading-relaxed text-slate-500">
          The cover photo is the first thing a buyer sees. Cards with a real
          photo get opened; cards without one get scrolled past.
        </p>
        {photos.length > 0 && (
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Current photos</span>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {photos.map((p) => (
                <div key={p.id} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(p.storage_path, PHOTO_WIDTHS.thumb)} alt=""
                    className="aspect-[4/3] w-full rounded-lg object-cover" />
                  <button type="button" onClick={() => removePhoto(p.id)}
                    aria-label="Remove photo"
                    className="absolute -right-1.5 -top-1.5 rounded-full bg-slate-900 px-1.5 text-xs text-white">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {photos.length > 0 ? "Add photos" : "Photos"}{" "}
            <span className="font-normal text-slate-400">(up to 12, first one is the cover)</span>
          </span>
          <input name="photos" type="file" accept="image/*" multiple
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        {uploadNote && <p className="text-xs text-slate-500">{uploadNote}</p>}
      </>)}

      {section("story", <>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Description{" "}
            <span className="font-normal text-slate-400">
              (up to 5,500 characters — a little more room than Facebook
              Marketplace gives you)
            </span>
          </span>
          {/* 5,500 by the owner's rule: slightly above FBMP's 5,000, so a
              description pasted from FBMP always fits with room to spare. */}
          <textarea name="description" rows={5} maxLength={5500}
            placeholder="Condition, history, options, why it's a good one…"
            defaultValue={listing?.description ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>

        <label className="block sm:max-w-xs">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            VIN <span className="font-normal text-slate-400">(optional — builds trust)</span>
          </span>
          <input name="vin" maxLength={20}
            defaultValue={listing?.vin ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>

        {/* The financing switch (0008) — off means no est./mo, no
            calculator. The pitch above the checkbox is the persuasion-
            in-form pattern: the case, then the choice. */}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs leading-relaxed text-slate-600">
            <span className="font-semibold text-slate-800">
              Most buyers budget by the month, not the sticker.
            </span>{" "}
            Leaving financing on puts an estimated payment right on your
            card and a calculator on your listing — it answers the question
            buyers are actually asking.
          </p>
          <label className="mt-2 flex items-start gap-2">
            <input
              type="checkbox"
              name="financing_offered"
              defaultChecked={listing?.financing_offered ?? true}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm text-slate-700">
              <span className="font-medium">Offer financing on this car</span>
              <span className="block text-xs text-slate-500">
                Untick for a cash-only sale.
              </span>
            </span>
          </label>
        </div>
      </>)}

      <div className="flex items-center gap-4 pt-1">
        <button disabled={busy}
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? "Saving…" : listing ? "Save changes" : "Submit for review"}
        </button>
        {!listing && (
          <p className="text-xs text-slate-400">
            A real person reviews every listing before it goes live — usually
            same day.
          </p>
        )}
      </div>
    </form>
  );
}
