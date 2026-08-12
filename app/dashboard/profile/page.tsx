import type { Metadata } from "next";
import Link from "next/link";
import { requireApprovedSeller } from "@/lib/auth";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My dealer page · YouBuyCars" };

export default async function ProfilePage() {
  const { profile } = await requireApprovedSeller();
  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-2xl font-bold">My dealer page</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        What buyers see about you.
        {profile.public_slug ? (
          <>
            {" "}Live at{" "}
            <Link
              href={`/sellers/${profile.public_slug}`}
              className="text-blue-600 underline"
            >
              /sellers/{profile.public_slug}
            </Link>
            .
          </>
        ) : (
          " Your page goes live when you save it."
        )}
      </p>
      <ProfileForm profile={profile} />
    </main>
  );
}
