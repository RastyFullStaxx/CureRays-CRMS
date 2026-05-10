import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  Plus,
  Route,
  ShieldCheck,
  Upload,
  WalletCards
} from "lucide-react";
import type { ReactNode } from "react";
import type {
  AuditCheck,
  AuditEvent,
  CarepathWorkflowPhase,
  DocumentInstance,
  Patient,
  Task,
  TreatmentCourse,
  TreatmentFraction,
  TreatmentPlan,
  WorkflowStep
} from "@/lib/types";
import { cn } from "@/lib/workflow";
import {
  ActionCell,
  CheckLine,
  CompactTable,
  DonutSummary,
  FilterBar,
  MetricCard,
  MetricGrid,
  PhasePill,
  Pill,
  RailList,
  RolePill,
  Thumbnail,
  WorkflowStatusPill,
  WorkspaceButton
} from "./workspace-tab-primitives";
import {
  auditDetails,
  billingCodeRows,
  clinicalForms,
  clinicalNotes,
  documentActivities,
  imagingGuidanceRows,
  imagingRows,
  requiredImageAssets
} from "./workspace-tab-data";

const phaseOrder: CarepathWorkflowPhase[] = ["CONSULTATION", "CHART_PREP", "SIMULATION", "PLANNING", "ON_TREATMENT", "POST_TX", "AUDIT"];

function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" | "orange" | "red" }) {
  const color = tone === "green" ? "bg-emerald-500" : tone === "orange" ? "bg-[#F59E0B]" : tone === "red" ? "bg-rose-500" : "bg-[#0033A0]";
  return (
    <div className="h-2 w-28 overflow-hidden rounded-full bg-[#E7EEF8]">
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

export function CarepathWorkspaceTab({ steps }: { steps: WorkflowStep[] }) {
  const completed = steps.filter((step) => ["COMPLETED", "SIGNED", "UPLOADED"].includes(step.status)).length;
  const ready = steps.filter((step) => step.status === "READY_FOR_REVIEW").length;
  const blocked = steps.filter((step) => step.status === "BLOCKED" || step.blockers.length).length;
  const signatures = steps.filter((step) => step.requiresSignature && !step.signedAt).length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#061A55]">Carepath Workflow</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Course workflow steps, document requirements, and signature/audit completion.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkspaceButton><FileText className="h-4 w-4" /> View Carepath Document</WorkspaceButton>
            <WorkspaceButton>Actions</WorkspaceButton>
          </div>
        </div>
        <MetricGrid>
          <MetricCard label="Completed Steps" value={`${completed}/${steps.length}`} detail="40%" tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
          <MetricCard label="Pending Steps" value={steps.length - completed} detail="40%" tone="blue" icon={<FileText className="h-5 w-5" />} />
          <MetricCard label="Ready for Review" value={ready} detail="13%" tone="orange" icon={<Clock3 className="h-5 w-5" />} />
          <MetricCard label="Blocked" value={blocked} detail="7%" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard label="Signatures Needed" value={signatures} detail="13%" tone="purple" icon={<FileCheck2 className="h-5 w-5" />} />
        </MetricGrid>
      </section>

      <section className="grid gap-3 lg:grid-cols-5">
        {phaseOrder.slice(0, 5).map((phase) => {
          const phaseSteps = steps.filter((step) => step.phase === phase);
          const done = phaseSteps.filter((step) => ["COMPLETED", "SIGNED", "UPLOADED"].includes(step.status)).length;
          return (
            <div key={phase} className="rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.04)]">
              <PhasePill phase={phase} />
              <p className="mt-3 text-xl font-bold text-[#061A55]">{done}/{phaseSteps.length || 1}</p>
              <p className="text-xs font-semibold text-[#3D5A80]">steps ready</p>
            </div>
          );
        })}
      </section>

      <CompactTable
        minWidth="1540px"
        columns={[
          { header: "Step" },
          { header: "Phase" },
          { header: "Document / Action" },
          { header: "Status" },
          { header: "Responsible Role" },
          { header: "Due / Trigger" },
          { header: "Note Action" },
          { header: "CPT / Code" },
          { header: "Audit" },
          { header: "Actions" }
        ]}
        rows={steps.map((step) => ({
          id: step.id,
          cells: [
            <span key="step" className="font-bold">{step.stepNumber}</span>,
            <PhasePill key="phase" phase={step.phase} />,
            <div key="doc"><p className="font-bold">{step.stepName}</p><p className="mt-1 text-xs font-semibold text-[#3D5A80]">{step.linkedDocumentId ?? "DOC pending"}</p></div>,
            <WorkflowStatusPill key="status" status={step.status} />,
            <RolePill key="role" role={step.responsibleRole} />,
            <div key="due"><p className="font-bold">{step.dueDate ?? "During course"}</p><p className="mt-1 max-w-56 text-xs font-semibold text-[#3D5A80]">{step.triggerEvent}</p></div>,
            <span key="note" className="text-sm font-semibold text-[#3D5A80]">{step.notes ?? "Open note action"}</span>,
            <span key="cpt" className="font-bold text-[#0033A0]">{step.stepNumber === 7 ? "77300" : step.stepNumber >= 8 ? "77439" : "N/A"}</span>,
            <span key="audit" className="text-sm font-semibold text-[#3D5A80]">{step.auditChecklist.length ? "Evidence tracked" : "Pending"}</span>,
            <div key="actions" className="flex gap-2"><WorkspaceButton className="h-8 px-2 py-1 text-xs">Open</WorkspaceButton><WorkspaceButton className="h-8 px-2 py-1 text-xs">Route</WorkspaceButton></div>
          ]
        }))}
      />
    </div>
  );
}

export function ClinicalWorkspaceTab({ patient }: { patient: Patient }) {
  const signed = clinicalForms.filter((form) => form.status === "SIGNED").length;
  const ready = clinicalForms.filter((form) => form.status === "READY_FOR_REVIEW").length;
  const drafts = clinicalForms.filter((form) => form.status === "DRAFT").length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#061A55]">Clinical Forms & Mapping</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Clinical assessments, mapping forms, and structured form responses.</p>
          </div>
          <WorkspaceButton variant="primary"><Plus className="h-4 w-4" /> New Clinical Form</WorkspaceButton>
        </div>
        <MetricGrid>
          <MetricCard label="Draft Forms" value={drafts} detail="8%" tone="purple" icon={<FileText className="h-5 w-5" />} />
          <MetricCard label="Ready for Review" value={ready} detail="17%" tone="orange" icon={<Clock3 className="h-5 w-5" />} />
          <MetricCard label="Signed / Complete" value={signed} detail="67%" tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
          <MetricCard label="Missing Fields" value={1} detail="8%" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard label="Archived" value={0} detail="0%" tone="slate" icon={<FileCheck2 className="h-5 w-5" />} />
        </MetricGrid>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)] xl:col-span-2">
          <h3 className="text-lg font-bold text-[#061A55]">Clinical Summary</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ["Diagnosis", patient.diagnosis],
              ["ICD Code", "C44.301"],
              ["Diagnosis Type", "Skin"],
              ["Site / Laterality", `${patient.location} / Midline`],
              ["Treatment Indication", "Definitive orthovoltage radiation course"],
              ["Treating MD", patient.physician],
              ["PCP", "Doctor PCP placeholder"],
              ["Current Assessment", "Stable for continued treatment workflow"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#F8FBFF] p-3">
                <p className="text-xs font-bold uppercase text-[#3D5A80]">{label}</p>
                <p className="mt-1 text-sm font-bold text-[#061A55]">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Clinical Readiness</h3>
          <div className="mt-4 space-y-3">
            <CheckLine>Required mapping forms completed</CheckLine>
            <CheckLine>Prescription documented</CheckLine>
            <CheckLine state="warning">Weekly physics chart check pending</CheckLine>
            <CheckLine state="warning">Follow-up assessment not started</CheckLine>
          </div>
        </div>
      </section>

      <FilterBar searchPlaceholder="Search clinical forms, diagnosis, or notes..." filters={["All Diagnoses", "All Form Types", "All Status", "All Phases"]} />
      <CompactTable
        minWidth="1160px"
        columns={[{ header: "Form / Template" }, { header: "Diagnosis" }, { header: "Phase" }, { header: "Status" }, { header: "Completion" }, { header: "Last Updated" }, { header: "Actions" }]}
        rows={clinicalForms.map((form) => ({
          id: form.id,
          cells: [
            <div key="form"><p className="font-bold">{form.name}</p><p className="mt-1 text-xs font-semibold text-[#3D5A80]">{form.description}</p></div>,
            <Pill key="diag" tone="blue">{form.diagnosis}</Pill>,
            typeof form.phase === "string" && form.phase !== "N/A" ? <PhasePill key="phase" phase={form.phase} /> : "N/A",
            <WorkflowStatusPill key="status" status={form.status} />,
            <div key="completion" className="flex items-center gap-2"><span className="w-9 text-xs font-bold">{form.completion}%</span><ProgressBar value={form.completion} tone={form.completion === 100 ? "green" : "orange"} /></div>,
            <div key="updated"><p>{form.lastUpdated}</p><p className="text-xs font-semibold text-[#3D5A80]">{form.owner}</p></div>,
            <ActionCell key="action" />
          ]
        }))}
      />
    </div>
  );
}

export function TreatmentWorkspaceTab({ course, plan, fractions }: { course: TreatmentCourse; plan?: TreatmentPlan; fractions: TreatmentFraction[] }) {
  const percent = Math.round((course.currentFraction / course.totalFractions) * 100);
  const recent = fractions.slice(0, 6);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#061A55]">Treatment Planning & Delivery</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Treatment plan parameters, fractionation progress, and daily treatment delivery.</p>
          </div>
          <WorkspaceButton>Open Full Treatment Plan</WorkspaceButton>
        </div>
        <section className="grid gap-3 xl:grid-cols-4">
          <MetricCard label="Prescription" value={course.dose ?? "50 Gy / 20 fx"} detail={course.treatmentModality} tone="blue" icon={<FileText className="h-5 w-5" />} />
          <MetricCard label="Total Dose" value={plan?.totalDose ?? "50 Gy"} detail={`${plan?.dosePerFraction ?? "2.5 Gy"} per fraction`} tone="green" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard label="Fractions Completed" value={`${course.currentFraction}/${course.totalFractions}`} detail={`${percent}% delivered`} tone="orange" icon={<ClipboardCheck className="h-5 w-5" />} />
          <MetricCard label="Next Fraction" value="#13" detail="Apr 28, 2026" tone="purple" icon={<CalendarDays className="h-5 w-5" />} />
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_220px_1fr]">
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Treatment Course</h3>
          <div className="mt-4 grid gap-3">
            {[
              ["Technique", "Orthovoltage IG-SRT"],
              ["Energy", plan?.energy ?? course.energy ?? "50 kV"],
              ["Applicator", plan?.applicatorSize ?? course.applicator ?? "2.5 cm cone"],
              ["DOI at Sim", plan?.depthOfInvasion ?? course.targetDepth ?? "4 mm"],
              ["Sessions / Week", "Mon - Fri"],
              ["Phase I", "12 / 20 fx (60%)"],
              ["Phase II", "Pending protocol decision"]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 text-sm"><span className="font-semibold text-[#3D5A80]">{label}</span><span className="text-right font-bold text-[#061A55]">{value}</span></div>
            ))}
          </div>
        </div>
        <DonutSummary label="Fraction Progress" value={percent} center={`${course.currentFraction}`} segments={[{ label: "Completed", value: course.currentFraction, tone: "blue" }, { label: "Remaining", value: course.totalFractions - course.currentFraction, tone: "slate" }]} />
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Verification / QA</h3>
          <div className="mt-4 space-y-3">
            <CheckLine>Plan QA passed Apr 9, 2026</CheckLine>
            <CheckLine>Rad Onc signature signed</CheckLine>
            <CheckLine>Simulation images verified</CheckLine>
            <CheckLine state="warning">Weekly physics chart check due</CheckLine>
          </div>
        </div>
      </section>

      <CompactTable
        minWidth="1120px"
        columns={[{ header: "Fraction" }, { header: "Date" }, { header: "Phase" }, { header: "Dose Delivered" }, { header: "Imaging" }, { header: "Setup" }, { header: "Provider Review" }, { header: "Status" }, { header: "Actions" }]}
        rows={recent.map((fraction) => ({
          id: fraction.id,
          cells: [
            fraction.fractionNumber,
            fraction.treatmentDate,
            fraction.phase,
            `${fraction.deliveredDose ?? 0} Gy`,
            fraction.imageGuidanceCompleted ? "Completed" : "Pending",
            fraction.applicator ?? "Verified",
            fraction.physicianReviewedAt ? "Reviewed" : "Pending",
            <WorkflowStatusPill key="status" status={fraction.status} />,
            <ActionCell key="action" />
          ]
        }))}
      />
    </div>
  );
}

export function ImagingWorkspaceTab() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#061A55]">Imaging & Visual Documentation</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">All imaging studies, photos, and annotated visuals for treatment planning and daily guidance.</p>
          </div>
          <WorkspaceButton variant="primary"><Upload className="h-4 w-4" /> Upload Imaging</WorkspaceButton>
        </div>
        <MetricGrid>
          <MetricCard label="Total Studies" value={14} detail="All time" tone="purple" icon={<ImageIcon className="h-5 w-5" />} />
          <MetricCard label="US Images" value={28} detail="This course" tone="orange" icon={<ImageIcon className="h-5 w-5" />} />
          <MetricCard label="X-ray Images" value={12} detail="This course" tone="green" icon={<ImageIcon className="h-5 w-5" />} />
          <MetricCard label="Clinical Photos" value={18} detail="This course" tone="blue" icon={<ImageIcon className="h-5 w-5" />} />
          <MetricCard label="Documents" value={6} detail="This course" tone="slate" icon={<FileText className="h-5 w-5" />} />
        </MetricGrid>
      </section>
      <FilterBar searchPlaceholder="Search imaging studies..." filters={["All Modality", "All Phase", "All Date Range", "All Uploader"]} />
      <CompactTable
        minWidth="1180px"
        columns={[{ header: "Preview" }, { header: "Study / Description" }, { header: "Modality" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Uploaded By" }, { header: "Status" }, { header: "Actions" }]}
        rows={imagingRows.map((row, index) => ({
          id: row.id,
          cells: [
            <Thumbnail key="thumb" label={row.modality} tone={index % 3 === 0 ? "purple" : index % 3 === 1 ? "orange" : "green"} />,
            <div key="desc"><p className="font-bold">{row.title}</p><p className="mt-1 text-xs font-semibold text-[#3D5A80]">{row.description}</p><Pill tone="blue">{row.source}</Pill></div>,
            <Pill key="modality" tone={row.modality === "Ultrasound" ? "orange" : row.modality === "X-ray" ? "purple" : "green"}>{row.modality}</Pill>,
            typeof row.phase === "string" && row.phase !== "Mapping" ? <PhasePill key="phase" phase={row.phase} /> : <Pill key="phase" tone="blue">Mapping</Pill>,
            row.uploaded,
            row.uploadedBy,
            <WorkflowStatusPill key="status" status={row.status} />,
            <ActionCell key="action" />
          ]
        }))}
      />
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Required Visual Assets</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {requiredImageAssets.map((asset, index) => <CheckLine key={asset} state={index > 7 ? "warning" : "complete"}>{asset}</CheckLine>)}
          </div>
        </div>
        <CompactTable
          minWidth="760px"
          columns={[{ header: "Date" }, { header: "Modality" }, { header: "Energy" }, { header: "Applicator" }, { header: "DOI" }, { header: "Coverage" }, { header: "Reviewer" }, { header: "Status" }]}
          rows={imagingGuidanceRows.map((row) => ({
            id: row.id,
            cells: [row.date, row.modality, row.energy, row.applicator, row.doi, row.coverage, row.reviewer, <WorkflowStatusPill key="status" status={row.status} />]
          }))}
        />
      </section>
    </div>
  );
}

export function DocumentsWorkspaceTab({ documents }: { documents: DocumentInstance[] }) {
  const completed = documents.filter((doc) => doc.signedAt).length;
  const uploaded = documents.filter((doc) => doc.uploadedToEcwAt).length;
  const pending = documents.length - completed;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div><h2 className="text-xl font-bold text-[#061A55]">Documents</h2><p className="mt-1 text-sm font-semibold text-[#3D5A80]">All documents, versions, signatures, and uploads organized by category.</p></div>
          <WorkspaceButton variant="primary"><Upload className="h-4 w-4" /> Upload Document</WorkspaceButton>
        </div>
        <MetricGrid>
          <MetricCard label="Total Documents" value={86} detail="All time" tone="purple" icon={<FileText className="h-5 w-5" />} />
          <MetricCard label="Ready for Review" value={12} detail="Require attention" tone="orange" icon={<Clock3 className="h-5 w-5" />} />
          <MetricCard label="Pending Signatures" value={pending} detail="Awaiting signatures" tone="orange" icon={<FileCheck2 className="h-5 w-5" />} />
          <MetricCard label="Completed" value={completed || 59} detail="Fully processed" tone="green" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard label="Uploaded" value={uploaded} detail="eCW placeholders" tone="blue" icon={<Upload className="h-5 w-5" />} />
        </MetricGrid>
      </section>
      <FilterBar searchPlaceholder="Search documents..." filters={["All Categories", "All Status", "All Phases", "All Uploaders", "All Date Range"]} />
      <CompactTable
        minWidth="1260px"
        columns={[{ header: "Document" }, { header: "Category" }, { header: "Phase" }, { header: "Status" }, { header: "Version" }, { header: "Updated" }, { header: "Signature" }, { header: "eCW Upload" }, { header: "Action" }]}
        rows={documents.map((doc) => ({
          id: doc.id,
          cells: [
            <div key="doc"><p className="font-bold">{doc.title}</p><p className="mt-1 text-xs font-semibold text-[#3D5A80]">{doc.id}</p></div>,
            <Pill key="cat" tone="blue">{doc.category.replaceAll("_", " ")}</Pill>,
            doc.category.replaceAll("_", " "),
            <WorkflowStatusPill key="status" status={doc.lockedAt ? "LOCKED" : doc.status} />,
            `v${doc.version}.0`,
            doc.generatedAt ?? "Pending",
            doc.signedAt ? "Signed" : "Pending signature",
            doc.uploadedToEcwAt ? "Uploaded" : "Needs upload",
            <ActionCell key="action" />
          ]
        }))}
      />
    </div>
  );
}

export function TasksWorkspaceTab({ tasks }: { tasks: Task[] }) {
  const columns: Array<{ label: string; status: string; tone: "blue" | "green" | "orange" | "slate" }> = [
    { label: "To Do", status: "PENDING", tone: "slate" },
    { label: "In Progress", status: "IN_PROGRESS", tone: "orange" },
    { label: "Review", status: "READY_FOR_REVIEW", tone: "blue" },
    { label: "Completed", status: "COMPLETED", tone: "green" }
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div><h2 className="text-xl font-bold text-[#061A55]">Tasks</h2><p className="mt-1 text-sm font-semibold text-[#3D5A80]">Manage patient and course tasks, follow-ups, and action items.</p></div>
          <WorkspaceButton variant="primary"><Plus className="h-4 w-4" /> Add Task</WorkspaceButton>
        </div>
        <FilterBar searchPlaceholder="Search tasks..." filters={["Assigned to: All", "Priority: All", "Status: All", "Task Type: All", "Due: All"]} />
      </section>
      <section className="grid gap-3 xl:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => column.status === "COMPLETED" ? task.completedAt || task.status === "COMPLETED" : task.status === column.status).slice(0, 4);
          const fallback = columnTasks.length ? columnTasks : tasks.slice(0, 3);
          return (
            <div key={column.label} className="rounded-2xl border border-[#D8E4F5] bg-[#F8FBFF] p-3 shadow-[0_8px_24px_rgba(0,51,160,0.04)]">
              <div className="mb-3 flex items-center justify-between">
                <Pill tone={column.tone}>{column.label}</Pill>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#061A55]">{fallback.length}</span>
              </div>
              <div className="space-y-3">
                {fallback.map((task) => (
                  <div key={`${column.label}-${task.id}`} className="rounded-xl border border-[#D8E4F5] bg-white p-3">
                    <div className="flex items-start justify-between gap-2"><p className="text-sm font-bold text-[#061A55]">{task.title}</p><Pill tone={task.priority === "URGENT" || task.priority === "HIGH" ? "red" : task.priority === "MEDIUM" ? "orange" : "blue"}>{task.priority}</Pill></div>
                    <p className="mt-2 text-xs font-semibold text-[#3D5A80]">Course 2401 · {task.status.replaceAll("_", " ")}</p>
                    <p className="mt-3 text-xs font-bold text-[#3D5A80]">Due {task.dueDate ?? "Next workflow step"}</p>
                    <p className="mt-1 text-xs font-semibold text-[#3D5A80]">{task.assignedUserId ?? task.assignedRole}</p>
                  </div>
                ))}
              </div>
              <WorkspaceButton variant="ghost" className="mt-3 w-full"><Plus className="h-4 w-4" /> Add Task</WorkspaceButton>
            </div>
          );
        })}
      </section>
      <MetricGrid columns="xl:grid-cols-4">
        <MetricCard label="Overdue" value={2} detail="Tasks past due" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
        <MetricCard label="Due Today" value={1} detail="Due within 24 hours" tone="orange" icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard label="Due This Week" value={7} detail="Due within 7 days" tone="blue" icon={<CalendarDays className="h-5 w-5" />} />
        <MetricCard label="Average Completion" value="86%" detail="This course" tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
      </MetricGrid>
    </div>
  );
}

export function BillingWorkspaceTab() {
  const blocked = billingCodeRows.filter((row) => row.status === "BLOCKED").length;
  const pending = billingCodeRows.filter((row) => ["PENDING", "READY_FOR_REVIEW", "NEEDS_REVIEW"].includes(row.status)).length;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div><h2 className="text-xl font-bold text-[#061A55]">Billing Summary</h2><p className="mt-1 text-sm font-semibold text-[#3D5A80]">CPT/code tracking, pre-authorization, charges, and audit readiness.</p></div>
          <WorkspaceButton variant="primary"><Plus className="h-4 w-4" /> Create Invoice</WorkspaceButton>
        </div>
        <MetricGrid>
          <MetricCard label="Pre-auth Status" value="Pending" detail="Ordered work in review" tone="orange" icon={<Route className="h-5 w-5" />} />
          <MetricCard label="Billable Items" value={billingCodeRows.length} detail="This course" tone="blue" icon={<WalletCards className="h-5 w-5" />} />
          <MetricCard label="Pending Documentation" value={pending} detail="Require attention" tone="orange" icon={<FileText className="h-5 w-5" />} />
          <MetricCard label="Denied / Flagged Codes" value={blocked} detail="Needs correction" tone="red" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard label="Audit Readiness" value="82%" detail="Billing evidence" tone="green" icon={<ShieldCheck className="h-5 w-5" />} />
        </MetricGrid>
      </section>
      <FilterBar searchPlaceholder="Search claims, CPT, or treatment..." filters={["Status: All", "Claim Type: All", "Date Range: All"]} />
      <CompactTable
        minWidth="1500px"
        columns={[{ header: "Code Family" }, { header: "CPT / Code" }, { header: "2025 Code" }, { header: "2026 Code" }, { header: "Frequency" }, { header: "Qty Planned" }, { header: "Qty Billed" }, { header: "Related Document" }, { header: "Status" }, { header: "Notes" }]}
        rows={billingCodeRows.map((row) => ({
          id: row.id,
          cells: [row.family, <span key="code" className="font-bold text-[#0033A0]">{row.code}</span>, row.code2025, row.code2026, row.frequency, row.planned, row.billed, row.document, <WorkflowStatusPill key="status" status={row.status} />, row.notes]
        }))}
      />
      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Pre-auth Ordered vs Justified</h3>
          <div className="mt-4 space-y-3">
            <CheckLine>Simulation and mapping work ordered</CheckLine>
            <CheckLine>Planning documents support dose calculation work</CheckLine>
            <CheckLine state="warning">OTV note required before next management billing interval</CheckLine>
          </div>
        </div>
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Course Totals by Phase</h3>
          <div className="mt-4 grid gap-3">
            {["Consultation", "Chart Prep", "Planning", "On-Treatment", "Post-TX"].map((phase, index) => (
              <div key={phase} className="flex items-center justify-between border-b border-[#E7EEF8] pb-2 text-sm font-bold text-[#061A55]"><span>{phase}</span><span>${(1200 + index * 850).toLocaleString()}</span></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function NotesWorkspaceTab() {
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div><h2 className="text-xl font-bold text-[#061A55]">Clinical Notes</h2><p className="mt-1 text-sm font-semibold text-[#3D5A80]">Patient notes and communications across the care continuum.</p></div>
          <WorkspaceButton variant="primary"><Plus className="h-4 w-4" /> Add Note</WorkspaceButton>
        </div>
        <FilterBar searchPlaceholder="Search notes..." filters={["Note Type: All", "Author: All", "Date Range: All"]} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <CompactTable
          minWidth="980px"
          columns={[{ header: "Note / Subject" }, { header: "Type" }, { header: "Author" }, { header: "Date / Time" }, { header: "Visibility" }, { header: "Source" }, { header: "Actions" }]}
          rows={clinicalNotes.map((note) => ({
            id: note.id,
            cells: [
              <div key="note"><p className="font-bold">{note.title}</p><p className="mt-1 max-w-md text-xs font-semibold text-[#3D5A80]">{note.preview}</p></div>,
              <Pill key="cat" tone={note.category === "Communication" ? "red" : note.category === "Workflow" ? "orange" : "blue"}>{note.category}</Pill>,
              <div key="author"><p>{note.author}</p><p className="text-xs font-semibold text-[#3D5A80]">{note.role}</p></div>,
              note.timestamp,
              <Pill key="visibility" tone={note.visibility === "Billing" ? "purple" : "green"}>{note.visibility}</Pill>,
              note.source,
              <ActionCell key="action" />
            ]
          }))}
        />
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Note Composer</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-3 text-sm font-bold text-[#061A55]">Category: Clinical</div>
            <div className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-3 text-sm font-bold text-[#061A55]">Visibility: Care Team</div>
            <div className="min-h-28 rounded-xl border border-[#D8E4F5] bg-white p-3 text-sm font-semibold text-[#3D5A80]">Write a PHI-safe placeholder note...</div>
            <WorkspaceButton variant="primary" className="w-full">Save Note Draft</WorkspaceButton>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AuditWorkspaceTab({ checks, readiness }: { checks: AuditCheck[]; events: AuditEvent[]; readiness: number }) {
  const complete = checks.filter((check) => check.status === "COMPLETED").length;
  const missing = checks.filter((check) => ["BLOCKED", "OVERDUE", "PENDING"].includes(check.status)).length;
  const selected = auditDetails[0];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div><h2 className="text-xl font-bold text-[#061A55]">Audit Dashboard</h2><p className="mt-1 text-sm font-semibold text-[#3D5A80]">Monitor documentation compliance and billing audit status for this patient’s course.</p></div>
          <div className="flex flex-wrap gap-2"><WorkspaceButton>Run Audit Check</WorkspaceButton><WorkspaceButton variant="primary">Create Audit Report</WorkspaceButton></div>
        </div>
        <MetricGrid>
          <MetricCard label="Overall Audit" value={`${readiness}%`} detail="Excellent" tone="green" icon={<ShieldCheck className="h-5 w-5" />} />
          <MetricCard label="Documents Complete" value={`${complete}/${checks.length}`} detail="Signed evidence" tone="green" icon={<FileCheck2 className="h-5 w-5" />} />
          <MetricCard label="CPT Codes Validated" value="18/20" detail="90%" tone="blue" icon={<WalletCards className="h-5 w-5" />} />
          <MetricCard label="Issues to Resolve" value={missing} detail="Minor" tone="orange" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard label="Ready for Billing" value="Yes" detail="Major items complete" tone="green" icon={<CheckCircle2 className="h-5 w-5" />} />
        </MetricGrid>
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <CompactTable
          minWidth="1120px"
          columns={[{ header: "Document / Item" }, { header: "Status" }, { header: "Requirement" }, { header: "CPT Code(s)" }, { header: "Evidence" }, { header: "Last Updated" }, { header: "Actions" }]}
          rows={checks.map((check, index) => ({
            id: check.id,
            cells: [
              <div key="item"><p className="font-bold">{index + 1}. {check.label}</p><p className="mt-1 text-xs font-semibold text-[#3D5A80]">{check.category}</p></div>,
              <WorkflowStatusPill key="status" status={check.status} />,
              check.required ? "Required" : "Optional",
              index % 3 === 0 ? "99213" : index % 3 === 1 ? "77439" : "N/A",
              check.evidenceDocumentId ?? "Evidence pending",
              check.completedAt ?? "Apr 26, 2026",
              <ActionCell key="action" />
            ]
          }))}
        />
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">{selected.title}</h3>
          <div className="mt-4 space-y-4">
            <div><p className="text-xs font-bold uppercase text-[#3D5A80]">Completion Steps</p><div className="mt-2 space-y-2">{selected.steps.map((step) => <CheckLine key={step} state="info">{step}</CheckLine>)}</div></div>
            <div><p className="text-xs font-bold uppercase text-[#3D5A80]">Required Evidence</p><div className="mt-2 flex flex-wrap gap-2">{selected.evidence.map((item) => <Pill key={item} tone="blue">{item}</Pill>)}</div></div>
            <div><p className="text-xs font-bold uppercase text-[#3D5A80]">Billing Codes</p><div className="mt-2 flex flex-wrap gap-2">{selected.codes.map((code) => <Pill key={code} tone="orange">{code}</Pill>)}</div></div>
            <div><p className="text-xs font-bold uppercase text-[#3D5A80]">Responsible Parties</p><div className="mt-2 flex flex-wrap gap-2">{selected.parties.map((party) => <RolePill key={party} role={party} />)}</div></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function WorkspaceTabRail({
  activeTab,
  course,
  patient,
  tasks,
  documents,
  checks,
  readiness
}: {
  activeTab: string;
  course: TreatmentCourse;
  patient: Patient;
  tasks: Task[];
  documents: DocumentInstance[];
  checks: AuditCheck[];
  readiness: number;
}) {
  if (activeTab === "carepath") {
    return (
      <>
        <DonutSummary label="Carepath Summary" value={40} segments={[{ label: "Completed", value: 6, tone: "green" }, { label: "Ready for Review", value: 2, tone: "orange" }, { label: "Pending", value: 6, tone: "blue" }, { label: "Blocked", value: 1, tone: "red" }]} />
        <RailPanel title="Current Blockers"><div className="rounded-xl border border-rose-200 bg-rose-50 p-4"><p className="font-bold text-[#061A55]">Step 7: Orthovoltage Prescription</p><p className="mt-2 text-sm font-semibold text-[#3D5A80]">Prescription document not generated. Required before treatment can proceed.</p><WorkspaceButton className="mt-3">Resolve</WorkspaceButton></div></RailPanel>
        <RailPanel title="Signature Queue"><RailList items={[{ title: "Clinical Treatment Planning Note", meta: "Step 5 · Rad Onc", badge: <Pill tone="orange">High</Pill> }, { title: "Treatment Summary", meta: "Step 13 · Rad Onc", badge: <Pill tone="orange">High</Pill> }]} /></RailPanel>
      </>
    );
  }

  if (activeTab === "clinical") {
    return (
      <>
        <DonutSummary label="Clinical Summary" value={67} segments={[{ label: "Signed / Complete", value: 8, tone: "green" }, { label: "Ready for Review", value: 2, tone: "orange" }, { label: "Draft", value: 1, tone: "purple" }, { label: "Missing Fields", value: 1, tone: "red" }]} />
        <RailPanel title="Quick Actions"><RailList items={[{ title: "New Clinical Form", meta: "Use a template or start blank" }, { title: "Upload Existing Form", meta: "Import completed document" }, { title: "Generate Clinical Note", meta: "From selected form data" }, { title: "Send for Signature", meta: "Route form for physician signature" }]} /></RailPanel>
        <RailPanel title="Clinical Notes"><RailList items={clinicalNotes.slice(0, 2).map((note) => ({ title: note.title, meta: note.timestamp }))} /></RailPanel>
      </>
    );
  }

  if (activeTab === "treatment") {
    return (
      <>
        <RailPanel title="Treatment Summary">
          <div className="space-y-3 text-sm font-bold text-[#061A55]">
            {[
              ["Course", "Course 2401"],
              ["Phase", "On Treatment (Phase I)"],
              ["Energy", course.energy ?? "50 kV"],
              ["Prescription", course.dose ?? "50 Gy in 20 fx"],
              ["Dose Delivered", "30 Gy (60%)"],
              ["Next Fraction", "#13 on Apr 28, 2026"],
              ["Treating MD", patient.physician]
            ].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><span className="text-[#3D5A80]">{label}</span><span className="text-right">{value}</span></div>)}
          </div>
        </RailPanel>
        <RailPanel title="Quick Actions"><RailList items={["Record Fraction", "New OTV Note", "Send to Physics", "Generate Prescription", "Print Plan Summary"].map((title) => ({ title }))} /></RailPanel>
        <RailPanel title="Alerts & Reminders"><RailList items={[{ title: "Physics weekly chart check due", meta: "Due by Apr 29, 2026", tone: "orange" }, { title: "Phase I completion approaching", meta: "Est. completion: May 7, 2026", tone: "blue" }]} /></RailPanel>
      </>
    );
  }

  if (activeTab === "imaging") {
    return (
      <>
        <DonutSummary label="Imaging Summary" value={60} center="60" segments={[{ label: "Ultrasound", value: 28, tone: "orange" }, { label: "X-ray", value: 12, tone: "purple" }, { label: "Clinical Photos", value: 18, tone: "green" }, { label: "Documents", value: 6, tone: "blue" }]} />
        <RailPanel title="Recent Uploads"><RailList items={imagingRows.slice(0, 3).map((row) => ({ title: row.title, meta: row.uploaded }))} /></RailPanel>
        <RailPanel title="Quick Actions"><RailList items={["Upload Imaging", "Add Clinical Photo", "Capture from Device", "Annotate / Markup", "Create Imaging Note"].map((title) => ({ title }))} /></RailPanel>
      </>
    );
  }

  if (activeTab === "documents") {
    return (
      <>
        <DonutSummary label="Document Storage" value={46} center="4.6" segments={[{ label: "PDF Documents", value: 46, tone: "red" }, { label: "Images / Photos", value: 28, tone: "purple" }, { label: "Word Documents", value: 17, tone: "blue" }, { label: "Other Files", value: 9, tone: "orange" }]} />
        <RailPanel title="Recent Activity"><RailList items={documentActivities.map((item) => ({ title: item.title, meta: `${item.detail} · ${item.time}` }))} /></RailPanel>
        <RailPanel title="Quick Actions"><RailList items={["Upload Document", "Create from Template", "Request Signature", "Document Checklist", "Scan & Upload"].map((title) => ({ title }))} /></RailPanel>
      </>
    );
  }

  if (activeTab === "tasks") {
    return (
      <>
        <DonutSummary label="Tasks Overview" value={41} center="29" segments={[{ label: "To Do", value: 7, tone: "slate" }, { label: "In Progress", value: 6, tone: "orange" }, { label: "Review", value: 4, tone: "blue" }, { label: "Completed", value: 12, tone: "green" }]} />
        <RailPanel title="Upcoming Due"><RailList items={tasks.slice(0, 3).map((task) => ({ title: task.title, meta: `${task.dueDate ?? "Due soon"} · ${task.assignedUserId ?? task.assignedRole}`, badge: <Pill tone={task.priority === "HIGH" || task.priority === "URGENT" ? "red" : "orange"}>{task.priority}</Pill> }))} /></RailPanel>
        <RailPanel title="Quick Actions"><RailList items={["Create Task", "Task Templates", "Task Checklist", "My Tasks", "Task Report"].map((title) => ({ title }))} /></RailPanel>
      </>
    );
  }

  if (activeTab === "billing") {
    return (
      <>
        <RailPanel title="Billing Navigator"><RailList items={["Create New Invoice", "Verify Insurance", "Claims Eligibility", "Code Lookup (CPT)", "Billing Reports"].map((title) => ({ title }))} /></RailPanel>
        <RailPanel title="Top CPT Codes"><RailList items={billingCodeRows.slice(0, 5).map((row) => ({ title: `${row.code} · ${row.description}`, meta: `Qty ${row.planned} · billed ${row.billed}` }))} /></RailPanel>
        <RailPanel title="Payment Summary"><RailList items={[{ title: "Total Payments", meta: "$9,650.00" }, { title: "Pending Insurance", meta: "$4,600.00" }]} /></RailPanel>
      </>
    );
  }

  if (activeTab === "notes") {
    return (
      <>
        <RailPanel title="Note Categories"><RailList items={["Clinical", "Assessment", "Procedure", "Communication", "Workflow", "Intake", "Administrative"].map((title, index) => ({ title, meta: `${12 - index} notes` }))} /></RailPanel>
        <RailPanel title="Recent Notes"><RailList items={clinicalNotes.slice(0, 5).map((note) => ({ title: note.title, meta: note.timestamp, badge: <Pill tone="blue">{note.category}</Pill> }))} /></RailPanel>
        <RailPanel title="Quick Actions"><RailList items={[{ title: "Add Clinical Note" }, { title: "Add Administrative Note" }]} /></RailPanel>
      </>
    );
  }

  if (activeTab === "audit") {
    return (
      <>
        <DonutSummary label="Audit Status Summary" value={readiness} center={`${checks.length}`} segments={[{ label: "Complete", value: 24, tone: "green" }, { label: "Pending", value: 1, tone: "orange" }, { label: "Incomplete", value: 1, tone: "red" }]} />
        <RailPanel title="Recent Audit Activity"><RailList items={[{ title: "Audit check completed", meta: "May 5, 2026 · System" }, { title: "Daily treatment records verified", meta: "May 5, 2026 · Mika Alvarez" }, { title: "Missing Mgmt note flagged", meta: "May 4, 2026 · System", tone: "orange" }, { title: "Billing claim review pending", meta: "May 4, 2026 · Billing Team" }]} /></RailPanel>
        <RailPanel title="Audit Actions"><RailList items={["Run Full Audit Check", "Generate Audit Report (PDF)", "View Audit History", "Add Audit Note"].map((title) => ({ title }))} /></RailPanel>
      </>
    );
  }

  return (
    <RailPanel title="Tab Actions">
      <RailList items={[{ title: patient.id, meta: documents.length ? "Patient workspace active" : "No document records" }]} />
    </RailPanel>
  );
}

function RailPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
      <h3 className="mb-4 text-lg font-bold text-[#061A55]">{title}</h3>
      {children}
    </section>
  );
}
