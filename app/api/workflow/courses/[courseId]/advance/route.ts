import { NextRequest, NextResponse } from "next/server";
import {
  advanceCourseWorkflow,
  workflowMutationContextFromRequest
} from "@/lib/server/workflow-command-service";
import type { WorkflowAdvanceInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { courseId: string } }) {
  const body = (await request.json()) as Partial<WorkflowAdvanceInput>;
  const context = workflowMutationContextFromRequest(
    request,
    "workflow:mutate",
    body.changeReason ?? "Advance course workflow phase"
  );

  if (!context) {
    return NextResponse.json({ message: "Workflow access denied" }, { status: 403 });
  }

  const response = await advanceCourseWorkflow(params.courseId, body, context);
  return NextResponse.json(response.body, { status: response.status });
}
