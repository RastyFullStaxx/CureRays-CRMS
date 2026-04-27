import { NextResponse } from "next/server";
import { getWorkflowSnapshot } from "@/lib/clinical-store";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getWorkflowSnapshot());
}
