import { notFound } from "next/navigation";
import { AuditChecklist } from "@/components/audit-checklist";
import { AuditTimeline } from "@/components/audit-timeline";
import { CourseTimeline } from "@/components/course-timeline";
import { DataTable } from "@/components/data-table";
import { DocumentList } from "@/components/document-list";
import { DetailPanel, FieldList, WorkspaceGrid } from "@/components/layout/page-layout";
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
      <WorkspaceGrid
        main={
          <>
            <PatientOverviewPanel
              patient={patient}
              course={course}
              tasks={tasks}
              documents={documents}
              fractions={fractions}
            />
            <TreatmentCoursePanel course={course} />
            <SectionCard title="Current Work" description="Next operational actions for this patient/course.">
              <TaskList tasks={moduleTasks} />
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Patient Context" subtitle="Drawer-ready workspace summary" actionLabel="Open full context">
              <FieldList
                items={[
                  { label: "MRN", value: patient.mrn },
                  { label: "DOB", value: patient.dob ?? "Not entered" },
                  { label: "Course", value: domainCourse?.courseNumber ?? course.id },
                  { label: "Phase", value: domainCourse?.currentPhase.replaceAll("_", " ") ?? course.chartRoundsPhase },
                  { label: "Next Action", value: domainCourse?.nextAction ?? patient.nextAction }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Assigned Care Team" description="Role-aware routing placeholder.">
              <FieldList
                items={[
                  { label: "Physician", value: patient.physician },
                  { label: "Assigned Staff", value: patient.assignedStaff },
                  { label: "Signatures", value: `${documents.filter((document) => document.status === "NEEDS_REVIEW").length} pending` },
                  { label: "Audit", value: courseAuditChecks.length ? "In review" : "Not started" }
                ]}
              />
            </SectionCard>
            <SectionCard title="Notes and Flags" description="Operational notes and active issue markers.">
              <p className="text-sm font-semibold leading-6 text-[#3D5A80]">{patient.notes}</p>
              <div className="mt-4 space-y-3">
                {patient.flags.length ? (
                  patient.flags.map((flag) => (
                    <div key={flag.id} className="rounded-xl border border-[#FFD7C2] bg-[#FFF8F4] p-3">
                      <p className="text-sm font-bold text-[#FF6620]">{flag.severity}</p>
                      <p className="mt-1 text-sm font-semibold leading-5 text-[#061A55]">{flag.summary}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-[#F8FBFF] p-3 text-sm font-bold text-[#3D5A80]">No active operational flags.</div>
                )}
              </div>
            </SectionCard>
          </>
        }
      />

      <div id="carepath">
        <SectionCard title="Course Workflow" description="Canonical Carepath steps copied onto this active course.">
          <WorkflowStepTable steps={workflowSteps} />
        </SectionCard>
      </div>

      <section className="grid gap-4 xl:grid-cols-2">
        <div id="clinical-forms">
          <SectionCard title="Clinical Forms" description="Structured clinical form responses generate notes and route for signature.">
            <DataTable
              compact
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
              compact
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
              compact
              columns={[{ header: "Category" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Notes" }]}
              rows={courseImages.map((asset) => ({
                id: asset.id,
                cells: [asset.category, asset.phase.replaceAll("_", " "), asset.uploadedAt ?? "Pending", asset.notes ?? ""]
              }))}
            />
          </SectionCard>
        </div>

        <div id="treatment-delivery">
          <SectionCard title="Treatment Delivery" description="Fractionation records and final-fraction trigger state.">
            <DataTable
              compact
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
      </section>

      <div id="documents">
        <SectionCard title="Documents" description="Generated documents, versions, signatures, locked states, and eCW upload placeholders.">
          <DocumentList documents={moduleDocuments} />
        </SectionCard>
      </div>

      <div id="billing-audit">
        <SectionCard title="Billing / Audit" description="Audit closeout checks for documents, signatures, images, treatment logs, follow-up, and billing.">
          <AuditChecklist checks={courseAuditChecks.length ? courseAuditChecks : auditChecks.slice(0, 4)} />
        </SectionCard>
      </div>

      <div id="audit">
        <AuditTimeline events={auditEvents} />
      </div>
    </PatientProfileShell>
  );
}
