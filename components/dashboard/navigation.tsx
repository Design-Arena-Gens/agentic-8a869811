"use client";

import { User } from "firebase/auth";
import { Claims, getRolePermissions } from "@/lib/rbac";
import { PrimaryButton } from "@/components/ui/button";

type Props = {
  user: User;
  claims: Claims;
  onLogout: () => Promise<void>;
};

export default function DashboardNavigation({ user, claims, onLogout }: Props) {
  const permissions = getRolePermissions(claims.role);

  return (
    <aside className="w-72 rounded-md border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Signed in as</p>
          <p className="font-semibold">{user.displayName ?? user.email}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Role</p>
          <p className="font-medium text-primary">{claims.role.replace("_", " ")}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Permissions</p>
          <ul className="mt-1 space-y-1 text-sm">
            {permissions.map((permission) => (
              <li key={permission} className="text-muted-foreground">
                • {permission}
              </li>
            ))}
          </ul>
        </div>
        <PrimaryButton variant="ghost" onClick={onLogout}>
          Sign out
        </PrimaryButton>
      </div>
    </aside>
  );
}
