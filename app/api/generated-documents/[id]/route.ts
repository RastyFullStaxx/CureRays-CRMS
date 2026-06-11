import { NextRequest, NextResponse } from "next/server";
import {
  readGeneratedDocumentLifecycle,
  renderGeneratedDocumentLifecycle,
  signGeneratedDocumentLifecycle
} from "@/lib/server/document-lifecycle-service";
import { phiAccessFromRequest } from "@/lib/server/phi-store";
import type { GeneratedDocumentOutput } from "@/lib/types";

export const dynamic = "force-dynamic";

function safeOutputFormat(value: unknown): GeneratedDocumentOutput["format"] {
  return value === "DOCX" || value === "XLSX" ? value : "PDF";
}

function documentResponse(result: ReturnType<typeof readGeneratedDocumentLifecycle>) {
  if (result.blockedReason) {
    return NextResponse.json({ message: result.blockedReason }, { status: 404 });
  }

  return NextResponse.json(result);
}

export function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const access = phiAccessFromRequest(request, "Read generated PHI document");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    return documentResponse(readGeneratedDocumentLifecycle(access, params.id));
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const access = phiAccessFromRequest(request, "Render or sign generated PHI document");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  const body = await request.json();

  try {
    const result = body.action === "sign"
      ? signGeneratedDocumentLifecycle(access, params.id)
      : renderGeneratedDocumentLifecycle(access, params.id, safeOutputFormat(body.format));

    return documentResponse(result);
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }
}
