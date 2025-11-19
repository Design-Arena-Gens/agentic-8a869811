 "use client";

import { useMemo } from "react";
import DashboardNavigation from "@/components/dashboard/navigation";
import JobsPanel from "@/components/dashboard/jobs-panel";
import CompaniesPanel from "@/components/dashboard/companies-panel";
import UsersPanel from "@/components/dashboard/users-panel";
import { useAuth } from "@/contexts/auth-context";
import { hasPermission } from "@/lib/rbac";
import AnalyticsPanel from "@/components/dashboard/analytics-panel";

export default function DashboardShell() {
  const { firebaseUser, claims, logout, loading } = useAuth();

  const panels = useMemo(() => {
    if (!claims) return [];
    return [
      hasPermission(claims.role, "jobs.read") && { id: "jobs", component: <JobsPanel /> },
      hasPermission(claims.role, "companies.read") && {
        id: "companies",
        component: <CompaniesPanel />
      },
      hasPermission(claims.role, "users.read") && { id: "users", component: <UsersPanel /> },
      hasPermission(claims.role, "analytics.read") && { id: "analytics", component: <AnalyticsPanel /> }
    ].filter(Boolean) as { id: string; component: JSX.Element }[];
  }, [claims]);

  if (loading) {
    return (
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-4 py-24">
        <p className="text-muted-foreground">Loading secure dashboard...</p>
      </section>
    );
  }

  if (!firebaseUser || !claims) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto flex max-w-6xl gap-8">
        <DashboardNavigation user={firebaseUser} claims={claims} onLogout={logout} />
        <div className="flex-1 space-y-8">
          {panels.map((panel) => (
            <div key={panel.id} className="rounded-md border border-border p-6 shadow-sm">
              {panel.component}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
