"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  NotebookTabs,
  Printer,
  Radiation,
  ShieldCheck,
  Upload,
  WalletCards
} from "lucide-react";
import { AuditChecklist } from "@/components/audit-checklist";
import { AuditTimeline } from "@/components/audit-timeline";
import { DataTable } from "@/components/data-table";
import { DocumentList } from "@/components/document-list";
import { FieldList } from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { TaskList } from "@/components/task-list";
import { WorkflowStepTable } from "@/components/workflow-step-table";
import {
  AuditWorkspaceTab,
  BillingWorkspaceTab,
  CarepathWorkspaceTab,
  ClinicalWorkspaceTab,
  DocumentsWorkspaceTab,
  ImagingWorkspaceTab,
  NotesWorkspaceTab,
  TasksWorkspaceTab,
  TreatmentWorkspaceTab,
  WorkspaceTabRail
} from "@/components/patients/workspace-tabs/patient-workspace-tabs";
import type {
  AuditCheck,
  AuditEvent,
  CarepathTask,
  ClinicalFormTemplate,
  Course,
  DocumentInstance,
  FractionLogEntry,
  GeneratedDocument,
  ImagingAsset,
  Patient,
  Task,
  TreatmentCourse,
  TreatmentFraction,
  TreatmentPlan,
  WorkflowStep
} from "@/lib/types";
import { auditReadinessScore, carepathProgress, cn, documentProgress, formatDate, patientName } from "@/lib/workflow";

type WorkspaceTab = "overview" | "carepath" | "clinical" | "treatment" | "imaging" | "documents" | "tasks" | "billing" | "notes" | "audit";

type PatientWorkspaceProps = {
  patient: Patient;
  course: TreatmentCourse;
  domainCourse?: Course;
  carepathTasks: CarepathTask[];
  generatedDocuments: GeneratedDocument[];
  fractionEntries: FractionLogEntry[];
  workflowSteps: WorkflowStep[];
  tasks: Task[];
  documents: DocumentInstance[];
  clinicalFormTemplates: ClinicalFormTemplate[];
  treatmentPlans: TreatmentPlan[];
  treatmentFractions: TreatmentFraction[];
  images: ImagingAsset[];
  auditChecks: AuditCheck[];
  auditEvents: AuditEvent[];
};

const tabs: Array<{ id: WorkspaceTab; label: string; icon: typeof ClipboardList }> = [
  { id: "overview", label: "Overview", icon: ClipboardList },
  { id: "carepath", label: "Carepath", icon: ShieldCheck },
  { id: "clinical", label: "Clinical", icon: NotebookTabs },
  { id: "treatment", label: "Treatment", icon: Radiation },
  { id: "imaging", label: "Imaging", icon: ImageIcon },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "billing", label: "Billing", icon: WalletCards },
  { id: "notes", label: "Notes", icon: NotebookTabs },
  { id: "audit", label: "Audit", icon: ShieldCheck }
];

const carePathStages = [
  { label: "Consult", detail: "Ready" },
  { label: "Mapping / Sim", detail: "Complete" },
  { label: "Planning / QA", detail: "Complete" },
  { label: "On Treatment", detail: "Current" },
  { label: "Post Treatment", detail: "Pending" },
  { label: "Follow-Up", detail: "Pending" }
];

const imageChecklist = [
  "Inked Target",
  "Shielded Nozzle View",
  "Side Nozzle View",
  "US image at Sim",
  "Lesion without ink",
  "Lesion inked at border",
  "Dermoscopy",
  "Phase I margin",
  "Phase II margin",
  "All margins",
  "Isodose overlay"
];

const fakePatientDetails = [
  { label: "Phone", value: "(530) 555-0198" },
  { label: "Email", value: "patient.10321@example.com" },
  { label: "Address", value: "123 Ridgeview Dr." },
  { label: "Preferred Contact", value: "Phone" },
  { label: "Emergency Contact", value: "Maria S. (530) 555-0170" }
];

export function PatientWorkspace({
  patient,
  course,
  domainCourse,
  carepathTasks,
  generatedDocuments,
  fractionEntries,
  workflowSteps,
  tasks,
  documents,
  clinicalFormTemplates,
  treatmentPlans,
  treatmentFractions,
  images,
  auditChecks,
  auditEvents
}: PatientWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");
  const urgentTasks = tasks.filter((task) => task.priority === "URGENT" || task.priority === "HIGH" || task.status === "READY_FOR_REVIEW");
  const currentPlan = treatmentPlans[0];
  const readiness = auditReadinessScore(carepathTasks, generatedDocuments, fractionEntries);
  const carepath = carepathProgress(carepathTasks);
  const docs = documentProgress(generatedDocuments);
  const fractionPercent = Math.round((course.currentFraction / course.totalFractions) * 100);
  const signedDocuments = documents.filter((document) => document.signedAt).length;
  const pendingDocuments = documents.filter((document) => !document.signedAt).length;
  const blockedSteps = workflowSteps.filter((step) => step.status === "BLOCKED" || step.blockers.length);

  const activeContent = useMemo(() => {
    switch (activeTab) {
      case "carepath":
        return <CarepathWorkspaceTab steps={workflowSteps} />;
      case "clinical":
        return <ClinicalWorkspaceTab patient={patient} />;
      case "treatment":
        return <TreatmentWorkspaceTab course={course} plan={currentPlan} fractions={treatmentFractions} />;
      case "imaging":
        return <ImagingWorkspaceTab />;
      case "documents":
        return <DocumentsWorkspaceTab documents={documents} />;
      case "tasks":
        return <TasksWorkspaceTab tasks={tasks} />;
      case "billing":
        return <BillingWorkspaceTab />;
      case "notes":
        return <NotesWorkspaceTab />;
      case "audit":
        return <AuditWorkspaceTab checks={auditChecks} events={auditEvents} readiness={readiness} />;
      case "overview":
      default:
        return (
          <OverviewTab
            patient={patient}
            course={course}
            domainCourse={domainCourse}
            plan={currentPlan}
            urgentTasks={urgentTasks}
            fractionPercent={fractionPercent}
          />
        );
    }
  }, [
    activeTab,
    auditChecks,
    auditEvents,
    course,
    currentPlan,
    documents,
    domainCourse,
    fractionPercent,
    patient,
    readiness,
    tasks,
    treatmentFractions,
    urgentTasks,
    workflowSteps
  ]);

  return (
    <div className="space-y-4 bg-white">
      <WorkspaceHeader patient={patient} course={course} domainCourse={domainCourse} />
      <nav className="scrollbar-soft flex gap-1 overflow-x-auto border-b border-[#D8E4F5]" aria-label="Patient workspace tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex min-w-fit items-center gap-2 border-b-2 px-3 py-3 text-sm font-bold transition",
                activeTab === tab.id
                  ? "border-[#0033A0] text-[#0033A0]"
                  : "border-transparent text-[#3D5A80] hover:text-[#0033A0]"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0">{activeContent}</div>
        <aside className="min-w-0 space-y-4">
          {activeTab === "overview" ? (
            <ContextRail
              activeTab={activeTab}
              patient={patient}
              course={course}
              urgentTasks={urgentTasks}
              readiness={readiness}
              carepathPercent={carepath.percent}
              documentPercent={docs.percent}
              blockedSteps={blockedSteps.length}
              pendingDocuments={pendingDocuments}
              plan={currentPlan}
            />
          ) : (
            <WorkspaceTabRail
              activeTab={activeTab}
              course={course}
              patient={patient}
              tasks={tasks}
              documents={documents}
              checks={auditChecks}
              readiness={readiness}
            />
          )}
        </aside>
      </section>
    </div>
  );
}

function WorkspaceHeader({ patient, course, domainCourse }: { patient: Patient; course: TreatmentCourse; domainCourse?: Course }) {
  return (
    <section className="space-y-4 border-b border-[#D8E4F5] pb-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <Link href="/patients" className="inline-flex items-center gap-2 text-sm font-bold text-[#0033A0]">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Patients
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-[#061A55]">{patientName(patient)}</h1>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-500/15">
              {patient.status.replaceAll("_", " ")}
            </span>
            <span className="rounded-full bg-[#EAF1FF] px-3 py-1 text-xs font-bold text-[#0033A0] ring-1 ring-[#0033A0]/15">
              PHI-minimized
            </span>
          </div>
          <p className="mt-2 text-sm font-semibold text-[#3D5A80]">
            MRN {patient.mrn} · {patient.sex ?? "Sex not entered"} · DOB {patient.dob ?? "Not entered"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-xl border border-[#D8E4F5] bg-white px-3 py-2 text-sm font-bold text-[#0033A0]">
            <Printer className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Print
          </button>
          <button type="button" className="rounded-xl border border-[#D8E4F5] bg-white px-3 py-2 text-sm font-bold text-[#0033A0]">
            <Upload className="mr-2 inline h-4 w-4" aria-hidden="true" />
            Export
          </button>
          <button type="button" className="rounded-xl bg-[#0033A0] px-3 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)]">
            + Create Task
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-[#D8E4F5] text-[#0033A0]">
            <MoreVertical className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="grid gap-2 rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.08)] md:grid-cols-3 xl:grid-cols-6">
        <Meta label="Diagnosis" value={patient.diagnosis} sub="ICD-10: C44.301" />
        <Meta label="Site" value={patient.location} />
        <Meta label="Physician" value={patient.physician} />
        <Meta label="Course" value={domainCourse?.courseNumber ?? course.id} />
        <Meta label="Phase" value={course.chartRoundsPhase.replaceAll("_", " ")} />
        <Meta label="Protocol" value={course.protocolName} />
      </div>
    </section>
  );
}

function OverviewTab({
  patient,
  course,
  domainCourse,
  plan,
  urgentTasks,
  fractionPercent
}: {
  patient: Patient;
  course: TreatmentCourse;
  domainCourse?: Course;
  plan?: TreatmentPlan;
  urgentTasks: Task[];
  fractionPercent: number;
}) {
  return (
    <div className="space-y-4">
      <CarePathProgress course={course} />
      <section className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Treatment Summary" description="Current prescription and course state.">
          <FieldList
            items={[
              { label: "Technique", value: course.treatmentModality },
              { label: "Energy", value: course.energy ?? plan?.energy ?? "50 kV" },
              { label: "Applicator", value: course.applicator ?? plan?.applicatorSize ?? "2.5 cm" },
              { label: "Prescription", value: course.dose ?? "50 Gy in 20 fractions" },
              { label: "Phase I", value: `${course.currentFraction} / ${course.totalFractions} fx completed` },
              { label: "End Date", value: formatDate(course.endDate) },
              { label: "Treating MD", value: patient.physician }
            ]}
          />
          <button type="button" className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#D8E4F5] px-3 py-2 text-sm font-bold text-[#0033A0]">
            View full treatment plan
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </SectionCard>
        <SectionCard title="Recent Activity" description="Latest operational events.">
          <ActivityList />
        </SectionCard>
        <SectionCard title="Key Metrics" description="Treatment progress snapshot.">
          <FieldList
            items={[
              { label: "Total Dose Delivered", value: `${fractionPercent}%` },
              { label: "Fractions Completed", value: `${course.currentFraction} / ${course.totalFractions}` },
              { label: "Missed Treatments", value: 0 },
              { label: "Treatment Breaks", value: 0 },
              { label: "Next Fraction", value: "Tomorrow, 9:00 AM" },
              { label: "Weekday", value: "Mon-Fri" }
            ]}
          />
        </SectionCard>
      </section>
      <SectionCard title="Upcoming Schedule" description="Next treatment and follow-up timing.">
        <DataTable
          compact
          minWidth="980px"
          columns={[{ header: "Date" }, { header: "Time" }, { header: "Type" }, { header: "Description" }, { header: "Provider" }, { header: "Location" }, { header: "Status" }]}
          rows={[13, 14, 15].map((fraction, index) => ({
            id: `upcoming-${fraction}`,
            cells: [
              `May ${16 + index}, 2026`,
              "9:00 AM",
              "Treatment",
              `Fraction ${fraction} of ${course.totalFractions}`,
              patient.assignedStaff,
              domainCourse?.location ?? course.treatmentModality,
              "Scheduled"
            ]
          }))}
        />
      </SectionCard>
    </div>
  );
}

function CarepathTab({ steps, blockedSteps }: { steps: WorkflowStep[]; blockedSteps: number }) {
  const completed = steps.filter((step) => ["COMPLETED", "SIGNED", "UPLOADED"].includes(step.status)).length;
  const review = steps.filter((step) => step.status === "READY_FOR_REVIEW").length;
  const signature = steps.filter((step) => step.requiresSignature && !step.signedAt).length;
  return (
    <div className="space-y-4">
      <MetricStrip
        metrics={[
          ["Completed Steps", completed],
          ["Pending Steps", steps.length - completed],
          ["Ready for Review", review],
          ["Blocked", blockedSteps],
          ["Signatures Needed", signature]
        ]}
      />
      <SectionCard title="Carepath Workflow" description="Rows 0-14 for this active course. Row detail drawer is the future action surface.">
        <WorkflowStepTable steps={steps} />
      </SectionCard>
    </div>
  );
}

function ClinicalTab({ templates }: { templates: ClinicalFormTemplate[] }) {
  return (
    <div className="space-y-4">
      <MetricStrip metrics={[["Draft Forms", 2], ["Ready for Review", 1], ["Signed Forms", 4], ["Missing Fields", 3]]} />
      <section className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <SectionCard key={template.id} title={template.name} description={`${template.diagnosisType} · ${template.schema.length} sections`}>
            <FieldList
              items={[
                { label: "Status", value: template.active ? "Active" : "Inactive" },
                { label: "Completion", value: "Draft" },
                { label: "Last Updated", value: "Pending form response" },
                { label: "Actions", value: "Open / Generate Note" }
              ]}
            />
          </SectionCard>
        ))}
      </section>
    </div>
  );
}

function TreatmentTab({ course, plan, fractions }: { course: TreatmentCourse; plan?: TreatmentPlan; fractions: TreatmentFraction[] }) {
  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-4">
        <SectionCard title="Current Plan" description="Prescription summary.">
          <FieldList items={[{ label: "Energy", value: plan?.energy ?? course.energy ?? "Pending" }, { label: "Applicator", value: plan?.applicatorSize ?? course.applicator ?? "Pending" }, { label: "DOI", value: plan?.depthOfInvasion ?? course.targetDepth ?? "Pending" }]} />
        </SectionCard>
        <SectionCard title="Dose Calculator" description="Dose-depth summary.">
          <FieldList items={[{ label: "PDD", value: plan?.percentDepthDose ? `${plan.percentDepthDose}%` : "Pending" }, { label: "Dose to Depth", value: plan?.doseToDepth ?? "Pending" }, { label: "Coverage", value: plan?.coverage ?? "Pending" }]} />
        </SectionCard>
        <SectionCard title="Fraction Progress" description="Delivery state.">
          <FieldList items={[{ label: "Completed", value: `${course.currentFraction}/${course.totalFractions}` }, { label: "Cumulative", value: `${Math.round((course.currentFraction / course.totalFractions) * 100)}%` }, { label: "Next", value: "Tomorrow" }]} />
        </SectionCard>
        <SectionCard title="Physics Review" description="Review and signature.">
          <FieldList items={[{ label: "Physics", value: plan?.physicistReviewStatus.replaceAll("_", " ") ?? "Pending" }, { label: "Rad Onc", value: plan?.radOncSignatureStatus.replaceAll("_", " ") ?? "Pending" }, { label: "Document", value: "Generate Rx" }]} />
        </SectionCard>
      </section>
      <SectionCard title="Recent Fractions" description="Compact preview only.">
        <DataTable
          compact
          minWidth="980px"
          columns={[{ header: "Fx" }, { header: "Date" }, { header: "Planned" }, { header: "Delivered" }, { header: "Cumulative" }, { header: "Energy" }, { header: "IG" }, { header: "Status" }]}
          rows={fractions.slice(0, 8).map((fraction) => ({
            id: fraction.id,
            cells: [fraction.fractionNumber, fraction.treatmentDate, fraction.plannedDose, fraction.deliveredDose ?? "Held", fraction.cumulativeDose, fraction.energy ?? "Pending", fraction.imageGuidanceCompleted ? "Complete" : "Pending", fraction.status.replaceAll("_", " ")]
          }))}
        />
      </SectionCard>
    </div>
  );
}

function ImagingTab({ images }: { images: ImagingAsset[] }) {
  return (
    <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
      <SectionCard title="Required Image Checklist" description="IGSRT course image requirements.">
        <DataTable compact columns={[{ header: "Image" }, { header: "Status" }]} rows={imageChecklist.map((item) => ({ id: item, cells: [item, images.some((image) => image.category === item) ? "Present" : "Missing"] }))} />
      </SectionCard>
      <SectionCard title="Image Gallery" description="Course-specific image assets.">
        <DataTable compact columns={[{ header: "Category" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Notes" }]} rows={images.map((image) => ({ id: image.id, cells: [image.category, image.phase.replaceAll("_", " "), image.uploadedAt ?? "Pending", image.notes ?? ""] }))} />
      </SectionCard>
    </section>
  );
}

function DocumentsTab({ documents, signed, pending }: { documents: DocumentInstance[]; signed: number; pending: number }) {
  return (
    <div className="space-y-4">
      <MetricStrip metrics={[["Pending Signature", pending], ["Ready for Review", pending], ["Signed", signed], ["Uploaded to eCW", documents.filter((doc) => doc.uploadedToEcwAt).length]]} />
      <SectionCard title="Generated Documents" description="Patient/course generated documents and signature state.">
        <DocumentList documents={documents} />
      </SectionCard>
    </div>
  );
}

function TasksTab({ tasks }: { tasks: Task[] }) {
  return (
    <div className="space-y-4">
      <MetricStrip metrics={[["Open Tasks", tasks.length], ["Due Today", tasks.filter((task) => task.dueDate).length], ["Overdue", tasks.filter((task) => task.status === "OVERDUE").length], ["Signatures Needed", tasks.filter((task) => task.type === "SIGN_DOCUMENT").length]]} />
      <SectionCard title="Patient Work Queue" description="Course-specific tasks only.">
        <TaskList tasks={tasks} />
      </SectionCard>
    </div>
  );
}

function BillingTab({ courseId, auditChecks, documents }: { courseId: string; auditChecks: AuditCheck[]; documents: DocumentInstance[] }) {
  return (
    <div className="space-y-4">
      <MetricStrip metrics={[["Readiness", "78%"], ["Missing Docs", documents.filter((doc) => !doc.signedAt).length], ["Preauth", "Pending"], ["Billing Complete", auditChecks.some((check) => check.label.toLowerCase().includes("billing")) ? "Review" : "Pending"]]} />
      <SectionCard title="Billing Evidence" description="Course-specific billing readiness placeholders.">
        <DataTable
          compact
          minWidth="980px"
          columns={[{ header: "Code" }, { header: "Description" }, { header: "Planned" }, { header: "Completed" }, { header: "Billed" }, { header: "Required Document" }, { header: "Status" }]}
          rows={["77280", "77300", "77436"].map((code, index) => ({
            id: `${courseId}-${code}`,
            cells: [code, "Course documentation evidence", index + 1, index, 0, documents[index]?.title ?? "Pending", index ? "Review" : "Ready"]
          }))}
        />
      </SectionCard>
    </div>
  );
}

function NotesTab({ patient, auditEvents }: { patient: Patient; auditEvents: AuditEvent[] }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Add Note" description="Operational note composer placeholder.">
        <div className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-4 text-sm font-semibold text-[#3D5A80]">Write an operational note...</div>
      </SectionCard>
      <SectionCard title="Notes" description="Operational summaries only.">
        <p className="text-sm font-semibold leading-6 text-[#3D5A80]">{patient.notes}</p>
      </SectionCard>
      <SectionCard title="Activity-Linked Notes" description="Recent note-adjacent activity.">
        <DataTable compact columns={[{ header: "Time" }, { header: "Action" }, { header: "Entity" }]} rows={auditEvents.slice(0, 5).map((event) => ({ id: event.id, cells: [event.timestamp, event.action, event.entityType.replaceAll("_", " ")] }))} />
      </SectionCard>
    </div>
  );
}

function AuditTab({ checks, events, readiness }: { checks: AuditCheck[]; events: AuditEvent[]; readiness: number }) {
  return (
    <div className="space-y-4">
      <MetricStrip metrics={[["Audit Readiness", `${readiness}%`], ["Checks", checks.length], ["Blockers", checks.filter((check) => ["BLOCKED", "OVERDUE"].includes(check.status)).length], ["Final Sign", "Pending"]]} />
      <SectionCard title="Audit Checklist" description="Final closeout validation.">
        <AuditChecklist checks={checks} />
      </SectionCard>
      <AuditTimeline events={events} />
    </div>
  );
}

function ContextRail({
  activeTab,
  patient,
  course,
  urgentTasks,
  readiness,
  carepathPercent,
  documentPercent,
  blockedSteps,
  pendingDocuments,
  plan
}: {
  activeTab: WorkspaceTab;
  patient: Patient;
  course: TreatmentCourse;
  urgentTasks: Task[];
  readiness: number;
  carepathPercent: number;
  documentPercent: number;
  blockedSteps: number;
  pendingDocuments: number;
  plan?: TreatmentPlan;
}) {
  if (activeTab === "carepath") {
    return (
      <>
        <RailCard title="Workflow Summary" items={[["Progress", `${carepathPercent}%`], ["Blocked", blockedSteps], ["Current", course.chartRoundsPhase.replaceAll("_", " ")]]} />
        <RailCard title="Signature Queue" items={[["Pending Docs", pendingDocuments], ["Next Action", patient.nextAction]]} warning />
      </>
    );
  }
  if (activeTab === "treatment") {
    return (
      <>
        <RailCard title="Plan Summary" items={[["Energy", plan?.energy ?? course.energy ?? "Pending"], ["Applicator", plan?.applicatorSize ?? course.applicator ?? "Pending"], ["Fractions", `${course.currentFraction}/${course.totalFractions}`]]} />
        <RailCard title="Next Fraction" items={[["When", "Tomorrow, 9:00 AM"], ["Location", "Main Campus"], ["IG", "Required"]]} />
      </>
    );
  }
  if (activeTab === "documents") {
    return <RailCard title="Signature Summary" items={[["Pending", pendingDocuments], ["Document Progress", `${documentPercent}%`], ["eCW", "Review uploads"]]} warning={pendingDocuments > 0} />;
  }
  if (activeTab === "audit") {
    return <RailCard title="Audit Readiness" items={[["Score", `${readiness}%`], ["Final Blockers", blockedSteps + pendingDocuments], ["Closeout", "Pending"]]} warning />;
  }
  if (activeTab !== "overview") {
    return <RailCard title="Tab Actions" items={[["Patient", patient.id], ["Course", course.id], ["Next Action", patient.nextAction]]} />;
  }
  return (
    <>
      <SectionCard title="Open Tasks" description="Top urgent work.">
        <div className="space-y-3">
          {(urgentTasks.length ? urgentTasks : []).slice(0, 3).map((task) => (
            <div key={task.id} className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-3">
              <p className="text-sm font-bold text-[#061A55]">{task.title}</p>
              <p className="mt-1 text-xs font-semibold text-[#FF6620]">{task.priority} · {task.dueDate ?? "Due soon"}</p>
            </div>
          ))}
          <button type="button" className="text-sm font-bold text-[#0033A0]">View all</button>
        </div>
      </SectionCard>
      <SectionCard title="Patient Details" description="Fake contact placeholders.">
        <FieldList items={fakePatientDetails} />
      </SectionCard>
      <SectionCard title="Flags & Alerts" description="Operational warnings.">
        <div className="space-y-3">
          <AlertRow text="Allergy: Adhesive tape" />
          <AlertRow text={patient.checklist.followUpScheduled ? "Follow-up scheduled" : "Needs follow-up scheduled"} />
          {patient.flags.map((flag) => <AlertRow key={flag.id} text={flag.summary} />)}
        </div>
      </SectionCard>
    </>
  );
}

function CarePathProgress({ course }: { course: TreatmentCourse }) {
  return (
    <SectionCard title="Care Path Progress" description={`Phase I: ${course.dose ?? "50 Gy in 20 fx"}`}>
      <div className="scrollbar-soft overflow-x-auto">
        <ol className="flex min-w-[780px] items-center justify-between gap-2">
          {carePathStages.map((stage, index) => {
            const isDone = index < 3;
            const isCurrent = index === 3;
            return (
              <li key={stage.label} className="flex flex-1 flex-col items-center text-center">
                <span className={cn("grid h-8 w-8 place-items-center rounded-full text-sm font-bold ring-4", isCurrent ? "bg-[#0033A0] text-white ring-[#EAF1FF]" : isDone ? "bg-emerald-500 text-white ring-emerald-50" : "bg-[#E7EEF8] text-white ring-[#F8FBFF]")}>
                  {isDone ? "✓" : isCurrent ? "•" : "×"}
                </span>
                <span className="mt-2 text-xs font-bold text-[#061A55]">{stage.label}</span>
                <span className="mt-1 text-xs font-semibold text-[#3D5A80]">{isCurrent ? `${course.currentFraction} of ${course.totalFractions} fx` : stage.detail}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionCard>
  );
}

function MetricStrip({ metrics }: { metrics: Array<[string, string | number]> }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
          <p className="text-xs font-bold uppercase tracking-wide text-[#3D5A80]">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#061A55]">{value}</p>
        </div>
      ))}
    </section>
  );
}

function ActivityList() {
  const rows = [
    ["Treatment session completed", "Today, 9:15 AM"],
    ["US image guidance reviewed", "Today, 9:10 AM"],
    ["Physician OTV note signed", "Yesterday"],
    ["Plan QA passed", "Aug 21"],
    ["Simulation completed", "Aug 19"]
  ];
  return (
    <div className="space-y-3">
      {rows.map(([title, time], index) => (
        <div key={title} className="flex gap-3">
          <span className={cn("mt-0.5 grid h-8 w-8 place-items-center rounded-lg", index % 2 ? "bg-[#FFF0E8] text-[#FF6620]" : "bg-[#EAF1FF] text-[#0033A0]")}>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-[#061A55]">{title}</p>
            <p className="text-xs font-semibold text-[#3D5A80]">{time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RailCard({ title, items, warning = false }: { title: string; items: Array<[string, string | number]>; warning?: boolean }) {
  return (
    <SectionCard title={title} description={warning ? "Needs attention" : "Context"}>
      <FieldList items={items.map(([label, value]) => ({ label, value, tone: warning && label !== "Score" ? "warning" : "default" }))} />
    </SectionCard>
  );
}

function AlertRow({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-[#FFF8F4] p-3 text-sm font-semibold text-[#061A55]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF6620]" aria-hidden="true" />
      {text}
    </div>
  );
}

function Meta({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="min-w-0 rounded-xl px-2 py-1">
      <p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#3D5A80]" title={label}>{label}</p>
      <p className="mt-0.5 truncate text-[13px] font-bold leading-5 text-[#061A55]" title={value}>{value}</p>
      {sub ? <p className="mt-0.5 truncate text-[11px] font-semibold leading-4 text-[#3D5A80]" title={sub}>{sub}</p> : null}
    </div>
  );
}
