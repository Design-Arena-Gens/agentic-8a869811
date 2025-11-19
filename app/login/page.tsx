"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithGoogle } from "@/lib/firebase-client";
import { PrimaryButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { firebaseUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && firebaseUser) {
    router.replace("/");
  }

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = data.get("email")?.toString() ?? "";
    const password = data.get("password")?.toString() ?? "";
    setError(null);
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 py-24">
      <div className="rounded-md border border-border bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold">Secure sign-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use your WorkFlicks admin credentials. Two-factor authentication is enforced for privileged roles.
        </p>
        <form className="mt-6 grid gap-3" onSubmit={handleEmailLogin}>
          <label className="flex flex-col gap-2 text-sm">
            Email
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="rounded-md border border-border px-3 py-2"
            />
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </PrimaryButton>
        </form>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">or</p>
          <PrimaryButton
            className="mt-2 w-full"
            type="button"
            onClick={async () => {
              setError(null);
              try {
                await loginWithGoogle();
                router.push("/");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to sign in with Google");
              }
            }}
          >
            Sign in with Google
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
}
