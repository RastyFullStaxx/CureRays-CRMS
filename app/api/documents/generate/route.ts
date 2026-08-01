import { NextRequest, NextResponse } from 'next/server';
import {
  GeneratedDocumentOutputServiceError,
  generateGeneratedDocumentOutput,
  parseGenerateDocumentRequest,
  type GenerateDocumentRequest,
} from '@/lib/server/generated-document-output-service';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';
import { phiAccessFromRequest, requirePhiAction } from '@/lib/server/phi-store';
import {
  generateClinicalFormDocx,
  generateFractionLogXlsx,
  type GeneratedDocumentArtifact,
} from '@/lib/services/document-generation-service';

export const dynamic = 'force-dynamic';

function accessDeniedResponse() {
  return NextResponse.json({ message: 'Document generation access denied.' }, { status: 403 });
}

function invalidRequestResponse() {
  return NextResponse.json({ message: 'Document generation request is invalid.' }, { status: 400 });
}

function generationErrorResponse(error: unknown) {
  if (!(error instanceof GeneratedDocumentOutputServiceError)) {
    return NextResponse.json({ message: 'Document could not be generated.' }, { status: 500 });
  }

  if (error.code === 'ACCESS_DENIED') return accessDeniedResponse();
  if (error.code === 'NOT_FOUND') {
    return NextResponse.json({ message: 'Document generation resource was not found.' }, { status: 404 });
  }
  if (error.code === 'PERSISTENCE_REQUIRED') {
    return NextResponse.json({ message: 'Durable document generation is unavailable.' }, { status: 503 });
  }
  if (['INAPPLICABLE', 'TEMPLATE_NOT_READY', 'SAVED_DATA_REQUIRED', 'MISSING_REQUIRED_FIELDS'].includes(error.code)) {
    return NextResponse.json({ message: 'Document is not ready for generation.' }, { status: 409 });
  }
  return NextResponse.json({ message: 'Document could not be generated.' }, { status: 500 });
}

function requestAccess(request: NextRequest) {
  const access = phiAccessFromRequest(request, 'Generate clinical document output');
  if (!access) return null;

  try {
    requirePhiAction(access, 'document:render');
    return access;
  } catch {
    return null;
  }
}

function legacyRequest(request: NextRequest): GenerateDocumentRequest | null {
  const kind = request.nextUrl.searchParams.get('kind') ?? 'form';
  const courseId = request.nextUrl.searchParams.get('courseId');
  return parseGenerateDocumentRequest(
    kind === 'fraction-log'
      ? { kind, courseId }
      : { kind, courseId, requirementId: request.nextUrl.searchParams.get('requirementId') },
  );
}

export async function POST(request: NextRequest) {
  const access = requestAccess(request);
  if (!access) return accessDeniedResponse();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return invalidRequestResponse();
  }

  const input = parseGenerateDocumentRequest(payload);
  if (!input) return invalidRequestResponse();

  await hydrateClinicalStoreFromDatabase();
  try {
    return NextResponse.json(await generateGeneratedDocumentOutput(access, input));
  } catch (error) {
    return generationErrorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  if (!requestAccess(request)) return accessDeniedResponse();
  const input = legacyRequest(request);
  if (!input) return invalidRequestResponse();

  await hydrateClinicalStoreFromDatabase();
  let artifact: GeneratedDocumentArtifact | null;
  try {
    artifact = input.kind === 'fraction-log'
      ? await generateFractionLogXlsx(input.courseId)
      : await generateClinicalFormDocx(input.courseId, input.requirementId);
  } catch {
    return NextResponse.json({ message: 'Document could not be generated.' }, { status: 500 });
  }

  if (!artifact) {
    return NextResponse.json({ message: 'Document generation resource was not found.' }, { status: 404 });
  }

  const fileName = artifact.fileName.replace(/["\r\n]/g, '');
  return new NextResponse(new Uint8Array(artifact.buffer), {
    status: 200,
    headers: {
      'Content-Type': artifact.contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': String(artifact.buffer.length),
      'Cache-Control': 'no-store',
    },
  });
}
