import { NextRequest, NextResponse } from "next/server";
import { generatedDocuments, renderGeneratedDocument, signGeneratedDocument } from "@/lib/clinical-store";
import { phiAccessFromRequest, requirePhiAction } from "@/lib/server/phi-store";

export const dynamic = "force-dynamic";

export function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const document = generatedDocuments.find((item) => item.id === params.id);

  if (!document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const access = phiAccessFromRequest(request, "Render or sign generated PHI document");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();

  if (body.action === "sign") {
    try {
      requirePhiAction(access, "document:sign");
    } catch {
      return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
    }
    const result = signGeneratedDocument(params.id);
    return result ? NextResponse.json(result) : NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  try {
    requirePhiAction(access, "document:render");
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }
  const result = renderGeneratedDocument(params.id, body.format ?? "PDF");
  return result ? NextResponse.json(result) : NextResponse.json({ message: "Document not found" }, { status: 404 });
}
