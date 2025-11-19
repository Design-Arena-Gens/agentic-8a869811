import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { createJob, listJobs } from "@/lib/firestore";
import { JobPayloadSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request, "jobs.read");
    const jobs = await listJobs();
    return NextResponse.json({ jobs });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request, ["jobs.write"]);
    const json = await request.json();
    const payload = JobPayloadSchema.parse(json);
    const record = await createJob({ ...payload, createdBy: auth.uid });
    return NextResponse.json({ job: record }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 422 });
    }
    console.error("Failed to create job", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
