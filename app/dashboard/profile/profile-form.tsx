"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/auth";
import { isMetroDetroitCity, logoUrl, METRO_DETROIT_CITIES, PHOTO_WIDTHS } from "@/lib/listings";
import { saveProfileAction } from "./actions";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      // Logo: browser → own storage folder, path recorded via the action.
      let logoPath: string | undefined;
      const logo = fd.get("logo") as File | null;
      if (logo && logo.size > 0) {
        if (logo.size > 3 * 1024 * 1024) {
          throw new Error("Keep the logo under 3 MB.");
        }
        const supabase = createClient();
        const clean = logo.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-40);
        logoPath = `${profile.id}/${Date.now()}-${clean}`;
        const { error } = await supabase.storage
          .from("dealer-logos")
          .upload(logoPath, logo, { contentType: logo.type, cacheControl: "31536000" });
        if (error) throw new Error(`Logo upload failed: ${error.message}`);
      }

      const res = await saveProfileAction({
        display_name: String(fd.get("display_name") ?? ""),
        phone: String(fd.get("phone") ?? ""),
        city: String(fd.get("city") ?? ""),
        about: String(fd.get("about") ?? ""),
        financing_offered: fd.get("financing_offered") != null,
        logo_path: logoPath,
      });
      if (!res.ok) throw new Error(res.error);
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {saved && (
        <p className="rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">
          Saved — your page is up to date.
        </p>
      )}

      <div className="flex items-center gap-4">
        {profile.logo_path ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl(profile.logo_path, PHOTO_WIDTHS.logo)} alt=""
            className="h-16 w-16 rounded-xl border border-slate-200 object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl">🏪</div>
        )}
        <label className="block flex-1">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Logo <span className="font-normal text-slate-400">(optional, square works best)</span>
          </span>
          <input name="logo" type="file" accept="image/*"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Name buyers see</span>
          <input name="display_name" required maxLength={80}
            defaultValue={profile.display_name ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Public phone <span className="font-normal text-slate-400">(optional)</span>
          </span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30}
            defaultValue={profile.phone ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">City</span>
        {/* From the list, not typed (23 Aug 2026 SEO plan): the one live
            profile said "South East, Michigan", which printed into a page
            title. One spelling per city is what makes city pages possible. */}
        <select name="city" autoComplete="address-level2"
          defaultValue={isMetroDetroitCity(profile.city) ? (profile.city as string) : ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm">
          <option value="">Choose your city…</option>
          {METRO_DETROIT_CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">About</span>
        <textarea name="about" rows={4} maxLength={2000}
          placeholder="Who you are, what you sell, why buyers should trust you."
          defaultValue={profile.about ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
      </label>

      {/* The master financing breaker (0009): off hides est./mo and the
          calculator on EVERY listing, whatever each listing's box says. */}
      <label className="flex items-start gap-2">
        <input type="checkbox" name="financing_offered"
          defaultChecked={profile.financing_offered ?? true}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600" />
        <span className="text-sm text-slate-700">
          <span className="font-medium">Offer financing</span>
          <span className="block text-xs text-slate-500">
            Off = every one of your listings shows no monthly estimate and no
            payment calculator, regardless of each listing&apos;s own setting.
          </span>
        </span>
      </label>

      <button disabled={busy}
        className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
        {busy ? "Saving…" : "Save my page"}
      </button>
    </form>
  );
}
