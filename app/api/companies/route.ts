import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { CompanyPayloadSchema } from "@/lib/validation";
import { createCompany, listCompanies } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request, "companies.read");
    const companies = await listCompanies();
    return NextResponse.json({ companies });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await authenticateRequest(request, "companies.write");
    const json = await request.json();
    const payload = CompanyPayloadSchema.parse(json);
    const company = await createCompany(payload);
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation error" }, { status: 422 });
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
