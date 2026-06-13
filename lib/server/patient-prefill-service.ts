import "server-only";

import { inflateRawSync } from "node:zlib";
import type {
  DiagnosisCategory,
  PatientCreateInput,
  PatientPrefillField,
  PatientPrefillFieldKey,
  PatientPrefillResult,
  PatientPrefillTemplateType
} from "@/lib/types";

const maxDocxBytes = 4 * 1024 * 1024;

const fieldLabels: Record<PatientPrefillFieldKey, string> = {
  firstName: "First name",
  lastName: "Last name",
  mrn: "External MRN",
  diagnosis: "Diagnosis / reason",
  location: "Location / site",
  physician: "Physician / provider",
  notes: "Source notes",
  "initialCourse.bodyRegion": "Body region hint"
};

const unsupportedValueWords = new Set([
  "age",
  "age/sex",
  "assessment",
  "code",
  "date",
  "dob",
  "dos",
  "focused",
  "history",
  "id",
  "location",
  "mrn",
  "patient",
  "phone",
  "plan",
  "reason",
  "select",
  "signature"
]);

type ZipEntry = {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
};

export class PatientPrefillError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "PatientPrefillError";
    this.status = status;
  }
}

function safeText(value: string | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function decodeXmlText(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function zipEntries(buffer: Buffer): ZipEntry[] {
  let directoryEnd = -1;
  for (let index = buffer.length - 22; index >= Math.max(0, buffer.length - 66000); index -= 1) {
    if (buffer.readUInt32LE(index) === 0x06054b50) {
      directoryEnd = index;
      break;
    }
  }

  if (directoryEnd < 0) {
    throw new PatientPrefillError("Only valid DOCX files can be used for prefill.");
  }

  const totalEntries = buffer.readUInt16LE(directoryEnd + 10);
  let offset = buffer.readUInt32LE(directoryEnd + 16);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      break;
    }

    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.slice(offset + 46, offset + 46 + nameLength).toString("utf8");

    entries.push({ name, method, compressedSize, localOffset });
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipEntry(buffer: Buffer, entry: ZipEntry) {
  const offset = entry.localOffset;
  if (buffer.readUInt32LE(offset) !== 0x04034b50) {
    return "";
  }

  const nameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const start = offset + 30 + nameLength + extraLength;
  const compressed = buffer.slice(start, start + entry.compressedSize);

  if (entry.method === 0) {
    return compressed.toString("utf8");
  }

  if (entry.method === 8) {
    return inflateRawSync(compressed).toString("utf8");
  }

  return "";
}

function xmlToText(xml: string) {
  return decodeXmlText(
    xml
      .replace(/<\/w:p>/g, "\n")
      .replace(/<\/w:tr>/g, "\n")
      .replace(/<\/w:tc>/g, "\t")
      .replace(/<[^>]+>/g, " ")
  )
    .split("\n")
    .map((line) => safeText(line))
    .filter(Boolean)
    .join("\n");
}

function extractDocxText(buffer: Buffer) {
  if (buffer.length === 0) {
    throw new PatientPrefillError("The uploaded DOCX file is empty.");
  }

  if (buffer.length > maxDocxBytes) {
    throw new PatientPrefillError("The uploaded DOCX file is too large for prefill.");
  }

  if (buffer.length < 4 || buffer.readUInt32LE(0) !== 0x04034b50) {
    throw new PatientPrefillError("Only valid DOCX files can be used for prefill.");
  }

  const textByPart = zipEntries(buffer)
    .filter((entry) => /^word\/(document|header\d+|footer\d+)\.xml$/i.test(entry.name))
    .map((entry) => ({ part: entry.name, text: xmlToText(readZipEntry(buffer, entry)) }))
    .filter((entry) => entry.text);

  if (textByPart.length === 0) {
    throw new PatientPrefillError("The uploaded DOCX file could not be read.");
  }

  return textByPart;
}

function valueLooksLikeTemplateLabel(value: string) {
  const normalized = value.toLowerCase().replace(/[^a-z/ ]/g, "").trim();
  if (!normalized) {
    return true;
  }

  if (unsupportedValueWords.has(normalized)) {
    return true;
  }

  return normalized
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => unsupportedValueWords.has(word));
}

function cleanDetectedValue(value: string | undefined, maxLength = 120) {
  const cleaned = safeText(value)
    .replace(/^[:#\-\s]+/, "")
    .replace(/\s+[_-]+$/g, "")
    .slice(0, maxLength)
    .trim();

  return cleaned && !valueLooksLikeTemplateLabel(cleaned) ? cleaned : undefined;
}

function matchAfterLabel(text: string, labels: string[], stopLabels: string[], maxLength = 120) {
  const stop = stopLabels.map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*[:#-]?\\s*([\\s\\S]{1,${maxLength}}?)(?=\\s+(?:${stop})\\b|\\n|$)`, "i");
    const value = cleanDetectedValue(text.match(pattern)?.[1], maxLength);
    if (value) {
      return value;
    }
  }

  return undefined;
}

function detectTemplateType(text: string, fileName: string): PatientPrefillTemplateType {
  const haystack = `${fileName} ${text}`.toLowerCase();
  if (haystack.includes("after-visit summary") || haystack.includes("avs")) {
    return "AVS";
  }
  if (haystack.includes("patient intake") || haystack.includes("intake")) {
    return "INTAKE";
  }
  return "UNKNOWN";
}

function splitPatientName(name: string | undefined) {
  if (!name) {
    return {};
  }

  const cleaned = name.replace(/\b(patient|name)\b/gi, "").replace(/[,|]/g, " ").replace(/\s+/g, " ").trim();
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length < 2) {
    return {};
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" ")
  };
}

function detectDiagnosisCategory(text: string): DiagnosisCategory | undefined {
  const lower = text.toLowerCase();
  if (lower.includes("dupuytren")) {
    return "DUPUYTRENS";
  }
  if (lower.includes("arthritis") || lower.includes("joint")) {
    return "ARTHRITIS";
  }
  if (lower.includes("skin cancer") || lower.includes("basal cell") || lower.includes("squamous cell") || lower.includes("bcc") || lower.includes("scc")) {
    return "SKIN_CANCER";
  }
  return undefined;
}

function detectBodyRegion(text: string) {
  const lower = text.toLowerCase();
  for (const [token, region] of [
    ["hand", "HAND"],
    ["finger", "HAND"],
    ["palm", "HAND"],
    ["foot", "FOOT"],
    ["toe", "FOOT"],
    ["knee", "KNEE"],
    ["skin", "SITE"],
    ["lesion", "SITE"]
  ] as const) {
    if (lower.includes(token)) {
      return region;
    }
  }

  return undefined;
}

function sourceForPart(parts: Array<{ part: string; text: string }>, value: string | undefined): PatientPrefillField["source"] {
  if (!value) {
    return "SYSTEM";
  }

  return parts.find((part) => part.text.includes(value))?.part.includes("header") ? "DOCX_HEADER" : "DOCX_BODY";
}

function buildField(
  key: PatientPrefillFieldKey,
  value: string | undefined,
  source: PatientPrefillField["source"] = "DOCX_BODY"
): PatientPrefillField {
  return {
    key,
    label: fieldLabels[key],
    status: value ? "FOUND" : "NOT_FOUND",
    value,
    source: value ? source : "SYSTEM",
    requiresReview: Boolean(value)
  };
}

export function parsePatientPrefillDocx({
  fileName,
  buffer
}: {
  fileName: string;
  buffer: Buffer;
}): PatientPrefillResult {
  if (!fileName.toLowerCase().endsWith(".docx")) {
    throw new PatientPrefillError("Only AVS or Intake DOCX files can be used for prefill.");
  }

  const parts = extractDocxText(buffer);
  const fullText = parts.map((part) => part.text).join("\n");
  const compactText = safeText(fullText);
  const templateType = detectTemplateType(compactText, fileName);

  if (templateType === "UNKNOWN") {
    throw new PatientPrefillError("Only AVS or Intake DOCX files are supported for patient prefill.");
  }

  const patientName = matchAfterLabel(compactText, ["Patient Name"], ["DOB", "Age/Sex", "MRN", "DOS", "Phone"]);
  const { firstName, lastName } = splitPatientName(patientName);
  const mrn = matchAfterLabel(compactText, ["MRN"], ["DOB", "DOS", "Phone", "ID", "Code", "Location", "Reason"], 40);
  const diagnosis =
    matchAfterLabel(compactText, ["Reason for visit", "Assessment", "History of Present Illness", "Diagnosis"], ["Focused Exam", "Assessment", "Plan", "Performance status", "Scribe", "Date"], 160);
  const location = matchAfterLabel(compactText, ["Location of visit", "Location", "Treatment Site"], ["Reason for visit", "Focused Exam", "Assessment", "Physician"], 80);
  const physician = matchAfterLabel(compactText, ["MD treating team", "Physician", "Provider"], ["History of Present Illness", "Primary Care Physician", "CureRays", "Date"], 80);
  const bodyRegion = detectBodyRegion(`${diagnosis ?? ""} ${location ?? ""}`);
  const diagnosisCategory = detectDiagnosisCategory(`${diagnosis ?? ""} ${compactText}`);
  const sourceNote = templateType === "AVS" ? "Detected draft values from uploaded AVS DOCX. Staff must review before saving." : "Detected draft values from uploaded Intake DOCX. Staff must review before saving.";

  const draft: Partial<PatientCreateInput> = {
    firstName,
    lastName,
    mrn,
    diagnosis,
    location,
    physician,
    notes: sourceNote,
    diagnosisCategory,
    initialCourse: {
      bodyRegion
    }
  };

  const fields: PatientPrefillField[] = [
    buildField("firstName", firstName, sourceForPart(parts, firstName)),
    buildField("lastName", lastName, sourceForPart(parts, lastName)),
    buildField("mrn", mrn, sourceForPart(parts, mrn)),
    buildField("diagnosis", diagnosis, sourceForPart(parts, diagnosis)),
    buildField("location", location, sourceForPart(parts, location)),
    buildField("physician", physician, sourceForPart(parts, physician)),
    buildField("initialCourse.bodyRegion", bodyRegion, bodyRegion ? "DOCX_BODY" : "SYSTEM"),
    buildField("notes", sourceNote, "SYSTEM")
  ];

  const foundIdentity = Boolean(firstName && lastName);
  return {
    templateType,
    fileRetained: false,
    requiresIdentityConfirmation: true,
    fields: fields.map((field) => field.status === "FOUND" && !foundIdentity && ["firstName", "lastName", "mrn"].includes(field.key)
      ? { ...field, status: "NEEDS_REVIEW" }
      : field),
    draft,
    warnings: [
      "Detected values are draft only.",
      "Confirm patient identity before continuing.",
      ...(foundIdentity ? [] : ["Patient name was not confidently detected."])
    ]
  };
}

