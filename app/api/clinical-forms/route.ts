import { NextRequest, NextResponse } from "next/server";
import { getClinicalFormResponse, upsertClinicalFormResponse } from "@/lib/clinical-store";
import { workflowMutationContextFromRequest } from "@/lib/server/workflow-command-service";
import { PersistenceWriteError, persistCourseClinicalMutation } from "@/lib/server/write-through";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import type { ClinicalFormResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

type ClinicalFormPatchBody = {
  courseId?: string;
  requirementId?: string;
  templateId?: string;
  responseData?: ClinicalFormResponse["responseData"];
  intent?: "DRAFT" | "SUBMIT" | "SIGN";
  requiredFieldIds?: string[];
  changeReason?: string;
};

function persistenceFailureResponse() {
  return NextResponse.json(
    { message: "Change could not be saved to the configured database." },
    { status: 500 }
  );
}

export async function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get("courseId") ?? "";
  const requirementId = request.nextUrl.searchParams.get("requirementId") ?? "";

  if (!courseId || !requirementId) {
    return NextResponse.json({ message: "courseId and requirementId are required" }, { status: 400 });
  }

  await hydrateClinicalStoreFromDatabase();
  return NextResponse.json({ response: getClinicalFormResponse(courseId, requirementId) ?? null });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as ClinicalFormPatchBody;
  const context = workflowMutationContextFromRequest(
    request,
    "workflow:step_mutate",
    body.changeReason ?? "Update clinical form"
  );

  if (!context) {
    return NextResponse.json({ message: "Workflow access denied" }, { status: 403 });
  }

  if (!body.courseId || !body.requirementId || !body.templateId) {
    return NextResponse.json(
      { message: "courseId, requirementId, and templateId are required" },
      { status: 400 }
    );
  }

  const intent = body.intent ?? "DRAFT";
  if (!["DRAFT", "SUBMIT", "SIGN"].includes(intent)) {
    return NextResponse.json({ message: "Unsupported clinical form intent" }, { status: 400 });
  }

  await hydrateClinicalStoreFromDatabase();

  let result: ReturnType<typeof upsertClinicalFormResponse>;
  try {
    result = upsertClinicalFormResponse({
      courseId: body.courseId,
      requirementId: body.requirementId,
      templateId: body.templateId,
      responseData: body.responseData ?? {},
      intent,
      signedByUserId: intent === "SIGN" ? context.userId : undefined,
      requiredFieldIds: body.requiredFieldIds
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Clinical form update failed" },
      { status: 404 }
    );
  }

  try {
    await persistCourseClinicalMutation(body.courseId, result.auditEvent.id);
  } catch (error) {
    if (error instanceof PersistenceWriteError) {
      await hydrateClinicalStoreFromDatabase({ force: true });
      return persistenceFailureResponse();
    }
    throw error;
  }

  return NextResponse.json({ response: result.response });
}
