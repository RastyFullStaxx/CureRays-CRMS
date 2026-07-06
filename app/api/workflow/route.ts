import { NextRequest, NextResponse } from "next/server";
import { listWorkflowCommandSnapshot } from "@/lib/server/workflow-command-service";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await hydrateClinicalStoreFromDatabase();
  void request.headers.get("x-prototype-role");
  return NextResponse.json(await listWorkflowCommandSnapshot());
}
