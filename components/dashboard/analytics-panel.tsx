"use client";

import { useAuthorizedSWR } from "@/lib/authorized-fetch";

type AnalyticsResponse = {
  summary: {
    totalJobs: number;
    publishedJobs: number;
    totalCompanies: number;
    totalTeamMembers: number;
    industries: string[];
  };
};

export default function AnalyticsPanel() {
  const { data, isLoading } = useAuthorizedSWR<AnalyticsResponse, Error>("/api/analytics", undefined, {
    refreshInterval: 30_000
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Reporting</p>
          <h2 className="text-2xl font-semibold">Operational analytics</h2>
        </div>
      </div>
      {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading analytics...</p>}
      {data?.summary && (
        <div className="mt-6 grid gap-4">
          <div className="rounded-md border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Jobs</p>
            <p className="text-2xl font-semibold">{data.summary.totalJobs}</p>
            <p className="text-sm text-muted-foreground">
              {data.summary.publishedJobs} currently published to candidates
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Companies</p>
            <p className="text-2xl font-semibold">{data.summary.totalCompanies}</p>
            <p className="text-sm text-muted-foreground">
              {data.summary.industries.length} industry verticals represented
            </p>
          </div>
          <div className="rounded-md border border-border p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Team members</p>
            <p className="text-2xl font-semibold">{data.summary.totalTeamMembers}</p>
            <p className="text-sm text-muted-foreground">
              Keep least privilege by revoking unused accounts monthly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
