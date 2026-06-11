import { NextRequest, NextResponse } from "next/server";
import { createPatient, operationalPatients, validatePatientCreateInput } from "@/lib/clinical-store";
import { phiAccessFromRequest, requirePhiAction } from "@/lib/server/phi-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ patients: operationalPatients() });
}

export async function POST(request: NextRequest) {
  const access = phiAccessFromRequest(request, "Create patient PHI record");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    requirePhiAction(access, "phi:create");
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();
  const validation = validatePatientCreateInput(body);
  if (!validation.valid) {
    return NextResponse.json({ message: "Patient validation failed", errors: validation.errors }, { status: 400 });
  }

  return NextResponse.json(createPatient(body), { status: 201 });
}
