import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { deleteJob, getJob, updateJob } from "@/lib/firestore";
import { JobPayloadSchema } from "@/lib/validation";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request, "jobs.read");
    const job = await getJob(params.id);
    if (!job) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request, "jobs.write");
    const json = await request.json();
    const payload = JobPayloadSchema.parse({ ...json, id: params.id });
    const job = await updateJob(params.id, payload);
    return NextResponse.json({ job });
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
    console.error("Failed to update job", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await authenticateRequest(request, "jobs.write");
    await deleteJob(params.id);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Failed to delete job", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
