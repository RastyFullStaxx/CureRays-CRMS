import { NextRequest, NextResponse } from "next/server";
import {
  updateWorkflowStepCommand,
  workflowMutationContextFromRequest
} from "@/lib/server/workflow-command-service";
import type { WorkflowStepMutationInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ stepId: string }> }) {
  const { stepId } = await params;
  const body = (await request.json()) as Partial<WorkflowStepMutationInput>;
  const context = workflowMutationContextFromRequest(
    request,
    "workflow:mutate",
    body.changeReason ?? "Update workflow step"
  );

  if (!context) {
    return NextResponse.json({ message: "Workflow access denied" }, { status: 403 });
  }

  const response = await updateWorkflowStepCommand(stepId, body, context);
  return NextResponse.json(response.body, { status: response.status });
}
