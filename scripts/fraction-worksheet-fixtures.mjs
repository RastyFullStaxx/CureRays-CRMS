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
const tempDir = await mkdtemp(path.join(tmpdir(), "curerays-fraction-worksheet-"));
const modulePath = path.join(tempDir, "fraction-worksheet-service.mjs");
await writeFile(modulePath, compiled, "utf8");

const service = await import(pathToFileURL(modulePath).href);

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

console.log("Fraction worksheet fixtures passed.");
