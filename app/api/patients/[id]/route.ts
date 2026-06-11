import { NextRequest, NextResponse } from "next/server";
import { updatePatient, validatePatientUpdateInput } from "@/lib/clinical-store";
import { findPatientPhi, phiAccessFromRequest, requirePhiAction } from "@/lib/server/phi-store";

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
  const access = phiAccessFromRequest(request, "Update patient PHI record");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    requirePhiAction(access, "phi:update");
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();
  const validation = validatePatientUpdateInput(params.id, body);
  if (!validation.valid) {
    return NextResponse.json({ message: "Patient validation failed", errors: validation.errors }, { status: 400 });
  }

  const result = updatePatient(params.id, body);

  if (!result) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
