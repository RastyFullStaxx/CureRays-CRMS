import Link from "next/link";
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, FileClock, ShieldCheck, Users } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { KpiCard } from "@/components/kpi-card";
import { SectionCard } from "@/components/section-card";
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalAppointments,
  operationalPatients,
  operationalPriorityFlags,
  operationalTreatmentCourses
} from "@/lib/clinical-store";
import {
  auditReadinessScore,
  completedTaskStatuses,
  countFlaggedPatients,
  overdueTaskCount,
  phaseCounts
} from "@/lib/workflow";

export default function DashboardPage() {
  const patients = operationalPatients();
  const safeTreatmentCourses = operationalTreatmentCourses();
  const appointments = operationalAppointments();
  const priorityFlags = operationalPriorityFlags();
  const counts = phaseCounts(patients);
  const flagged = countFlaggedPatients(patients);
  const auditScore = auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries);
  const openTasks = carepathTasks.filter((task) => !completedTaskStatuses.includes(task.status)).length;
  const coursesNeedingAttention = safeTreatmentCourses.filter((course) =>
    ["ON_HOLD", "NOT_STARTED"].includes(course.status)
  ).length;
  const pendingSignatures = generatedDocuments.filter((document) => document.signReviewState === "READY_FOR_SIGNATURE");
  const missingDocuments = generatedDocuments.filter((document) =>
    ["PENDING_NEEDED", "MISSING_FIELDS", "NEEDS_REVIEW"].includes(document.status)
  );
  const treatmentProgress =
    safeTreatmentCourses.length === 0
      ? 0
      : Math.round(
          (safeTreatmentCourses.reduce(
            (sum, course) => sum + course.currentFraction / Math.max(course.totalFractions, 1),
            0
          ) /
            safeTreatmentCourses.length) *
            100
        );

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-glass p-5 sm:p-6">
        <p className="text-xs font-bold uppercase text-curerays-orange">Command center</p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-curerays-dark-plum">Dashboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-curerays-indigo sm:text-base">
              Compact operational overview for CureRays workflow state. Detailed patient, Carepath,
              document, form, treatment, billing, and audit work now lives in dedicated modules.
            </p>
          </div>
          <Link
            href="/patients"
            className="inline-flex w-fit rounded-lg bg-curerays-blue px-4 py-2 text-sm font-semibold text-white"
          >
            Open registry
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Active Patients"
          value={patients.length}
          detail="Centralized operational records."
          icon={Users}
          tone="blue"
        />
        <KpiCard
          label="Upcoming"
          value={counts.UPCOMING}
          detail="Filtered by chart-rounds phase."
          icon={CalendarDays}
          tone="plum"
        />
        <KpiCard
          label="On Treatment"
          value={counts.ON_TREATMENT}
          detail="Active courses with fraction and document signals."
          icon={Activity}
          tone="orange"
        />
        <KpiCard
          label="Post Treatment"
          value={counts.POST}
          detail="Closure, billing review, and audit readiness."
          icon={CheckCircle2}
          tone="blue"
        />
        <KpiCard
          label="Treatment Progress"
          value={`${treatmentProgress}%`}
          detail="Average fraction progress across active courses."
          icon={Activity}
          tone="orange"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Audit Readiness"
          value={`${auditScore}%`}
          detail={`${flagged} records carry open clinical or operational flags.`}
          icon={ShieldCheck}
          tone="amber"
        />
        <KpiCard
          label="Open Tasks"
          value={openTasks}
          detail="Assigned work outside completed states."
          icon={CheckCircle2}
          tone="orange"
        />
        <KpiCard
          label="Pending Documents"
          value={missingDocuments.length}
          detail="Missing, pending, or review-needed documents."
          icon={FileClock}
          tone="plum"
        />
        <KpiCard
          label="Pending Signatures"
          value={pendingSignatures.length}
          detail="Documents ready for clinical signature."
          icon={ShieldCheck}
          tone="blue"
        />
        <KpiCard
          label="Overdue Tasks"
          value={overdueTaskCount(carepathTasks)}
          detail={`${coursesNeedingAttention} treatment courses need attention.`}
          icon={AlertTriangle}
          tone="orange"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Urgent Queue" description="Short list only; open Tasks or Patient Workspace for work.">
          <DataTable
            columns={[{ header: "Item" }, { header: "Owner" }, { header: "Due" }, { header: "Open" }]}
            rows={priorityFlags.slice(0, 5).map((flag) => ({
              id: flag.id,
              cells: [
                <span key="summary" className="font-semibold">{flag.summary}</span>,
                flag.owner,
                flag.dueAt,
                <Link key="open" href="/tasks" className="font-semibold text-curerays-blue">Tasks</Link>
              ]
            }))}
          />
        </SectionCard>
        <SectionCard title="Today" description="Appointments and treatments that can trigger workflow updates.">
          <DataTable
            columns={[{ header: "Time" }, { header: "Patient" }, { header: "Location" }, { header: "Staff" }]}
            rows={appointments.slice(0, 5).map((appointment) => ({
              id: appointment.id,
              cells: [appointment.time, appointment.displayLabel, appointment.location, appointment.staff]
            }))}
          />
        </SectionCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Missing Documents" description="Document details and versioning live in Documents.">
          <DataTable
            columns={[{ header: "Document" }, { header: "Status" }, { header: "Assigned" }, { header: "Open" }]}
            rows={missingDocuments.slice(0, 5).map((document) => ({
              id: document.id,
              cells: [
                <span key="name" className="font-semibold">{document.name}</span>,
                document.status.replaceAll("_", " "),
                document.assignedTo,
                <Link key="open" href="/documents" className="font-semibold text-curerays-blue">Documents</Link>
              ]
            }))}
          />
        </SectionCard>
        <SectionCard title="Blocked Courses" description="Courses needing review before phase advancement.">
          <DataTable
            columns={[{ header: "Course" }, { header: "Phase" }, { header: "Status" }, { header: "Open" }]}
            rows={safeTreatmentCourses
              .filter((course) => ["ON_HOLD", "NOT_STARTED"].includes(course.status))
              .map((course) => ({
                id: course.id,
                cells: [
                  <span key="course" className="font-semibold">{course.courseRef}</span>,
                  course.chartRoundsPhase.replaceAll("_", " "),
                  course.status.replaceAll("_", " "),
                  <Link key="open" href="/courses" className="font-semibold text-curerays-blue">Courses</Link>
                ]
              }))}
          />
        </SectionCard>
      </section>
    </div>
  );
}
