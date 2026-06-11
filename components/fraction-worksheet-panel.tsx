"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Calculator, CheckCircle2, ClipboardList, FileText, RefreshCw, Save, Table2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FractionLogEntry, IgsrtWorkspace, PrescriptionPhase, TreatmentCourse } from "@/lib/types";
import {
  buildBillingRows,
  buildPhaseSummaries,
  fractionWorksheetReferenceCurves,
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

type WorksheetTab = "log" | "note" | "reference" | "billing";

const tabs: Array<{ id: WorksheetTab; label: string; icon: typeof Table2 }> = [
  { id: "log", label: "Fraction Log", icon: Table2 },
  { id: "note", label: "Isodose Note", icon: FileText },
  { id: "reference", label: "Reference Curves", icon: Calculator },
  { id: "billing", label: "Billing", icon: ClipboardList }
];

const inputClass =
  "h-9 w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-2 text-sm font-semibold text-[var(--color-text)] outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--color-primary)_18%,transparent)]";
const calcClass =
  "inline-flex h-9 min-w-[78px] items-center justify-end rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] px-2 text-sm font-bold text-[var(--color-text)]";
const labelClass = "clinical-label";
const fieldSizeOptions = ["1.5 cm", "2.0 cm", "2.5 cm", "3.0 cm", "4.0 cm", "5.0 cm", "10 cm", "8x18 cm"];
const approvalOptions = ["PENDING", "APPROVED", "REVISION_NEEDED"] as const;
const referenceDepths = [0.5, 1, 1.5, 2, 3, 4];

function optionalNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? undefined : Number(value);
}

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function compactWarnings(entry: FractionLogEntry) {
  return entry.calculationMeta?.warnings ?? [];
}

function formatDose(value: number | undefined) {
  return value === undefined ? "-" : `${value.toLocaleString()} cGy`;
}

function phaseInputDefaults(phase: ReturnType<typeof buildPhaseSummaries>[number] | undefined) {
  return {
    energyKv: phase?.energyKv ?? 50,
    ssdCm: phase?.ssdCm ?? 15,
    dosePerFractionCgy: phase?.dosePerFractionCgy ?? 250,
    fieldSizeCm: phase?.fieldSizeCm ?? "3.0 cm",
    treatmentTimeMinutes: phase?.treatmentTimeMinutes ?? 0
  };
}

function RowInput({
  formId,
  name,
  defaultValue,
  type = "text",
  step,
  min,
  className
}: {
  formId: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
  step?: string;
  min?: string;
  className?: string;
}) {
  return (
    <input
      form={formId}
      name={name}
      type={type}
      step={step}
      min={min}
      defaultValue={defaultValue}
      className={cn(inputClass, className)}
    />
  );
}

function RowSelect({
  formId,
  name,
  defaultValue,
  options
}: {
  formId: string;
  name: string;
  defaultValue?: string | number;
  options: Array<string | number>;
}) {
  return (
    <select form={formId} name={name} defaultValue={defaultValue} className={inputClass}>
      {options.map((option) => (
        <option key={String(option)} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export function FractionWorksheetPanel({
  initialEntries,
  course,
  phases,
  title = "Fractionation Worksheet"
}: {
  initialEntries: FractionLogEntry[];
  course: TreatmentCourse;
  phases: PrescriptionPhase[];
  title?: string;
}) {
  const [entries, setEntries] = useState(initialEntries);
  const [activeTab, setActiveTab] = useState<WorksheetTab>("log");
  const [selectedEntryId, setSelectedEntryId] = useState(initialEntries[0]?.id ?? "");
  const [selectedPhaseName, setSelectedPhaseName] = useState<string>(phases[0]?.phaseName ?? "Phase I");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sortedEntries = useMemo(() => [...entries].sort((a, b) => a.fractionNumber - b.fractionNumber), [entries]);
  const phaseSummaries = useMemo(() => buildPhaseSummaries(course, phases, sortedEntries), [course, phases, sortedEntries]);
  const selectedPhase = phaseSummaries.find((phase) => phase.phaseName === selectedPhaseName) ?? phaseSummaries[0];
  const defaults = phaseInputDefaults(selectedPhase);
  const selectedEntry = sortedEntries.find((entry) => entry.id === selectedEntryId) ?? sortedEntries[0];
  const billingRows = useMemo(() => buildBillingRows(sortedEntries), [sortedEntries]);
  const approvedCount = sortedEntries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const latestEntry = sortedEntries.at(-1);
  const nextFractionNumber = (latestEntry?.fractionNumber ?? 0) + 1;

  async function requestJson(action: string, data: Record<string, unknown>, method = "POST") {
    setPendingAction(action);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/igsrt", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-curerays-role": "RAD_ONC"
        },
        body: JSON.stringify({ action, data })
      });
      const result = (await response.json()) as ApiResult;

      if (!response.ok) {
        throw new Error(result.message ?? "Worksheet update failed");
      }

      const workspace = result.workspace ?? result.data;
      if (workspace?.courseFractions) {
        setEntries(workspace.courseFractions);
        setSelectedEntryId(data.id ? String(data.id) : workspace.courseFractions.at(-1)?.id ?? selectedEntryId);
      }
      setMessage(action === "addFraction" ? "Worksheet row added and calculated." : "Worksheet row recalculated.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Worksheet update failed");
    } finally {
      setPendingAction(null);
    }
  }

  function formDataToWorksheetRow(formData: FormData) {
    return {
      courseId: course.id,
      id: textValue(formData, "id") || undefined,
      fractionNumber: optionalNumber(formData, "fractionNumber"),
      date: textValue(formData, "date"),
      phase: textValue(formData, "phase"),
      energyKv: optionalNumber(formData, "energyKv"),
      ssdCm: optionalNumber(formData, "ssdCm"),
      fieldSizeCm: textValue(formData, "fieldSizeCm"),
      treatmentTimeMinutes: optionalNumber(formData, "treatmentTimeMinutes"),
      dosePerFractionCgy: optionalNumber(formData, "dosePerFractionCgy"),
      technicianInitials: textValue(formData, "technicianInitials"),
      mdApprovalState: textValue(formData, "mdApprovalState"),
      dotApprovalState: textValue(formData, "dotApprovalState"),
      depthOfTargetMm: optionalNumber(formData, "depthOfTargetMm"),
      isodoseToDotPercent: optionalNumber(formData, "isodoseToDotPercent"),
      isodoseOverrideReason: textValue(formData, "isodoseOverrideReason"),
      treatmentSetupComments: textValue(formData, "treatmentSetupComments"),
      notes: textValue(formData, "notes")
    };
  }

  function addFraction(formData: FormData) {
    requestJson("addFraction", formDataToWorksheetRow(formData));
  }

  function updateFraction(formData: FormData) {
    requestJson("updateFraction", formDataToWorksheetRow(formData));
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[var(--color-border-soft)] p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                <Table2 className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate font-heading text-lg font-bold text-[var(--color-text)]">{title}</h3>
                <p className="text-sm font-semibold text-[var(--color-text-muted)]">
                  Native worksheet for treatment entry, DOT lookup, isodose notes, and billing support.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">
              <AlertTriangle className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              Clinical validation required
            </Badge>
            <Badge variant={approvedCount === sortedEntries.length && sortedEntries.length > 0 ? "success" : "primary"}>
              {approvedCount}/{sortedEntries.length} approved
            </Badge>
            <Badge variant="info">
              {formatDose(latestEntry?.cumulativeDoseToDotCgy ?? latestEntry?.cumulativeDoseToDepth)} DOT
            </Badge>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {phaseSummaries.map((phase) => (
            <div key={phase.phaseName} className="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={labelClass}>{phase.phaseName}</p>
                  <p className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
                    {phase.completedFractions}/{phase.plannedFractions} fx
                  </p>
                </div>
                <Badge variant={phase.completedFractions >= phase.plannedFractions && phase.plannedFractions > 0 ? "success" : "default"}>
                  {phase.energyKv} kV
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-[var(--color-text-muted)]">
                <span>{phase.dosePerFractionCgy} cGy/fx</span>
                <span>{phase.ssdCm} cm SSD</span>
                <span>{phase.fieldSizeCm}</span>
                <span>{phase.treatmentTimeMinutes || "-"} min</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-b border-[var(--color-border-soft)] pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-[var(--radius-md)] border px-3 text-sm font-bold transition",
                  activeTab === tab.id
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {message ? (
          <div className="mt-3 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-success)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-3 text-sm font-semibold text-[var(--color-success)]">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-3 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-error)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] p-3 text-sm font-semibold text-[var(--color-error)]">
            {error}
          </div>
        ) : null}
      </div>

      {activeTab === "log" ? (
        <div className="p-4">
          <form
            key={selectedPhaseName}
            className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 md:grid-cols-4 xl:grid-cols-8"
            onSubmit={(event) => {
              event.preventDefault();
              addFraction(new FormData(event.currentTarget));
            }}
          >
            <label className="grid gap-1">
              <span className={labelClass}>Fx</span>
              <input name="fractionNumber" type="number" defaultValue={nextFractionNumber} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Date</span>
              <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Phase</span>
              <select
                name="phase"
                value={selectedPhaseName}
                onChange={(event) => setSelectedPhaseName(event.target.value)}
                className={inputClass}
              >
                {phaseSummaries.map((phase) => (
                  <option key={phase.phaseName} value={phase.phaseName}>
                    {phase.phaseName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Energy</span>
              <select name="energyKv" defaultValue={defaults.energyKv} className={inputClass}>
                <option value={50}>50 kV</option>
                <option value={70}>70 kV</option>
                <option value={100}>100 kV</option>
              </select>
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Field</span>
              <select name="fieldSizeCm" defaultValue={defaults.fieldSizeCm} className={inputClass}>
                {fieldSizeOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Dose</span>
              <input name="dosePerFractionCgy" type="number" defaultValue={defaults.dosePerFractionCgy} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>DOT</span>
              <input name="depthOfTargetMm" type="number" step="0.1" defaultValue={phases[0]?.depthOfTargetMm ?? 1} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>SSD</span>
              <input name="ssdCm" type="number" step="0.1" defaultValue={defaults.ssdCm} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Time</span>
              <input name="treatmentTimeMinutes" type="number" step="0.1" defaultValue={defaults.treatmentTimeMinutes} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Tech</span>
              <input name="technicianInitials" defaultValue="NR" className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>MD</span>
              <select name="mdApprovalState" defaultValue="PENDING" className={inputClass}>
                {approvalOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>DOT</span>
              <select name="dotApprovalState" defaultValue="APPROVED" className={inputClass}>
                {approvalOptions.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}
              </select>
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Override %</span>
              <input name="isodoseToDotPercent" type="number" step="0.1" min="0" className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Override Reason</span>
              <input name="isodoseOverrideReason" className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Setup Comments</span>
              <input name="treatmentSetupComments" className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Notes</span>
              <input name="notes" defaultValue="Native worksheet entry from CureRays CRMS." className={inputClass} />
            </label>
            <div className="flex items-end">
              <Button type="submit" disabled={pendingAction === "addFraction"} className="w-full">
                <Save className="h-4 w-4" aria-hidden="true" />
                {pendingAction === "addFraction" ? "Saving" : "Add Row"}
              </Button>
            </div>
          </form>

          <div className="scrollbar-soft mt-4 overflow-x-auto">
            <table className="w-full min-w-[1740px] border-collapse">
              <thead>
                <tr className="bg-[var(--color-table-header-bg)] text-left text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                  <th className="px-3 py-3">Fx</th>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Phase</th>
                  <th className="px-3 py-3">Energy</th>
                  <th className="px-3 py-3">SSD</th>
                  <th className="px-3 py-3">Field</th>
                  <th className="px-3 py-3">Dose/Fx</th>
                  <th className="px-3 py-3">Cumulative</th>
                  <th className="px-3 py-3">DOT Depth</th>
                  <th className="px-3 py-3">Isodose</th>
                  <th className="px-3 py-3">Dose to DOT</th>
                  <th className="px-3 py-3">Cum DOT</th>
                  <th className="px-3 py-3">Approvals</th>
                  <th className="px-3 py-3">Override</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-soft)]">
                {sortedEntries.map((entry) => {
                  const formId = `worksheet-row-${entry.id}`;
                  const warnings = compactWarnings(entry);
                  return (
                    <tr key={entry.id} className="bg-[var(--color-card)] align-top hover:bg-[var(--color-table-row-hover)]">
                      <td className="px-3 py-3">
                        <form
                          id={formId}
                          onSubmit={(event) => {
                            event.preventDefault();
                            updateFraction(new FormData(event.currentTarget));
                          }}
                        />
                        <input form={formId} name="id" type="hidden" value={entry.id} />
                        <RowInput formId={formId} name="fractionNumber" type="number" defaultValue={entry.fractionNumber} className="w-16" />
                      </td>
                      <td className="px-3 py-3"><RowInput formId={formId} name="date" type="date" defaultValue={entry.date} /></td>
                      <td className="px-3 py-3">
                        <RowSelect formId={formId} name="phase" defaultValue={entry.phase} options={phaseSummaries.map((phase) => phase.phaseName)} />
                      </td>
                      <td className="px-3 py-3">
                        <RowSelect formId={formId} name="energyKv" defaultValue={entry.energyKv ?? parseEnergyKv(entry.energy)} options={[50, 70, 100]} />
                      </td>
                      <td className="px-3 py-3"><RowInput formId={formId} name="ssdCm" type="number" step="0.1" defaultValue={entry.ssdCm ?? parseNumeric(entry.ssd) ?? 15} /></td>
                      <td className="px-3 py-3">
                        <RowSelect formId={formId} name="fieldSizeCm" defaultValue={normalizeFieldSizeCm(entry.fieldSizeCm)} options={fieldSizeOptions} />
                      </td>
                      <td className="px-3 py-3"><RowInput formId={formId} name="dosePerFractionCgy" type="number" defaultValue={entry.dosePerFractionCgy ?? entry.dosePerFraction} /></td>
                      <td className="px-3 py-3"><span className={calcClass}>{entry.cumulativeDoseCgy ?? entry.cumulativeDose}</span></td>
                      <td className="px-3 py-3"><RowInput formId={formId} name="depthOfTargetMm" type="number" step="0.1" defaultValue={entry.depthOfTargetMm ?? parseNumeric(entry.depthOfTarget)} /></td>
                      <td className="px-3 py-3"><span className={calcClass}>{entry.isodoseToDotPercent ?? entry.isodosePercent}%</span></td>
                      <td className="px-3 py-3"><span className={calcClass}>{entry.doseToDotCgy ?? entry.doseToDepth}</span></td>
                      <td className="px-3 py-3"><span className={calcClass}>{entry.cumulativeDoseToDotCgy ?? entry.cumulativeDoseToDepth}</span></td>
                      <td className="px-3 py-3">
                        <div className="grid gap-2">
                          <RowSelect formId={formId} name="mdApprovalState" defaultValue={entry.mdApprovalState ?? (entry.mdApproval ? "APPROVED" : "PENDING")} options={[...approvalOptions]} />
                          <RowSelect formId={formId} name="dotApprovalState" defaultValue={entry.dotApprovalState ?? (entry.dotApproval ? "APPROVED" : "PENDING")} options={[...approvalOptions]} />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="grid gap-2">
                          <RowInput formId={formId} name="isodoseToDotPercent" type="number" step="0.1" defaultValue={entry.isodoseOverrideReason ? entry.isodoseToDotPercent ?? entry.isodosePercent : ""} />
                          <RowInput formId={formId} name="isodoseOverrideReason" defaultValue={entry.isodoseOverrideReason} />
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="grid gap-2">
                          <Badge variant={entry.calculationStatus === "AUTO_LOOKUP" ? "success" : entry.calculationStatus === "MANUAL_OVERRIDE" ? "warning" : "info"}>
                            {(entry.calculationStatus ?? "LEGACY_IMPORTED").replaceAll("_", " ")}
                          </Badge>
                          {warnings.length ? <span className="max-w-[220px] text-xs font-semibold text-[var(--color-text-muted)]">{warnings[0]}</span> : null}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="grid gap-2">
                          <RowInput formId={formId} name="treatmentSetupComments" defaultValue={entry.treatmentSetupComments ?? entry.notes} />
                          <input form={formId} name="notes" type="hidden" defaultValue={entry.notes} />
                          <Button type="submit" form={formId} size="sm" variant="secondary" disabled={pendingAction === "updateFraction"}>
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {activeTab === "note" ? (
        <div className="grid gap-4 p-4 xl:grid-cols-[280px_1fr]">
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
            <p className={labelClass}>Fractions</p>
            <div className="mt-3 grid gap-2">
              {sortedEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={cn(
                    "flex items-center justify-between rounded-[var(--radius-md)] border px-3 py-2 text-left text-sm font-bold",
                    selectedEntry?.id === entry.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                      : "border-[var(--color-border-soft)] bg-[var(--color-card)] text-[var(--color-text)]"
                  )}
                >
                  <span>Fx {entry.fractionNumber}</span>
                  {entry.mdApproval && entry.dotApproval ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-4">
            {selectedEntry ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={labelClass}>Isodose Note</p>
                    <h4 className="mt-1 font-heading text-xl font-bold text-[var(--color-text)]">
                      Fx {selectedEntry.fractionNumber} | {formatDate(selectedEntry.date)}
                    </h4>
                  </div>
                  <Badge variant={selectedEntry.calculationStatus === "AUTO_LOOKUP" ? "success" : "warning"}>
                    {(selectedEntry.calculationStatus ?? "Legacy imported").toString().replaceAll("_", " ")}
                  </Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <span className={calcClass}>DOT {selectedEntry.depthOfTargetMm ?? parseNumeric(selectedEntry.depthOfTarget)} mm</span>
                  <span className={calcClass}>{selectedEntry.isodoseToDotPercent ?? selectedEntry.isodosePercent}%</span>
                  <span className={calcClass}>{selectedEntry.doseToDotCgy ?? selectedEntry.doseToDepth} cGy</span>
                  <span className={calcClass}>{selectedEntry.cumulativeDoseToDotCgy ?? selectedEntry.cumulativeDoseToDepth} cGy</span>
                </div>
                <p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 text-sm font-semibold leading-7 text-[var(--color-text)]">
                  {selectedEntry.isodoseNote ?? "No isodose note generated yet. Recalculate this row to generate the native CRMS note."}
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-[var(--color-text-muted)]">No fraction rows available.</p>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "reference" ? (
        <div className="scrollbar-soft overflow-x-auto p-4">
          <table className="w-full min-w-[980px] border-collapse">
            <thead>
              <tr className="bg-[var(--color-table-header-bg)] text-left text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                <th className="px-3 py-3">Energy</th>
                <th className="px-3 py-3">Field</th>
                {referenceDepths.map((depth) => <th key={depth} className="px-3 py-3">{depth.toFixed(1)}</th>)}
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

      {activeTab === "billing" ? (
        <div className="scrollbar-soft overflow-x-auto p-4">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-[var(--color-table-header-bg)] text-left text-[11px] font-bold uppercase text-[var(--color-text-muted)]">
                <th className="px-3 py-3">Fx</th>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Phase</th>
                <th className="px-3 py-3">Activity</th>
                <th className="px-3 py-3">CPT</th>
                <th className="px-3 py-3">Reviewer</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-soft)]">
              {billingRows.map((row) => (
                <tr key={row.id} className="bg-[var(--color-card)]">
                  <td className="px-3 py-3 font-bold text-[var(--color-primary)]">{row.fractionNumber}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-[var(--color-text)]">{formatDate(row.date)}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{row.phase}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{row.activity}</td>
                  <td className="px-3 py-3 text-sm font-bold text-[var(--color-text)]">{row.cptCode}</td>
                  <td className="px-3 py-3 text-sm font-semibold text-[var(--color-text-muted)]">{row.reviewer}</td>
                  <td className="px-3 py-3">
                    <Badge variant={row.status === "Ready" ? "success" : "warning"}>{row.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  );
}
