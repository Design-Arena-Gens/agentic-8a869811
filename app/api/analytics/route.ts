import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { getAnalyticsSummary } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request, "analytics.read");
    const summary = await getAnalyticsSummary();
    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
