import { NextRequest, NextResponse } from "next/server";
import {
  updateTaskCommand,
  workflowMutationContextFromRequest
} from "@/lib/server/workflow-command-service";
import type { TaskMutationInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, { params }: { params: { taskId: string } }) {
  const body = (await request.json()) as Partial<TaskMutationInput>;
  const context = workflowMutationContextFromRequest(
    request,
    "task:mutate",
    body.changeReason ?? "Update carepath task"
  );

  if (!context) {
    return NextResponse.json({ message: "Task access denied" }, { status: 403 });
  }

  const response = await updateTaskCommand(params.taskId, body, context);
  return NextResponse.json(response.body, { status: response.status });
}
