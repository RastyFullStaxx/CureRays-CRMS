import { NextRequest, NextResponse } from "next/server";
import {
  getPatientEditRecord,
  patientMutationContextFromRequest,
  updatePatientRecord
} from "@/lib/server/patient-registration-service";
import type { PatientUpdateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const context = patientMutationContextFromRequest(request, "phi:read", "Resolve patient edit DTO");

  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const response = await getPatientEditRecord(params.id, context);
  return NextResponse.json(response.body, { status: response.status });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as Partial<PatientUpdateInput>;
  const context = patientMutationContextFromRequest(
    request,
    "phi:update",
    body.changeReason ?? "Update patient PHI record"
  );
  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const response = await updatePatientRecord(params.id, body, context);

  return NextResponse.json(response.body, { status: response.status });
}
