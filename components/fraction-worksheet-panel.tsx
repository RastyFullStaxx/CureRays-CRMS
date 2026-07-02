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
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/shared/data-table";
import { statusTone } from "@/lib/status-utils";
import { formatUiLabel } from "@/lib/ui-copy";
import type {
  FractionApprovalType,
  FractionLogEntry,
  IgsrtWorkspace,
  PrescriptionPhase,
  TreatmentCourse,
  TreatmentFraction
} from "@/lib/types";
import {
  buildBillingRows,
  buildPhaseSummaries,
  calculateFractionWorksheetEntry,
  deriveFractionLogStatus,
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

function approvalBadge(label: "MD" | "DOT", approved: boolean, state?: string) {
  const revisionNeeded = state === "REVISION_NEEDED";
  const reviewLabel = label === "DOT" ? "Target Depth" : "Physician";
  return (
    <Badge variant={approved ? "positive" : revisionNeeded ? "intermediate" : "neutral"}>
      {reviewLabel} {approved ? "Approved" : revisionNeeded ? "Revision" : "Pending"}
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
    ["fraction number", draft.fractionNumber],
    ["treatment date", draft.date],
    ["treatment phase", draft.phase],
    ["energy", draft.energyKv],
    ["applicator or field size", draft.fieldSizeCm],
    ["dose per fraction", draft.dosePerFractionCgy],
    ["depth of target", draft.depthOfTargetMm],
    ["source-to-surface distance", draft.ssdCm],
    ["technician initials", draft.technicianInitials],
    ["treatment time", draft.treatmentTimeMinutes]
  ].filter(([, value]) => !String(value).trim()).map(([label]) => label);
}

function ActionFeedback({ message, error }: { message: string | null; error: string | null }) {
  if (!message && !error) return null;
  return error ? (
    <div className="clinical-alert-negative p-3 type-body" role="alert">{error}</div>
  ) : (
    <div className="clinical-alert-positive p-3 type-body" role="status" aria-live="polite">{message}</div>
  );
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
  const [correctionDirty, setCorrectionDirty] = useState(false);
  const [reasonRequest, setReasonRequest] = useState<ReasonRequest | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvalRequest, setApprovalRequest] = useState<{ entry: FractionLogEntry; approvalType: FractionApprovalType } | null>(null);
  const [draftBaseline, setDraftBaseline] = useState("");

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
  const approvedCount = sortedActiveEntries.filter((entry) => deriveFractionLogStatus(entry) === "APPROVED").length;
  const reviewQueue = sortedActiveEntries.filter((entry) => {
    const hasWarnings = compactWarnings(entry).length > 0;
    const scheduled = scheduleByFraction.get(entry.fractionNumber);
    return (
      deriveFractionLogStatus(entry) !== "APPROVED" ||
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
      "Fraction recorded. Target depth and physician review queues updated."
    );

    if (workspace?.courseFractions) {
      const nextDraft = buildInitialDraft(course, phases, workspace.courseFractions, workspace.treatmentFractions ?? schedule);
      setDraft(nextDraft);
      setDraftBaseline(JSON.stringify(nextDraft));
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
    const input = correctionFormToInput(new FormData(event.currentTarget));
    if (input.isodoseToDotPercent !== undefined && !input.isodoseOverrideReason) {
      setError("Enter a clinical reason for the manual isodose override.");
      return;
    }
    const workspace = await requestJson(
      "updateFraction",
      input,
      "Fraction corrected. Approvals were reset for review."
    );

    if (workspace) {
      setCorrectionEntryId(null);
      setCorrectionDirty(false);
    }
  }

  async function approveFraction(entry: FractionLogEntry, approvalType: FractionApprovalType) {
    return requestJson(
      "approveFraction",
      { courseId: course.id, id: entry.id, approvalType },
      `${approvalType === "DOT" ? "Target depth" : "Physician"} approval recorded for fraction ${entry.fractionNumber}.`
    );
  }

  async function confirmApproval() {
    if (!approvalRequest) return;
    const workspace = await approveFraction(approvalRequest.entry, approvalRequest.approvalType);
    if (workspace) setApprovalRequest(null);
  }

  async function linkFractionImage(entry: FractionLogEntry) {
    await requestJson(
      "linkFractionImage",
      {
        courseId: course.id,
        fractionNumber: entry.fractionNumber,
        assetId: `PROTO-IMG-${entry.id}`
      },
      `Image evidence linked for fraction ${entry.fractionNumber}.`
    );
  }

  async function submitReason(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reasonRequest) {
      return;
    }

    const entry = sortedEntries.find((item) => item.id === reasonRequest.entryId);
    const label = entry ? `Fraction ${entry.fractionNumber}` : "fraction";
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
  const today = new Date().toISOString().slice(0, 10);
  const invalidFractionValues = [
    Number(draft.fractionNumber) < 1 ? "fraction number must be at least 1" : "",
    draft.date > today ? "treatment date cannot be in the future" : "",
    Number(draft.dosePerFractionCgy) <= 0 ? "dose per fraction must be greater than 0" : "",
    Number(draft.depthOfTargetMm) < 0 ? "depth of target cannot be negative" : "",
    Number(draft.ssdCm) <= 0 ? "source-to-surface distance must be greater than 0" : "",
    Number(draft.treatmentTimeMinutes) <= 0 ? "treatment time must be greater than 0" : "",
  ].filter(Boolean);
  const overrideReasonMissing = Boolean(draft.isodoseToDotPercent.trim()) && !draft.isodoseOverrideReason.trim();
  const recordReady = missingFractionFields.length === 0 && invalidFractionValues.length === 0 && !preview.error && !overrideReasonMissing;
  const hasUnsavedDraft = showEntryFlow && JSON.stringify(draft) !== draftBaseline;

  function openEntryFlow() {
    setDraftBaseline(JSON.stringify(draft));
    setError(null);
    setMessage(null);
    setShowEntryFlow(true);
  }

  function canCloseEntryFlow() {
    return !hasUnsavedDraft || window.confirm("Discard the unsaved fraction changes?");
  }

  function closeEntryFlow() {
    if (canCloseEntryFlow()) setShowEntryFlow(false);
  }

  function canCloseReason() {
    return !reasonText.trim() || window.confirm("Discard the unsaved reason?");
  }

  function closeReason() {
    if (!canCloseReason()) return;
    setReasonRequest(null);
    setReasonText("");
  }

  function canCloseCorrection() {
    return !correctionDirty || window.confirm("Discard the unsaved correction?");
  }

  function closeCorrection() {
    if (!canCloseCorrection()) return;
    setCorrectionEntryId(null);
    setCorrectionDirty(false);
  }

  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4">
      <ActionFeedback message={message} error={error} />

      {showEntryFlow ? (
        <Modal
          open={showEntryFlow}
          onClose={() => setShowEntryFlow(false)}
          shouldClose={canCloseEntryFlow}
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
                  <h3 className="mt-1 type-heading text-[var(--color-text)]">
                    Fraction {draft.fractionNumber || nextFractionNumber(entries)}
                  </h3>
                  <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                    Confirm the course, enter treatment values, and review the live calculation before recording.
                  </p>
                </div>
                <Badge variant={recordReady ? "positive" : "intermediate"}>
                  {recordReady ? "Ready" : "Needs attention"}
                </Badge>
              </div>
            </div>

            <div className="clinical-modal-body grid content-start gap-4 py-4">
              <ActionFeedback message={message} error={error} />
              {missingFractionFields.length || invalidFractionValues.length ? (
                <div id="fraction-record-errors" className="clinical-alert-negative p-3 type-body" role="alert">
                  {missingFractionFields.length ? `Complete ${missingFractionFields.join(", ")}. ` : ''}
                  {invalidFractionValues.length ? `Correct ${invalidFractionValues.join(", ")}.` : ''}
                </div>
              ) : null}
              {overrideReasonMissing ? (
                <div id="fraction-override-error" className="clinical-alert-negative p-3 type-body" role="alert">
                  Enter a clinical reason for the manual isodose override.
                </div>
              ) : null}

              <div className="clinical-fraction-entry-grid">
                <section className="grid content-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                  <h4 className=" type-body text-[var(--color-text)]">Confirm Course and Fraction</h4>
                  <label className="grid gap-1">
                    <span className={labelClass}>Fraction number</span>
                    <Input
                      type="number"
                      min="1"
                      required
                      aria-invalid={!draft.fractionNumber.trim() || Number(draft.fractionNumber) < 1}
                      aria-describedby={!draft.fractionNumber.trim() || Number(draft.fractionNumber) < 1 ? "fraction-record-errors" : undefined}
                      value={draft.fractionNumber}
                      onChange={(event) => updateDraft("fractionNumber", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className={labelClass}>Treatment date</span>
                    <Input
                      type="date"
                      max={today}
                      required
                      aria-invalid={!draft.date.trim() || draft.date > today}
                      aria-describedby={!draft.date.trim() || draft.date > today ? "fraction-record-errors" : undefined}
                      value={draft.date}
                      onChange={(event) => updateDraft("date", event.target.value)}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className={labelClass}>Treatment phase</span>
                    <Select required aria-invalid={!draft.phase.trim()} aria-describedby={!draft.phase.trim() ? "fraction-record-errors" : undefined} value={draft.phase} onChange={(event) => applyPhaseDefaults(event.target.value)}>
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
                  <h4 className=" type-body text-[var(--color-text)]">Enter Treatment Values</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className={labelClass}>Energy (kV)</span>
                      <Select required aria-invalid={!draft.energyKv.trim()} aria-describedby={!draft.energyKv.trim() ? "fraction-record-errors" : undefined} value={draft.energyKv} onChange={(event) => updateDraft("energyKv", event.target.value)}>
                        {energyOptions.map((energy) => (
                          <option key={energy} value={energy}>
                            {energy} kV
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Applicator / field size</span>
                      <Select required aria-invalid={!draft.fieldSizeCm.trim()} aria-describedby={!draft.fieldSizeCm.trim() ? "fraction-record-errors" : undefined} value={draft.fieldSizeCm} onChange={(event) => updateDraft("fieldSizeCm", event.target.value)}>
                        {fieldSizeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </Select>
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Dose per fraction (cGy)</span>
                      <Input
                        type="number"
                        min="1"
                        required
                        aria-invalid={!draft.dosePerFractionCgy.trim() || Number(draft.dosePerFractionCgy) <= 0}
                        aria-describedby={!draft.dosePerFractionCgy.trim() || Number(draft.dosePerFractionCgy) <= 0 ? "fraction-record-errors" : undefined}
                        value={draft.dosePerFractionCgy}
                        onChange={(event) => updateDraft("dosePerFractionCgy", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Depth of target (DOT, mm)</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        aria-invalid={!draft.depthOfTargetMm.trim() || Number(draft.depthOfTargetMm) < 0}
                        aria-describedby={!draft.depthOfTargetMm.trim() || Number(draft.depthOfTargetMm) < 0 ? "fraction-record-errors" : undefined}
                        value={draft.depthOfTargetMm}
                        onChange={(event) => updateDraft("depthOfTargetMm", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Source-to-surface distance (SSD, cm)</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="1"
                        required
                        aria-invalid={!draft.ssdCm.trim() || Number(draft.ssdCm) <= 0}
                        aria-describedby={!draft.ssdCm.trim() || Number(draft.ssdCm) <= 0 ? "fraction-record-errors" : undefined}
                        value={draft.ssdCm}
                        onChange={(event) => updateDraft("ssdCm", event.target.value)}
                      />
                    </label>
                    <label className="grid gap-1">
                      <span className={labelClass}>Technician initials</span>
                      <Input required aria-invalid={!draft.technicianInitials.trim()} aria-describedby={!draft.technicianInitials.trim() ? "fraction-record-errors" : undefined} value={draft.technicianInitials} onChange={(event) => updateDraft("technicianInitials", event.target.value)} />
                    </label>
                    <label className="grid gap-1 sm:col-span-2">
                      <span className={labelClass}>Treatment time (minutes)</span>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        required
                        aria-invalid={!draft.treatmentTimeMinutes.trim() || Number(draft.treatmentTimeMinutes) <= 0}
                        aria-describedby={!draft.treatmentTimeMinutes.trim() || Number(draft.treatmentTimeMinutes) <= 0 ? "fraction-record-errors" : undefined}
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
                    <h4 className=" type-body text-[var(--color-text)]">Review Calculated Dose</h4>
                    <Badge variant={preview.entry?.calculationStatus === "AUTO_LOOKUP" ? "positive" : "intermediate"}>
                      {formatUiLabel(preview.entry?.calculationStatus ?? "pending")}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className={labelClass}>Live Calculation</p>
                  </div>

                  {preview.error ? (
                    <div className="clinical-alert-negative mt-3 p-3 type-body">
                      {preview.error}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <PreviewMetric label="Dose to Target Depth" value={formatDose(preview.entry?.doseToDotCgy ?? preview.entry?.doseToDepth)} />
                      <PreviewMetric label="Cumulative" value={formatDose(preview.entry?.cumulativeDoseCgy ?? preview.entry?.cumulativeDose)} />
                      <PreviewMetric label="Cumulative Target Dose" value={formatDose(preview.entry?.cumulativeDoseToDotCgy ?? preview.entry?.cumulativeDoseToDepth)} />
                      <PreviewMetric label="Isodose" value={formatPercent(preview.entry?.isodoseToDotPercent ?? preview.entry?.isodosePercent)} />
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className={labelClass}>Manual isodose override (%)</span>
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
                      <span className={labelClass}>Override reason</span>
                      <Textarea
                        rows={3}
                        required={Boolean(draft.isodoseToDotPercent.trim())}
                        aria-invalid={overrideReasonMissing}
                        aria-describedby={overrideReasonMissing ? "fraction-override-error" : undefined}
                        value={draft.isodoseOverrideReason}
                        onChange={(event) => updateDraft("isodoseOverrideReason", event.target.value)}
                      />
                    </label>
                  </div>

                  {compactWarnings(preview.entry ?? undefined).length ? (
                    <div className="grid gap-2">
                      {compactWarnings(preview.entry ?? undefined).map((warning) => (
                        <div key={warning} className="flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3 type-body text-[var(--color-text-muted)]">
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--status-intermediate-text)]" aria-hidden="true" />
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
                onClick={closeEntryFlow}
              >
                Cancel
              </Button>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="clinical-action-lg" disabled={!recordReady || pendingAction === "addFraction-new"} aria-busy={pendingAction === "addFraction-new"}>
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
          shouldClose={canCloseReason}
          title={reasonRequest.type === "void" ? "Void Fraction" : "Request Revision"}
          width={560}
        >
          <form className="grid gap-4" onSubmit={submitReason}>
            <ActionFeedback message={message} error={error} />
            <label className="grid gap-1">
              <span className={labelClass}>{reasonRequest.type === "void" ? "Void reason" : `${reasonRequest.approvalType === "DOT" ? "Target depth" : "Physician"} revision reason`}</span>
              <Textarea
                rows={3}
                required
                aria-invalid={!reasonText.trim()}
                value={reasonText}
                onChange={(event) => setReasonText(event.target.value)}
                placeholder={reasonRequest.type === "void" ? "Why this row should be voided" : "What needs correction before approval"}
              />
            </label>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-border-soft)] pt-3">
              <Button type="button" variant="ghost" className="clinical-action" onClick={closeReason}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="clinical-action-lg"
                variant={reasonRequest.type === "void" ? "danger" : "primary"}
                disabled={!reasonText.trim() || pendingAction === `${reasonRequest.type === "void" ? "voidFraction" : "requestFractionRevision"}-${reasonRequest.entryId}`}
                aria-busy={pendingAction === `${reasonRequest.type === "void" ? "voidFraction" : "requestFractionRevision"}-${reasonRequest.entryId}`}
              >
                {reasonRequest.type === "void" ? <XCircle className="h-4 w-4" aria-hidden="true" /> : <Undo2 className="h-4 w-4" aria-hidden="true" />}
                {reasonRequest.type === "void" ? "Void fraction" : "Submit revision request"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {correctionEntry ? (
        <Modal open={Boolean(correctionEntry)} onClose={() => {
          setCorrectionEntryId(null);
          setCorrectionDirty(false);
        }} shouldClose={canCloseCorrection} title="Correct Fraction" width="var(--width-clinical-modal-lg)" height="var(--height-clinical-modal)" contentClassName="flex flex-col">
          <form className="clinical-modal-frame flex-1" onSubmit={updateCorrection} onChange={() => setCorrectionDirty(true)}>
            <input type="hidden" name="id" value={correctionEntry.id} />
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-soft)] pb-3">
              <div>
                <p className={labelClass}>Correct Fraction</p>
                <h3 className="mt-1 type-heading text-[var(--color-text)]">Fraction {correctionEntry.fractionNumber}</h3>
              </div>
              <Badge variant="intermediate">Approvals reset after correction</Badge>
            </div>
            <div className="clinical-modal-body grid content-start gap-4 py-4">
              <ActionFeedback message={message} error={error} />
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <CorrectionInput label="Fraction Number" name="fractionNumber" type="number" defaultValue={correctionEntry.fractionNumber} required />
                <CorrectionInput label="Treatment Date" name="date" type="date" defaultValue={correctionEntry.date} required />
                <label className="grid gap-1">
                  <span className={labelClass}>Phase</span>
                  <Select name="phase" defaultValue={correctionEntry.phase} required>
                    {phaseSummaries.map((phase) => (
                      <option key={phase.phaseName} value={phase.phaseName}>
                        {phase.phaseName}
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Energy</span>
                  <Select name="energyKv" defaultValue={correctionEntry.energyKv ?? parseEnergyKv(correctionEntry.energy)} required>
                    {energyOptions.map((energy) => (
                      <option key={energy} value={energy}>
                        {energy} kV
                      </option>
                    ))}
                  </Select>
                </label>
                <label className="grid gap-1">
                  <span className={labelClass}>Field</span>
                  <Select name="fieldSizeCm" defaultValue={normalizeFieldSizeCm(correctionEntry.fieldSizeCm)} required>
                    {fieldSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </label>
                <CorrectionInput label="Dose per Fraction (cGy)" name="dosePerFractionCgy" type="number" defaultValue={correctionEntry.dosePerFractionCgy ?? correctionEntry.dosePerFraction} required />
                <CorrectionInput label="Depth of Target (DOT, mm)" name="depthOfTargetMm" type="number" step="0.1" defaultValue={correctionEntry.depthOfTargetMm ?? parseNumeric(correctionEntry.depthOfTarget)} required />
                <CorrectionInput label="Source-to-surface distance (SSD, cm)" name="ssdCm" type="number" step="0.1" defaultValue={correctionEntry.ssdCm ?? parseNumeric(correctionEntry.ssd)} required />
                <CorrectionInput label="Treatment Time (Minutes)" name="treatmentTimeMinutes" type="number" step="0.1" defaultValue={correctionEntry.treatmentTimeMinutes ?? 0} required />
                <CorrectionInput label="Technician Initials" name="technicianInitials" defaultValue={correctionEntry.technicianInitials} required />
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
              <Button type="button" variant="ghost" className="clinical-action" onClick={closeCorrection}>
                Cancel
              </Button>
              <Button type="submit" className="clinical-action-lg" disabled={pendingAction === `updateFraction-${correctionEntry.id}`} aria-busy={pendingAction === `updateFraction-${correctionEntry.id}`}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                {pendingAction === `updateFraction-${correctionEntry.id}` ? "Saving Correction" : "Save Correction"}
              </Button>
            </div>
          </form>
        </Modal>
      ) : null}

      {approvalRequest ? (
        <Modal
          open={Boolean(approvalRequest)}
          onClose={() => setApprovalRequest(null)}
          title={approvalRequest.approvalType === "DOT" ? "Confirm Target Depth Approval" : "Confirm Physician Approval"}
          width={560}
        >
          <div className="grid gap-4">
            <ActionFeedback message={message} error={error} />
            <div className="clinical-muted-surface p-4">
              <p className="type-item-title">Fraction {approvalRequest.entry.fractionNumber}</p>
              <p className="type-meta mt-2">
                This approval records the current treatment evidence in the audit trail. Reopening it later requires a documented revision reason.
              </p>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--color-border-soft)] pt-3">
              <Button type="button" variant="ghost" onClick={() => setApprovalRequest(null)}>Cancel</Button>
              <Button
                type="button"
                onClick={confirmApproval}
                disabled={pendingAction === `approveFraction-${approvalRequest.entry.id}`}
                aria-busy={pendingAction === `approveFraction-${approvalRequest.entry.id}`}
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                {pendingAction === `approveFraction-${approvalRequest.entry.id}` ? "Recording approval" : "Confirm approval"}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}

      <div className="min-w-0">
        <DataTable
          minTableWidth="1320px"
          toolbarPrefix={
            <div className="min-w-[220px]">
              <h3 className=" type-heading text-[var(--color-text)]">{title} History</h3>
              <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
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
                onClick={openEntryFlow}
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Record Next Fraction
              </Button>
            </>
          }
          columns={[
            { key: "fx", label: "Fraction", width: "88px", render: (row) => <span className="type-medium text-[var(--color-primary)]">Fraction {row.entry.fractionNumber}</span> },
            { key: "date", label: "Date", render: (row) => formatDate(row.entry.date) },
            { key: "phase", label: "Phase", render: (row) => row.entry.phase },
            { key: "dose", label: "Dose", render: (row) => formatDose(row.entry.dosePerFractionCgy ?? row.entry.dosePerFraction) },
            { key: "dot", label: "Target Depth (DOT)", render: (row) => `${row.entry.depthOfTargetMm ?? parseNumeric(row.entry.depthOfTarget) ?? "-"} mm` },
            { key: "isodose", label: "Isodose", render: (row) => formatPercent(row.entry.isodoseToDotPercent ?? row.entry.isodosePercent) },
            { key: "cumDot", label: "Cumulative Target Dose", render: (row) => formatDose(row.entry.cumulativeDoseToDotCgy ?? row.entry.cumulativeDoseToDepth) },
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
              render: (row) => {
                const status = deriveFractionLogStatus(row.entry);
                return <Badge variant={statusTone(status)}>{formatUiLabel(status)}</Badge>;
              }
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
            status: formatUiLabel(deriveFractionLogStatus(entry)),
            review: `${entry.mdApprovalState ?? ""} ${entry.dotApprovalState ?? ""}`,
            entry
          }))}
          keyField="id"
          getRowId={(row) => `workspace-target-fraction-${row.entry.id}`}
          getRowLabel={(row) => `Open fraction ${row.entry.fractionNumber} details`}
          onRowClick={(row) => {
            setSelectedEntryId(row.entry.id);
            setAdvancedPanel("note");
          }}
          pageSize={Math.min(10, Math.max(sortedEntries.length, 1))}
          empty="No fraction rows recorded."
          search={{
            placeholder: "Search fraction history...",
            getText: (row) => `${row.entry.fractionNumber} ${row.entry.date} ${row.entry.phase} ${row.status} ${row.review}`
          }}
          filters={[
            {
              id: "status",
              label: "Status",
              getValue: (row) => formatUiLabel(deriveFractionLogStatus(row.entry))
            }
          ]}
        />
      </div>

      <Modal
        open={advancedPanel !== null}
        onClose={() => setAdvancedPanel(null)}
        title={advancedPanel === "reference" ? "Reference Curves" : advancedPanel === "billing" ? "Billing Rows" : "Fraction Details"}
        width={advancedPanel === "reference" ? "var(--width-clinical-modal-lg)" : 760}
      >
        <ActionFeedback message={message} error={error} />
        {advancedPanel === "note" ? (
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className={labelClass}>Isodose Note</p>
                <h3 className="mt-1 type-heading text-[var(--color-text)]">
                  {selectedEntry ? `Fraction ${selectedEntry.fractionNumber} | ${formatDate(selectedEntry.date)}` : "No fraction selected"}
                </h3>
              </div>
              {selectedEntry ? (() => {
                const status = deriveFractionLogStatus(selectedEntry);
                return <Badge variant={statusTone(status)}>{formatUiLabel(status)}</Badge>;
              })() : null}
            </div>
            {selectedEntry ? (
              <>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <PreviewMetric label="Depth of Target (DOT)" value={`${selectedEntry.depthOfTargetMm ?? parseNumeric(selectedEntry.depthOfTarget) ?? "-"} mm`} />
                  <PreviewMetric label="Isodose" value={formatPercent(selectedEntry.isodoseToDotPercent ?? selectedEntry.isodosePercent)} />
                  <PreviewMetric label="Dose to Target Depth" value={formatDose(selectedEntry.doseToDotCgy ?? selectedEntry.doseToDepth)} />
                  <PreviewMetric label="Cumulative Target Dose" value={formatDose(selectedEntry.cumulativeDoseToDotCgy ?? selectedEntry.cumulativeDoseToDepth)} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {approvalBadge("DOT", selectedEntry.dotApproval, selectedEntry.dotApprovalState)}
                  {approvalBadge("MD", selectedEntry.mdApproval, selectedEntry.mdApprovalState)}
                  {scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING" ? (
                    <Badge variant="intermediate">Image missing</Badge>
                  ) : null}
                  {compactWarnings(selectedEntry).map((warning) => (
                    <Badge key={warning} variant="intermediate">{warning}</Badge>
                  ))}
                </div>
                <details className="clinical-muted-surface mt-4 p-3 type-body text-[var(--color-text-muted)]">
                  <summary className="clinical-focus cursor-pointer type-medium text-[var(--color-primary)]">Treatment Abbreviations</summary>
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div><dt className="type-medium text-[var(--color-text)]">DOT</dt><dd>Depth of target</dd></div>
                    <div><dt className="type-medium text-[var(--color-text)]">SSD</dt><dd>Source-to-surface distance</dd></div>
                    <div><dt className="type-medium text-[var(--color-text)]">MD</dt><dd>Physician review</dd></div>
                    <div><dt className="type-medium text-[var(--color-text)]">cGy</dt><dd>Centigray dose unit</dd></div>
                  </dl>
                </details>
                <p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 type-body text-[var(--color-text)]">
                {selectedEntry.isodoseNote ?? "No isodose note."}
              </p>
                <p className="mt-3 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 type-body text-[var(--color-text-muted)]">
                  {selectedEntry.notes || "No treatment note recorded."}
                </p>
                {!isVoidedFractionEntry(selectedEntry) ? (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-border-soft)] pt-3">
                    {scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING" ? (
                      <p className="w-full type-body text-[var(--status-intermediate-text)]" role="status">
                        Attach imaging evidence before target depth approval.
                      </p>
                    ) : null}
                    {scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING" ? (
                      <Button type="button" size="sm" variant="secondary" disabled={pendingAction === `linkFractionImage-new`} onClick={() => linkFractionImage(selectedEntry)}>
                        <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                        Mark imaging evidence complete
                      </Button>
                    ) : null}
                    {!selectedEntry.dotApproval ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={scheduleByFraction.get(selectedEntry.fractionNumber)?.imageGuidanceStatus === "MISSING"}
                        onClick={() => {
                          setAdvancedPanel(null);
                          setApprovalRequest({ entry: selectedEntry, approvalType: "DOT" });
                        }}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve target depth (DOT)
                      </Button>
                    ) : null}
                    <Button type="button" size="sm" variant="ghost" onClick={() => {
                      setAdvancedPanel(null);
                      setReasonRequest({ type: "revision", entryId: selectedEntry.id, approvalType: "DOT" });
                    }}>
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {selectedEntry.dotApproval ? "Reopen target depth review" : "Request target depth revision"}
                    </Button>
                    {!selectedEntry.mdApproval ? (
                      <Button type="button" size="sm" variant="secondary" onClick={() => {
                        setAdvancedPanel(null);
                        setApprovalRequest({ entry: selectedEntry, approvalType: "MD" });
                      }}>
                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Approve physician review (MD)
                      </Button>
                    ) : null}
                    <Button type="button" size="sm" variant="ghost" onClick={() => {
                      setAdvancedPanel(null);
                      setReasonRequest({ type: "revision", entryId: selectedEntry.id, approvalType: "MD" });
                    }}>
                      <Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
                      {selectedEntry.mdApproval ? "Reopen physician review" : "Request physician revision"}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => {
                      setAdvancedPanel(null);
                      setCorrectionDirty(false);
                      setCorrectionEntryId(selectedEntry.id);
                    }}>
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                      Correct fraction
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => {
                      setAdvancedPanel(null);
                      setReasonRequest({ type: "void", entryId: selectedEntry.id });
                    }}>
                      <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      Void fraction
                    </Button>
                  </div>
                ) : null}
            </>
          ) : (
              <p className="mt-4 type-body text-[var(--color-text-muted)]">No fraction selected.</p>
            )}
          </div>
        ) : null}

        {advancedPanel === "reference" ? (
          <div className="scrollbar-soft overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-[var(--color-table-header-bg)] text-left type-label text-[var(--color-text-muted)]">
                  <th className="px-3 py-3">Energy</th>
                  <th className="px-3 py-3">Field</th>
                  {referenceDepths.map((depth) => <th key={depth} className="px-3 py-3">{depth.toFixed(1)} mm</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-soft)]">
                {fractionWorksheetReferenceCurves.flatMap((curve) =>
                  curve.fieldCurves.map((fieldCurve) => (
                    <tr key={`${curve.energyKv}-${fieldCurve.fieldSizeCm}`} className="bg-[var(--color-card)]">
                      <td className="px-3 py-3 type-body text-[var(--color-text)]">{curve.energyKv} kV</td>
                      <td className="px-3 py-3 type-body text-[var(--color-text-muted)]">{fieldCurve.fieldSizeCm}</td>
                      {referenceDepths.map((depth) => {
                        const index = curve.depthsMm.findIndex((item) => item === depth);
                        return (
                          <td key={depth} className="px-3 py-3 type-body text-[var(--color-text)]">
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
              { key: "fractionNumber", label: "Fraction" },
              { key: "date", label: "Date", render: (row) => formatDate(row.date) },
              { key: "phase", label: "Phase" },
              { key: "activity", label: "Activity" },
              { key: "cptCode", label: "Billing Code (CPT)" },
              { key: "reviewer", label: "Reviewer" },
              {
                key: "status",
                label: "Status",
                render: (row) => <Badge variant={row.status === "Ready" ? "positive" : "intermediate"}>{row.status}</Badge>
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
      <p className="mt-1 type-heading text-[var(--color-text)]">{value}</p>
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
      <span className={cn(labelClass, required ? "after:ml-1 after:text-[var(--status-negative-text)] after:content-['*']" : "")}>{label}</span>
      <Input name={name} type={type} step={step} defaultValue={defaultValue} required={required} />
    </label>
  );
}
