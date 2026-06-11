import { NextRequest, NextResponse } from "next/server";
import {
  patientMutationContextFromRequest,
  updatePatientLifecycleRecord
} from "@/lib/server/patient-registration-service";
import type { PatientLifecycleUpdateInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = (await request.json()) as Partial<PatientLifecycleUpdateInput>;
  const context = patientMutationContextFromRequest(
    request,
    "phi:update",
    body.changeReason ?? "Update patient lifecycle state"
  );

  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const response = await updatePatientLifecycleRecord(params.id, body, context);
  return NextResponse.json(response.body, { status: response.status });
}
