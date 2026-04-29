import { NextRequest, NextResponse } from "next/server";
import { updatePatient } from "@/lib/clinical-store";
import { findPatientPhi, phiAccessFromRequest } from "@/lib/server/phi-store";

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
  if (!phiAccessFromRequest(request, "Update patient PHI record")) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();
  const result = updatePatient(params.id, body);

  if (!result) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
