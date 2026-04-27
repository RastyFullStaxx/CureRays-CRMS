"use client";

import { useMemo, useState } from "react";
import { Check, FileOutput, Save, Stethoscope } from "lucide-react";
import type { GeneratedDocumentOutput, IgsrtWorkspace, PrescriptionPhase } from "@/lib/types";
import { DocumentStatusBadge } from "@/components/badges";
import { FractionLogTable } from "@/components/fraction-log-table";
import { DocumentLifecycleTable } from "@/components/document-lifecycle-table";
import { patientName } from "@/lib/workflow";

type ApiResult = {
  data?: IgsrtWorkspace | GeneratedDocumentOutput;
  workspace?: IgsrtWorkspace;
  auditEvent?: unknown;
};

const inputClass =
  "w-full rounded-lg border border-white/70 bg-white/70 px-3 py-2 text-sm font-semibold text-curerays-dark-plum outline-none ring-curerays-blue/20 transition focus:ring-2";
const labelClass = "text-xs font-bold uppercase text-curerays-indigo";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string) {
  return Number(formData.get(key) ?? 0);
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function IgsrtCrudWorkspace({ initialWorkspace }: { initialWorkspace: IgsrtWorkspace }) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [preview, setPreview] = useState<GeneratedDocumentOutput | null>(
    initialWorkspace.generatedDocumentOutputs[0] ?? null
  );
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const isPending = pendingAction !== null;

  const nextFractionNumber = useMemo(() => {
    const last = workspace.courseFractions.at(-1);
    return last ? last.fractionNumber + 1 : 1;
  }, [workspace.courseFractions]);

  async function requestJson(url: string, init: RequestInit) {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as ApiResult;
  }

  function updateWorkspaceFromResult(result: ApiResult) {
    if (result.workspace) {
      setWorkspace(result.workspace);
    } else if (result.data && "patient" in result.data) {
      setWorkspace(result.data);
    }

    if (result.data && "contentPreview" in result.data) {
      setPreview(result.data);
    }
  }

  async function runAction(action: string, callback: () => Promise<ApiResult>) {
    setPendingAction(action);
    try {
      const result = await callback();
      updateWorkspaceFromResult(result);
    } finally {
      setPendingAction(null);
    }
  }

  function saveSimulationOrder(formData: FormData) {
    runAction("simulation", async () =>
      requestJson("/api/igsrt", {
        method: "PATCH",
        body: JSON.stringify({
          resource: "simulationOrder",
          courseId: workspace.course.id,
          data: {
            lesionLocation: textValue(formData, "lesionLocation"),
            laterality: textValue(formData, "laterality"),
            lesionBorderInked: formData.has("lesionBorderInked"),
            allMarginsInked: formData.has("allMarginsInked"),
            phaseIMarginInstruction: textValue(formData, "phaseIMarginInstruction"),
            phaseIIMarginInstruction: textValue(formData, "phaseIIMarginInstruction"),
            chairSetup: textValue(formData, "chairSetup"),
            position: textValue(formData, "position"),
            setupPhotoChecklist: splitList(textValue(formData, "setupPhotoChecklist")),
            ultrasoundFrequencies: splitList(textValue(formData, "ultrasoundFrequencies")),
            weeklyPhysicsRequired: formData.has("weeklyPhysicsRequired"),
            weeklyPhysicsReason: textValue(formData, "weeklyPhysicsReason"),
            specialPhysicsRequired: formData.has("specialPhysicsRequired"),
            specialPhysicsReason: textValue(formData, "specialPhysicsReason"),
            inVivoDosimetryRequired: formData.has("inVivoDosimetryRequired"),
            radiationOncologist: textValue(formData, "radiationOncologist"),
            dateCompleted: textValue(formData, "dateCompleted") || null
          }
        })
      })
    );
  }

  function savePrescription(formData: FormData) {
    const currentPhase = workspace.prescription.phases[0];
    const phase: PrescriptionPhase = {
      ...currentPhase,
      energyKv: numberValue(formData, "energyKv"),
      phaseTotalDoseGy: numberValue(formData, "phaseTotalDoseGy"),
      dosePerFractionGy: numberValue(formData, "dosePerFractionGy"),
      totalFractions: numberValue(formData, "totalFractions"),
      timeMinutes: numberValue(formData, "timeMinutes"),
      ssdCm: numberValue(formData, "ssdCm"),
      applicatorSize: textValue(formData, "applicatorSize"),
      marginMm: numberValue(formData, "marginMm"),
      technique: textValue(formData, "technique"),
      shieldingDesign: textValue(formData, "shieldingDesign"),
      depthOfTargetMm: numberValue(formData, "depthOfTargetMm")
    };

    runAction("prescription", async () =>
      requestJson("/api/igsrt", {
        method: "PATCH",
        body: JSON.stringify({
          resource: "prescription",
          courseId: workspace.course.id,
          data: {
            site: textValue(formData, "site"),
            laterality: textValue(formData, "laterality"),
            verifiedInSensus: formData.has("verifiedInSensus"),
            priorRadiationTherapy: formData.has("priorRadiationTherapy"),
            preAuthorized: formData.has("preAuthorized"),
            imagingGuidance: splitList(textValue(formData, "imagingGuidance")),
            dateOrdered: textValue(formData, "dateOrdered") || null,
            phases: [phase]
          }
        })
      })
    );
  }

  function addFraction(formData: FormData) {
    runAction("fraction", async () =>
      requestJson("/api/igsrt", {
        method: "POST",
        body: JSON.stringify({
          action: "addFraction",
          data: {
            courseId: workspace.course.id,
            fractionNumber: numberValue(formData, "fractionNumber"),
            date: textValue(formData, "date"),
            phase: textValue(formData, "phase"),
            energy: textValue(formData, "energy"),
            ssd: textValue(formData, "ssd"),
            dosePerFraction: numberValue(formData, "dosePerFraction"),
            technicianInitials: textValue(formData, "technicianInitials"),
            mdApproval: formData.has("mdApproval"),
            dotApproval: formData.has("dotApproval"),
            depthOfTarget: textValue(formData, "depthOfTarget"),
            isodosePercent: numberValue(formData, "isodosePercent"),
            notes: textValue(formData, "notes")
          }
        })
      })
    );
  }

  function renderDocument(documentId: string) {
    runAction(`render-${documentId}`, async () =>
      requestJson("/api/igsrt", {
        method: "POST",
        body: JSON.stringify({
          action: "renderDocument",
          documentId,
          format: documentId.endsWith("FXLOG") ? "XLSX" : "PDF"
        })
      })
    );
  }

  function signDocument(documentId: string) {
    runAction(`sign-${documentId}`, async () =>
      requestJson("/api/igsrt", {
        method: "POST",
        body: JSON.stringify({
          action: "signDocument",
          documentId
        })
      })
    );
  }

  const order = workspace.simulationOrder;
  const rx = workspace.prescription;
  const phase = rx.phases[0];

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-glass p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-curerays-orange">System of record workspace</p>
            <h2 className="mt-2 text-2xl font-semibold text-curerays-dark-plum">
              {patientName(workspace.patient)} - {workspace.course.protocolName}
            </h2>
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">
              Structured IGSRT records now drive document status, task blockers, dose totals, and generated exports.
            </p>
          </div>
          <div className="grid gap-2 rounded-lg border border-white/70 bg-white/52 p-4 text-sm font-semibold text-curerays-indigo">
            <span>{workspace.course.currentFraction}/{workspace.course.totalFractions} fractions</span>
            <span>{workspace.courseDocuments.length} generated documents</span>
            <span>{workspace.auditEvents.length} audit events</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <form
          key={order.lastUpdatedAt}
          className="glass-panel rounded-glass p-5"
          onSubmit={(event) => {
            event.preventDefault();
            saveSimulationOrder(new FormData(event.currentTarget));
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-curerays-orange">Simulation order</p>
              <h3 className="mt-1 text-xl font-semibold text-curerays-dark-plum">CTP / SIM IGSRT</h3>
            </div>
            <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
              {order.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className={labelClass}>Lesion location</span>
              <input name="lesionLocation" defaultValue={order.lesionLocation} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Laterality</span>
              <input name="laterality" defaultValue={order.laterality} className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Phase I margin instruction</span>
              <textarea name="phaseIMarginInstruction" defaultValue={order.phaseIMarginInstruction} className={inputClass} rows={3} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Phase II margin instruction</span>
              <textarea name="phaseIIMarginInstruction" defaultValue={order.phaseIIMarginInstruction} className={inputClass} rows={2} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Chair setup</span>
              <input name="chairSetup" defaultValue={order.chairSetup} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Position</span>
              <input name="position" defaultValue={order.position} className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Setup photos</span>
              <input name="setupPhotoChecklist" defaultValue={order.setupPhotoChecklist.join(", ")} className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Ultrasound frequencies</span>
              <input name="ultrasoundFrequencies" defaultValue={order.ultrasoundFrequencies.join(", ")} className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Weekly physics reason</span>
              <textarea name="weeklyPhysicsReason" defaultValue={order.weeklyPhysicsReason} className={inputClass} rows={2} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Special physics reason</span>
              <textarea name="specialPhysicsReason" defaultValue={order.specialPhysicsReason} className={inputClass} rows={2} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Radiation oncologist</span>
              <input name="radiationOncologist" defaultValue={order.radiationOncologist} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Date completed</span>
              <input name="dateCompleted" type="date" defaultValue={order.dateCompleted ?? ""} className={inputClass} />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-curerays-indigo">
            <label className="inline-flex items-center gap-2">
              <input name="lesionBorderInked" type="checkbox" defaultChecked={order.lesionBorderInked} />
              Border inked
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="allMarginsInked" type="checkbox" defaultChecked={order.allMarginsInked} />
              All margins inked
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="weeklyPhysicsRequired" type="checkbox" defaultChecked={order.weeklyPhysicsRequired} />
              Weekly physics
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="specialPhysicsRequired" type="checkbox" defaultChecked={order.specialPhysicsRequired} />
              Special physics
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="inVivoDosimetryRequired" type="checkbox" defaultChecked={order.inVivoDosimetryRequired} />
              In vivo dosimetry
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-curerays-dark-plum px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-curerays-blue"
            disabled={isPending}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pendingAction === "simulation" ? "Saving" : "Save Simulation"}
          </button>
        </form>

        <form
          key={rx.lastUpdatedAt}
          className="glass-panel rounded-glass p-5"
          onSubmit={(event) => {
            event.preventDefault();
            savePrescription(new FormData(event.currentTarget));
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-curerays-orange">Prescription</p>
              <h3 className="mt-1 text-xl font-semibold text-curerays-dark-plum">Phase Parameters</h3>
            </div>
            <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
              {rx.status.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <label className="grid gap-1">
              <span className={labelClass}>Site</span>
              <input name="site" defaultValue={rx.site} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Laterality</span>
              <input name="laterality" defaultValue={rx.laterality} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Energy kV</span>
              <input name="energyKv" type="number" defaultValue={phase.energyKv} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Total dose Gy</span>
              <input name="phaseTotalDoseGy" type="number" step="0.1" defaultValue={phase.phaseTotalDoseGy} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Dose / fraction Gy</span>
              <input name="dosePerFractionGy" type="number" step="0.1" defaultValue={phase.dosePerFractionGy} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Fractions</span>
              <input name="totalFractions" type="number" defaultValue={phase.totalFractions} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Time minutes</span>
              <input name="timeMinutes" type="number" step="0.1" defaultValue={phase.timeMinutes} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>SSD cm</span>
              <input name="ssdCm" type="number" step="0.1" defaultValue={phase.ssdCm} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Applicator</span>
              <input name="applicatorSize" defaultValue={phase.applicatorSize} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Margin mm</span>
              <input name="marginMm" type="number" defaultValue={phase.marginMm} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Technique</span>
              <input name="technique" defaultValue={phase.technique} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>DOT mm</span>
              <input name="depthOfTargetMm" type="number" step="0.1" defaultValue={phase.depthOfTargetMm} className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Shielding design</span>
              <input name="shieldingDesign" defaultValue={phase.shieldingDesign} className={inputClass} />
            </label>
            <label className="grid gap-1 md:col-span-2">
              <span className={labelClass}>Imaging guidance</span>
              <input name="imagingGuidance" defaultValue={rx.imagingGuidance.join(", ")} className={inputClass} />
            </label>
            <label className="grid gap-1">
              <span className={labelClass}>Date ordered</span>
              <input name="dateOrdered" type="date" defaultValue={rx.dateOrdered ?? ""} className={inputClass} />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-curerays-indigo">
            <label className="inline-flex items-center gap-2">
              <input name="verifiedInSensus" type="checkbox" defaultChecked={rx.verifiedInSensus} />
              Verified in Sensus
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="preAuthorized" type="checkbox" defaultChecked={rx.preAuthorized} />
              Pre-authorized
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="priorRadiationTherapy" type="checkbox" defaultChecked={rx.priorRadiationTherapy} />
              Prior RT
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-curerays-dark-plum px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-curerays-blue"
            disabled={isPending}
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {pendingAction === "prescription" ? "Saving" : "Save Prescription"}
          </button>
        </form>
      </section>

      <section className="glass-panel rounded-glass p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-curerays-orange">Fraction CRUD</p>
            <h3 className="mt-1 text-xl font-semibold text-curerays-dark-plum">Daily Treatment Entry</h3>
          </div>
          <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
            Auto-calculates cumulative dose
          </span>
        </div>

        <form
          key={nextFractionNumber}
          className="mt-5 grid gap-3 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            addFraction(new FormData(event.currentTarget));
          }}
        >
          <label className="grid gap-1">
            <span className={labelClass}>Fraction</span>
            <input name="fractionNumber" type="number" defaultValue={nextFractionNumber} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Date</span>
            <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Phase</span>
            <input name="phase" defaultValue="Phase I" className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Energy</span>
            <input name="energy" defaultValue={`${phase.energyKv} kV`} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>SSD</span>
            <input name="ssd" defaultValue={`${phase.ssdCm} cm`} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Dose cGy</span>
            <input name="dosePerFraction" type="number" defaultValue={phase.dosePerFractionGy * 100} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>DOT</span>
            <input name="depthOfTarget" defaultValue={`${phase.depthOfTargetMm} mm`} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Isodose %</span>
            <input name="isodosePercent" type="number" defaultValue={90} className={inputClass} />
          </label>
          <label className="grid gap-1">
            <span className={labelClass}>Tech initials</span>
            <input name="technicianInitials" defaultValue="NR" className={inputClass} />
          </label>
          <label className="grid gap-1 md:col-span-3">
            <span className={labelClass}>Notes</span>
            <input name="notes" defaultValue="Structured fraction entry from CureRays CWS." className={inputClass} />
          </label>
          <div className="flex items-center gap-4 text-sm font-semibold text-curerays-indigo md:col-span-3">
            <label className="inline-flex items-center gap-2">
              <input name="mdApproval" type="checkbox" />
              MD approval
            </label>
            <label className="inline-flex items-center gap-2">
              <input name="dotApproval" type="checkbox" defaultChecked />
              DOT approval
            </label>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-curerays-orange px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-curerays-blue"
            disabled={isPending}
          >
            <Stethoscope className="h-4 w-4" aria-hidden="true" />
            {pendingAction === "fraction" ? "Adding" : "Add Fraction"}
          </button>
        </form>
      </section>

      <FractionLogTable entries={workspace.courseFractions} />

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="space-y-4">
          <DocumentLifecycleTable documents={workspace.courseDocuments} />
          <section className="grid gap-3 md:grid-cols-3">
            {workspace.courseDocuments.map((document) => (
              <article key={document.id} className="rounded-lg border border-white/72 bg-white/58 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-sm font-semibold text-curerays-dark-plum">{document.name}</h4>
                  <DocumentStatusBadge status={document.status} />
                </div>
                <p className="mt-2 text-sm leading-5 text-curerays-indigo">{document.requiredAction}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => renderDocument(document.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-curerays-dark-plum px-3 py-2 text-xs font-semibold text-white transition hover:bg-curerays-blue"
                    disabled={isPending}
                  >
                    <FileOutput className="h-3.5 w-3.5" aria-hidden="true" />
                    {pendingAction === `render-${document.id}` ? "Rendering" : "Render"}
                  </button>
                  <button
                    type="button"
                    onClick={() => signDocument(document.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/72 px-3 py-2 text-xs font-semibold text-curerays-dark-plum ring-1 ring-curerays-blue/10 transition hover:bg-white"
                    disabled={isPending}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                    {pendingAction === `sign-${document.id}` ? "Signing" : "Sign"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        </div>

        <section className="glass-panel rounded-glass p-5">
          <p className="text-sm font-semibold text-curerays-orange">Generated preview</p>
          <h3 className="mt-1 text-xl font-semibold text-curerays-dark-plum">
            {preview ? `${preview.format} v${preview.version}` : "No output rendered"}
          </h3>
          <pre className="scrollbar-soft mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-white/66 p-4 text-sm leading-6 text-curerays-dark-plum">
            {preview?.contentPreview ?? "Render a document to preview system-filled output."}
          </pre>
        </section>
      </section>
    </div>
  );
}
