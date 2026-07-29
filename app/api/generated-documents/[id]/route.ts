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
import { hydrateClinicalStoreFromDatabase } from "@/lib/server/database-hydration";
import { phiAccessFromRequest, type PhiAccessContext } from "@/lib/server/phi-store";
import { pilotSessionFromRequest } from "@/lib/server/pilot-session";
import { PersistenceWriteError } from "@/lib/server/write-through";
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
  const session = pilotSessionFromRequest(request);
  return session ? { ...session, reason } : null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await hydrateClinicalStoreFromDatabase();
  const { id } = await params;
  const access = phiAccessFromRequest(request, "Read generated PHI document");
  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    return documentResponse(readGeneratedDocumentLifecycle(access, id));
  } catch {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await hydrateClinicalStoreFromDatabase();
  const { id } = await params;
  const body = await request.json();
  const action = String(body.action ?? "render");
  const access = documentMutationAccessFromRequest(request, `Generated document action: ${action}`);

  if (!access) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    const result = await (action === "sign" || action === "signDocument"
      ? signGeneratedDocumentLifecycle(access, id)
      : action === "export"
        ? exportGeneratedDocumentLifecycle(access, id)
        : action === "confirmEcwUpload"
          ? confirmGeneratedDocumentEcwUploadLifecycle(access, id, {
              externalReference: body.externalReference,
              reason: body.reason
            })
          : action === "voidOutput"
            ? voidGeneratedDocumentOutputLifecycle(access, id, { reason: body.reason })
            : action === "recordManualEditException"
              ? recordGeneratedDocumentManualEditExceptionLifecycle(access, id, { reason: body.reason })
              : renderGeneratedDocumentLifecycle(access, id, safeOutputFormat(body.format)));

    return documentResponse(result);
  } catch (error) {
    if (error instanceof PersistenceWriteError) {
      return NextResponse.json(
        { message: "Document change could not be saved to the configured database." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }
}
