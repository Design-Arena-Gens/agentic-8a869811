import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { adminAuth } from "@/lib/firebase-admin";
import { listPortalUsers, setPortalUser } from "@/lib/firestore";
import { PortalUserPayloadSchema } from "@/lib/validation";
import { getRolePermissions } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request, "users.read");
    const users = await listPortalUsers();
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticateRequest(request, "users.write");
    const payload = PortalUserPayloadSchema.parse(await request.json());

    await adminAuth().setCustomUserClaims(payload.id, {
      role: payload.role,
      permissions: getRolePermissions(payload.role)
    });
    await setPortalUser(payload);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 422 });
    }
    console.error("Failed to set user", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
