import { NextRequest, NextResponse } from "next/server";
import { generatedDocuments, renderGeneratedDocument, signGeneratedDocument } from "@/lib/clinical-store";

export const dynamic = "force-dynamic";

export function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const document = generatedDocuments.find((item) => item.id === params.id);

  if (!document) {
    return NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();

  if (body.action === "sign") {
    const result = signGeneratedDocument(params.id);
    return result ? NextResponse.json(result) : NextResponse.json({ message: "Document not found" }, { status: 404 });
  }

  const result = renderGeneratedDocument(params.id, body.format ?? "PDF");
  return result ? NextResponse.json(result) : NextResponse.json({ message: "Document not found" }, { status: 404 });
}
