import { NextRequest, NextResponse } from "next/server";
import { createPatient, patients } from "@/lib/clinical-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ patients });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json(createPatient(body), { status: 201 });
}
