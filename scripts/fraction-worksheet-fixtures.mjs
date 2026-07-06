import { strict as assert } from "node:assert";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const root = process.cwd();
const sourcePath = path.join(root, "lib/services/fraction-worksheet-service.ts");
const source = await readFile(sourcePath, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    esModuleInterop: true,
    skipLibCheck: true
  }
}).outputText;
async function createFixtureTempDir() {
  const roots = [...new Set([process.env.TMPDIR, tmpdir(), "/tmp"].filter(Boolean))];
  let lastError;

  for (const rootPath of roots) {
    try {
      return await mkdtemp(path.join(rootPath, "curerays-fraction-worksheet-"));
    } catch (error) {
      lastError = error;
      if (!["EACCES", "ENOENT", "EPERM", "EROFS"].includes(error?.code)) {
        throw error;
      }
    }
  }

  throw lastError;
}

const tempDir = await createFixtureTempDir();
const modulePath = path.join(tempDir, "fraction-worksheet-service.mjs");
await writeFile(modulePath, compiled, "utf8");

const service = await import(pathToFileURL(modulePath).href);

assert.equal(service.fractionWorksheetReferenceVersion, "IGSRT-FX-REF-2026-06-11-PROTOTYPE");
assert.equal(service.roundToClinicalTenth(12.26), 12.3);
assert.equal(service.roundToClinicalTenth(12.24), 12.2);

const lookup50 = service.lookupIsodoseToDotPercent({
  energyKv: 50,
  fieldSizeCm: "2.0 cm",
  depthOfTargetMm: 1
});
assert.equal(lookup50.percent, 84);
assert.equal(lookup50.roundedDepthMm, 1);

const lookup70 = service.lookupIsodoseToDotPercent({
  energyKv: 70,
  fieldSizeCm: "4.0 cm",
  depthOfTargetMm: 1.5
});
assert.equal(lookup70.percent, 86);

const lookup100 = service.lookupIsodoseToDotPercent({
  energyKv: 100,
  fieldSizeCm: "10 cm",
  depthOfTargetMm: 2
});
assert.equal(lookup100.percent, 93.8);

const lookupMissing = service.lookupIsodoseToDotPercent({
  energyKv: 125,
  fieldSizeCm: "10 cm",
  depthOfTargetMm: 2
});
assert.equal(lookupMissing.percent, null);
assert.ok(lookupMissing.warnings.some((warning) => warning.includes("No normalized worksheet reference table")));

const priorEntry = service.calculateFractionWorksheetEntry(
  {
    id: "FR-FIXTURE-01",
    courseId: "COURSE-FIXTURE",
    fractionNumber: 4,
    date: "2026-04-01",
    phase: "Phase I",
    energyKv: 50,
    fieldSizeCm: "2.0 cm",
    ssdCm: 15,
    dosePerFractionCgy: 250,
    cumulativeDoseCgy: 1000,
    cumulativeDoseToDotCgy: 840,
    depthOfTargetMm: 1,
    technicianInitials: "QA"
  },
  []
);
const nextEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 5,
    date: "2026-04-02",
    phase: "Phase I",
    energyKv: 50,
    fieldSizeCm: "2.0 cm",
    ssdCm: 15,
    dosePerFractionCgy: 250,
    depthOfTargetMm: 1,
    technicianInitials: "QA"
  },
  [priorEntry]
);
assert.equal(nextEntry.doseToDotCgy, 210);
assert.equal(nextEntry.cumulativeDoseCgy, 1250);
assert.equal(nextEntry.cumulativeDoseToDotCgy, 1050);
assert.equal(nextEntry.calculationStatus, "AUTO_LOOKUP");
assert.equal(nextEntry.calculationMeta.referenceVersion, service.fractionWorksheetReferenceVersion);
assert.equal(nextEntry.calculationMeta.clinicalValidationRequired, true);

const overrideEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 1,
    date: "2026-04-03",
    phase: "Phase I",
    energyKv: 50,
    fieldSizeCm: "10 cm",
    ssdCm: 15,
    dosePerFractionCgy: 250,
    depthOfTargetMm: 1,
    isodoseToDotPercent: 80,
    isodoseOverrideReason: "Fixture override for missing normalized 50 kV / 10 cm curve.",
    technicianInitials: "QA"
  },
  []
);
assert.equal(overrideEntry.calculationStatus, "MANUAL_OVERRIDE");
assert.equal(overrideEntry.doseToDotCgy, 200);
assert.equal(overrideEntry.calculationMeta.referenceVersion, service.fractionWorksheetReferenceVersion);

assert.throws(
  () =>
    service.calculateFractionWorksheetEntry(
      {
        courseId: "COURSE-FIXTURE",
        fractionNumber: 1,
        date: "2026-04-03",
        phase: "Phase I",
        energyKv: 50,
        fieldSizeCm: "2.0 cm",
        ssdCm: 15,
        dosePerFractionCgy: 250,
        depthOfTargetMm: 1,
        isodoseToDotPercent: 150,
        isodoseOverrideReason: "Fixture invalid override.",
        technicianInitials: "QA"
      },
      []
    ),
  /greater than 0 and no more than 100/
);

assert.throws(
  () =>
    service.calculateFractionWorksheetEntry(
      {
        courseId: "COURSE-FIXTURE",
        fractionNumber: 1,
        date: "2026-04-03",
        phase: "Phase I",
        energyKv: 50,
        fieldSizeCm: "2.0 cm",
        ssdCm: 15,
        dosePerFractionCgy: 250,
        depthOfTargetMm: 1,
        isodoseToDotPercent: 80,
        technicianInitials: "QA"
      },
      []
    ),
  /override requires an override reason/
);

const voidableEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 1,
    date: "2026-04-05",
    phase: "Phase I",
    energyKv: 50,
    fieldSizeCm: "2.0 cm",
    ssdCm: 15,
    dosePerFractionCgy: 250,
    depthOfTargetMm: 1,
    technicianInitials: "QA"
  },
  []
);
const dependentEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 2,
    date: "2026-04-06",
    phase: "Phase I",
    energyKv: 50,
    fieldSizeCm: "2.0 cm",
    ssdCm: 15,
    dosePerFractionCgy: 250,
    depthOfTargetMm: 1,
    technicianInitials: "QA"
  },
  [voidableEntry]
);
assert.equal(dependentEntry.cumulativeDoseCgy, 500);

const recalculatedAfterVoid = service.recalculateFractionWorksheetEntries([
  { ...voidableEntry, status: "VOIDED", voidReason: "Fixture void", voidedAt: "2026-04-06T10:00:00Z" },
  dependentEntry
]);
assert.equal(recalculatedAfterVoid[0].status, "VOIDED");
assert.equal(recalculatedAfterVoid[1].cumulativeDoseCgy, 250);
assert.equal(recalculatedAfterVoid[1].cumulativeDoseToDotCgy, 210);

const correctedFirstWithDelta = service.calculateFractionWorksheetEntry(
  { ...voidableEntry, dosePerFractionCgy: 300, dosePerFraction: 300 },
  [],
  {
    existingId: voidableEntry.id,
    firstEntryCumulativeDelta: {
      previousDoseCgy: voidableEntry.dosePerFractionCgy,
      previousDoseToDotCgy: voidableEntry.doseToDotCgy
    }
  }
);
assert.equal(correctedFirstWithDelta.cumulativeDoseCgy, 300);
assert.equal(correctedFirstWithDelta.cumulativeDoseToDotCgy, 252);

const correctedDoseEntries = service.recalculateFractionWorksheetEntries([
  correctedFirstWithDelta,
  dependentEntry
]);
assert.equal(correctedDoseEntries[0].cumulativeDoseCgy, 300);
assert.equal(correctedDoseEntries[1].cumulativeDoseCgy, 550);
assert.equal(correctedDoseEntries[1].cumulativeDoseToDotCgy, 462);

assert.throws(() =>
  service.calculateFractionWorksheetEntry(
    {
      courseId: "COURSE-FIXTURE",
      fractionNumber: 1,
      date: "2026-04-04",
      phase: "Phase I",
      energyKv: 50,
      fieldSizeCm: "10 cm",
      ssdCm: 15,
      dosePerFractionCgy: 250,
      depthOfTargetMm: 1,
      technicianInitials: "QA"
    },
    []
  )
);

const phaseSummaries = service.buildPhaseSummaries(
  {
    id: "COURSE-FIXTURE",
    patientId: "PATIENT-FIXTURE",
    diagnosis: "Fixture",
    diagnosisCategory: "SKIN_CANCER",
    protocolName: "Fixture IGSRT",
    totalFractions: 20,
    currentFraction: 5,
    startDate: "2026-04-01",
    endDate: null,
    chartRoundsPhase: "ON_TREATMENT",
    status: "ACTIVE",
    treatmentModality: "IGSRT",
    treatmentType: "SRT",
    notes: ""
  },
  [
    {
      id: "RX-FIXTURE-P1",
      phaseName: "Phase I",
      energyKv: 50,
      phaseTotalDoseGy: 50,
      dosePerFractionGy: 2.5,
      totalFractions: 20,
      timeMinutes: 4,
      ssdCm: 15,
      applicatorSize: "2.0 cm",
      marginMm: 5,
      technique: "SRT",
      shieldingDesign: "Fixture",
      depthOfTargetMm: 1
    }
  ],
  [priorEntry, nextEntry]
);
assert.equal(phaseSummaries[0].completedFractions, 2);
assert.equal(phaseSummaries[0].plannedFractions, 20);

// Fraction Calculation Contract golden cases.
// Sample from the clinic Apps Script notes: Phase V, 100 kV, SSD 23, Time 23,
// Dose 4 (Gy = 400 cGy), skin dose 300 cGy, DOT depth 3.0 mm.
// The formulas are asserted; the isodose value (85%) comes from the repo's
// existing 100 kV / 3.0 cm reference curve at 3.0 mm, not fabricated here.
const skinDoseEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 1,
    date: "2026-04-10",
    phase: "Phase V",
    energyKv: 100,
    fieldSizeCm: "3.0 cm",
    ssdCm: 23,
    treatmentTimeMinutes: 23,
    dosePerFractionCgy: 400,
    skinSurfaceDoseCgy: 300,
    depthOfTargetMm: 3,
    technicianInitials: "QA"
  },
  []
);
assert.equal(skinDoseEntry.isodoseToDotPercent, 85);
// Dose to DOT uses skin-surface dose (300), not dose per fraction (400).
assert.equal(skinDoseEntry.doseToDotCgy, 255);
assert.equal(skinDoseEntry.cumulativeDoseCgy, 400);
assert.equal(skinDoseEntry.cumulativeSkinSurfaceDoseCgy, 300);
assert.equal(skinDoseEntry.cumulativeDoseToDotCgy, 255);

// Second fraction: cumulative skin-surface dose and cumulative DOT dose are running sums.
const skinDoseEntryTwo = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 2,
    date: "2026-04-11",
    phase: "Phase V",
    energyKv: 100,
    fieldSizeCm: "3.0 cm",
    ssdCm: 23,
    treatmentTimeMinutes: 23,
    dosePerFractionCgy: 400,
    skinSurfaceDoseCgy: 300,
    depthOfTargetMm: 3,
    technicianInitials: "QA"
  },
  [skinDoseEntry]
);
assert.equal(skinDoseEntryTwo.cumulativeDoseCgy, 800);
assert.equal(skinDoseEntryTwo.cumulativeSkinSurfaceDoseCgy, 600);
assert.equal(skinDoseEntryTwo.cumulativeDoseToDotCgy, 510);

// Fallback: with no skin-surface dose, Dose to DOT falls back to dose per fraction.
const noSkinDoseEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 1,
    date: "2026-04-12",
    phase: "Phase I",
    energyKv: 100,
    fieldSizeCm: "3.0 cm",
    ssdCm: 15,
    treatmentTimeMinutes: 4,
    dosePerFractionCgy: 400,
    depthOfTargetMm: 3,
    technicianInitials: "QA"
  },
  []
);
assert.equal(noSkinDoseEntry.doseToDotCgy, 340);
assert.equal(noSkinDoseEntry.cumulativeSkinSurfaceDoseCgy, undefined);

// detectPrescriptionMismatchFields compares row values against the phase prescription
// (dose fields converted Gy -> cGy).
const referencePhase = {
  energyKv: 100,
  ssdCm: 23,
  timeMinutes: 23,
  dosePerFractionGy: 4,
  skinSurfaceDoseCgy: 300
};
assert.deepEqual(service.detectPrescriptionMismatchFields(skinDoseEntry, referencePhase), []);
const mismatchFields = service.detectPrescriptionMismatchFields(
  { energyKv: 70, ssdCm: 20, treatmentTimeMinutes: 23, dosePerFractionCgy: 400, skinSurfaceDoseCgy: 350 },
  referencePhase
);
assert.deepEqual(mismatchFields, ["Energy", "SSD", "Skin-surface dose"]);

// A mismatched entry cannot reach Approved (even with both approvals) until an
// override reason is supplied.
const mismatchEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 1,
    date: "2026-04-13",
    phase: "Phase V",
    energyKv: 70,
    fieldSizeCm: "3.0 cm",
    ssdCm: 23,
    treatmentTimeMinutes: 23,
    dosePerFractionCgy: 400,
    skinSurfaceDoseCgy: 300,
    depthOfTargetMm: 3,
    mdApprovalState: "APPROVED",
    dotApprovalState: "APPROVED",
    technicianInitials: "QA"
  },
  [],
  { prescriptionPhase: referencePhase }
);
assert.deepEqual(mismatchEntry.prescriptionMismatchFields, ["Energy"]);
assert.equal(mismatchEntry.status, "NEEDS_REVIEW");
assert.equal(mismatchEntry.mdApproval, true);
assert.equal(mismatchEntry.dotApproval, true);

const overriddenMismatchEntry = service.calculateFractionWorksheetEntry(
  {
    courseId: "COURSE-FIXTURE",
    fractionNumber: 1,
    date: "2026-04-13",
    phase: "Phase V",
    energyKv: 70,
    fieldSizeCm: "3.0 cm",
    ssdCm: 23,
    treatmentTimeMinutes: 23,
    dosePerFractionCgy: 400,
    skinSurfaceDoseCgy: 300,
    depthOfTargetMm: 3,
    prescriptionOverrideReason: "Physicist approved 70 kV substitution for this session.",
    mdApprovalState: "APPROVED",
    dotApprovalState: "APPROVED",
    technicianInitials: "QA"
  },
  [],
  { prescriptionPhase: referencePhase }
);
assert.equal(overriddenMismatchEntry.status, "APPROVED");

// Mismatch flags survive full-course recalculation (which runs without prescription phases).
const recalculatedMismatch = service.recalculateFractionWorksheetEntries([mismatchEntry]);
assert.deepEqual(recalculatedMismatch[0].prescriptionMismatchFields, ["Energy"]);
assert.equal(recalculatedMismatch[0].status, "NEEDS_REVIEW");

// Correction recalculates downstream cumulative skin-surface dose.
const correctedSkinDose = service.recalculateFractionWorksheetEntries([
  { ...skinDoseEntry, skinSurfaceDoseCgy: 200 },
  skinDoseEntryTwo
]);
assert.equal(correctedSkinDose[0].cumulativeSkinSurfaceDoseCgy, 200);
assert.equal(correctedSkinDose[1].cumulativeSkinSurfaceDoseCgy, 500);

console.log("Fraction worksheet fixtures passed.");
