import { NextRequest, NextResponse } from "next/server";
import { patients, updatePatient } from "@/lib/clinical-store";

export const dynamic = "force-dynamic";

export function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const patient = patients.find((item) => item.id === params.id);

  if (!patient) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const result = updatePatient(params.id, body);

  if (!result) {
    return NextResponse.json({ message: "Patient not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
