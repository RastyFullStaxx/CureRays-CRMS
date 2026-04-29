import { NextRequest, NextResponse } from "next/server";
import { createPatient, operationalPatients } from "@/lib/clinical-store";
import { phiAccessFromRequest } from "@/lib/server/phi-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ patients: operationalPatients() });
}

export async function POST(request: NextRequest) {
  if (!phiAccessFromRequest(request, "Create patient PHI record")) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();
  return NextResponse.json(createPatient(body), { status: 201 });
}
