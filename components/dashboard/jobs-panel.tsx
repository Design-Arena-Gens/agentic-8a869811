"use client";

import { FormEvent, useState } from "react";
import { useAuthorizedSWR } from "@/lib/authorized-fetch";
import { Job, JobSchema } from "@/types";
import { PrimaryButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

type JobsResponse = {
  jobs: Job[];
};

export default function JobsPanel() {
  const { token, claims } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { data, mutate, isLoading } = useAuthorizedSWR<JobsResponse, Error>("/api/jobs");

  const canWrite = claims ? ["super_admin", "admin", "recruiter", "content_editor"].includes(claims.role) : false;

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = JobSchema.pick({
        title: true,
        description: true,
        companyId: true,
        location: true,
        employmentType: true,
        experienceLevel: true,
        status: true
      }).parse({
        title: formData.get("title"),
        description: formData.get("description"),
        companyId: formData.get("companyId"),
        location: formData.get("location"),
        employmentType: formData.get("employmentType"),
        experienceLevel: formData.get("experienceLevel"),
        status: formData.get("status")
      });

      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to create job");
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
          <h2 className="text-2xl font-semibold">Jobs</h2>
        </div>
        {canWrite && (
          <PrimaryButton onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Close form" : "Add job"}
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
            Title
            <input name="title" required className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Description
            <textarea name="description" required className="rounded-md border border-border px-3 py-2" />
          </label>
          <label className="flex flex-col gap-2 text-sm">
            Company Id
            <input name="companyId" required className="rounded-md border border-border px-3 py-2" />
          </label>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Location
              <input name="location" required className="rounded-md border border-border px-3 py-2" />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Employment Type
              <select name="employmentType" className="rounded-md border border-border px-3 py-2">
                <option value="full_time">Full time</option>
                <option value="part_time">Part time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </label>
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Experience Level
              <select name="experienceLevel" className="rounded-md border border-border px-3 py-2">
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm">
            Status
            <select name="status" className="rounded-md border border-border px-3 py-2">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save job"}
          </PrimaryButton>
        </form>
      )}
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading jobs...</p>}
        {data?.jobs?.length === 0 && <p className="text-sm text-muted-foreground">No jobs created yet.</p>}
        {data?.jobs?.map((job) => (
          <article key={job.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {job.location} • {job.employmentType} • {job.experienceLevel}
                </p>
              </div>
              <span className="badge badge-soft-primary">
                {job.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{job.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
