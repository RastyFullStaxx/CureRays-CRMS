import { NextRequest, NextResponse } from "next/server";
import { listWorkflowCommandSnapshot } from "@/lib/server/workflow-command-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  void request.headers.get("x-prototype-role");
  return NextResponse.json(await listWorkflowCommandSnapshot());
}
