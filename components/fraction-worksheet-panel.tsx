"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  RefreshCw,
  Save,
  ShieldCheck,
  Undo2,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import type {
  FractionApprovalType,
  FractionLogEntry,
  FractionLogStatus,
  IgsrtWorkspace,
  PrescriptionPhase,
  TreatmentCourse,
  TreatmentFraction
} from "@/lib/types";
import {
  buildBillingRows,
  buildPhaseSummaries,
  calculateFractionWorksheetEntry,
  fractionWorksheetReferenceCurves,
  isVoidedFractionEntry,
  normalizeFieldSizeCm,
  parseEnergyKv,
  parseNumeric
} from "@/lib/services/fraction-worksheet-service";
import { cn, formatDate } from "@/lib/workflow";

type ApiResult = {
  data?: IgsrtWorkspace;
  workspace?: IgsrtWorkspace;
  message?: string;
};

type DraftFraction = {
  fractionNumber: string;
  date: string;
  phase: string;
  energyKv: string;
  fieldSizeCm: string;
  dosePerFractionCgy: string;
  depthOfTargetMm: string;
  ssdCm: string;
  treatmentTimeMinutes: string;
  technicianInitials: string;
  treatmentSetupComments: string;
  notes: string;
  isodoseToDotPercent: string;
  isodoseOverrideReason: string;
};

type AdvancedPanel = "note" | "reference" | "billing";

type ReasonRequest =
  | { type: "revision"; entryId: string; approvalType: FractionApprovalType }
  | { type: "void"; entryId: string };

const labelClass = "clinical-label";
const fieldSizeOptions = ["1.5 cm", "2.0 cm", "2.5 cm", "3.0 cm", "4.0 cm", "5.0 cm", "10 cm", "8x18 cm"];
const energyOptions = [50, 70, 100];
const referenceDepths = [0.5, 1, 1.5, 2, 3, 4];

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function requiredNumber(value: string, fallback = 0) {
  return optionalNumber(value) ?? fallback;
}

function formatDose(value: number | undefined) {
  return value === undefined ? "-" : `${value.toLocaleString()} cGy`;
}

function formatPercent(value: number | undefined) {
  return value === undefined ? "-" : `${value.toFixed(1).replace(/\.0$/, "")}%`;
}

function statusVariant(status: FractionLogStatus | undefined): "default" | "success" | "warning" | "error" | "info" | "primary" {
  if (status === "APPROVED") {
    return "success";
  }
  if (status === "REVISION_NEEDED") {
    return "warning";
  }
  if (status === "VOIDED") {
    return "error";
  }
  if (status === "NEEDS_REVIEW") {
    return "primary";
  }
  return "default";
}

function statusLabel(status: FractionLogStatus | undefined) {
  return (status ?? "RECORDED").replaceAll("_", " ");
}

function approvalBadge(label: "MD" | "DOT", approved: boolean, state?: string) {
  const revisionNeeded = state === "REVISION_NEEDED";
  return (
    <Badge variant={approved ? "success" : revisionNeeded ? "warning" : "default"}>
      {label} {approved ? "approved" : revisionNeeded ? "revision" : "pending"}
    </Badge>
  );
}

function phaseDefaults(phase: ReturnType<typeof buildPhaseSummaries>[number] | undefined, course: TreatmentCourse) {
  return {
    phaseName: phase?.phaseName ?? "Phase I",
    energyKv: phase?.energyKv ?? parseEnergyKv(course.energy),
    ssdCm: phase?.ssdCm ?? 15,
    dosePerFractionCgy: phase?.dosePerFractionCgy ?? parseNumeric(course.dose) ?? 250,
    fieldSizeCm: phase?.fieldSizeCm ?? normalizeFieldSizeCm(course.applicator),
    treatmentTimeMinutes: phase?.treatmentTimeMinutes ?? 0,
    depthOfTargetMm: parseNumeric(course.targetDepth) ?? 1
  };
}

function activeEntries(entries: FractionLogEntry[]) {
  return entries.filter((entry) => !isVoidedFractionEntry(entry));
}

function nextFractionNumber(entries: FractionLogEntry[]) {
  const active = activeEntries(entries);
  return active.length > 0 ? Math.max(...active.map((entry) => entry.fractionNumber)) + 1 : 1;
}

function nextOpenPhase(
  course: TreatmentCourse,
  phases: PrescriptionPhase[],
  entries: FractionLogEntry[]
) {
  const summaries = buildPhaseSummaries(course, phases, activeEntries(entries));
  return summaries.find((phase) => phase.completedFractions < phase.plannedFractions) ?? summaries[0];
}

function nextScheduledFraction(scheduledFractions: TreatmentFraction[], entries: FractionLogEntry[]) {
  const recordedNumbers = new Set(activeEntries(entries).map((entry) => entry.fractionNumber));
  return scheduledFractions
    .filter((fraction) => !recordedNumbers.has(fraction.fractionNumber))
    .sort((a, b) => a.fractionNumber - b.fractionNumber)[0];
}

function buildInitialDraft(
  course: TreatmentCourse,
  phases: PrescriptionPhase[],
  entries: FractionLogEntry[],
  scheduledFractions: TreatmentFraction[] = []
): DraftFraction {
  const scheduled = nextScheduledFraction(scheduledFractions, entries);
  const defaults = phaseDefaults(
    scheduled ? buildPhaseSummaries(course, phases, entries).find((phase) => phase.phaseName === scheduled.phase) : nextOpenPhase(course, phases, entries),
    course
  );

  return {
    fractionNumber: String(scheduled?.fractionNumber ?? nextFractionNumber(entries)),
    date: scheduled?.treatmentDate ?? todayIsoDate(),
    phase: scheduled?.phase ?? defaults.phaseName,
    energyKv: String(scheduled ? parseEnergyKv(scheduled.energy) : defaults.energyKv),
    fieldSizeCm: scheduled?.applicator ? normalizeFieldSizeCm(scheduled.applicator) : defaults.fieldSizeCm,
    dosePerFractionCgy: String(scheduled?.plannedDose ?? defaults.dosePerFractionCgy),
    depthOfTargetMm: String(defaults.depthOfTargetMm),
    ssdCm: String(defaults.ssdCm),
    treatmentTimeMinutes: String(defaults.treatmentTimeMinutes),
    technicianInitials: "NR",
    treatmentSetupComments: "",
    notes: "Structured fraction entry from CureRays CRMS.",
    isodoseToDotPercent: "",
    isodoseOverrideReason: ""
  };
}

function draftToFractionInput(courseId: string, draft: DraftFraction) {
  return {
    courseId,
    fractionNumber: requiredNumber(draft.fractionNumber, 1),
    date: draft.date,
    phase: draft.phase,
    energyKv: requiredNumber(draft.energyKv, 50),
    fieldSizeCm: draft.fieldSizeCm,
    dosePerFractionCgy: requiredNumber(draft.dosePerFractionCgy, 0),
    depthOfTargetMm: requiredNumber(draft.depthOfTargetMm, 0),
    ssdCm: requiredNumber(draft.ssdCm, 15),
    treatmentTimeMinutes: requiredNumber(draft.treatmentTimeMinutes, 0),
    technicianInitials: draft.technicianInitials.trim() || "NR",
    treatmentSetupComments: draft.treatmentSetupComments.trim(),
    notes: draft.notes.trim() || "Structured fraction entry from CureRays CRMS.",
    isodoseToDotPercent: optionalNumber(draft.isodoseToDotPercent),
    isodoseOverrideReason: draft.isodoseOverrideReason.trim(),
    mdApprovalState: "PENDING" as const,
    dotApprovalState: "PENDING" as const
  };
}

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function formNumber(formData: FormData, key: string) {
  const value = formValue(formData, key);
  return value ? Number(value) : undefined;
}

function compactWarnings(entry: FractionLogEntry | undefined) {
  return entry?.calculationMeta?.warnings ?? [];
}

function requiredFractionFieldsMissing(draft: DraftFraction) {
  return [
    ["Fx", draft.fractionNumber],
    ["Date", draft.date],
    ["Phase", draft.phase],
    ["Energy", draft.energyKv],
    ["Field", draft.fieldSizeCm],
    ["Dose", draft.dosePerFractionCgy],
    ["DOT", draft.depthOfTargetMm],
    ["SSD", draft.ssdCm],
    ["Tech", draft.technicianInitials]
  ].filter(([, value]) => !String(value).trim()).map(([label]) => label);
}

export function FractionWorksheetPanel({
  initialEntries,
  course,
  phases,
  scheduledFractions = [],
  title = "Fractionation Worksheet"
}: {
  initialEntries: FractionLogEntry[];
  course: TreatmentCourse;
  phases: PrescriptionPhase[];
  scheduledFractions?: TreatmentFraction[];
  title?: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [schedule, setSchedule] = useState(scheduledFractions);
  const [draft, setDraft] = useState(() => buildInitialDraft(course, phases, initialEntries, scheduledFractions));
  const [showEntryFlow, setShowEntryFlow] = useState(false);
  const [advancedPanel, setAdvancedPanel] = useState<AdvancedPanel | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState(initialEntries[0]?.id ?? "");
  const [correctionEntryId, setCorrectionEntryId] = useState<string | null>(null);
  const [reasonRequest, setReasonRequest] = useState<ReasonRequest | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => a.fractionNumber - b.fractionNumber), [entries]);
  const sortedActiveEntries = useMemo(() => activeEntries(sortedEntries), [sortedEntries]);
  const phaseSummaries = useMemo(() => buildPhaseSummaries(course, phases, sortedActiveEntries), [course, phases, sortedActiveEntries]);
  const scheduleByFraction = useMemo(
    () => new Map(schedule.map((fraction) => [fraction.fractionNumber, fraction])),
    [schedule]
  );
  const selectedEntry = sortedEntries.find((entry) => entry.id === selectedEntryId) ?? sortedEntries[0];
  const correctionEntry = sortedEntries.find((entry) => entry.id === correctionEntryId);
  const billingRows = useMemo(() => buildBillingRows(sortedEntries), [sortedEntries]);
  const approvedCount = sortedActiveEntries.filter((entry) => entry.status === "APPROVED").length;
  const reviewQueue = sortedActiveEntries.filter((entry) => {
    const hasWarnings = compactWarnings(entry).length > 0;
    const scheduled = scheduleByFraction.get(entry.fractionNumber);
    return (
      entry.status !== "APPROVED" ||
      hasWarnings ||
      scheduled?.imageGuidanceStatus === "MISSING" ||
      entry.calculationStatus === "MANUAL_OVERRIDE" ||
      entry.calculationStatus === "LEGACY_IMPORTED"
    );
  });

  const preview = useMemo(() => {
    try {
      const entry = calculateFractionWorksheetEntry(
        draftToFractionInput(course.id, draft),
        sortedActiveEntries,
        { calculatedAt: new Date().toISOString() }
      );
      return { entry, error: null };
    } catch (caughtError) {
      return {
        entry: null,
        error: caughtError instanceof Error ? caughtError.message : "Fraction calculation failed"
      };
    }
  }, [course.id, draft, sortedActiveEntries]);

  async function requestJson(action: string, data: Record<string, unknown>, successMessage: string) {
    setPendingAction(`${action}-${String(data.id ?? "new")}`);
    setError(null);
    setMessage(null);

    const requestRole =
      action === "approveFraction" || action === "requestFractionRevision"
        ? data.approvalType === "DOT"
          ? "RTT"
          : "RAD_ONC"
        : "RAD_ONC";

    try {
      const response = await fetch("/api/igsrt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-curerays-role": requestRole
        },
        body: JSON.stringify({ action, data })
      });
      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        throw new Error(result.message ?? "Fraction workflow update failed");
      }

      const workspace = result.workspace ?? result.data;
      if (workspace?.courseFractions) {
        setEntries(workspace.courseFractions);
        setSelectedEntryId(data.id ? String(data.id) : workspace.courseFractions.at(-1)?.id ?? selectedEntryId);
      }
      if (workspace?.treatmentFractions) {
        setSchedule(workspace.treatmentFractions);
      }
      setMessage(successMessage);
      return workspace ?? null;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Fraction workflow update failed");
      return null;
    } finally {
      setPendingAction(null);
    }
  }

  function updateDraft<K extends keyof DraftFraction>(key: K, value: DraftFraction[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyPhaseDefaults(phaseName: string) {
    const phase = phaseSummaries.find((item) => item.phaseName === phaseName);
    const defaults = phaseDefaults(phase, course);
    setDraft((current) => ({
      ...current,
      phase: phaseName,
      energyKv: String(defaults.energyKv),
      fieldSizeCm: defaults.fieldSizeCm,
      dosePerFractionCgy: String(defaults.dosePerFractionCgy),
      ssdCm: String(defaults.ssdCm),
      treatmentTimeMinutes: String(defaults.treatmentTimeMinutes)
    }));
  }

  async function addFraction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const workspace = await requestJson(
      "addFraction",
      draftToFractionInput(course.id, draft),
      "Fraction recorded. DOT and MD review queue updated."
    );

    if (workspace?.courseFractions) {
      setDraft(buildInitialDraft(course, phases, workspace.courseFractions, workspace.treatmentFractions ?? schedule));
      setShowEntryFlow(false);
    }
  }

  function correctionFormToInput(formData: FormData) {
    return {
      courseId: course.id,
      id: formValue(formData, "id"),
      fractionNumber: formNumber(formData, "fractionNumber"),
      date: formValue(formData, "date"),
      phase: formValue(formData, "phase"),
      energyKv: formNumber(formData, "energyKv"),
      fieldSizeCm: formValue(formData, "fieldSizeCm"),
      dosePerFractionCgy: formNumber(formData, "dosePerFractionCgy"),
      depthOfTargetMm: formNumber(formData, "depthOfTargetMm"),
      ssdCm: formNumber(formData, "ssdCm"),
      treatmentTimeMinutes: formNumber(formData, "treatmentTimeMinutes"),
      technicianInitials: formValue(formData, "technicianInitials"),
      treatmentSetupComments: formValue(formData, "treatmentSetupComments"),
      notes: formValue(formData, "notes"),
      isodoseToDotPercent: formNumber(formData, "isodoseToDotPercent"),
      isodoseOverrideReason: formValue(formData, "isodoseOverrideReason"),
      correctionReason: formValue(formData, "correctionReason")
    };
  }

  async function updateCorrection(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const workspace = await requestJson(
      "updateFraction",
      correctionFormToInput(new FormData(event.currentTarget)),
      "Fraction corrected. Approvals were reset for review."
    );

    if (workspace) {
      setCorrectionEntryId(null);
    }
  }

  async function approveFraction(entry: FractionLogEntry, approvalType: FractionApprovalType) {
    await requestJson(
      "approveFraction",
      { courseId: course.id, id: entry.id, approvalType },
      `${approvalType} approval recorded for Fx ${entry.fractionNumber}.`
    );
  }

  async function linkFractionImage(entry: FractionLogEntry) {
    await requestJson(
      "linkFractionImage",
      {
        courseId: course.id,
        fractionNumber: entry.fractionNumber,
        assetId: `PROTO-IMG-${entry.id}`
      },
      `Image evidence linked for Fx ${entry.fractionNumber}.`
    );
  }

  async function submitReason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reasonRequest) {
      return;
    }

    const entry = sortedEntries.find((item) => item.id === reasonRequest.entryId);
    const label = entry ? `Fx ${entry.fractionNumber}` : "fraction";
    const workspace = reasonRequest.type === "void"
      ? await requestJson(
          "voidFraction",
          { courseId: course.id, id: reasonRequest.entryId, reason: reasonText },
          `${label} voided and retained for audit.`
        )
      : await requestJson(
          "requestFractionRevision",
          {
            courseId: course.id,
            id: reasonRequest.entryId,
            approvalType: reasonRequest.approvalType,
            reason: reasonText
          },
          `${reasonRequest.approvalType} revision requested for ${label}.`
        );

    if (workspace) {
      setReasonRequest(null);
      setReasonText("");
    }
  }

  const missingFractionFields = requiredFractionFieldsMissing(draft);

  return (
    <div className="grid gap-4">
      {message ? (
        <div className="clinical-alert-success p-3 text-sm font-semibold">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="clinical-alert-error p-3 text-sm font-semibold" role="alert">
          {error}
        </div>
      ) : null}

      {showEntryFlow ? (
        <Modal
          open={showEntryFlow}
          onClose={() => setShowEntryFlow(false)}
          title="Record Next Fraction"
          width="var(--width-clinical-modal-xl)"
          height="var(--height-clinical-modal-xl)"
          contentClassName="flex flex-col"
        >
          <form className="clinical-modal-frame flex-1" onSubmit={addFraction}>
            <div className="border-b border-[var(--color-border-soft)] pb-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className={labelClass}>Record Next Fraction</p>
                  <h3 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
                    Fx {draft.fractionNumber || nextFractionNumber(entries)}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Confirm the course, enter treatment values, and review the live calculation before recording.
                  </p>
                </div>
                <Badge variant={preview.error ? "warning" : "success"}>
                  {preview.error ? "Needs Attention" : "Ready"}
                </Badge>
              </div>
            </div>

            <div className="clinical-modal-body grid content-start gap-4 py-4">
              {missingFractionFields.length ? (
                <div className="clinical-muted-surface p-3 text-sm font-semibold text-[var(--color-text-muted)]">
                  Complete {missingFractionFields.join(", ")} before recording.
                </div>
              ) : null}

              <div className="clinical-fraction-entry-grid">
                <section className="grid content-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                  <div>
                    <p className={labelClass}>Step 1</p>
                    <h4 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Confirm</h4>
                  </div>
                  <label className="grid gap-1">
                    <span className={labelClass}>Fx</span>
                    <Input
                      type="number"
                      min="1"
                      value={draft.fractionNumber}
                      onChange={(event) => updateDraft("fractionNumber", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className={labelClass}>Date</span>
                    <Input
                      type="date"
                      value={draft.date}
                      onChange={(event) => updateDraft("date", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className={labelClass}>Phase</span>
                    <Select value={draft.phase} onChange={(event) => applyPhaseDefaults(event.target.value)}>
                      {phaseSummaries.map((phase) => (
                        <option key={phase.phaseName} value={phase.phaseName}>
                          {phase.phaseName}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <div className="grid gap-2">
                    <PreviewMetric label="Course" value={course.id.replace("COURSE-", "C")} />
                    <PreviewMetric label="Protocol" value={course.protocolName} />
                    <PreviewMetric label="Logged" value={`${sortedActiveEntries.length}/${course.totalFractions}`} />
                  </div>
                </section>

                <section className="grid content-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                  <div>
                    <p className={labelClass}>Step 2</p>
                    <h4 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Treatment Values</h4>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className={labelClass}>Energy</span>
                      <Select value={draft.energyKv} onChange={(event) => updateDraft("energyKv", event.target.value)}>
                        {energyOptions.map((energy) => (
                          <option key={energy} value={energy}>
                            {energy} kV
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Field</span>
                      <Select value={draft.fieldSizeCm} onChange={(event) => updateDraft("fieldSizeCm", event.target.value)}>
                        {fieldSizeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Dose</span>
                      <Input
                        type="number"
                        min="0"
                        value={draft.dosePerFractionCgy}
                        onChange={(event) => updateDraft("dosePerFractionCgy", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>DOT</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={draft.depthOfTargetMm}
                        onChange={(event) => updateDraft("depthOfTargetMm", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>SSD</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={draft.ssdCm}
                        onChange={(event) => updateDraft("ssdCm", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Tech</span>
                      <Input value={draft.technicianInitials} onChange={(event) => updateDraft("technicianInitials", event.target.value)} />
                    </label>
                    <label className="grid gap-1 sm:col-span-2">
                      <span className={labelClass}>Time</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={draft.treatmentTimeMinutes}
                        onChange={(event) => updateDraft("treatmentTimeMinutes", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1 sm:col-span-2">
                      <span className={labelClass}>Setup Comments</span>
                      <Textarea
                        rows={3}
                        value={draft.treatmentSetupComments}
                        onChange={(event) => updateDraft("treatmentSetupComments", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1 sm:col-span-2">
                      <span className={labelClass}>Notes</span>
                      <Textarea rows={3} value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} />
                    </label>
                  </div>
                </section>

                <section className="grid content-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={labelClass}>Step 3</p>
                      <h4 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Calculation Review</h4>
                    </div>
                    <Badge variant={preview.entry?.calculationStatus === "AUTO_LOOKUP" ? "success" : "warning"}>
                      {(preview.entry?.calculationStatus ?? "pending").replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={labelClass}>Live Calculation</p>
                  </div>

                  {preview.error ? (
                    <div className="clinical-alert-error mt-3 p-3 text-sm font-semibold">
                      {preview.error}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <PreviewMetric label="DOT Dose" value={formatDose(preview.entry?.doseToDotCgy ?? preview.entry?.doseToDepth)} />
                      <PreviewMetric label="Cumulative" value={formatDose(preview.entry?.cumulativeDoseCgy ?? preview.entry?.cumulativeDose)} />
                      <PreviewMetric label="Cumulative DOT" value={formatDose(preview.entry?.cumulativeDoseToDotCgy ?? preview.entry?.cumulativeDoseToDepth)} />
                      <PreviewMetric label="Isodose" value={formatPercent(preview.entry?.isodoseToDotPercent ?? preview.entry?.isodosePercent)} />
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className={labelClass}>Override %</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={draft.isodoseToDotPercent}
                        onChange={(event) => updateDraft("isodoseToDotPercent", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1 sm:col-span-2">
                      <span className={labelClass}>Override Reason</span>
                      <Textarea
                        rows={3}
                        value={draft.isodoseOverrideReason}
                        onChange={(event) => updateDraft("isodoseOverrideReason", event.target.value)}
                      />
                    </label>
                  </div>

                  {compactWarnings(preview.entry ?? undefined).length ? (
                    <div className="grid gap-2">
                      {compactWarnings(preview.entry ?? undefined).map((warning) => (
                        <div key={warning} className="flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3 text-sm font-semibold text-[var(--color-text-muted)]">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
                          <span>{warning}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            </div>

            <div className="clinical-modal-footer">
              <Button
                type="button"
                variant="ghost"
                className="clinical-action"
                onClick={() => setShowEntryFlow(false)}
              >
                Cancel
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="clinical-action-lg" disabled={missingFractionFields.length > 0 || Boolean(preview.error) || pendingAction === "addFraction-new"}>
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {pendingAction === "addFraction-new" ? "Recording" : "Record Fraction"}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}

      {reasonRequest ? (
        <Modal
          open={Boolean(reasonRequest)}
          onClose={() => {
            setReasonRequest(null);
            setReasonText("");
          }}
          title={reasonRequest.type === "void" ? "Void Fraction" : "Request Revision"}
          width={560}
        >
          <form className="grid gap-4" onSubmit={submitReason}>
            <label className="grid gap-1">
              <span className={labelClass}>{reasonRequest.type === "void" ? "Void Reason" : `${reasonRequest.approvalType} Revision Reason`}</span>
              <Textarea
                rows={3}
                value={reasonText}
                onChange={(event) => setReasonText(event.target.value)}
                placeholder={reasonRequest.type === "void" ? "Why this row should be voided" : "What needs correction before approval"}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-border-soft)] pt-3">
              <Button type="button" variant="ghost" className="clinical-action" onClick={() => {
                setReasonRequest(null);
                setReasonText("");
              }}>
                Cancel
              </Button>
              <Button type="submit" className="clinical-action-lg" variant={reasonRequest.type === "void" ? "danger" : "primary"} disabled={!reasonText.trim()}>
                {reasonRequest.type === "void" ? <XCircle className="h-4 w-4" aria-hidden="true" /> : <Undo2 className="h-4 w-4" aria-hidden="true" />}
                Confirm
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {correctionEntry ? (
        <Modal open={Boolean(correctionEntry)} onClose={() => setCorrectionEntryId(null)} title="Correct Fraction" width="var(--width-clinical-modal-lg)" height="var(--height-clinical-modal)" contentClassName="flex flex-col">
          <form className="clinical-modal-frame flex-1" onSubmit={updateCorrection}>
            <input type="hidden" name="id" value={correctionEntry.id} />
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-soft)] pb-3">
              <div>
                <p className={labelClass}>Correct Fraction</p>
                <h3 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">Fx {correctionEntry.fractionNumber}</h3>
              </div>
              <Badge variant="warning">Approvals reset after correction</Badge>
            </div>
            <div className="clinical-modal-body grid content-start gap-4 py-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <CorrectionInput label="Fx" name="fractionNumber" type="number" defaultValue={correctionEntry.fractionNumber} />
                <CorrectionInput label="Date" name="date" type="date" defaultValue={correctionEntry.date} />
                <label className="grid gap-1">
                  <span className={labelClass}>Phase</span>
                  <Select name="phase" defaultValue={correctionEntry.phase}>
                    {phaseSummaries.map((phase) => (
                      <option key={phase.phaseName} value={phase.phaseName}>
                        {phase.phaseName}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Energy</span>
                  <Select name="energyKv" defaultValue={correctionEntry.energyKv ?? parseEnergyKv(correctionEntry.energy)}>
                    {energyOptions.map((energy) => (
                      <option key={energy} value={energy}>
                        {energy} kV
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Field</span>
                  <Select name="fieldSizeCm" defaultValue={normalizeFieldSizeCm(correctionEntry.fieldSizeCm)}>
                    {fieldSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
                <CorrectionInput label="Dose" name="dosePerFractionCgy" type="number" defaultValue={correctionEntry.dosePerFractionCgy ?? correctionEntry.dosePerFraction} />
                <CorrectionInput label="DOT Depth" name="depthOfTargetMm" type="number" step="0.1" defaultValue={correctionEntry.depthOfTargetMm ?? parseNumeric(correctionEntry.depthOfTarget)} />
                <CorrectionInput label="SSD" name="ssdCm" type="number" step="0.1" defaultValue={correctionEntry.ssdCm ?? parseNumeric(correctionEntry.ssd)} />
                <CorrectionInput label="Time" name="treatmentTimeMinutes" type="number" step="0.1" defaultValue={correctionEntry.treatmentTimeMinutes ?? 0} />
                <CorrectionInput label="Tech" name="technicianInitials" defaultValue={correctionEntry.technicianInitials} />
                <CorrectionInput label="Override %" name="isodoseToDotPercent" type="number" step="0.1" defaultValue={correctionEntry.isodoseOverrideReason ? correctionEntry.isodoseToDotPercent ?? correctionEntry.isodosePercent : ""} />
                <CorrectionInput label="Override Reason" name="isodoseOverrideReason" defaultValue={correctionEntry.isodoseOverrideReason ?? ""} />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <CorrectionInput label="Setup Comments" name="treatmentSetupComments" defaultValue={correctionEntry.treatmentSetupComments ?? ""} />
                <CorrectionInput label="Notes" name="notes" defaultValue={correctionEntry.notes} />
                <CorrectionInput label="Correction Reason" name="correctionReason" defaultValue="" required />
              </div>
            </div>
            <div className="clinical-modal-footer">
              <Button type="button" variant="ghost" className="clinical-action" onClick={() => setCorrectionEntryId(null)}>
                Cancel
              </Button>
              <Button type="submit" className="clinical-action-lg">
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Save Correction
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      <Card className="min-h-[420px]">
        <DataTable
          minTableWidth="1320px"
          toolbarPrefix={
            <div className="min-w-[220px]">
              <h3 className="font-heading text-base font-bold text-[var(--color-text)]">{title} History</h3>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                {reviewQueue.length ? `${reviewQueue.length} need review` : "Review queue clear"} | {approvedCount}/{sortedActiveEntries.length} approved
              </p>
            </div>
          }
          toolbarActions={
            <>
              <Button type="button" size="sm" variant="secondary" onClick={() => setAdvancedPanel("reference")}>
                <Calculator className="h-3.5 w-3.5" aria-hidden="true" />
                Reference
              </Button>
              <Button type="button" size="sm" variant="secondary" onClick={() => setAdvancedPanel("billing")}>
                <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" />
                Billing
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowEntryFlow(true)}
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Record Next Fraction
              </Button>
            </>
          }
          columns={[
            { key: "fx", label: "Fx", width: "72px", render: (row) => <span className="font-bold text-[var(--color-primary)]">Fx {row.entry.fractionNumber}</span> },
            { key: "date", label: "Date", render: (row) => formatDate(row.entry.date) },
            { key: "phase", label: "Phase", render: (row) => row.entry.phase },
            { key: "dose", label: "Dose", render: (row) => formatDose(row.entry.dosePerFractionCgy ?? row.entry.dosePerFraction) },
            { key: "dot", label: "DOT", render: (row) => `${row.entry.depthOfTargetMm ?? parseNumeric(row.entry.depthOfTarget) ?? "-"} mm` },
            { key: "isodose", label: "Isodose", render: (row) => formatPercent(row.entry.isodoseToDotPercent ?? row.entry.isodosePercent) },
            { key: "cumDot", label: "Cum DOT", render: (row) => formatDose(row.entry.cumulativeDoseToDotCgy ?? row.entry.cumulativeDoseToDepth) },
            {
              key: "review",
              label: "Review",
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  {approvalBadge("DOT", row.entry.dotApproval, row.entry.dotApprovalState)}
                  {approvalBadge("MD", row.entry.mdApproval, row.entry.mdApprovalState)}
                </div>
              )
            },
            {
              key: "status",
              label: "Status",
              render: (row) => <Badge variant={statusVariant(row.entry.status)}>{statusLabel(row.entry.status)}</Badge>
            },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedEntryId(row.entry.id);
                      setAdvancedPanel("note");
                    }}
                  >
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                    Details
                  </Button>
                </div>
              )
            }
          ]}
          rows={sortedEntries.map((entry) => ({
            id: entry.id,
            status: statusLabel(entry.status),
            review: `${entry.mdApprovalState ?? ""} ${entry.dotApprovalState ?? ""}`,
            entry
          }))}
          keyField="id"
          pageSize={10}
          empty="No fraction rows recorded."
          search={{
            placeholder: "Search fraction history...",
            getText: (row) => `${row.entry.fractionNumber} ${row.entry.date} ${row.entry.phase} ${row.status} ${row.review}`
          }}
          filters={[
            {
              id: "status",
              label: "Status",
              getValue: (row) => statusLabel(row.entry.status)
            }
          ]}
        />
      </Card>

      <Modal
        open={advancedPanel !== null}
        onClose={() => setAdvancedPanel(null)}
        title={advancedPanel === "reference" ? "Reference Curves" : advancedPanel === "billing" ? "Billing Rows" : "Fraction Details"}
        width={advancedPanel === "reference" ? "var(--width-clinical-modal-lg)" : 760}
      >
        {advancedPanel === "note" ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={labelClass}>Isodose Note</p>
                <h3 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
                  {selectedEntry ? `Fx ${selectedEntry.fractionNumber} | ${formatDate(selectedEntry.date)}` : "No fraction selected"}
                </h3>
              </div>
              {selectedEntry ? <Badge variant={statusVariant(selectedEntry.status)}>{statusLabel(selectedEntry.status)}</Badge> : null}
            </div>
            {selectedEntry ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <PreviewMetric label="DOT" value={`${selectedEntry.depthOfTargetMm ?? parseNumeric(selectedEntry.depthOfTarget) ?? "-"} mm`} />
                  <PreviewMetric label="Isodose" value={formatPercent(selectedEntry.isodoseToDotPercent ?? selectedEntry.isodosePercent)} />
                  <PreviewMetric label="Dose to DOT" value={formatDose(selectedEntry.doseToDotCgy ?? selectedEntry.doseToDepth)} />
                  <PreviewMetric label="Cumulative DOT" value={formatDose(selectedEntry.cumulativeDoseToDotCgy ?? selectedEntry.cumulativeDoseToDepth)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {approvalBadge("DOT", selectedEntry.dotApproval, selectedEntry.dotApprovalState)}
                  {approvalBadge("MD", selectedEntry.mdApproval, selectedEntry.mdApprovalState)}
                  {scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING" ? (
                    <Badge variant="warning">Image missing</Badge>
                  ) : null}
                  {compactWarnings(selectedEntry).map((warning) => (
                    <Badge key={warning} variant="warning">{warning}</Badge>
                  ))}
                </div>
                <p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 text-sm font-semibold leading-7 text-[var(--color-text)]">
                {selectedEntry.isodoseNote ?? "No isodose note."}
              </p>
                <p className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 text-sm font-semibold leading-7 text-[var(--color-text-muted)]">
                  {selectedEntry.notes || "No treatment note recorded."}
                </p>
                {!isVoidedFractionEntry(selectedEntry) ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border-soft)] pt-3">
                    {scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING" ? (
                      <Button type="button" size="sm" variant="secondary" disabled={pendingAction === `linkFractionImage-new`} onClick={() => linkFractionImage(selectedEntry)}>
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        Image Complete
                      </Button>
                    ) : null}
                    {!selectedEntry.dotApproval ? (
                      <>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          disabled={pendingAction === `approveFraction-${selectedEntry.id}` || scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING"}
                          title={scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING" ? "Link imaging evidence before DOT approval" : undefined}
                          onClick={() => approveFraction(selectedEntry, "DOT")}
                        >
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                          DOT Approve
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => {
                          setAdvancedPanel(null);
                          setReasonRequest({ type: "revision", entryId: selectedEntry.id, approvalType: "DOT" });
                        }}>
                          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                          DOT Revision
                        </Button>
                      </>
                    ) : null}
                    {!selectedEntry.mdApproval ? (
                      <>
                        <Button type="button" size="sm" variant="secondary" disabled={pendingAction === `approveFraction-${selectedEntry.id}`} onClick={() => approveFraction(selectedEntry, "MD")}>
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          MD Approve
                        </Button>
                        <Button type="button" size="sm" variant="ghost" onClick={() => {
                          setAdvancedPanel(null);
                          setReasonRequest({ type: "revision", entryId: selectedEntry.id, approvalType: "MD" });
                        }}>
                          <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                          MD Revision
                        </Button>
                      </>
                    ) : null}
                    <Button type="button" size="sm" variant="secondary" onClick={() => {
                      setAdvancedPanel(null);
                      setCorrectionEntryId(selectedEntry.id);
                    }}>
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      Correct
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => {
                      setAdvancedPanel(null);
                      setReasonRequest({ type: "void", entryId: selectedEntry.id });
                    }}>
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Void
                    </Button>
                  </div>
                ) : null}
            </>
          ) : (
              <p className="mt-4 text-sm font-semibold text-[var(--color-text-muted)]">No fraction selected.</p>
            )}
          </div>
        ) : null}

        {advancedPanel === "reference" ? (
          <div className="scrollbar-soft overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-[var(--color-table-header-bg)] text-left text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                  <th className="px-3 py-3">Energy</th>
                  <th className="px-3 py-3">Field</th>
                  {referenceDepths.map((depth) => <th key={depth} className="px-3 py-3">{depth.toFixed(1)} mm</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-soft)]">
                {fractionWorksheetReferenceCurves.flatMap((curve) =>
                  curve.fieldCurves.map((fieldCurve) => (
                    <tr key={`${curve.energyKv}-${fieldCurve.fieldSizeCm}`} className="bg-[var(--color-card)]">
                      <td className="px-3 py-3 text-sm font-bold text-[var(--color-text)]">{curve.energyKv} kV</td>
                      <td className="px-3 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{fieldCurve.fieldSizeCm}</td>
                      {referenceDepths.map((depth) => {
                        const index = curve.depthsMm.findIndex((item) => item === depth);
                        return (
                          <td key={depth} className="px-3 py-3 text-sm font-semibold text-[var(--color-text)]">
                            {fieldCurve.isodosePercents[index] ?? "-"}%
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {advancedPanel === "billing" ? (
          <DataTable
            minTableWidth="1080px"
            columns={[
              { key: "fractionNumber", label: "Fx" },
              { key: "date", label: "Date", render: (row) => formatDate(row.date) },
              { key: "phase", label: "Phase" },
              { key: "activity", label: "Activity" },
              { key: "cptCode", label: "CPT" },
              { key: "reviewer", label: "Reviewer" },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status === "Ready" ? "success" : "warning"}>{row.status}</Badge>
              }
            ]}
            rows={billingRows}
            pageSize={8}
            empty="No billable fraction rows available."
          />
        ) : null}
      </Modal>
    </div>
  );
}

function PreviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
      <p className={labelClass}>{label}</p>
      <p className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">{value}</p>
    </div>
  );
}

function CorrectionInput({
  label,
  name,
  defaultValue,
  type = "text",
  step,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className={cn(labelClass, required ? "after:ml-1 after:text-[var(--color-error)] after:content-['*']" : "")}>{label}</span>
      <Input name={name} type={type} step={step} defaultValue={defaultValue} required={required} />
    </label>
  );
}
