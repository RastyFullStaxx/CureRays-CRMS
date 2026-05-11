import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ChevronRight,
  FileCheck2,
  FilePlus2,
  FileText,
  FolderOpen,
  History,
  Image as ImageIcon,
  ListChecks,
  MessageSquareText,
  MoreVertical,
  NotebookPen,
  PenLine,
  Plus,
  Route,
  Printer,
  ShieldCheck,
  Upload,
  UserRound,
  WalletCards
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
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
  CompactFixedTable,
  CompactTable,
  DonutSummary,
  FilterBar,
  IconActionRow,
  MetricCard,
  MetricGrid,
  Pagination,
  PhasePill,
  Pill,
  RailList,
  RightRailCard,
  RolePill,
  TruncateText,
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
  imagingRows
} from "./workspace-tab-data";

const carepathRowsPerPage = 8;
const clinicalRowsPerPage = 6;
const treatmentRowsPerPage = 6;

const carepathShortNames: Record<number, string> = {
  0: "Carepath Preauth",
  1: "Image Guidance Order",
  2: "Simulation Order",
  3: "Simulation Note",
  4: "Treatment Device Note",
  5: "Clinical Treatment Planning Note",
  6: "Special Physics Consult",
  7: "Orthovoltage Prescription",
  8: "Fractionation Log",
  9: "Special Treatment Procedure",
  10: "Treatment Management Notes",
  11: "Weekly Physics Check",
  12: "In-Vivo Dosimetry",
  13: "Treatment Summary",
  14: "Carepath Audit Sign"
};

const shortRoleLabels: Record<string, string> = {
  VA: "Virtual Assistant",
  MA: "Medical Assistant",
  RTT: "Therapist",
  NP_PA: "NP/PA",
  PCP: "PCP",
  RAD_ONC: "Rad Onc",
  PHYSICIST: "Physicist",
  BILLING: "Billing",
  ADMIN: "Admin"
};

const clinicalShortNames: Record<string, string> = {
  "CLIN-ARTH-MAP": "Hand Arthritis Mapping",
  "CLIN-TX-PARAM": "IGSRT Parameters",
  "CLIN-MARGINS": "Lesion Margins",
  "CLIN-ISO": "Isodose Worksheet",
  "CLIN-PHYS": "Physics Consult",
  "CLIN-RX": "Orthovoltage Prescription",
  "CLIN-INTAKE": "Intake Form",
  "CLIN-FOLLOW": "Follow-Up Assessment"
};

const clinicalSubtitles: Record<string, string> = {
  "CLIN-ARTH-MAP": "Joint grading",
  "CLIN-TX-PARAM": "Energy and dose",
  "CLIN-MARGINS": "Margins",
  "CLIN-ISO": "Depth coverage",
  "CLIN-PHYS": "Physics review",
  "CLIN-RX": "Prescription",
  "CLIN-INTAKE": "Intake",
  "CLIN-FOLLOW": "Post-treatment"
};

function clinicalStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    READY_FOR_REVIEW: "Review",
    SIGNED: "Signed",
    MISSING_FIELDS: "Missing",
    NOT_STARTED: "Not Started",
    COMPLETED: "Signed"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function clinicalDiagnosisLabel(diagnosis: string) {
  return diagnosis === "Skin Cancer" ? "Skin" : diagnosis;
}

function carepathStatusLabel(status: string) {
  const labels: Record<string, string> = {
    COMPLETED: "Completed",
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    READY_FOR_REVIEW: "Ready for Review",
    SIGNED: "Completed",
    UPLOADED: "Completed",
    BLOCKED: "Blocked",
    NOT_APPLICABLE: "N/A"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function carepathTrigger(step: WorkflowStep) {
  if (step.stepNumber < 8) {
    return step.stepNumber === 0 ? "Before tx start" : "Before treatment";
  }
  if (step.stepNumber <= 12) {
    return "During treatment";
  }
  if (step.stepNumber === 13) {
    return "Final fraction";
  }
  return "Course closeout";
}

function carepathAction(step: WorkflowStep) {
  if (step.status === "BLOCKED") {
    return "Route to Rad Onc";
  }
  if (step.status === "READY_FOR_REVIEW") {
    return "Review required";
  }
  if (step.requiresSignature && !step.signedAt) {
    return "Awaiting signature";
  }
  if (step.stepNumber >= 13) {
    return "Ready for audit";
  }
  if (step.status === "PENDING") {
    return "Upload pending";
  }
  return "Template generated";
}

function ProgressBar({ value, tone = "blue", width = "w-28" }: { value: number; tone?: "blue" | "green" | "orange" | "red"; width?: string }) {
  const color = tone === "green" ? "bg-emerald-500" : tone === "orange" ? "bg-[#F59E0B]" : tone === "red" ? "bg-rose-500" : "bg-[#0033A0]";
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-[#E7EEF8]", width)}>
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

function formatShortDate(date: string) {
  const parsed = new Date(`${date}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(parsed);
}

function addDays(date: string, days: number) {
  const parsed = new Date(`${date}T00:00:00`);
  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function treatmentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    COMPLETED: "Completed",
    READY_FOR_REVIEW: "Review",
    IN_PROGRESS: "In Progress",
    PENDING: "Scheduled",
    NOT_STARTED: "Scheduled",
    BLOCKED: "Held",
    OVERDUE: "Missed"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function treatmentReviewLabel(reviewed: boolean) {
  return reviewed ? "Reviewed" : "Pending";
}

function treatmentSetupLabel(completed: boolean) {
  return completed ? "Verified" : "Scheduled";
}

function treatmentImagingLabel(completed: boolean) {
  return completed ? "Complete" : "Pending";
}

function treatmentPhaseLabel(phase: string, fractionNumber: number) {
  if (phase) {
    const value = phase.trim();
    if (value.toLowerCase().includes("phase")) {
      return value.replaceAll("  ", " ");
    }
  }
  return fractionNumber <= 12 ? "Phase I" : "Phase II";
}

function imagingTitle(title: string) {
  const replacements: Record<string, string> = {
    "Hand Arthritis X-ray Mapping": "Hand Arthritis Mapping",
    "US at Simulation (50 MHz)": "US at Simulation",
    "Lesion Inked - Phase I Margin": "Phase I Margin",
    "US Daily Image - Fx #12": "Daily US Fx #12",
    "Annotate / Markup": "Annotate"
  };
  return replacements[title] ?? title;
}

function imagingSubtitle(description: string) {
  const replacements: Record<string, string> = {
    "Joint space evaluation and KL grading": "Joint grading",
    "Dose of invasion baseline": "DOI baseline",
    "Phase I treatment field margin": "Treatment field",
    "Nozzle configuration - frontal": "Nozzle setup",
    "Treatment day ultrasound guidance": "Daily guidance"
  };
  return replacements[description] ?? description;
}

function imagingModalityTone(modality: string): "blue" | "green" | "orange" | "purple" | "slate" {
  if (modality === "Ultrasound") {
    return "orange";
  }
  if (modality === "X-ray") {
    return "purple";
  }
  if (modality === "Photo" || modality === "Clinical Photo") {
    return "green";
  }
  return "blue";
}

function imagingPhaseTone(phase: string): "blue" | "green" | "orange" | "purple" | "slate" {
  if (phase === "Mapping") {
    return "purple";
  }
  if (phase === "Simulation") {
    return "blue";
  }
  if (phase === "Planning") {
    return "orange";
  }
  if (phase === "On Treatment") {
    return "green";
  }
  return "slate";
}

function imagingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    COMPLETED: "Completed",
    SIGNED: "Signed",
    READY_FOR_REVIEW: "Review",
    PENDING: "Pending",
    BLOCKED: "Missing"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function imagingStatusTone(status: string) {
  if (status === "COMPLETED" || status === "SIGNED") return "green";
  if (status === "READY_FOR_REVIEW") return "orange";
  if (status === "BLOCKED") return "red";
  return "blue";
}

function imagingRecentUploadIcon(modality: string) {
  if (modality === "Ultrasound") return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  if (modality === "X-ray") return <ImageIcon className="h-4 w-4" aria-hidden="true" />;
  return <FileText className="h-4 w-4" aria-hidden="true" />;
}

const documentsRowsPerPage = 6;
const notesRowsPerPage = 6;
const auditRowsPerPage = 6;

function displayDate(value?: string) {
  if (!value) {
    return "Pending";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value.replace("T", " ").replace("+08:00", "");
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(parsed);
}

function compactDocumentTitle(title: string) {
  return title
    .replace("Arthritis X-ray Mapping Note", "Arthritis Mapping Note")
    .replace("AVS PCP Template", "PCP Communication")
    .replace("OTV / Treatment Management Note", "Treatment Management Note")
    .replace("IGSRT Isodose Curve Support", "Isodose Curve Support")
    .replace("Final Audit Sign-Off", "Audit Sign-Off");
}

function compactCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    CLINICAL_PHOTO: "Images",
    CAREPATH: "Carepath",
    PLANNING: "Planning",
    PHYSICS: "Physics",
    ON_TREATMENT: "Treatment",
    AUDIT: "Audit"
  };
  return labels[category] ?? category.replaceAll("_", " ");
}

function compactDocStatusLabel(status: string, locked: boolean) {
  if (locked) return "Locked";
  const labels: Record<string, string> = {
    READY_FOR_REVIEW: "Review",
    PENDING_NEEDED: "Pending",
    PENDING: "Pending",
    SIGNED: "Signed",
    UPLOADED: "Uploaded",
    COMPLETED: "Signed"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function priorityTone(priority: Task["priority"]): "blue" | "green" | "orange" | "red" {
  if (priority === "URGENT" || priority === "HIGH") return "red";
  if (priority === "MEDIUM") return "orange";
  if (priority === "LOW") return "blue";
  return "green";
}

function priorityLabel(priority: Task["priority"]) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function taskStatusMeta(status: string) {
  const labels: Record<string, string> = {
    PENDING: "To Do",
    IN_PROGRESS: "In Progress",
    READY_FOR_REVIEW: "Review",
    COMPLETED: "Completed"
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

function compactTaskTitle(title: string) {
  const replacements: Record<string, string> = {
    "AVS / PCP communication": "PCP communication",
    "Follow-up / assessment": "Follow-up assessment",
    "OTV / treatment management note": "Treatment management note",
    "Clinical photo - All margins": "Clinical photo margins",
    "IGSRT fraction log approval": "Fraction log approval",
    "Carepath pre-auth note": "Carepath preauth note"
  };
  return replacements[title] ?? title;
}

function notePreview(noteId: string, preview: string) {
  const labels: Record<string, string> = {
    "NOTE-1": "Reviewed weekly physics chart.",
    "NOTE-2": "Patient stable. Continue protocol.",
    "NOTE-3": "Simulation verified.",
    "NOTE-4": "Task routed to Rad Onc.",
    "NOTE-5": "Upcoming schedule discussed.",
    "NOTE-6": "Authorization pending."
  };
  return labels[noteId] ?? preview;
}

function noteTone(category: string): "blue" | "green" | "orange" | "red" | "purple" | "slate" {
  if (category === "Communication") return "red";
  if (category === "Workflow") return "orange";
  if (category === "Assessment") return "purple";
  if (category === "Procedure") return "green";
  if (category === "Administrative") return "slate";
  return "blue";
}

const auditDisplayRows = [
  { id: "AUD-PREAUTH", item: "Carepath Preauth", category: "Chart Prep", status: "COMPLETED", requirement: "Preauth note", cpt: "N/A", evidence: "Signed note", owner: "VA" },
  { id: "AUD-SIM-ORDER", item: "Simulation Order", category: "Planning", status: "COMPLETED", requirement: "Order signed", cpt: "77436", evidence: "DOC-2401-SIM", owner: "Rad Onc" },
  { id: "AUD-RX", item: "Treatment Prescription", category: "Planning", status: "SIGNED", requirement: "Prescription", cpt: "77300", evidence: "Signed Rx", owner: "Rad Onc" },
  { id: "AUD-FRACTIONS", item: "Fractionation Log", category: "On Treatment", status: "COMPLETED", requirement: "Daily delivery", cpt: "77437", evidence: "Log complete", owner: "Therapist" },
  { id: "AUD-PHYSICS", item: "Weekly Physics Check", category: "On Treatment", status: "SIGNED", requirement: "Weekly check", cpt: "77336", evidence: "Signed check", owner: "Physicist" },
  { id: "AUD-MGMT", item: "Treatment Management", category: "On Treatment", status: "READY_FOR_REVIEW", requirement: "OTV every 5 fx", cpt: "77427", evidence: "Review pending", owner: "Rad Onc" },
  { id: "AUD-SUMMARY", item: "Treatment Summary", category: "Post-TX", status: "PENDING", requirement: "Course summary", cpt: "N/A", evidence: "Pending", owner: "Rad Onc" },
  { id: "AUD-BILLING", item: "Billing Evidence", category: "Billing", status: "READY_FOR_REVIEW", requirement: "Claim support", cpt: "77439", evidence: "Matched docs", owner: "Billing" },
  { id: "AUD-FOLLOW", item: "Follow-up Scheduled", category: "Post-TX", status: "COMPLETED", requirement: "Follow-up plan", cpt: "99213", evidence: "Schedule", owner: "Admin" },
  { id: "AUD-SIGNOFF", item: "Final Audit Sign", category: "Audit", status: "PENDING", requirement: "Final signature", cpt: "N/A", evidence: "Draft packet", owner: "Rad Onc" }
];

export function CarepathWorkspaceTab({ steps }: { steps: WorkflowStep[] }) {
  const [page, setPage] = useState(1);
  const completed = steps.filter((step) => ["COMPLETED", "SIGNED", "UPLOADED"].includes(step.status)).length;
  const ready = steps.filter((step) => step.status === "READY_FOR_REVIEW").length;
  const blocked = steps.filter((step) => step.status === "BLOCKED" || step.blockers.length).length;
  const signatures = steps.filter((step) => step.requiresSignature && !step.signedAt).length;
  const totalPages = Math.max(1, Math.ceil(steps.length / carepathRowsPerPage));
  const visibleSteps = useMemo(
    () => steps.slice((page - 1) * carepathRowsPerPage, page * carepathRowsPerPage),
    [page, steps]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#061A55]">Carepath Workflow</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Course workflow, signatures, and audit readiness.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkspaceButton><FileText className="h-4 w-4" /> View Carepath Document</WorkspaceButton>
            <WorkspaceButton>Actions</WorkspaceButton>
          </div>
        </div>
        <MetricGrid>
          <MetricCard size="compact" label="Completed Steps" value={`${completed}/${steps.length}`} detail="40%" tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
          <MetricCard size="compact" label="Pending Steps" value={steps.length - completed} detail="40%" tone="blue" icon={<FileText className="h-4 w-4" />} />
          <MetricCard size="compact" label="Ready for Review" value={ready} detail="13%" tone="orange" icon={<Clock3 className="h-4 w-4" />} />
          <MetricCard size="compact" label="Blocked" value={blocked} detail="7%" tone="red" icon={<AlertTriangle className="h-4 w-4" />} />
          <MetricCard size="compact" label="Signatures Needed" value={signatures} detail="13%" tone="purple" icon={<FileCheck2 className="h-4 w-4" />} />
        </MetricGrid>
      </section>

      <div className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
      <CompactFixedTable
        columns={[
          { header: "Step", width: "6%" },
          { header: "Phase", width: "13%" },
          { header: "Document", width: "25%" },
          { header: "Status", width: "14%" },
          { header: "Owner", width: "15%" },
          { header: "Trigger", width: "13%" },
          { header: "Action", width: "14%" }
        ]}
        rows={visibleSteps.map((step) => ({
          id: step.id,
          cells: [
            <span key="step" className="font-bold">{step.stepNumber}</span>,
            <PhasePill key="phase" phase={step.phase} size="compact" />,
            <div key="doc" className="flex min-w-0 items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <TruncateText className="font-bold" title={step.stepName}>{carepathShortNames[step.stepNumber] ?? step.stepName}</TruncateText>
                <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={step.linkedDocumentId ?? undefined}>{step.linkedDocumentId ?? "Document pending"}</TruncateText>
              </div>
            </div>,
            <WorkflowStatusPill key="status" status={step.status} size="compact" label={carepathStatusLabel(step.status)} />,
            <RolePill key="role" role={step.responsibleRole} size="compact" label={shortRoleLabels[step.responsibleRole]} />,
            <TruncateText key="trigger" title={step.triggerEvent}>{carepathTrigger(step)}</TruncateText>,
            <div key="action" className="flex min-w-0 items-center justify-between gap-2">
              <TruncateText className="text-[#3D5A80]" title={step.notes ?? step.triggerEvent}>{carepathAction(step)}</TruncateText>
              <WorkspaceButton size="compact" className="shrink-0">Open</WorkspaceButton>
            </div>
          ]
        }))}
      />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </div>
    </div>
  );
}

export function ClinicalWorkspaceTab({ patient }: { patient: Patient }) {
  const [page, setPage] = useState(1);
  const signed = clinicalForms.filter((form) => form.status === "SIGNED").length;
  const ready = clinicalForms.filter((form) => form.status === "READY_FOR_REVIEW").length;
  const drafts = clinicalForms.filter((form) => form.status === "DRAFT").length;
  const totalPages = Math.max(1, Math.ceil(clinicalForms.length / clinicalRowsPerPage));
  const visibleForms = useMemo(
    () => clinicalForms.slice((page - 1) * clinicalRowsPerPage, page * clinicalRowsPerPage),
    [page]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#061A55]">Clinical Forms & Mapping</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Assessments, mapping forms, and structured responses.</p>
          </div>
          <WorkspaceButton variant="primary" size="compact"><Plus className="h-4 w-4" /> New Clinical Form</WorkspaceButton>
        </div>
        <MetricGrid>
          <MetricCard size="compact" label="Draft" value={drafts} detail="8%" tone="purple" icon={<FileText className="h-4 w-4" />} />
          <MetricCard size="compact" label="Review" value={ready} detail="17%" tone="orange" icon={<Clock3 className="h-4 w-4" />} />
          <MetricCard size="compact" label="Signed" value={signed} detail="67%" tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
          <MetricCard size="compact" label="Missing" value={1} detail="8%" tone="red" icon={<AlertTriangle className="h-4 w-4" />} />
          <MetricCard size="compact" label="Archived" value={0} detail="0%" tone="slate" icon={<FileCheck2 className="h-4 w-4" />} />
        </MetricGrid>
      </section>

      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Clinical Summary</h3>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {[
              ["Diagnosis", patient.diagnosis],
              ["ICD-10", "C44.301"],
              ["Type", "Skin"],
              ["Site", patient.location],
              ["Laterality", "Midline"],
              ["Indication", "Definitive orthovoltage course"],
              ["Treating MD", patient.physician],
              ["PCP", "Doctor PCP"],
              ["Assessment", "Stable for treatment workflow"]
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-xl border border-[#E7EEF8] bg-[#F8FBFF] px-3 py-2">
                <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#3D5A80]" title={label}>{label}</p>
                <TruncateText className="mt-0.5 text-[13px] font-bold leading-5 text-[#061A55]" title={value}>{value}</TruncateText>
              </div>
            ))}
          </div>
      </section>

      <FilterBar searchPlaceholder="Search forms, diagnosis, or notes..." filters={["Diagnosis", "Form Type", "Status", "Phase"]} />
      <div className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
      <CompactFixedTable
        columns={[
          { header: "Form", width: "31%" },
          { header: "Diagnosis", width: "12%" },
          { header: "Phase", width: "12%" },
          { header: "Status", width: "13%" },
          { header: "Progress", width: "14%" },
          { header: "Updated", width: "11%" },
          { header: "Actions", width: "7%" }
        ]}
        rows={visibleForms.map((form) => ({
          id: form.id,
          cells: [
            <div key="form" className="flex min-w-0 items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <TruncateText className="font-bold" title={form.name}>{clinicalShortNames[form.id] ?? form.name}</TruncateText>
                <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={form.description}>{clinicalSubtitles[form.id] ?? form.description}</TruncateText>
              </div>
            </div>,
            <Pill key="diag" tone="blue" size="compact">{clinicalDiagnosisLabel(form.diagnosis)}</Pill>,
            typeof form.phase === "string" && form.phase !== "N/A" ? <PhasePill key="phase" phase={form.phase} size="compact" /> : <Pill key="phase" tone="slate" size="compact">N/A</Pill>,
            <WorkflowStatusPill key="status" status={form.status} size="compact" label={clinicalStatusLabel(form.status)} />,
            <div key="completion" className="flex min-w-0 items-center gap-2"><span className="w-8 shrink-0 text-[11px] font-bold">{form.completion}%</span><ProgressBar value={form.completion} width="w-16" tone={form.completion === 100 ? "green" : form.completion === 0 ? "red" : "orange"} /></div>,
            <div key="updated" className="min-w-0"><TruncateText>{form.lastUpdated}</TruncateText><TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={form.owner}>{form.owner}</TruncateText></div>,
            <ActionCell key="action" />
          ]
        }))}
      />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </div>
    </div>
  );
}

export function TreatmentWorkspaceTab({ course, plan, fractions }: { course: TreatmentCourse; plan?: TreatmentPlan; fractions: TreatmentFraction[] }) {
  const [page, setPage] = useState(1);
  const percent = Math.round((course.currentFraction / course.totalFractions) * 100);
  const dosePerFractionGy = Number.parseFloat(plan?.dosePerFraction ?? "2.5") || 2.5;
  const totalDoseGy = Number.parseFloat(plan?.totalDose ?? "50") || Math.round(dosePerFractionGy * course.totalFractions);
  const prescriptionLabel = `${Math.round(dosePerFractionGy * 100)} cGy × ${course.totalFractions}`;
  const deliveredGy = Math.round(dosePerFractionGy * course.currentFraction);
  const nextFractionDate = "Apr 28, 2026";
  const treatmentLogRows = useMemo(() => {
    const actualByNumber = new Map(fractions.map((fraction) => [fraction.fractionNumber, fraction]));
    const startNumber = Math.max(1, course.currentFraction - 1);
    const endNumber = Math.min(course.totalFractions, startNumber + treatmentRowsPerPage * 2 - 1);
    const referenceDate =
      fractions.find((fraction) => fraction.fractionNumber === course.currentFraction)?.treatmentDate ??
      fractions[fractions.length - 1]?.treatmentDate ??
      course.startDate;

    return Array.from({ length: endNumber - startNumber + 1 }, (_, index) => {
      const fractionNumber = startNumber + index;
      const actual = actualByNumber.get(fractionNumber);
      const isHistorical = actual ? actual.fractionNumber <= course.currentFraction : fractionNumber <= course.currentFraction;
      const generatedDate = actual?.treatmentDate ?? addDays(referenceDate, fractionNumber - course.currentFraction);
      const phase = treatmentPhaseLabel(actual?.phase ?? "", fractionNumber);
      const status = actual?.status ?? (isHistorical ? "COMPLETED" : "PENDING");
      const reviewed = actual?.physicianReviewedAt ? true : isHistorical;
      const imagingCompleted = actual ? actual.imageGuidanceCompleted : isHistorical;
      const setupVerified = actual ? Boolean(actual.applicator || actual.energy) : isHistorical;

      return {
        id: actual?.id ?? `FX-${course.id}-${String(fractionNumber).padStart(2, "0")}`,
        fractionNumber,
        date: formatShortDate(generatedDate),
        phase,
        dose: `${Math.round(actual?.plannedDose ?? dosePerFractionGy * 100)} cGy`,
        imaging: treatmentImagingLabel(imagingCompleted),
        setup: treatmentSetupLabel(setupVerified),
        review: treatmentReviewLabel(reviewed),
        status,
        isHistorical
      };
    });
  }, [course.currentFraction, course.id, course.startDate, course.totalFractions, dosePerFractionGy, fractions]);

  const totalPages = Math.max(1, Math.ceil(treatmentLogRows.length / treatmentRowsPerPage));
  const visibleRows = useMemo(
    () => treatmentLogRows.slice((page - 1) * treatmentRowsPerPage, page * treatmentRowsPerPage),
    [page, treatmentLogRows]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#061A55]">Treatment Planning</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Prescription, fractions, QA, and delivery.</p>
          </div>
          <WorkspaceButton variant="primary" size="compact">
            <FileText className="h-4 w-4" />
            Open Full Plan
          </WorkspaceButton>
        </div>
        <MetricGrid columns="xl:grid-cols-4">
          <MetricCard
            size="compact"
            label="Prescription"
            value={prescriptionLabel}
            detail="IG-SRT"
            tone="blue"
            icon={<FileText className="h-4 w-4" />}
          />
          <MetricCard
            size="compact"
            label="Total Dose"
            value={`${Math.round(totalDoseGy)} Gy`}
            detail={`${dosePerFractionGy.toFixed(1)} Gy per fraction`}
            tone="green"
            icon={<ShieldCheck className="h-4 w-4" />}
          />
          <MetricCard
            size="compact"
            label="Fractions"
            value={`${course.currentFraction}/${course.totalFractions}`}
            detail={`${percent}% complete`}
            tone="orange"
            icon={<ClipboardCheck className="h-4 w-4" />}
          />
          <MetricCard
            size="compact"
            label="Next Fraction"
            value="#13"
            detail={nextFractionDate}
            tone="purple"
            icon={<CalendarDays className="h-4 w-4" />}
          />
        </MetricGrid>
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#061A55]">Treatment Course</h3>
            <Pill tone="green" size="compact">Active</Pill>
          </div>
          <div className="space-y-2.5 text-[13px] font-bold text-[#061A55]">
            {[
              ["Technique", "Orthovoltage IG-SRT"],
              ["Energy", plan?.energy ?? course.energy ?? "50 kV"],
              ["Applicator", plan?.applicatorSize ?? course.applicator ?? "3 cm cone"],
              ["DOI", plan?.depthOfInvasion ?? course.targetDepth ?? "4 mm"],
              ["Schedule", "Mon-Fri"],
              ["Phase I", `${course.currentFraction}/20 fx`],
              ["Phase II", "Pending"]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wide text-[#3D5A80]" title={label}>
                  {label}
                </span>
                <TruncateText className="max-w-[58%] text-right text-[13px] font-bold text-[#061A55]" title={String(value)}>
                  {value}
                </TruncateText>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#061A55]">Dose Coverage</h3>
            <Pill tone="blue" size="compact">Planning</Pill>
          </div>
          <div className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-[13px] font-bold text-[#061A55]">
                <span>Target depth</span>
                <span>4.0 mm</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[13px] font-bold text-[#061A55]">
                <span>Coverage</span>
                <span>80%</span>
              </div>
              <ProgressBar value={80} tone="green" width="w-full" />
            </div>
            <div className="space-y-2 text-[13px] font-bold text-[#061A55]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-wide text-[#3D5A80]">Surface</span>
                <span>100%</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-wide text-[#3D5A80]">Energy</span>
                <span>{plan?.energy ?? course.energy ?? "50 kV"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] uppercase tracking-wide text-[#3D5A80]">Applicator</span>
                <span>{String(plan?.applicatorSize ?? course.applicator ?? "3 cm").replace(/ cone$/i, "")}</span>
              </div>
            </div>
            <p className="text-[11px] font-semibold leading-5 text-[#3D5A80]">250 cGy × 80% = 200 cGy depth dose</p>
          </div>
        </div>

        <DonutSummary
          label="Fraction Progress"
          value={percent}
          centerLabel={`${course.currentFraction}/${course.totalFractions}`}
          centerSubtitle={`${percent}% complete`}
          centerLabelClassName="text-[26px]"
          centerSubtitleClassName="max-w-24 text-[10px]"
          segments={[
            { label: "Completed", value: course.currentFraction, tone: "blue" },
            { label: "Remaining", value: course.totalFractions - course.currentFraction, tone: "slate" }
          ]}
        />

        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-[#061A55]">QA Status</h3>
            <Pill tone="green" size="compact">Ready</Pill>
          </div>
          <div className="space-y-2.5">
            <CheckLine>Plan QA passed</CheckLine>
            <CheckLine>Rad Onc signed</CheckLine>
            <CheckLine>Simulation images verified</CheckLine>
            <CheckLine state="warning">Physics check due</CheckLine>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E7EEF8] px-4 py-3">
          <div>
            <h3 className="text-lg font-bold text-[#061A55]">Fraction Log</h3>
            <p className="text-xs font-semibold text-[#3D5A80]">Daily delivery, image guidance, setup, and review status.</p>
          </div>
          <Pill tone="blue" size="compact">{`${course.currentFraction}/${course.totalFractions}`}</Pill>
        </div>
        <CompactFixedTable
          columns={[
            { header: "Fx", width: "6%" },
            { header: "Date", width: "13%" },
            { header: "Phase", width: "12%" },
            { header: "Dose", width: "12%" },
            { header: "Imaging", width: "12%" },
            { header: "Setup", width: "12%" },
            { header: "Review", width: "12%" },
            { header: "Status", width: "13%" },
            { header: "Actions", width: "8%" }
          ]}
          rows={visibleRows.map((fraction) => ({
            id: fraction.id,
            cells: [
              <span key="fx" className="font-bold text-[#061A55]">#{fraction.fractionNumber}</span>,
              <TruncateText key="date" title={fraction.date}>{fraction.date}</TruncateText>,
              <PhasePill key="phase" phase={fraction.phase === "Phase II" ? "POST_TX" : "ON_TREATMENT"} label={fraction.phase} size="compact" />,
              <TruncateText key="dose" title={fraction.dose}>{fraction.dose}</TruncateText>,
              <Pill key="img" tone={fraction.imaging === "Complete" ? "green" : "slate"} size="compact">{fraction.imaging}</Pill>,
              <Pill key="setup" tone={fraction.setup === "Verified" ? "green" : "slate"} size="compact">{fraction.setup}</Pill>,
              <Pill key="review" tone={fraction.review === "Reviewed" ? "green" : "orange"} size="compact">{fraction.review}</Pill>,
              <WorkflowStatusPill key="status" status={fraction.status} size="compact" label={treatmentStatusLabel(fraction.status)} />,
              <ActionCell key="action" />
            ]
          }))}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </section>
    </div>
  );
}

export function ImagingWorkspaceTab() {
  const [page, setPage] = useState(1);
  const imagingRowsPerPage = 5;
  const imagingStudyRows = useMemo(
    () => [
      ...imagingRows.map((row) => ({
        ...row,
        title: imagingTitle(row.title),
        description: imagingSubtitle(row.description),
        source: row.source.replace("Mapping / Planning", "Mapping"),
        phase:
          row.phase === "PLANNING"
            ? "Planning"
            : row.phase === "SIMULATION"
              ? "Simulation"
              : row.phase === "ON_TREATMENT"
                ? "On Treatment"
                : "Mapping"
      })),
      {
        id: "IMG-LESION-NO-INK",
        title: "Lesion without ink",
        description: "Pre-ink image",
        modality: "Photo",
        phase: "Planning",
        uploaded: "Apr 20, 2026 07:55 AM",
        uploadedBy: "Mika Alvarez",
        source: "Clinical Photo",
        status: "COMPLETED"
      },
      {
        id: "IMG-DERM-BORDER",
        title: "Dermoscopy Border",
        description: "Border image",
        modality: "Photo",
        phase: "Planning",
        uploaded: "Apr 19, 2026 11:10 AM",
        uploadedBy: "Iris Lim",
        source: "Clinical Photo",
        status: "READY_FOR_REVIEW"
      },
      {
        id: "IMG-SIDE-NOZZLE",
        title: "Side Nozzle View",
        description: "Nozzle setup",
        modality: "Photo",
        phase: "Planning",
        uploaded: "Apr 18, 2026 03:05 PM",
        uploadedBy: "Noah Tan",
        source: "Device Photo",
        status: "SIGNED"
      },
      {
        id: "IMG-ALL-MARGINS",
        title: "All Margins",
        description: "Combined margin view",
        modality: "Photo",
        phase: "Planning",
        uploaded: "Apr 17, 2026 09:20 AM",
        uploadedBy: "Mika Alvarez",
        source: "Clinical Photo",
        status: "COMPLETED"
      },
      {
        id: "IMG-US-SIM-2",
        title: "US Image at Sim",
        description: "DOI baseline",
        modality: "Ultrasound",
        phase: "Simulation",
        uploaded: "Apr 16, 2026 02:45 PM",
        uploadedBy: "Iris Lim",
        source: "Simulation",
        status: "READY_FOR_REVIEW"
      }
    ],
    []
  );
  const totalPages = Math.max(1, Math.ceil(imagingStudyRows.length / imagingRowsPerPage));
  const visibleStudies = useMemo(
    () => imagingStudyRows.slice((page - 1) * imagingRowsPerPage, page * imagingRowsPerPage),
    [imagingStudyRows, page]
  );
  const requiredAssets = [
    ["Inked Target", "complete"],
    ["Side Nozzle View", "complete"],
    ["Lesion without ink", "complete"],
    ["Dermoscopy Border", "complete"],
    ["Shielded Nozzle View", "complete"],
    ["US Image at Sim", "complete"],
    ["Lesion Border", "warning"],
    ["Phase I Margin", "warning"],
    ["Phase II Margin", "warning"],
    ["All Margins", "warning"]
  ] as const;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#061A55]">Imaging</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Studies, photos, and guidance assets.</p>
          </div>
          <WorkspaceButton variant="primary" size="compact">
            <Upload className="h-4 w-4" />
            Upload Imaging
          </WorkspaceButton>
        </div>
        <MetricGrid columns="xl:grid-cols-5">
          <MetricCard size="compact" label="Total Studies" value={14} detail="All time" tone="purple" icon={<ImageIcon className="h-4 w-4" />} />
          <MetricCard size="compact" label="Ultrasound" value={28} detail="This course" tone="orange" icon={<ImageIcon className="h-4 w-4" />} />
          <MetricCard size="compact" label="X-ray" value={12} detail="This course" tone="green" icon={<ImageIcon className="h-4 w-4" />} />
          <MetricCard size="compact" label="Clinical Photos" value={18} detail="This course" tone="blue" icon={<ImageIcon className="h-4 w-4" />} />
          <MetricCard size="compact" label="Documents" value={6} detail="This course" tone="slate" icon={<FileText className="h-4 w-4" />} />
        </MetricGrid>
      </section>

      <FilterBar searchPlaceholder="Search imaging..." filters={["Modality", "Phase", "Date", "Uploader"]} />

      <section className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#E7EEF8] px-4 py-3">
          <div>
            <h3 className="text-lg font-bold text-[#061A55]">Imaging Studies</h3>
            <p className="text-xs font-semibold text-[#3D5A80]">Mapped studies, photo sets, and guidance records.</p>
          </div>
          <Pill tone="blue" size="compact">{`Page ${page} of ${totalPages}`}</Pill>
        </div>
        <CompactFixedTable
          columns={[
            { header: "Preview", width: "10%" },
            { header: "Study", width: "28%" },
            { header: "Modality", width: "11%" },
            { header: "Phase", width: "11%" },
            { header: "Uploaded", width: "15%" },
            { header: "Owner", width: "13%" },
            { header: "Status", width: "7%" },
            { header: "Actions", width: "5%" }
          ]}
          rows={visibleStudies.map((row) => ({
            id: row.id,
            cells: [
              <div key="preview" className="flex h-16 w-20 flex-col items-center justify-center rounded-lg border border-[#D8E4F5] bg-[#F8FBFF] text-center ring-1 ring-[#0033A0]/10">
                <ImageIcon className="h-4 w-4 text-[#0033A0]" aria-hidden="true" />
                <span className="mt-1 text-[10px] font-bold text-[#3D5A80]">{row.modality}</span>
              </div>,
              <div key="study" className="min-w-0">
                <TruncateText className="font-bold text-[#061A55]" title={row.title}>
                  {row.title}
                </TruncateText>
                <TruncateText className="text-[11px] font-semibold leading-5 text-[#3D5A80]" title={row.description}>
                  {row.description}
                </TruncateText>
                <div className="mt-1">
                  <Pill tone="blue" size="compact">
                    {row.source}
                  </Pill>
                </div>
              </div>,
              <Pill key="modality" tone={imagingModalityTone(row.modality)} size="compact">
                {row.modality}
              </Pill>,
              <Pill key="phase" tone={imagingPhaseTone(row.phase)} size="compact">
                {row.phase}
              </Pill>,
              <TruncateText key="uploaded" title={row.uploaded}>
                {row.uploaded}
              </TruncateText>,
              <TruncateText key="owner" title={row.uploadedBy}>
                {row.uploadedBy}
              </TruncateText>,
              <WorkflowStatusPill key="status" status={row.status} size="compact" label={imagingStatusLabel(row.status)} />,
              <ActionCell key="action" />
            ]
          }))}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Required Assets</h3>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {requiredAssets.map(([asset, state]) => (
              <CheckLine key={asset} state={state === "warning" ? "warning" : "complete"}>
                {asset}
              </CheckLine>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <div className="border-b border-[#E7EEF8] px-4 py-3">
            <h3 className="text-lg font-bold text-[#061A55]">Guidance Log</h3>
          </div>
          <CompactFixedTable
            columns={[
              { header: "Date", width: "16%" },
              { header: "Modality", width: "16%" },
              { header: "Energy", width: "12%" },
              { header: "App.", width: "12%" },
              { header: "DOI", width: "12%" },
              { header: "Coverage", width: "14%" },
              { header: "Review", width: "18%" }
            ]}
            rows={imagingGuidanceRows.map((row) => ({
              id: row.id,
              cells: [
                <TruncateText key="date" title={row.date}>
                  {row.date}
                </TruncateText>,
                <TruncateText key="modality" title={row.modality === "Photo + US" ? "Combined" : row.modality}>
                  {row.modality === "Photo + US" ? "Combined" : row.modality}
                </TruncateText>,
                <TruncateText key="energy" title={row.energy}>
                  {row.energy}
                </TruncateText>,
                <TruncateText key="applicator" title={row.applicator}>
                  {row.applicator}
                </TruncateText>,
                <TruncateText key="doi" title={row.doi}>
                  {row.doi}
                </TruncateText>,
                <TruncateText key="coverage" title={row.coverage}>
                  {row.coverage}
                </TruncateText>,
                <TruncateText key="review" title={row.reviewer}>
                  {row.reviewer}
                </TruncateText>
              ]
            }))}
          />
        </div>
      </section>
    </div>
  );
}

export function DocumentsWorkspaceTab({ documents }: { documents: DocumentInstance[] }) {
  const [page, setPage] = useState(1);
  const completed = documents.filter((doc) => doc.signedAt).length;
  const uploaded = documents.filter((doc) => doc.uploadedToEcwAt).length;
  const pending = documents.length - completed;
  const totalPages = Math.max(1, Math.ceil(documents.length / documentsRowsPerPage));
  const visibleDocuments = useMemo(
    () => documents.slice((page - 1) * documentsRowsPerPage, page * documentsRowsPerPage),
    [documents, page]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#061A55]">Documents</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Documents, signatures, versions, and uploads.</p>
          </div>
          <WorkspaceButton variant="primary" size="compact"><Upload className="h-4 w-4" /> Upload Document</WorkspaceButton>
        </div>
        <MetricGrid>
          <MetricCard size="compact" label="Total Documents" value={86} detail="All time" tone="purple" icon={<FileText className="h-4 w-4" />} />
          <MetricCard size="compact" label="Ready for Review" value={12} detail="Needs review" tone="orange" icon={<Clock3 className="h-4 w-4" />} />
          <MetricCard size="compact" label="Pending Signatures" value={pending} detail="Awaiting signatures" tone="orange" icon={<FileCheck2 className="h-4 w-4" />} />
          <MetricCard size="compact" label="Completed" value={completed || 59} detail="Fully processed" tone="green" icon={<ShieldCheck className="h-4 w-4" />} />
          <MetricCard size="compact" label="Uploaded" value={uploaded} detail="eCW" tone="blue" icon={<Upload className="h-4 w-4" />} />
        </MetricGrid>
      </section>
      <FilterBar searchPlaceholder="Search documents..." filters={["Category", "Status", "Phase", "Uploader", "Date"]} />
      <section className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
        <CompactFixedTable
          columns={[
            { header: "Document", width: "28%" },
            { header: "Category", width: "12%" },
            { header: "Phase", width: "11%" },
            { header: "Status", width: "12%" },
            { header: "Version", width: "8%" },
            { header: "Updated", width: "12%" },
            { header: "Readiness", width: "11%" },
            { header: "Actions", width: "6%" }
          ]}
          rows={visibleDocuments.map((doc) => ({
            id: doc.id,
            cells: [
              <div key="doc" className="flex min-w-0 items-center gap-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]">
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <TruncateText className="font-bold" title={doc.title}>{compactDocumentTitle(doc.title)}</TruncateText>
                  <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={doc.id}>{doc.id}</TruncateText>
                </div>
              </div>,
              <Pill key="cat" tone="blue" size="compact">{compactCategoryLabel(doc.category)}</Pill>,
              <Pill key="phase" tone="green" size="compact">On Treatment</Pill>,
              <WorkflowStatusPill key="status" status={doc.lockedAt ? "LOCKED" : doc.status} size="compact" label={compactDocStatusLabel(doc.status, Boolean(doc.lockedAt))} />,
              <span key="version" className="font-bold">{`v${doc.version}.0`}</span>,
              <TruncateText key="updated" title={doc.generatedAt ?? undefined}>{displayDate(doc.generatedAt)}</TruncateText>,
              <div key="ready" className="flex min-w-0 flex-col gap-1">
                <Pill tone={doc.signedAt ? "green" : "orange"} size="compact">{doc.signedAt ? "Signed" : "Signature"}</Pill>
                <Pill tone={doc.uploadedToEcwAt ? "green" : "blue"} size="compact">{doc.uploadedToEcwAt ? "eCW" : "Upload"}</Pill>
              </div>,
              <ActionCell key="action" />
            ]
          }))}
        />
        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((current) => Math.max(1, current - 1))}
          onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
        />
      </section>
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
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#061A55]">Tasks</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Patient course tasks and follow-ups.</p>
          </div>
          <WorkspaceButton variant="primary" size="compact"><Plus className="h-4 w-4" /> Add Task</WorkspaceButton>
        </div>
        <FilterBar searchPlaceholder="Search tasks..." filters={["Assignee", "Priority", "Status", "Type", "Due"]} />
      </section>
      <section className="grid gap-3 xl:grid-cols-4">
        {columns.map((column) => {
          const columnTasks = tasks
            .filter((task) => column.status === "COMPLETED" ? task.completedAt || task.status === "COMPLETED" : task.status === column.status)
            .slice(0, 3);
          return (
            <div key={column.label} className="rounded-2xl border border-[#D8E4F5] bg-[#F8FBFF] p-3 shadow-[0_8px_24px_rgba(0,51,160,0.04)]">
              <div className="mb-3 flex items-center justify-between">
                <Pill tone={column.tone} size="compact">{column.label}</Pill>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-[#061A55]">{columnTasks.length}</span>
              </div>
              <div className="space-y-2.5">
                {columnTasks.length ? columnTasks.map((task) => (
                  <div key={`${column.label}-${task.id}`} className="rounded-xl border border-[#D8E4F5] bg-white p-3">
                    <div className="flex items-start justify-between gap-2">
                      <TruncateText className="text-[13px] font-bold text-[#061A55]" title={task.title}>{compactTaskTitle(task.title)}</TruncateText>
                      <Pill tone={priorityTone(task.priority)} size="compact">{priorityLabel(task.priority)}</Pill>
                    </div>
                    <p className="mt-1 truncate text-[11px] font-semibold text-[#3D5A80]">Course 2401 · {taskStatusMeta(task.status)}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-bold text-[#3D5A80]">
                      <span className="inline-flex min-w-0 items-center gap-1 truncate">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">Due {task.dueDate ?? "Next step"}</span>
                      </span>
                      <MoreVertical className="h-4 w-4 shrink-0 text-[#0033A0]" aria-hidden="true" />
                    </div>
                    <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold text-[#3D5A80]">
                      <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{task.assignedUserId ?? shortRoleLabels[task.assignedRole] ?? task.assignedRole}</span>
                    </p>
                  </div>
                )) : (
                  <div className="rounded-xl border border-dashed border-[#D8E4F5] bg-white p-3 text-center text-xs font-bold text-[#3D5A80]">
                    No tasks
                  </div>
                )}
              </div>
              <WorkspaceButton variant="ghost" size="compact" className="mt-3 w-full"><Plus className="h-3.5 w-3.5" /> Add Task</WorkspaceButton>
            </div>
          );
        })}
      </section>
      <MetricGrid columns="xl:grid-cols-4">
        <MetricCard size="compact" label="Overdue" value={2} detail="Tasks past due" tone="red" icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard size="compact" label="Due Today" value={1} detail="Due within 24 hours" tone="orange" icon={<CalendarDays className="h-4 w-4" />} />
        <MetricCard size="compact" label="Due This Week" value={7} detail="Due within 7 days" tone="blue" icon={<CalendarDays className="h-4 w-4" />} />
        <MetricCard size="compact" label="Completion" value="86%" detail="This course" tone="green" icon={<CheckCircle2 className="h-4 w-4" />} />
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
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(clinicalNotes.length / notesRowsPerPage));
  const visibleNotes = useMemo(
    () => clinicalNotes.slice((page - 1) * notesRowsPerPage, page * notesRowsPerPage),
    [page]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#061A55]">Clinical Notes</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Patient notes and care communication.</p>
          </div>
          <WorkspaceButton variant="primary" size="compact"><Plus className="h-4 w-4" /> Add Note</WorkspaceButton>
        </div>
        <FilterBar searchPlaceholder="Search notes..." filters={["Type", "Author", "Date"]} />
      </section>
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <CompactFixedTable
            columns={[
              { header: "Note", width: "34%" },
              { header: "Type", width: "13%" },
              { header: "Author", width: "18%" },
              { header: "Date", width: "17%" },
              { header: "Visibility", width: "12%" },
              { header: "Actions", width: "6%" }
            ]}
            rows={visibleNotes.map((note) => ({
              id: note.id,
              cells: [
                <div key="note" className="flex min-w-0 items-center gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]">
                    <MessageSquareText className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <TruncateText className="font-bold" title={note.title}>{note.title}</TruncateText>
                    <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={note.preview}>{notePreview(note.id, note.preview)}</TruncateText>
                  </div>
                </div>,
                <Pill key="cat" tone={noteTone(note.category)} size="compact">{note.category}</Pill>,
                <div key="author" className="min-w-0">
                  <TruncateText title={note.author}>{note.author}</TruncateText>
                  <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={note.role}>{note.role}</TruncateText>
                </div>,
                <TruncateText key="date" title={note.timestamp}>{note.timestamp.replace(" 2026 ", ", ")}</TruncateText>,
                <Pill key="visibility" tone={note.visibility === "Billing" ? "purple" : "green"} size="compact">{note.visibility}</Pill>,
                <ActionCell key="action" />
              ]
            }))}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          />
        </div>
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Note Composer</h3>
          <div className="mt-3 space-y-2.5">
            <div className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] px-3 py-2 text-[13px] font-bold text-[#061A55]">Category: Clinical</div>
            <div className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] px-3 py-2 text-[13px] font-bold text-[#061A55]">Visibility: Care Team</div>
            <div className="min-h-24 rounded-xl border border-[#D8E4F5] bg-white p-3 text-[13px] font-semibold text-[#3D5A80]">Write a PHI-safe placeholder note...</div>
            <WorkspaceButton variant="primary" size="compact" className="w-full">Save Draft</WorkspaceButton>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AuditWorkspaceTab({ checks, readiness }: { checks: AuditCheck[]; events: AuditEvent[]; readiness: number }) {
  const [page, setPage] = useState(1);
  const complete = checks.filter((check) => check.status === "COMPLETED").length;
  const missing = checks.filter((check) => ["BLOCKED", "OVERDUE", "PENDING"].includes(check.status)).length;
  const selected = auditDetails[0];
  const readinessDetail = readiness >= 90 ? "Ready" : "Needs review";
  const totalPages = Math.max(1, Math.ceil(auditDisplayRows.length / auditRowsPerPage));
  const visibleAuditRows = useMemo(
    () => auditDisplayRows.slice((page - 1) * auditRowsPerPage, page * auditRowsPerPage),
    [page]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#061A55]">Audit Dashboard</h2>
            <p className="mt-1 text-sm font-semibold text-[#3D5A80]">Course audit readiness and documentation status.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <WorkspaceButton size="compact"><Clock3 className="h-4 w-4" /> Run Audit Check</WorkspaceButton>
            <WorkspaceButton variant="primary" size="compact"><FileCheck2 className="h-4 w-4" /> Create Audit Report</WorkspaceButton>
          </div>
        </div>
        <MetricGrid>
          <MetricCard size="compact" label="Overall Audit" value={`${readiness}%`} detail={readinessDetail} tone={readiness >= 90 ? "green" : "orange"} icon={<ShieldCheck className="h-4 w-4" />} />
          <MetricCard size="compact" label="Documents" value={`${complete}/${checks.length}`} detail="Signed evidence" tone="green" icon={<FileCheck2 className="h-4 w-4" />} />
          <MetricCard size="compact" label="CPT Codes" value="18/20" detail="90%" tone="blue" icon={<WalletCards className="h-4 w-4" />} />
          <MetricCard size="compact" label="Issues" value={missing} detail={missing ? "Needs review" : "Clear"} tone={missing ? "orange" : "green"} icon={<AlertTriangle className="h-4 w-4" />} />
          <MetricCard size="compact" label="Ready for Billing" value={missing <= 2 ? "Yes" : "No"} detail="Major items" tone={missing <= 2 ? "green" : "orange"} icon={<CheckCircle2 className="h-4 w-4" />} />
        </MetricGrid>
      </section>
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="overflow-hidden rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <CompactFixedTable
            columns={[
              { header: "Item", width: "26%" },
              { header: "Status", width: "13%" },
              { header: "Requirement", width: "17%" },
              { header: "CPT", width: "10%" },
              { header: "Evidence", width: "15%" },
              { header: "Owner", width: "12%" },
              { header: "Action", width: "7%" }
            ]}
            rows={visibleAuditRows.map((row, index) => ({
              id: row.id,
              cells: [
                <div key="item" className="min-w-0">
                  <TruncateText className="font-bold" title={row.item}>{(page - 1) * auditRowsPerPage + index + 1}. {row.item}</TruncateText>
                  <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={row.category}>{row.category}</TruncateText>
                </div>,
                <WorkflowStatusPill key="status" status={row.status} size="compact" label={compactDocStatusLabel(row.status, false)} />,
                <TruncateText key="req" title={row.requirement}>{row.requirement}</TruncateText>,
                <TruncateText key="cpt" title={row.cpt}>{row.cpt}</TruncateText>,
                <TruncateText key="evidence" title={row.evidence}>{row.evidence}</TruncateText>,
                <TruncateText key="owner" title={row.owner}>{row.owner}</TruncateText>,
                <ActionCell key="action" />
              ]
            }))}
          />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
          />
        </div>
        <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
          <h3 className="text-lg font-bold text-[#061A55]">Treatment Management</h3>
          <div className="mt-3 space-y-3">
            <div><p className="text-[11px] font-bold uppercase text-[#3D5A80]">Completion Steps</p><div className="mt-2 space-y-1.5">{selected.steps.slice(0, 3).map((step) => <CheckLine key={step} state="info">{step}</CheckLine>)}</div></div>
            <div><p className="text-[11px] font-bold uppercase text-[#3D5A80]">Evidence</p><div className="mt-2 flex flex-wrap gap-1.5">{selected.evidence.map((item) => <Pill key={item} tone="blue" size="compact">{item}</Pill>)}</div></div>
            <div><p className="text-[11px] font-bold uppercase text-[#3D5A80]">Billing Codes</p><div className="mt-2 flex flex-wrap gap-1.5">{selected.codes.map((code) => <Pill key={code} tone="orange" size="compact">{code}</Pill>)}</div></div>
            <div><p className="text-[11px] font-bold uppercase text-[#3D5A80]">Responsible Parties</p><div className="mt-2 flex flex-wrap gap-1.5">{selected.parties.map((party) => <RolePill key={party} role={party} size="compact" />)}</div></div>
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
        <DonutSummary
          label="Carepath Summary"
          value={40}
          segments={[
            { label: "Completed", value: 6, tone: "green" },
            { label: "Ready for Review", value: 2, tone: "orange" },
            { label: "Pending", value: 6, tone: "blue" },
            { label: "Blocked", value: 1, tone: "red" },
            { label: "Signatures Needed", value: 2, tone: "purple" }
          ]}
        />
        <RightRailCard title="Current Blockers" icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}>
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
              <div className="min-w-0">
                <TruncateText className="text-sm font-bold text-[#061A55]" title="Step 7: Orthovoltage Prescription">Step 7: Orthovoltage Prescription</TruncateText>
                <p className="mt-1 text-xs font-semibold leading-5 text-[#3D5A80]">Prescription not generated.</p>
                <p className="text-xs font-semibold leading-5 text-[#3D5A80]">Assigned to Rad Onc.</p>
              </div>
            </div>
            <WorkspaceButton size="compact" className="mt-3 w-full">Resolve</WorkspaceButton>
          </div>
        </RightRailCard>
        <RightRailCard title="Signature Queue" icon={<FileCheck2 className="h-4 w-4" aria-hidden="true" />}>
          <RailList
            items={[
              { title: "Clinical Treatment Planning Note", meta: "Step 5 · Rad Onc", badge: <Pill tone="orange" size="compact">High</Pill> },
              { title: "Treatment Summary", meta: "Step 13 · Rad Onc", badge: <Pill tone="orange" size="compact">High</Pill> }
            ]}
          />
          <WorkspaceButton size="compact" className="mt-3 w-full">Go to Tasks</WorkspaceButton>
        </RightRailCard>
      </>
    );
  }

  if (activeTab === "clinical") {
    return (
      <>
        <DonutSummary
          label="Clinical Summary"
          value={67}
          segments={[
            { label: "Signed", value: 8, tone: "green" },
            { label: "Review", value: 2, tone: "orange" },
            { label: "Draft", value: 1, tone: "purple" },
            { label: "Missing", value: 1, tone: "red" }
          ]}
        />
        <RightRailCard title="Clinical Readiness" icon={<CheckCircle2 className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            <CheckLine>Mapping forms complete</CheckLine>
            <CheckLine>Prescription documented</CheckLine>
            <CheckLine state="warning">Physics check pending</CheckLine>
            <CheckLine state="warning">Follow-up not started</CheckLine>
          </div>
        </RightRailCard>
        <RightRailCard title="Quick Actions" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "New Form", meta: "Template or blank", icon: <Plus className="h-4 w-4" aria-hidden="true" /> },
              { title: "Upload Form", meta: "Import document", icon: <Upload className="h-4 w-4" aria-hidden="true" /> },
              { title: "Generate Note", meta: "From selected data", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
              { title: "Send for Signature", meta: "Route to physician", icon: <Route className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <button
                key={action.title}
                type="button"
                className="flex h-14 w-full items-center gap-3 rounded-xl border border-[#E7EEF8] bg-white px-3 text-left transition hover:bg-[#F8FBFF] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/10"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0] ring-1 ring-[#0033A0]/15">{action.icon}</span>
                <span className="min-w-0">
                  <TruncateText className="text-sm font-bold text-[#061A55]" title={action.title}>{action.title}</TruncateText>
                  <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={action.meta}>{action.meta}</TruncateText>
                </span>
              </button>
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Clinical Notes" icon={<FileText className="h-4 w-4" aria-hidden="true" />}>
          <RailList
            items={[
              { title: "Weekly physics check", meta: "Apr 26, 2026 · 08:00 AM", badge: <Pill tone="blue" size="compact">Clinical</Pill> },
              { title: "On-treatment evaluation", meta: "Apr 25, 2026 · 10:15 AM", badge: <Pill tone="purple" size="compact">Assessment</Pill> },
              { title: "Mapping update", meta: "Apr 24, 2026 · 02:30 PM", badge: <Pill tone="green" size="compact">Procedure</Pill> }
            ]}
          />
        </RightRailCard>
      </>
    );
  }

  if (activeTab === "treatment") {
    return (
      <>
        <RightRailCard title="Treatment Summary" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2.5 text-[13px] font-bold text-[#061A55]">
            {[
              ["Course", "Course 2401"],
              ["Phase", "On Treatment"],
              ["Energy", course.energy ?? "50 kV"],
              ["Prescription", "250 cGy × 20"],
              ["Delivered", "20 Gy"],
              ["Next Fx", "#13 Apr 28"],
              ["MD", patient.physician]
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-[11px] font-bold uppercase tracking-wide text-[#3D5A80]" title={label}>
                  {label}
                </span>
                <TruncateText className="max-w-[60%] text-right text-[13px] font-bold text-[#061A55]" title={String(value)}>
                  {value}
                </TruncateText>
              </div>
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Quick Actions" icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "Record Fraction", icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> },
              { title: "New OTV Note", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
              { title: "Send to Physics", icon: <Route className="h-4 w-4" aria-hidden="true" /> },
              { title: "Generate Prescription", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
              { title: "Print Summary", icon: <Printer className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <button
                key={action.title}
                type="button"
                className="flex h-11 w-full items-center gap-3 rounded-xl border border-[#E7EEF8] bg-white px-3 text-left transition hover:bg-[#F8FBFF] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/10"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0] ring-1 ring-[#0033A0]/15">
                  {action.icon}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#061A55]">{action.title}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#3D5A80]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Alerts" icon={<AlertTriangle className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2.5">
            {[
              { title: "Physics check due", meta: "Due Apr 29", badge: <Pill tone="orange" size="compact">Due</Pill>, icon: <AlertTriangle className="h-4 w-4 text-[#FF6620]" aria-hidden="true" /> },
              { title: "Phase I nearing completion", meta: "Est. May 7", badge: <Pill tone="blue" size="compact">Info</Pill>, icon: <Clock3 className="h-4 w-4 text-[#0033A0]" aria-hidden="true" /> },
              { title: "Signature pending", meta: "Prescription review", badge: <Pill tone="orange" size="compact">Pending</Pill>, icon: <FileCheck2 className="h-4 w-4 text-[#FF6620]" aria-hidden="true" /> }
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-[#E7EEF8] bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-start gap-2">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#F8FBFF] ring-1 ring-[#D8E4F5]">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <TruncateText className="text-sm font-bold text-[#061A55]" title={item.title}>
                        {item.title}
                      </TruncateText>
                      <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={item.meta}>
                        {item.meta}
                      </TruncateText>
                    </div>
                  </div>
                  {item.badge}
                </div>
              </div>
            ))}
          </div>
        </RightRailCard>
      </>
    );
  }

  if (activeTab === "imaging") {
    return (
      <>
        <DonutSummary
          label="Imaging Summary"
          value={64}
          centerLabel="64%"
          centerSubtitle="complete"
          centerLabelClassName="text-[26px]"
          centerSubtitleClassName="max-w-16 text-[10px]"
          segments={[
            { label: "Ultrasound", value: 28, tone: "orange" },
            { label: "X-ray", value: 12, tone: "purple" },
            { label: "Photos", value: 18, tone: "green" },
            { label: "Documents", value: 6, tone: "blue" }
          ]}
        />
        <RightRailCard
          title="Recent Uploads"
          icon={<Upload className="h-4 w-4" aria-hidden="true" />}
          action={<button type="button" className="text-xs font-bold text-[#0033A0]">View all</button>}
        >
          <div className="space-y-2.5">
            {imagingRows.slice(0, 3).map((row) => (
              <button
                key={row.id}
                type="button"
                className="flex w-full items-start gap-3 rounded-xl border border-[#E7EEF8] bg-white p-3 text-left transition hover:bg-[#F8FBFF] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/10"
              >
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg ring-1", imagingModalityTone(row.modality) === "orange" ? "bg-[#FFF0E8] text-[#FF6620] ring-[#FF6620]/15" : imagingModalityTone(row.modality) === "purple" ? "bg-violet-500/10 text-violet-700 ring-violet-500/15" : imagingModalityTone(row.modality) === "green" ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15" : "bg-[#EAF1FF] text-[#0033A0] ring-[#0033A0]/15")}>
                  {imagingRecentUploadIcon(row.modality)}
                </span>
                <span className="min-w-0 flex-1">
                  <TruncateText className="text-sm font-bold text-[#061A55]" title={imagingTitle(row.title)}>
                    {imagingTitle(row.title)}
                  </TruncateText>
                  <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={row.uploaded}>
                    {row.uploaded}
                  </TruncateText>
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[#3D5A80]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Quick Actions" icon={<ImageIcon className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "Upload Imaging", meta: "Import file", icon: <Upload className="h-4 w-4" aria-hidden="true" /> },
              { title: "Add Photo", meta: "Clinical photo", icon: <ImageIcon className="h-4 w-4" aria-hidden="true" /> },
              { title: "Capture Device", meta: "From device", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
              { title: "Annotate", meta: "Markup image", icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> },
              { title: "Create Imaging Note", meta: "From study", icon: <FileText className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <button
                key={action.title}
                type="button"
                className="flex h-12 w-full items-center gap-3 rounded-xl border border-[#E7EEF8] bg-white px-3 text-left transition hover:bg-[#F8FBFF] focus:outline-none focus:ring-4 focus:ring-[#0033A0]/10"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0] ring-1 ring-[#0033A0]/15">
                  {action.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <TruncateText className="text-[13px] font-semibold text-[#061A55]" title={action.title}>
                    {action.title}
                  </TruncateText>
                  <TruncateText className="text-[11px] font-semibold text-[#3D5A80]" title={action.meta}>
                    {action.meta}
                  </TruncateText>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#3D5A80]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </RightRailCard>
      </>
    );
  }

  if (activeTab === "documents") {
    return (
      <>
        <DonutSummary
          label="Document Storage"
          value={86}
          centerLabel="86"
          centerSubtitle="documents"
          centerLabelClassName="text-[28px]"
          centerSubtitleClassName="max-w-20 text-[10px]"
          segments={[
            { label: "PDF", value: 46, tone: "red" },
            { label: "Images", value: 28, tone: "purple" },
            { label: "Word", value: 17, tone: "blue" },
            { label: "Other", value: 9, tone: "orange" }
          ]}
        />
        <RightRailCard
          title="Recent Activity"
          icon={<History className="h-4 w-4" aria-hidden="true" />}
          action={<button type="button" className="text-xs font-bold text-[#0033A0]">View all</button>}
        >
          <div className="space-y-2.5">
            {documentActivities.map((item) => (
              <IconActionRow
                key={item.id}
                title={item.title.replace("OTV / Treatment Management Note", "Treatment Management Note")}
                meta={`${compactDocumentTitle(item.detail)} · ${item.time}`}
                icon={item.status === "SIGNED" ? <FileCheck2 className="h-4 w-4" aria-hidden="true" /> : <FileText className="h-4 w-4" aria-hidden="true" />}
                badge={<WorkflowStatusPill status={item.status} size="compact" label={compactDocStatusLabel(item.status, false)} />}
              />
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Quick Actions" icon={<FolderOpen className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "Upload Document", icon: <Upload className="h-4 w-4" aria-hidden="true" /> },
              { title: "Create from Template", icon: <FilePlus2 className="h-4 w-4" aria-hidden="true" /> },
              { title: "Request Signature", icon: <PenLine className="h-4 w-4" aria-hidden="true" /> },
              { title: "Document Checklist", icon: <ListChecks className="h-4 w-4" aria-hidden="true" /> },
              { title: "Scan Upload", icon: <Upload className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <IconActionRow key={action.title} title={action.title} icon={action.icon} />
            ))}
          </div>
        </RightRailCard>
      </>
    );
  }

  if (activeTab === "tasks") {
    return (
      <>
        <DonutSummary
          label="Tasks Overview"
          value={41}
          centerLabel="29"
          centerSubtitle="total tasks"
          centerLabelClassName="text-[28px]"
          centerSubtitleClassName="max-w-20 text-[10px]"
          segments={[
            { label: "To Do", value: 7, tone: "slate" },
            { label: "In Progress", value: 6, tone: "orange" },
            { label: "Review", value: 4, tone: "blue" },
            { label: "Completed", value: 12, tone: "green" }
          ]}
        />
        <RightRailCard
          title="Upcoming Due"
          icon={<Bell className="h-4 w-4" aria-hidden="true" />}
          action={<button type="button" className="text-xs font-bold text-[#0033A0]">View all</button>}
        >
          <div className="space-y-2.5">
            {tasks.slice(0, 3).map((task) => (
              <IconActionRow
                key={task.id}
                title={compactTaskTitle(task.title)}
                meta={`${task.dueDate ?? "Due soon"} · ${task.assignedUserId ?? shortRoleLabels[task.assignedRole] ?? task.assignedRole}`}
                icon={<ClipboardCheck className="h-4 w-4" aria-hidden="true" />}
                badge={<Pill tone={priorityTone(task.priority)} size="compact">{priorityLabel(task.priority)}</Pill>}
              />
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Quick Actions" icon={<ListChecks className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "Create Task", icon: <Plus className="h-4 w-4" aria-hidden="true" /> },
              { title: "Task Templates", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
              { title: "Task Checklist", icon: <ListChecks className="h-4 w-4" aria-hidden="true" /> },
              { title: "My Tasks", icon: <UserRound className="h-4 w-4" aria-hidden="true" /> },
              { title: "Task Report", icon: <ClipboardCheck className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <IconActionRow key={action.title} title={action.title} icon={action.icon} />
            ))}
          </div>
        </RightRailCard>
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
        <RightRailCard title="Note Categories" icon={<NotebookPen className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {["Clinical", "Assessment", "Procedure", "Communication", "Workflow", "Intake", "Administrative"].map((title, index) => (
              <IconActionRow
                key={title}
                title={title}
                icon={<MessageSquareText className="h-4 w-4" aria-hidden="true" />}
                badge={<span className="rounded-full bg-[#EAF1FF] px-2 py-1 text-[11px] font-bold text-[#0033A0]">{[12, 6, 4, 3, 3, 2, 2][index]}</span>}
              />
            ))}
          </div>
        </RightRailCard>
        <RightRailCard
          title="Recent Notes"
          icon={<Clock3 className="h-4 w-4" aria-hidden="true" />}
          action={<button type="button" className="text-xs font-bold text-[#0033A0]">View all</button>}
        >
          <div className="space-y-2.5">
            {clinicalNotes.slice(0, 5).map((note) => (
              <IconActionRow
                key={note.id}
                title={note.title}
                meta={note.timestamp}
                icon={<MessageSquareText className="h-4 w-4" aria-hidden="true" />}
                badge={<Pill tone={noteTone(note.category)} size="compact">{note.category}</Pill>}
              />
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Quick Actions" icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "Add Clinical Note", icon: <Plus className="h-4 w-4" aria-hidden="true" /> },
              { title: "Add Administrative Note", icon: <FileText className="h-4 w-4" aria-hidden="true" /> },
              { title: "Add Workflow Note", icon: <Route className="h-4 w-4" aria-hidden="true" /> },
              { title: "Export Notes", icon: <Upload className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <IconActionRow key={action.title} title={action.title} icon={action.icon} />
            ))}
          </div>
        </RightRailCard>
      </>
    );
  }

  if (activeTab === "audit") {
    return (
      <>
        <DonutSummary
          label="Audit Status Summary"
          value={readiness}
          centerLabel={`${readiness}%`}
          centerSubtitle="ready"
          centerLabelClassName="text-[28px]"
          centerSubtitleClassName="max-w-20 text-[10px]"
          segments={[
            { label: "Complete", value: 24, tone: "green" },
            { label: "Pending", value: 1, tone: "orange" },
            { label: "Incomplete", value: 1, tone: "red" }
          ]}
        />
        <RightRailCard
          title="Recent Audit Activity"
          icon={<History className="h-4 w-4" aria-hidden="true" />}
          action={<button type="button" className="text-xs font-bold text-[#0033A0]">View all</button>}
        >
          <div className="space-y-2.5">
            {[
              { title: "Audit check completed", meta: "May 5, 2026 · System", badge: <Pill tone="green" size="compact">Summary</Pill>, icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> },
              { title: "Daily records verified", meta: "May 5, 2026 · Mika Alvarez", badge: <Pill tone="blue" size="compact">Clinical</Pill>, icon: <FileCheck2 className="h-4 w-4" aria-hidden="true" /> },
              { title: "Mgmt note flagged", meta: "May 4, 2026 · System", badge: <Pill tone="orange" size="compact">Flagged</Pill>, icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" /> },
              { title: "Billing claim review pending", meta: "May 4, 2026 · Billing Team", badge: <Pill tone="purple" size="compact">Billing</Pill>, icon: <Clock3 className="h-4 w-4" aria-hidden="true" /> }
            ].map((item) => (
              <IconActionRow key={item.title} title={item.title} meta={item.meta} icon={item.icon} badge={item.badge} />
            ))}
          </div>
        </RightRailCard>
        <RightRailCard title="Audit Actions" icon={<ShieldCheck className="h-4 w-4" aria-hidden="true" />}>
          <div className="space-y-2">
            {[
              { title: "Run Full Audit Check", icon: <Clock3 className="h-4 w-4" aria-hidden="true" /> },
              { title: "Generate Report", icon: <FileCheck2 className="h-4 w-4" aria-hidden="true" /> },
              { title: "View History", icon: <History className="h-4 w-4" aria-hidden="true" /> },
              { title: "Add Audit Note", icon: <Plus className="h-4 w-4" aria-hidden="true" /> }
            ].map((action) => (
              <IconActionRow key={action.title} title={action.title} icon={action.icon} />
            ))}
          </div>
        </RightRailCard>
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
