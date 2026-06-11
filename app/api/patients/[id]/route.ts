import { NextRequest, NextResponse } from "next/server";
import {
  patientMutationContextFromRequest,
  updatePatientRecord
} from "@/lib/server/patient-registration-service";
import { findPatientPhi, phiAccessFromRequest } from "@/lib/server/phi-store";
import type { PatientUpdateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const access = phiAccessFromRequest(request, "Resolve patient profile PHI");

  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const patient = findPatientPhi(params.id, access);
  if (!patient) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const context = patientMutationContextFromRequest(request, "phi:update", "Update patient PHI record");
  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<PatientUpdateInput>;
  const response = updatePatientRecord(params.id, body, context);

  return NextResponse.json(response.body, { status: response.status });
}
