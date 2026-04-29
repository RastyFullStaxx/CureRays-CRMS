import { NextResponse } from "next/server";
import { getOperationalWorkflowSnapshot } from "@/lib/clinical-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getOperationalWorkflowSnapshot());
}
