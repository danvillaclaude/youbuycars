import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign in · YouBuyCars", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Manage your listings, or start selling.
      </p>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
