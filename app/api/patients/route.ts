import { NextRequest, NextResponse } from "next/server";
import {
  listOperationalPatientRecords,
  patientMutationContextFromRequest,
  registerPatient
} from "@/lib/server/patient-registration-service";
import type { PatientCreateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  void request.headers.get("x-prototype-role");
  const response = await listOperationalPatientRecords();
  return NextResponse.json(response.body, { status: response.status });
}

export async function POST(request: NextRequest) {
  const context = patientMutationContextFromRequest(request, "phi:create", "Create patient PHI record");
  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = (await request.json()) as Partial<PatientCreateInput>;
  const response = await registerPatient(body, context);

  return NextResponse.json(response.body, { status: response.status });
}
