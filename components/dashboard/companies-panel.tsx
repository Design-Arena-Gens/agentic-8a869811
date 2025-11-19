"use client";

import { FormEvent, useState } from "react";
import { useAuthorizedSWR } from "@/lib/authorized-fetch";
import { Company, CompanySchema } from "@/types";
import { PrimaryButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

type CompaniesResponse = {
  companies: Company[];
};

export default function CompaniesPanel() {
  const { token, claims } = useAuth();
  const { data, mutate, isLoading } = useAuthorizedSWR<CompaniesResponse, Error>("/api/companies");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const canWrite = claims ? ["super_admin", "admin"].includes(claims.role) : false;

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = CompanySchema.pick({
        name: true,
        description: true,
        website: true,
        industry: true,
        size: true
      }).parse({
        name: formData.get("name"),
        description: formData.get("description"),
        website: formData.get("website") || undefined,
        industry: formData.get("industry") || undefined,
        size: formData.get("size") || undefined
      });

      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create company");
      }
      await mutate();
      setShowForm(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Module</p>
          <h2 className="text-2xl font-semibold">Companies</h2>
        </div>
        {canWrite && (
          <PrimaryButton onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Add company"}
          </PrimaryButton>
        )}
      </div>
      {showForm && canWrite && (
        <form
          className="mt-4 grid gap-3 rounded-md border border-border p-4"
          onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            await handleSubmit(new FormData(event.currentTarget));
            event.currentTarget.reset();
          }}
        >
          <label className="flex flex-col gap-2 text-sm">
            Name
            <input name="name" required className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Description
            <textarea name="description" required className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Website
            <input name="website" type="url" className="rounded-md border border-border px-3 py-2" />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Industry
              <input name="industry" className="rounded-md border border-border px-3 py-2" />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Size
              <select name="size" className="rounded-md border border-border px-3 py-2">
                <option value="">Select</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </select>
            </label>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save company"}
          </PrimaryButton>
        </form>
      )}
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading companies...</p>}
        {data?.companies?.length === 0 && (
          <p className="text-sm text-muted-foreground">No companies registered.</p>
        )}
        {data?.companies?.map((company) => (
          <article key={company.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{company.name}</h3>
              {company.website && (
                  <a href={company.website} className="text-sm text-primary" target="_blank" rel="noreferrer">
                    {company.website}
                  </a>
                )}
              </div>
              {company.size && (
                <span className="badge badge-soft-primary">
                  {company.size}
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{company.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
