"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { PrimaryButton } from "@/components/ui/button";

export default function Landing() {
  const { firebaseUser } = useAuth();

  if (firebaseUser) return null;

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <span className="badge badge-soft-primary">
          WorkFlicks.in CMS
        </span>
        <h1 className="text-balance text-4xl font-semibold">
          Operational control center for your job marketplace
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Manage jobs, companies, recruitment pipelines, and content workflows with secure,
          role-based access. Built on Firebase and Google Cloud for elasticity and reliability.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <PrimaryButton>Sign in to CMS</PrimaryButton>
          </Link>
          <a href="https://workflicks.in" target="_blank" rel="noopener noreferrer" className="link-button">
            Visit WorkFlicks.in
          </a>
        </div>
      </div>
    </section>
  );
}
