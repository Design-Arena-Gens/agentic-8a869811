"use client";

import { FormEvent, useState } from "react";
import { useAuthorizedSWR } from "@/lib/authorized-fetch";
import { PortalUser, PortalUserSchema } from "@/types";
import { PrimaryButton } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

type UsersResponse = {
  users: PortalUser[];
};

const roleLabels: Record<PortalUser["role"], string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  recruiter: "Recruiter",
  content_editor: "Content Editor",
  viewer: "Viewer"
};

export default function UsersPanel() {
  const { token, claims } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { data, mutate, isLoading } = useAuthorizedSWR<UsersResponse, Error>("/api/users");
  const canWrite = claims ? ["super_admin", "admin"].includes(claims.role) : false;

  async function handleSubmit(formData: FormData) {
    if (!token) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = PortalUserSchema.pick({
        id: true,
        email: true,
        displayName: true,
        role: true
      }).parse({
        id: formData.get("uid"),
        email: formData.get("email"),
        displayName: formData.get("displayName"),
        role: formData.get("role")
      });

      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error ?? "Failed to persist user");
      }

      await mutate();
      (formData as any).target?.reset?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!claims) return null;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Module</p>
          <h2 className="text-2xl font-semibold">User access</h2>
        </div>
      </div>
      {canWrite && (
        <form
          className="mt-4 grid gap-3 rounded-md border border-border p-4"
          onSubmit={async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            await handleSubmit(new FormData(event.currentTarget));
            event.currentTarget.reset();
          }}
        >
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Firebase UID
              <input name="uid" required className="rounded-md border border-border px-3 py-2" />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Role
              <select name="role" className="rounded-md border border-border px-3 py-2">
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Email
              <input name="email" type="email" required className="rounded-md border border-border px-3 py-2" />
            </label>
            <label className="flex flex-1 flex-col gap-2 text-sm">
              Display name
              <input name="displayName" required className="rounded-md border border-border px-3 py-2" />
            </label>
          </div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save access"}
          </PrimaryButton>
        </form>
      )}
      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Loading users...</p>}
        {data?.users?.length === 0 && (
          <p className="text-sm text-muted-foreground">No team members registered.</p>
        )}
        {data?.users?.map((user) => (
          <article key={user.id} className="rounded-md border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{user.displayName}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <span className="badge badge-soft-primary">
                {roleLabels[user.role]}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
