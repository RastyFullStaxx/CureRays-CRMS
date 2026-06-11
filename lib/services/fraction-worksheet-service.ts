import type {
  FractionLogStatus,
  FractionLogEntry,
  FractionWorksheetApprovalState,
  FractionWorksheetCalculationMeta,
  PrescriptionPhase,
  TreatmentCourse
} from "@/lib/types";

export type FractionWorksheetEnergyKv = 50 | 70 | 100;

export type FractionWorksheetPhaseSummary = {
  phaseName: string;
  plannedFractions: number;
  completedFractions: number;
  energyKv: number;
  ssdCm: number;
  dosePerFractionCgy: number;
  fieldSizeCm: string;
  treatmentTimeMinutes: number;
};

export type FractionWorksheetReferenceCurve = {
  energyKv: FractionWorksheetEnergyKv;
  depthsMm: number[];
  fieldCurves: Array<{
    fieldSizeCm: string;
    isodosePercents: number[];
  }>;
};

export type FractionWorksheetBillingRow = {
  id: string;
  fractionNumber: number;
  date: string;
  phase: string;
  activity: string;
  cptCode: string;
  reviewer: string;
  status: string;
};

type FractionWorksheetInput = Partial<FractionLogEntry> & {
  courseId: string;
};

type LookupResult = {
  percent: number | null;
  roundedDepthMm: number;
  lookupKey?: string;
  warnings: string[];
};

const sourceTemplate =
  "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/12_FRACTIONATION_LOG/12_Fractionation_Log.SKIN_CANCER.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.xlsx";

const sourceTabs = ["skin lesion", "Isodose Note", "100 kV", "70 kV", "50 kV"];

export const fractionWorksheetReferenceVersion = "IGSRT-FX-REF-2026-06-11-PROTOTYPE";

const depthsMm = Array.from({ length: 40 }, (_, index) => roundToOne((index + 1) / 10));

const referenceCurveRows: Record<FractionWorksheetEnergyKv, Record<string, number[]>> = {
  50: {
    "1.5 cm": [100, 98, 96, 94, 92, 91, 90, 88, 86, 84, 83, 82, 81, 79, 77, 76, 75, 74, 73, 71, 70, 69, 68, 67, 66, 65, 64, 63, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 53, 52],
    "2.0 cm": [100, 98, 96, 94, 92, 91, 90, 88, 86, 84, 83, 82, 81, 79, 77, 76, 75, 74, 73, 71, 70, 69, 68, 67, 66, 65, 64, 63, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 53, 52],
    "2.5 cm": [100, 98, 96, 94, 92, 91, 90, 88, 86, 84, 83, 82, 80, 78, 76, 75, 74, 73, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 53, 52],
    "3.0 cm": [100, 98, 96, 93, 91, 90, 89, 87, 85, 83, 82, 81, 79, 77, 76, 75, 74, 73, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 53, 52],
    "4.0 cm": [100, 98, 96, 93, 91, 90, 89, 87, 85, 83, 82, 81, 79, 77, 76, 75, 74, 73, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 53, 52],
    "5.0 cm": [100, 98, 96, 93, 91, 90, 89, 87, 85, 83, 82, 80, 78, 76, 75, 74, 73, 72, 71, 69, 68, 67, 66, 65, 65, 64, 63, 62, 61, 60, 59, 58, 57, 56, 56, 55, 55, 54, 53, 52]
  },
  70: {
    "1.5 cm": [100, 99, 98, 97, 96, 96, 95, 95, 94, 94, 94, 93, 92, 91, 90, 89, 88, 87, 87, 86, 86, 85, 85, 84, 83, 82, 82, 81, 81, 80, 80, 79, 78, 77, 76, 75, 75, 74, 74, 73],
    "2.0 cm": [100, 99, 98, 97, 96, 95, 95, 94, 94, 93, 93, 92, 91, 90, 89, 88, 87, 86, 86, 85, 85, 84, 84, 83, 82, 81, 81, 80, 80, 79, 79, 78, 77, 76, 76, 75, 74, 74, 74, 73],
    "2.5 cm": [100, 99, 98, 97, 96, 95, 94, 94, 93, 92, 91, 90, 89, 88, 87, 87, 86, 86, 85, 85, 84, 83, 83, 82, 81, 81, 80, 79, 79, 78, 78, 77, 76, 76, 75, 75, 74, 73, 73, 72],
    "3.0 cm": [100, 99, 98, 97, 96, 95, 94, 94, 93, 92, 91, 90, 89, 88, 87, 87, 86, 86, 85, 84, 84, 83, 82, 81, 80, 80, 79, 79, 78, 78, 77, 76, 76, 75, 75, 74, 74, 73, 73, 72],
    "4.0 cm": [100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 86, 85, 85, 84, 83, 83, 82, 81, 80, 79, 79, 78, 78, 77, 77, 76, 75, 75, 74, 74, 73, 73, 72, 72, 71],
    "5.0 cm": [100, 99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 84, 83, 82, 82, 81, 80, 79, 78, 78, 77, 77, 76, 76, 75, 75, 74, 74, 73, 73, 72, 72, 71, 71]
  },
  100: {
    "1.5 cm": [100, 100, 99, 99, 99, 98, 98, 98, 97, 97, 96, 96, 95, 94, 94, 93, 93, 92, 92, 91, 91, 90, 90, 89, 89, 88, 88, 87, 87, 86, 86, 85, 85, 84, 83, 83, 82, 82, 81, 81],
    "2.0 cm": [100, 100, 99, 99, 99, 98, 98, 98, 97, 97, 96, 96, 95, 94, 94, 93, 93, 92, 92, 91, 91, 90, 90, 89, 89, 88, 88, 87, 87, 86, 85, 85, 84, 83, 83, 82, 82, 81, 81, 80],
    "2.5 cm": [100, 100, 99, 99, 99, 98, 98, 98, 97, 96, 96, 96, 95, 94, 94, 93, 93, 92, 91, 90, 90, 89, 89, 88, 88, 87, 87, 86, 86, 85, 85, 84, 83, 83, 82, 82, 81, 81, 80, 79],
    "3.0 cm": [100, 99, 99, 98, 98, 97, 97, 97, 96, 95, 95, 95, 94, 94, 93, 93, 92, 91, 90, 90, 90, 89, 89, 88, 88, 87, 87, 86, 86, 85, 84, 83, 83, 82, 82, 81, 81, 80, 79, 79],
    "4.0 cm": [100, 99, 98, 98, 97, 97, 96, 96, 95, 95, 95, 94, 94, 93, 93, 92, 91, 91, 90, 89, 89, 88, 88, 87, 87, 86, 86, 85, 85, 84, 83, 83, 82, 82, 81, 81, 80, 79, 79, 78],
    "5.0 cm": [100, 99, 98, 98, 97, 97, 96, 96, 95, 94, 94, 93, 93, 92, 92, 91, 91, 90, 89, 88, 88, 87, 87, 86, 86, 85, 85, 84, 84, 83, 83, 82, 82, 81, 81, 80, 79, 79, 78, 78],
    "10 cm": [99.5, 99.2, 98.9, 98.6, 98.3, 98, 97.7, 97.1, 96.8, 96.5, 96.3, 95.9, 95.6, 95.3, 95, 94.7, 94.4, 94.1, 93.7, 93.8, 93.6, 93.3, 93, 92.7, 92.5, 92.3, 92.1, 91.9, 91.7, 91.1, 90.8, 90.5, 90.2, 89.9, 89.6, 89.3, 89.1, 88.9, 88.7, 88.5],
    "8x18 cm": [99.7, 99.4, 99, 98.7, 98.4, 98.1, 97.4, 97.1, 96.8, 96.5, 96.3, 96, 95.9, 95.5, 95.4, 95.2, 95.1, 94.9, 94.7, 94.4, 94.2, 94, 93.8, 93.6, 93.4, 93.1, 93, 92.8, 92.5, 92.3, 92.1, 91.9, 91.7, 91.5, 91.3, 91.1, 90.9, 90.7, 90.5, 90.3]
  }
};

export const fractionWorksheetReferenceCurves: FractionWorksheetReferenceCurve[] = Object.entries(referenceCurveRows).map(
  ([energyKv, fieldMap]) => ({
    energyKv: Number(energyKv) as FractionWorksheetEnergyKv,
    depthsMm,
    fieldCurves: Object.entries(fieldMap).map(([fieldSizeCm, isodosePercents]) => ({
      fieldSizeCm,
      isodosePercents
    }))
  })
);

export function normalizeFieldSizeCm(value: string | number | undefined) {
  if (value === undefined || value === null || value === "") {
    return "3.0 cm";
  }

  const raw = String(value).trim().toLowerCase().replace(/\s+/g, " ");
  if (raw.includes("8x18") || raw.includes("8 x 18")) {
    return "8x18 cm";
  }

  const numeric = parseNumeric(raw);
  if (numeric === undefined) {
    return String(value).trim();
  }

  if (numeric === 10) {
    return "10 cm";
  }

  return `${numeric.toFixed(1)} cm`;
}

export function parseEnergyKv(value: string | number | undefined) {
  const numeric = parseNumeric(value);
  if (numeric === undefined) {
    return 50;
  }

  return numeric;
}

export function parseNumeric(value: string | number | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const match = value.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return undefined;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function roundToOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function roundToClinicalTenth(value: number) {
  return Math.round(value * 10) / 10;
}

export function isVoidedFractionEntry(entry: Pick<FractionLogEntry, "status" | "voidedAt">) {
  return entry.status === "VOIDED" || Boolean(entry.voidedAt);
}

export function deriveFractionLogStatus(
  entry: Pick<
    FractionLogEntry,
    "status" | "mdApproval" | "dotApproval" | "mdApprovalState" | "dotApprovalState" | "revisionReason" | "voidedAt"
  >
): FractionLogStatus {
  if (entry.status === "VOIDED" || entry.voidedAt) {
    return "VOIDED";
  }

  if (
    entry.mdApprovalState === "REVISION_NEEDED" ||
    entry.dotApprovalState === "REVISION_NEEDED" ||
    Boolean(entry.revisionReason)
  ) {
    return "REVISION_NEEDED";
  }

  if (entry.mdApproval && entry.dotApproval) {
    return "APPROVED";
  }

  if (!entry.mdApproval || !entry.dotApproval) {
    return "NEEDS_REVIEW";
  }

  return "RECORDED";
}

export function lookupIsodoseToDotPercent(input: {
  energyKv: number;
  fieldSizeCm: string;
  depthOfTargetMm: number;
}): LookupResult {
  const warnings: string[] = [];
  const energyKv = input.energyKv === 50 || input.energyKv === 70 || input.energyKv === 100 ? input.energyKv : undefined;
  const roundedDepthMm = roundToOne(input.depthOfTargetMm);
  const depthIndex = depthsMm.findIndex((depth) => depth === roundedDepthMm);

  if (!energyKv) {
    warnings.push(`No normalized worksheet reference table for ${input.energyKv} kV.`);
    return { percent: null, roundedDepthMm, warnings };
  }

  const fieldSizeCm = normalizeFieldSizeCm(input.fieldSizeCm);
  const curve = referenceCurveRows[energyKv][fieldSizeCm];
  if (!curve) {
    warnings.push(`No ${energyKv} kV isodose curve for field size ${fieldSizeCm}.`);
    return { percent: null, roundedDepthMm, lookupKey: `${energyKv} kV / ${fieldSizeCm}`, warnings };
  }

  if (depthIndex < 0 || curve[depthIndex] === undefined) {
    warnings.push(`No ${energyKv} kV isodose value for ${fieldSizeCm} at rounded DOT ${roundedDepthMm.toFixed(1)}.`);
    return { percent: null, roundedDepthMm, lookupKey: `${energyKv} kV / ${fieldSizeCm} / ${roundedDepthMm.toFixed(1)}`, warnings };
  }

  return {
    percent: curve[depthIndex],
    roundedDepthMm,
    lookupKey: `${energyKv} kV / ${fieldSizeCm} / ${roundedDepthMm.toFixed(1)}`,
    warnings
  };
}

export function calculateFractionWorksheetEntry(
  input: FractionWorksheetInput,
  priorEntries: FractionLogEntry[],
  options: {
    existingId?: string;
    calculatedAt?: string;
    firstEntryCumulativeDelta?: {
      previousDoseCgy: number;
      previousDoseToDotCgy: number;
    };
  } = {}
) {
  const sortedPriorEntries = priorEntries
    .filter((entry) => entry.id !== options.existingId)
    .sort((a, b) => a.fractionNumber - b.fractionNumber);
  const fractionNumber = Number(input.fractionNumber ?? sortedPriorEntries.at(-1)?.fractionNumber ?? 0) || 1;
  const previousEntry = sortedPriorEntries.filter((entry) => entry.fractionNumber < fractionNumber).at(-1);
  const energyKv = parseEnergyKv(input.energyKv ?? input.energy);
  const ssdCm = parseNumeric(input.ssdCm ?? input.ssd) ?? 15;
  const fieldSizeCm = normalizeFieldSizeCm(input.fieldSizeCm);
  const dosePerFractionCgy = Number(input.dosePerFractionCgy ?? input.dosePerFraction ?? 0);
  const depthOfTargetMm = parseNumeric(input.depthOfTargetMm ?? input.depthOfTarget) ?? 0;
  const lookup = lookupIsodoseToDotPercent({ energyKv, fieldSizeCm, depthOfTargetMm });
  const hasExplicitOverrideField =
    input.isodoseToDotPercent !== undefined &&
    input.isodoseToDotPercent !== null &&
    String(input.isodoseToDotPercent).trim() !== "";
  const overridePercent = Number(input.isodoseToDotPercent ?? input.isodosePercent);
  const hasOverride = Number.isFinite(overridePercent) && overridePercent > 0 && overridePercent <= 100;
  const overrideReason = String(input.isodoseOverrideReason ?? "").trim();
  const warnings = [...lookup.warnings];
  const calculatedAt = options.calculatedAt ?? new Date().toISOString();
  const canRetainLegacyOverride = Boolean(input.id) && !input.calculationStatus && !overrideReason;

  if (hasExplicitOverrideField && !hasOverride) {
    throw new Error("Manual isodose override must be greater than 0 and no more than 100.");
  }

  if (lookup.percent === null && !hasOverride) {
    throw new Error("Missing isodose lookup requires a manual isodose percent and override reason.");
  }

  if (lookup.percent === null && hasOverride && !overrideReason && !canRetainLegacyOverride) {
    throw new Error("Manual isodose override requires an override reason.");
  }

  const isManualOverride = lookup.percent === null || (hasOverride && Math.abs(overridePercent - (lookup.percent ?? overridePercent)) > 0.05);
  const isodoseToDotPercent = isManualOverride ? overridePercent : lookup.percent ?? overridePercent;
  if (isManualOverride && !overrideReason && !canRetainLegacyOverride) {
    throw new Error("Manual isodose override requires an override reason.");
  }
  if (isManualOverride) {
    warnings.push(
      canRetainLegacyOverride
        ? "Legacy worksheet isodose value retained; physicist validation recommended."
        : "Manual isodose override used instead of normalized workbook lookup."
    );
  }

  const doseToDotCgy = roundToClinicalTenth(dosePerFractionCgy * (isodoseToDotPercent / 100));
  const providedCumulativeDoseCgy = Number(input.cumulativeDoseCgy ?? input.cumulativeDose ?? dosePerFractionCgy);
  const providedCumulativeDoseToDotCgy = Number(input.cumulativeDoseToDotCgy ?? input.cumulativeDoseToDepth ?? doseToDotCgy);
  const cumulativeDoseCgy = previousEntry
    ? roundToClinicalTenth((previousEntry.cumulativeDoseCgy ?? previousEntry.cumulativeDose ?? 0) + dosePerFractionCgy)
    : roundToClinicalTenth(
        options.firstEntryCumulativeDelta
          ? Math.max(0, providedCumulativeDoseCgy - options.firstEntryCumulativeDelta.previousDoseCgy + dosePerFractionCgy)
          : providedCumulativeDoseCgy
      );
  const cumulativeDoseToDotCgy = roundToClinicalTenth(
    previousEntry
      ? (previousEntry.cumulativeDoseToDotCgy ?? previousEntry.cumulativeDoseToDepth ?? 0) + doseToDotCgy
      : options.firstEntryCumulativeDelta
        ? Math.max(
            0,
            providedCumulativeDoseToDotCgy - options.firstEntryCumulativeDelta.previousDoseToDotCgy + doseToDotCgy
          )
        : providedCumulativeDoseToDotCgy
  );
  const calculationMeta: FractionWorksheetCalculationMeta = {
    referenceVersion: fractionWorksheetReferenceVersion,
    sourceTemplate,
    sourceTabs,
    depthRoundedMm: lookup.roundedDepthMm,
    lookupKey: lookup.lookupKey,
    calculatedAt,
    clinicalValidationRequired: true,
    warnings
  };
  const mdApproval = input.mdApprovalState ? approvalStateToBoolean(input.mdApprovalState) : compactBoolean(input.mdApproval);
  const dotApproval = input.dotApprovalState ? approvalStateToBoolean(input.dotApprovalState) : compactBoolean(input.dotApproval);
  const mdApprovalState = input.mdApprovalState ?? booleanToApprovalState(mdApproval);
  const dotApprovalState = input.dotApprovalState ?? booleanToApprovalState(dotApproval);
  const status = deriveFractionLogStatus({
    status: input.status ?? "RECORDED",
    mdApproval,
    dotApproval,
    mdApprovalState,
    dotApprovalState,
    revisionReason: input.revisionReason,
    voidedAt: input.voidedAt
  });
  const entry: FractionLogEntry = {
    id: input.id ?? `FR-${input.courseId.replace("COURSE-", "")}-${String(fractionNumber).padStart(2, "0")}`,
    courseId: input.courseId,
    fractionNumber,
    status,
    date: input.date || new Date().toISOString().slice(0, 10),
    phase: input.phase || "Phase I",
    energy: `${energyKv} kV`,
    energyKv,
    ssd: `${ssdCm} cm`,
    ssdCm,
    fieldSizeCm,
    treatmentTimeMinutes: parseNumeric(input.treatmentTimeMinutes) ?? 0,
    dosePerFraction: dosePerFractionCgy,
    dosePerFractionCgy,
    cumulativeDose: cumulativeDoseCgy,
    cumulativeDoseCgy,
    technicianInitials: input.technicianInitials || "NR",
    mdApproval,
    mdApprovalState,
    mdApprovedAt: input.mdApprovedAt,
    mdApprovedByUserId: input.mdApprovedByUserId,
    dotApproval,
    dotApprovalState,
    dotApprovedAt: input.dotApprovedAt,
    dotApprovedByUserId: input.dotApprovedByUserId,
    depthOfTarget: `${depthOfTargetMm.toFixed(1)} mm`,
    depthOfTargetMm,
    isodosePercent: isodoseToDotPercent,
    isodoseToDotPercent,
    doseToDepth: doseToDotCgy,
    doseToDotCgy,
    cumulativeDoseToDepth: cumulativeDoseToDotCgy,
    cumulativeDoseToDotCgy,
    treatmentSetupComments: input.treatmentSetupComments ?? input.notes ?? "",
    isodoseOverrideReason: isManualOverride ? overrideReason : "",
    calculationStatus: isManualOverride ? (canRetainLegacyOverride ? "LEGACY_IMPORTED" : "MANUAL_OVERRIDE") : "AUTO_LOOKUP",
    calculationMeta,
    notes: input.notes ?? input.treatmentSetupComments ?? "Structured worksheet entry from CureRays CRMS.",
    isodoseNote: "",
    revisionApprovalType: input.revisionApprovalType,
    revisionReason: input.revisionReason,
    revisionRequestedAt: input.revisionRequestedAt,
    revisionRequestedByUserId: input.revisionRequestedByUserId,
    voidReason: input.voidReason,
    voidedAt: input.voidedAt,
    voidedByUserId: input.voidedByUserId,
    correctionReason: input.correctionReason,
    correctedAt: input.correctedAt,
    correctedByUserId: input.correctedByUserId
  };

  entry.isodoseNote = buildIsodoseNote(entry, previousEntry, getPhaseCompletedCount(entry.phase, sortedPriorEntries, fractionNumber));
  return entry;
}

export function recalculateFractionWorksheetEntries(entries: FractionLogEntry[]) {
  const recalculatedActiveEntries: FractionLogEntry[] = [];
  const sortedEntries = [...entries].sort((a, b) => a.fractionNumber - b.fractionNumber);

  return sortedEntries
    .reduce<FractionLogEntry[]>((recalculatedEntries, entry) => {
      if (isVoidedFractionEntry(entry)) {
        recalculatedEntries.push({ ...entry, status: "VOIDED" });
        return recalculatedEntries;
      }

      const lowerVoidedEntries = sortedEntries.filter(
        (item) => item.fractionNumber < entry.fractionNumber && isVoidedFractionEntry(item)
      );
      const shouldAdjustImportedBaseline = recalculatedActiveEntries.length === 0 && lowerVoidedEntries.length > 0;
      const dosePerFractionCgy = entry.dosePerFractionCgy ?? entry.dosePerFraction;
      const doseToDotCgy = entry.doseToDotCgy ?? entry.doseToDepth;
      const adjustedInput = shouldAdjustImportedBaseline
        ? {
            ...entry,
            cumulativeDoseCgy: Math.max(
              0,
              (entry.cumulativeDoseCgy ?? entry.cumulativeDose) -
                lowerVoidedEntries.reduce((total, item) => total + (item.dosePerFractionCgy ?? item.dosePerFraction), 0)
            ),
            cumulativeDoseToDotCgy: Math.max(
              0,
              (entry.cumulativeDoseToDotCgy ?? entry.cumulativeDoseToDepth) -
                lowerVoidedEntries.reduce((total, item) => total + (item.doseToDotCgy ?? item.doseToDepth), 0)
            )
          }
        : entry;
      const recalculatedEntry = calculateFractionWorksheetEntry(adjustedInput, recalculatedActiveEntries, { existingId: entry.id });
      if (shouldAdjustImportedBaseline && recalculatedActiveEntries.length === 0) {
        recalculatedEntry.cumulativeDose = Math.max(dosePerFractionCgy, recalculatedEntry.cumulativeDose);
        recalculatedEntry.cumulativeDoseCgy = recalculatedEntry.cumulativeDose;
        recalculatedEntry.cumulativeDoseToDepth = Math.max(doseToDotCgy, recalculatedEntry.cumulativeDoseToDepth);
        recalculatedEntry.cumulativeDoseToDotCgy = recalculatedEntry.cumulativeDoseToDepth;
      }
      recalculatedActiveEntries.push(recalculatedEntry);
      recalculatedEntries.push(recalculatedEntry);
      return recalculatedEntries;
    }, []);
}

export function buildPhaseSummaries(
  course: TreatmentCourse,
  phases: PrescriptionPhase[],
  entries: FractionLogEntry[]
): FractionWorksheetPhaseSummary[] {
  const phaseNames = ["Phase I", "Phase II", "Phase III", "Phase IV"];
  const fallbackPhase = phases[0];

  return phaseNames.map((phaseName, index) => {
    const phase = phases.find((item) => item.phaseName === phaseName) ?? fallbackPhase;
    const plannedFractions =
      phase?.totalFractions ??
      (index === 0 ? course.totalFractions : 0);
    const completedFractions = entries.filter((entry) => entry.phase === phaseName).length;

    return {
      phaseName,
      plannedFractions,
      completedFractions,
      energyKv: phase?.energyKv ?? parseEnergyKv(course.energy),
      ssdCm: phase?.ssdCm ?? 15,
      dosePerFractionCgy: phase ? phase.dosePerFractionGy * 100 : parseNumeric(course.dose) ?? 0,
      fieldSizeCm: normalizeFieldSizeCm(phase?.applicatorSize ?? course.applicator),
      treatmentTimeMinutes: phase?.timeMinutes ?? 0
    };
  });
}

export function buildBillingRows(entries: FractionLogEntry[]): FractionWorksheetBillingRow[] {
  return entries
    .filter((entry) => !isVoidedFractionEntry(entry))
    .map((entry) => ({
      id: `BILL-${entry.id}`,
      fractionNumber: entry.fractionNumber,
      date: entry.date,
      phase: entry.phase,
      activity: "SRT",
      cptCode: "77439",
      reviewer: entry.mdApproval ? "MD approved" : "MD review needed",
      status: entry.mdApproval && entry.dotApproval ? "Ready" : "Needs review"
    }));
}

export function buildIsodoseNote(entry: FractionLogEntry, previousEntry?: FractionLogEntry, phaseCompletedCount = 1) {
  const previousDepth = previousEntry
    ? previousEntry.depthOfTargetMm ?? parseNumeric(previousEntry.depthOfTarget)
    : undefined;
  const simulationDepth = previousEntry
    ? previousEntry.depthOfTargetMm ?? parseNumeric(previousEntry.depthOfTarget)
    : entry.depthOfTargetMm;
  const previousDelta = roundToClinicalTenth((entry.depthOfTargetMm ?? 0) - (previousDepth ?? entry.depthOfTargetMm ?? 0));
  const simulationDelta = roundToClinicalTenth((entry.depthOfTargetMm ?? 0) - (simulationDepth ?? entry.depthOfTargetMm ?? 0));
  const phasePlanned = phaseCompletedCount;

  return [
    `The patient was seen today for treatment number ${entry.fractionNumber} of the planned SRT sessions (${entry.phase}: ${phaseCompletedCount} completed of ${phasePlanned} tracked in CRMS).`,
    `Ultrasound estimated target maximum depth as ${(entry.depthOfTargetMm ?? 0).toFixed(1)} mm with approximately ${previousDelta.toFixed(1)} mm difference from previous imaging and ${simulationDelta.toFixed(1)} mm difference from the time of simulation.`,
    `Isodose overlay estimates ${roundToClinicalTenth(entry.isodoseToDotPercent ?? entry.isodosePercent).toFixed(1)}% dose at DOT; prescription dose ${entry.dosePerFractionCgy ?? entry.dosePerFraction} cGy is reduced to ${entry.doseToDotCgy ?? entry.doseToDepth} cGy at target depth.`,
    `Cumulative surface dose is ${entry.cumulativeDoseCgy ?? entry.cumulativeDose} cGy and cumulative DOT dose is ${entry.cumulativeDoseToDotCgy ?? entry.cumulativeDoseToDepth} cGy. Clinical validation required before production use.`
  ].join(" ");
}

function getPhaseCompletedCount(phase: string, entries: FractionLogEntry[], throughFractionNumber: number) {
  return entries.filter((entry) => entry.phase === phase && entry.fractionNumber < throughFractionNumber).length + 1;
}

function booleanToApprovalState(value: boolean): FractionWorksheetApprovalState {
  return value ? "APPROVED" : "PENDING";
}

function approvalStateToBoolean(value: FractionWorksheetApprovalState | undefined) {
  return value === "APPROVED";
}

function compactBoolean(value: unknown) {
  return value === true || value === "true" || value === "on";
}
