"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { photoUrl, type Listing, type ListingPhoto } from "@/lib/listings";
import {
  createListingAction,
  deletePhotoAction,
  recordPhotosAction,
  updateListingAction,
} from "./actions";

/**
 * Create and edit share this form. Photos go browser → storage directly
 * (the seller's own folder; RLS enforces it), then the rows are recorded
 * through a server action. On edit of a LIVE listing, the warning below
 * tells the truth: substance changes send it back for re-approval.
 */
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
  const [busy, setBusy] = useState(false);
  const [uploadNote, setUploadNote] = useState<string | null>(null);

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
    const input = {
      year: fd.get("year"),
      make: fd.get("make"),
      model: fd.get("model"),
      trim_level: fd.get("trim_level"),
      vin: fd.get("vin"),
      mileage: fd.get("mileage"),
      price: fd.get("price"),
      description: fd.get("description"),
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

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Year</span>
          <input name="year" type="number" required min={1900} max={2100}
            defaultValue={listing?.year ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Make</span>
          <input name="make" required maxLength={60} placeholder="Chevrolet"
            defaultValue={listing?.make ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Model</span>
          <input name="model" required maxLength={60} placeholder="Equinox"
            defaultValue={listing?.model ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Trim <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input name="trim_level" maxLength={60} placeholder="LT, XLT, Limited…"
            defaultValue={listing?.trim_level ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            VIN <span className="font-normal text-slate-400">(optional — builds trust)</span>
          </span>
          <input name="vin" maxLength={20}
            defaultValue={listing?.vin ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Mileage</span>
          <input name="mileage" type="number" required min={0}
            defaultValue={listing?.mileage ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Price (USD)</span>
          <input name="price" type="number" required min={0}
            defaultValue={listing?.price ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
      </div>

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

      {photos.length > 0 && (
        <div>
          <span className="mb-1 block text-sm font-medium text-slate-700">Current photos</span>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
            {photos.map((p) => (
              <div key={p.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoUrl(p.storage_path)} alt=""
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

      <button disabled={busy}
        className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {busy ? "Saving…" : listing ? "Save changes" : "Submit for review"}
      </button>
      {!listing && (
        <p className="text-xs text-slate-400">
          A real person reviews every listing before it goes live — usually
          same day.
        </p>
      )}
    </form>
  );
}
