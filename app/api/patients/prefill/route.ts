import { NextRequest, NextResponse } from "next/server";
import { parsePatientPrefillDocx, PatientPrefillError } from "@/lib/server/patient-prefill-service";
import { patientMutationContextFromRequest } from "@/lib/server/patient-registration-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function isFileLike(value: FormDataEntryValue | null): value is File {
  return Boolean(
    value &&
      typeof value === "object" &&
      "arrayBuffer" in value &&
      typeof value.arrayBuffer === "function" &&
      "name" in value &&
      typeof value.name === "string"
  );
}

export async function POST(request: NextRequest) {
  const context = patientMutationContextFromRequest(
    request,
    "phi:create",
    "Prefill patient registration from uploaded DOCX"
  );

  if (!context) {
    return NextResponse.json({ message: "PHI access denied" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!isFileLike(file)) {
      return NextResponse.json({ message: "Upload one AVS or Intake DOCX file." }, { status: 400 });
    }

    const prefill = parsePatientPrefillDocx({
      fileName: file.name,
      buffer: Buffer.from(await file.arrayBuffer())
    });

    return NextResponse.json({ prefill }, { status: 200 });
  } catch (caughtError) {
    if (caughtError instanceof PatientPrefillError) {
      return NextResponse.json({ message: caughtError.message }, { status: caughtError.status });
    }

    return NextResponse.json({ message: "Patient prefill could not be completed." }, { status: 500 });
  }
}

