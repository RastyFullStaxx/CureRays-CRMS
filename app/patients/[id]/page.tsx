import { notFound } from "next/navigation";
import { AuditChecklist } from "@/components/audit-checklist";
import { AuditTimeline } from "@/components/audit-timeline";
import { CourseTimeline } from "@/components/course-timeline";
import { DataTable } from "@/components/data-table";
import { DocumentList } from "@/components/document-list";
import { PatientOverviewPanel } from "@/components/patient-overview-panel";
import { PatientProfileShell } from "@/components/patient-profile-shell";
import { PatientSummaryHeader } from "@/components/patient-summary-header";
import { SectionCard } from "@/components/section-card";
import { TaskList } from "@/components/task-list";
import { TreatmentCoursePanel } from "@/components/treatment-course-panel";
import { WorkflowStepTable } from "@/components/workflow-step-table";
import {
  auditEvents,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  treatmentCourses
} from "@/lib/clinical-store";
import {
  auditChecks,
  clinicalFormTemplates,
  getCourses,
  getDocumentInstances,
  getTasks,
  getTreatmentFractions,
  getTreatmentPlans,
  getWorkflowSteps,
  imagingAssets
} from "@/lib/module-data";
import { findPatientPhi, systemPhiAccess } from "@/lib/server/phi-store";
import {
  courseDocuments,
  courseFractions,
  courseTasks,
  patientActiveCourse
} from "@/lib/workflow";

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const patient = findPatientPhi(params.id, systemPhiAccess("Render patient profile page"));

  if (!patient) {
    notFound();
  }

  const course = patientActiveCourse(patient, treatmentCourses);

  if (!course) {
    notFound();
  }

  const tasks = courseTasks(course.id, carepathTasks);
  const documents = courseDocuments(course.id, generatedDocuments);
  const fractions = courseFractions(course.id, fractionLogEntries);
  const domainCourse = getCourses().find((item) => item.id === course.id);
  const workflowSteps = getWorkflowSteps(course.id);
  const moduleTasks = getTasks().filter((task) => task.courseId === course.id);
  const moduleDocuments = getDocumentInstances().filter((document) => document.courseId === course.id);
  const treatmentPlans = getTreatmentPlans().filter((plan) => plan.courseId === course.id);
  const treatmentFractions = getTreatmentFractions().filter((fraction) => fraction.courseId === course.id);
  const courseImages = imagingAssets.filter((asset) => asset.courseId === course.id);
  const courseAuditChecks = auditChecks.filter((check) => check.courseId === course.id);

  return (
    <PatientProfileShell patient={patient} active="overview">
      {domainCourse ? (
        <>
          <PatientSummaryHeader patient={patient} course={domainCourse} />
          <CourseTimeline currentPhase={domainCourse.currentPhase} />
        </>
      ) : null}
      <PatientOverviewPanel
        patient={patient}
        course={course}
        tasks={tasks}
        documents={documents}
        fractions={fractions}
      />
      <TreatmentCoursePanel course={course} />

      <div id="tasks">
        <SectionCard title="Tasks" description="Course-specific work across forms, documents, signatures, delivery, and audit.">
          <TaskList tasks={moduleTasks} />
        </SectionCard>
      </div>

      <div id="clinical-forms">
        <SectionCard title="Clinical Forms" description="Structured clinical form responses generate notes and route for signature.">
          <DataTable
            columns={[{ header: "Template" }, { header: "Diagnosis" }, { header: "Fields" }, { header: "Status" }]}
            rows={clinicalFormTemplates.map((template) => ({
              id: template.id,
              cells: [
                template.name,
                template.diagnosisType,
                template.schema.flatMap((section) => section.fields).length,
                "Draft / Ready for form engine"
              ]
            }))}
          />
        </SectionCard>
      </div>

      <div id="treatment-planning">
        <SectionCard title="Treatment Planning" description="Planning parameters, review status, signature status, and generated planning document readiness.">
          <DataTable
            columns={[{ header: "Plan" }, { header: "Site" }, { header: "Dose" }, { header: "Physics" }, { header: "Rad Onc" }]}
            rows={treatmentPlans.map((plan) => ({
              id: plan.id,
              cells: [
                plan.id,
                plan.site,
                `${plan.dosePerFraction ?? "Pending"} x ${plan.totalFractions ?? "?"}`,
                plan.physicistReviewStatus.replaceAll("_", " "),
                plan.radOncSignatureStatus.replaceAll("_", " ")
              ]
            }))}
          />
        </SectionCard>
      </div>

      <div id="imaging">
        <SectionCard title="Imaging" description="Required photos and imaging assets linked to course, phase, and fraction.">
          <DataTable
            columns={[{ header: "Category" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Notes" }]}
            rows={courseImages.map((asset) => ({
              id: asset.id,
              cells: [asset.category, asset.phase.replaceAll("_", " "), asset.uploadedAt ?? "Pending", asset.notes ?? ""]
            }))}
          />
        </SectionCard>
      </div>

      <div id="documents">
        <SectionCard title="Documents" description="Generated documents, versions, signatures, locked states, and eCW upload placeholders.">
          <DocumentList documents={moduleDocuments} />
        </SectionCard>
      </div>

      <div id="treatment-delivery">
        <SectionCard title="Treatment Delivery" description="Fractionation records and final-fraction trigger state.">
          <DataTable
            columns={[{ header: "Fx" }, { header: "Date" }, { header: "Dose" }, { header: "Cumulative" }, { header: "Status" }]}
            rows={treatmentFractions.map((fraction) => ({
              id: fraction.id,
              cells: [
                fraction.fractionNumber,
                fraction.treatmentDate,
                fraction.deliveredDose ?? "Held",
                fraction.cumulativeDose,
                fraction.status.replaceAll("_", " ")
              ]
            }))}
          />
        </SectionCard>
      </div>

      <div id="billing-audit">
        <SectionCard title="Billing / Audit" description="Audit closeout checks for documents, signatures, images, treatment logs, follow-up, and billing.">
          <AuditChecklist checks={courseAuditChecks.length ? courseAuditChecks : auditChecks.slice(0, 4)} />
        </SectionCard>
      </div>

      <SectionCard title="Course Workflow" description="Canonical Carepath steps copied onto this active course.">
        <WorkflowStepTable steps={workflowSteps} />
      </SectionCard>

      <section id="notes" className="glass-panel rounded-glass p-5">
        <h3 className="text-lg font-semibold text-curerays-dark-plum">Notes and flags</h3>
        <p className="mt-2 text-sm leading-6 text-curerays-indigo">{patient.notes}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {patient.flags.length ? (
            patient.flags.map((flag) => (
              <div key={flag.id} className="rounded-lg bg-curerays-orange/10 p-4">
                <p className="text-sm font-semibold text-curerays-orange">{flag.severity}</p>
                <p className="mt-1 text-sm leading-5 text-curerays-dark-plum">{flag.summary}</p>
              </div>
            ))
          ) : (
            <div className="rounded-lg bg-white/54 p-4 text-sm font-semibold text-curerays-indigo">
              No active operational flags.
            </div>
          )}
        </div>
      </section>

      <div id="audit">
        <AuditTimeline events={auditEvents} />
      </div>
    </PatientProfileShell>
  );
}
