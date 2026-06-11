import { NextRequest, NextResponse } from "next/server";
import {
  confirmGeneratedDocumentEcwUploadLifecycle,
  exportGeneratedDocumentLifecycle,
  readGeneratedDocumentLifecycle,
  recordGeneratedDocumentManualEditExceptionLifecycle,
  renderGeneratedDocumentLifecycle,
  signGeneratedDocumentLifecycle,
  voidGeneratedDocumentOutputLifecycle
} from "@/lib/server/document-lifecycle-service";
import { phiAccessFromRequest, type PhiAccessContext } from "@/lib/server/phi-store";
import { prototypeSessionFromRequest } from "@/lib/server/prototype-session";
import type { DocumentLifecycleResult, GeneratedDocumentFormat } from "@/lib/types";

export const dynamic = "force-dynamic";

function safeOutputFormat(value: unknown): GeneratedDocumentFormat {
  return value === "DOCX" || value === "XLSX" ? value : "PDF";
}

function documentResponse(result: DocumentLifecycleResult) {
  if (result.blockedReason) {
    const status = result.document ? 409 : 404;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

function documentMutationAccessFromRequest(request: NextRequest, reason: string): PhiAccessContext | null {
  const session = prototypeSessionFromRequest(request);
  return session ? { role: session.role, reason } : null;
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
  const body = await request.json();
  const action = String(body.action ?? "render");
  const access = documentMutationAccessFromRequest(request, `Generated document action: ${action}`);

  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    const result =
      action === "sign" || action === "signDocument"
        ? signGeneratedDocumentLifecycle(access, params.id)
        : action === "export"
          ? exportGeneratedDocumentLifecycle(access, params.id)
          : action === "confirmEcwUpload"
            ? confirmGeneratedDocumentEcwUploadLifecycle(access, params.id, {
                externalReference: body.externalReference,
                reason: body.reason
              })
            : action === "voidOutput"
              ? voidGeneratedDocumentOutputLifecycle(access, params.id, { reason: body.reason })
              : action === "recordManualEditException"
                ? recordGeneratedDocumentManualEditExceptionLifecycle(access, params.id, { reason: body.reason })
                : renderGeneratedDocumentLifecycle(access, params.id, safeOutputFormat(body.format));

    return documentResponse(result);
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }
}
