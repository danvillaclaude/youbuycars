import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create account · YouBuyCars", robots: { index: false } };

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold">Create your seller account</h1>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Free to join. A real person approves every new seller account, and
        every listing is reviewed before it goes live.
      </p>
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
