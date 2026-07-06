import { NextRequest, NextResponse } from "next/server";
import { listTaskQueue } from "@/lib/server/workflow-command-service";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await hydrateClinicalStoreFromDatabase();
  const response = await listTaskQueue(request);
  return NextResponse.json(response.body, { status: response.status });
}
