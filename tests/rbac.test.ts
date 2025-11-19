import { describe, it, expect } from "vitest";
import { getRolePermissions, hasPermission } from "@/lib/rbac";

describe("RBAC permissions", () => {
  it("grants full access to super admin", () => {
    const permissions = getRolePermissions("super_admin");
    expect(permissions).toContain("jobs.write");
    expect(permissions).toContain("settings.write");
  });

  it("restricts recruiters from user management", () => {
    const permissions = getRolePermissions("recruiter");
    expect(permissions).not.toContain("users.write");
    expect(hasPermission("recruiter", "jobs.write")).toBe(true);
  });

  it("prevents viewers from writing jobs", () => {
    expect(hasPermission("viewer", "jobs.write")).toBe(false);
  });
});
