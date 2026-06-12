import { NextRequest, NextResponse } from "next/server";
import {
  listPatientRecordHistoryEntries,
  patientMutationContextFromRequest
} from "@/lib/server/patient-registration-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const context = patientMutationContextFromRequest(request, "phi:read", "Read redacted patient record history");

  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const response = await listPatientRecordHistoryEntries(id, context);
  return NextResponse.json(response.body, { status: response.status });
}
