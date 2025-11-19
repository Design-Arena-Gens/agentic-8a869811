import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { ClaimsSchema } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split("Bearer ")[1]!;
    const decoded = await adminAuth().verifyIdToken(token, true);
    const claims = ClaimsSchema.safeParse(decoded);

    if (!claims.success) {
      return NextResponse.json({ error: "Invalid claims" }, { status: 403 });
    }

    return NextResponse.json({ claims: claims.data }, { status: 200 });
  } catch (error) {
    console.error("Failed to verify claims", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
