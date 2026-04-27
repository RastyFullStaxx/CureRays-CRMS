import { NextRequest, NextResponse } from "next/server";
import {
  addFractionLogEntry,
  getIgsrtWorkspace,
  renderGeneratedDocument,
  signGeneratedDocument,
  updatePrescription,
  updateSimulationOrder
} from "@/lib/clinical-store";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const courseId = request.nextUrl.searchParams.get("courseId") ?? "COURSE-2401";

  try {
    return NextResponse.json(getIgsrtWorkspace(courseId));
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Workspace not found" }, { status: 404 });
  }
}

export async function PATCH(request: NextRequest) {
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
  const body = await request.json();

  if (body.action === "addFraction") {
    return NextResponse.json(addFractionLogEntry(body.data), { status: 201 });
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
