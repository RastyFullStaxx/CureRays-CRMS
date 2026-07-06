import { NextRequest, NextResponse } from "next/server";
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import {
  generateClinicalFormDocx,
  generateFractionLogXlsx,
  type GeneratedDocumentArtifact,
} from "@/lib/services/document-generation-service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  await hydrateClinicalStoreFromDatabase();

  const params = request.nextUrl.searchParams;
  const kind = params.get("kind") ?? "form";
  const courseId = params.get("courseId") ?? "";

  if (!courseId) {
    return NextResponse.json({ message: "courseId is required" }, { status: 400 });
  }

  let artifact: GeneratedDocumentArtifact | null = null;
  if (kind === "fraction-log") {
    artifact = await generateFractionLogXlsx(courseId);
  } else {
    const requirementId = params.get("requirementId") ?? "";
    if (!requirementId) {
      return NextResponse.json({ message: "requirementId is required" }, { status: 400 });
    }
    artifact = await generateClinicalFormDocx(courseId, requirementId);
  }

  if (!artifact) {
    return NextResponse.json({ message: "Document could not be generated for this course." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(artifact.buffer), {
    status: 200,
    headers: {
      "Content-Type": artifact.contentType,
      "Content-Disposition": `attachment; filename="${artifact.fileName}"`,
      "Content-Length": String(artifact.buffer.length),
      "Cache-Control": "no-store",
    },
  });
}
