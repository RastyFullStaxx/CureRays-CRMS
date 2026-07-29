import { NextRequest, NextResponse } from "next/server";
import {
  advanceCourseWorkflow,
  workflowMutationContextFromRequest
} from "@/lib/server/workflow-command-service";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import type { WorkflowAdvanceInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  await hydrateClinicalStoreFromDatabase();
  const { courseId } = await params;
  const payload = await request.json() as unknown;
  const body = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Partial<WorkflowAdvanceInput>
    : {};
  const context = workflowMutationContextFromRequest(
    request,
    "workflow:advance",
    typeof body.reason === "string" ? body.reason : ""
  );

  if (!context) {
    return NextResponse.json({ message: "Workflow access denied" }, { status: 403 });
  }

  const response = await advanceCourseWorkflow(courseId, body, context);
  return NextResponse.json(response.body, { status: response.status });
}
