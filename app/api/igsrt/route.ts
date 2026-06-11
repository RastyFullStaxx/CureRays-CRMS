import { NextRequest, NextResponse } from "next/server";
import {
  getIgsrtWorkspace,
  renderGeneratedDocument,
  signGeneratedDocument,
  updatePrescription,
  updateSimulationOrder,
} from "@/lib/clinical-store";
import {
  approveFractionRow,
  attachFractionImage,
  completeOtvCheck,
  completePhysicsCheck,
  correctFractionRow,
  createFractionRow,
  createFractionSchedule,
  requestFractionRowRevision,
  voidFractionRow
} from "@/lib/server/phase6-treatment-workflow-service";
import { phiAccessFromRequest, requirePhiAction } from "@/lib/server/phi-store";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  if (!phiAccessFromRequest(request, "Open IGSRT PHI workspace")) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const courseId = request.nextUrl.searchParams.get("courseId") ?? "COURSE-2401";

  try {
    return NextResponse.json(getIgsrtWorkspace(courseId));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Workspace not found" }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest) {
  const access = phiAccessFromRequest(request, "Update IGSRT PHI workspace");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    requirePhiAction(access, "igsrt:mutate");
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();
  const courseId = body.courseId ?? "COURSE-2401";

  if (body.resource === "simulationOrder") {
    const result = updateSimulationOrder(courseId, body.data ?? {});
    return result
      ? NextResponse.json(result)
      : NextResponse.json({ message: "Simulation order not found" }, { status: 404 });
  }

  if (body.resource === "prescription") {
    const result = updatePrescription(courseId, body.data ?? {});
    return result
      ? NextResponse.json(result)
      : NextResponse.json({ message: "Prescription not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Unsupported IGSRT resource" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const access = phiAccessFromRequest(request, "Mutate IGSRT PHI workspace");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();
  const mutateActions = new Set([
    "addFraction",
    "updateFraction",
    "voidFraction",
    "generateFractionSchedule",
    "linkFractionImage",
    "recordPhysicsCheck",
    "recordOtvCheck"
  ]);
  const documentActions = new Map([
    ["renderDocument", "document:render" as const],
    ["signDocument", "document:sign" as const]
  ]);

  try {
    if (mutateActions.has(body.action)) {
      requirePhiAction(access, "igsrt:mutate");
    }
    const documentAction = documentActions.get(body.action);
    if (documentAction) {
      requirePhiAction(access, documentAction);
    }
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  if (body.action === "addFraction") {
    try {
      return NextResponse.json(createFractionRow(access, body.data ?? {}), { status: 201 });
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Fraction worksheet validation failed" },
        { status: 400 }
      );
    }
  }

  if (body.action === "updateFraction") {
    try {
      const result = correctFractionRow(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Fraction worksheet row not found" }, { status: 404 });
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Fraction worksheet validation failed" },
        { status: 400 }
      );
    }
  }

  if (body.action === "approveFraction") {
    try {
      const result = approveFractionRow(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Fraction worksheet row not found" }, { status: 404 });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not allowed")) {
        return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
      }
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Fraction approval failed" },
        { status: 400 }
      );
    }
  }

  if (body.action === "requestFractionRevision") {
    try {
      const result = requestFractionRowRevision(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Fraction worksheet row not found" }, { status: 404 });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not allowed")) {
        return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
      }
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Fraction revision request failed" },
        { status: 400 }
      );
    }
  }

  if (body.action === "voidFraction") {
    try {
      const result = voidFractionRow(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Fraction worksheet row not found" }, { status: 404 });
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Fraction void failed" },
        { status: 400 }
      );
    }
  }

  if (body.action === "generateFractionSchedule") {
    try {
      const result = createFractionSchedule(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Treatment course not found" }, { status: 404 });
    } catch {
      return NextResponse.json({ message: "Fraction schedule generation failed" }, { status: 400 });
    }
  }

  if (body.action === "linkFractionImage") {
    try {
      const result = attachFractionImage(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Scheduled fraction not found" }, { status: 404 });
    } catch {
      return NextResponse.json({ message: "Fraction imaging update failed" }, { status: 400 });
    }
  }

  if (body.action === "recordPhysicsCheck") {
    try {
      const result = completePhysicsCheck(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Scheduled fraction not found" }, { status: 404 });
    } catch {
      return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
    }
  }

  if (body.action === "recordOtvCheck") {
    try {
      const result = completeOtvCheck(access, body.data ?? {});
      return result
        ? NextResponse.json(result)
        : NextResponse.json({ message: "Scheduled fraction not found" }, { status: 404 });
    } catch {
      return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
    }
  }

  if (body.action === "renderDocument") {
    const result = renderGeneratedDocument(body.documentId, body.format ?? "PDF");
    return result
      ? NextResponse.json(result)
      : NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  if (body.action === "signDocument") {
    const result = signGeneratedDocument(body.documentId);
    return result
      ? NextResponse.json(result)
      : NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Unsupported IGSRT action" }, { status: 400 });
}
