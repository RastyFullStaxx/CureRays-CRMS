import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileClock,
  ShieldCheck,
  Users
} from "lucide-react";
import { AuditReadinessCard } from "@/components/audit-readiness-card";
import { DocumentLifecycleTable } from "@/components/document-lifecycle-table";
import { KpiCard } from "@/components/kpi-card";
import { OperationalSnapshot } from "@/components/operational-snapshot";
import { PatientTable } from "@/components/patient-table";
import { ResponsiblePartyWorkQueue } from "@/components/responsible-party-work-queue";
import { RightRail } from "@/components/right-rail";
import {
  activities,
  appointments,
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  patients,
  priorityFlags,
  treatmentCourses
} from "@/lib/mock-data";
import {
  auditReadinessScore,
  countFlaggedPatients,
  documentStatusCounts,
  overdueTaskCount,
  phaseCounts,
  responsiblePartyQueue
} from "@/lib/workflow";

export default function DashboardPage() {
  const counts = phaseCounts(patients);
  const flagged = countFlaggedPatients(patients);
  const documents = documentStatusCounts(generatedDocuments);
  const auditScore = auditReadinessScore(carepathTasks, generatedDocuments, fractionLogEntries);
  const openTasks = carepathTasks.filter((task) => !["COMPLETED", "NOT_APPLICABLE"].includes(task.status)).length;
  const coursesNeedingAttention = treatmentCourses.filter((course) =>
    ["ON_HOLD", "NOT_STARTED"].includes(course.status)
  ).length;

  return (
    <div className="space-y-4">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Total Patients"
          value={patients.length}
          detail="Centralized records in the workflow platform."
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
          label="Audit Readiness"
          value={`${auditScore}%`}
          detail={`${flagged} records carry open clinical or operational flags.`}
          icon={ShieldCheck}
          tone="amber"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Open Carepath Tasks"
          value={openTasks}
          detail="Tasks still assigned to a responsible party."
          icon={ClipboardList}
          tone="orange"
        />
        <KpiCard
          label="Pending Documents"
          value={documents.PENDING_NEEDED}
          detail="Documents needed before the workflow can close."
          icon={FileClock}
          tone="plum"
        />
        <KpiCard
          label="Signed Documents"
          value={documents.SIGNED}
          detail="Signed generated documents currently audit-ready."
          icon={FileCheck2}
          tone="blue"
        />
        <KpiCard
          label="N/A Documents"
          value={documents.NOT_APPLICABLE}
          detail="Template items intentionally marked not applicable."
          icon={FileCheck2}
          tone="amber"
        />
        <KpiCard
          label="Overdue Tasks"
          value={overdueTaskCount(carepathTasks)}
          detail={`${coursesNeedingAttention} treatment courses need attention.`}
          icon={AlertTriangle}
          tone="orange"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <PatientTable
          patients={patients}
          courses={treatmentCourses}
          tasks={carepathTasks}
          documents={generatedDocuments}
          fractions={fractionLogEntries}
          title="Clinical workflow command center"
          description="Patient phase, Carepath tasks, documents, fractions, billing references, and audit readiness in one operational view."
        />
        <RightRail appointments={appointments} flags={priorityFlags} activities={activities} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <AuditReadinessCard
          tasks={carepathTasks}
          documents={generatedDocuments}
          fractions={fractionLogEntries}
        />
        <ResponsiblePartyWorkQueue queues={responsiblePartyQueue(carepathTasks, generatedDocuments)} />
      </section>

      <DocumentLifecycleTable documents={generatedDocuments.slice(0, 5)} />

      <OperationalSnapshot
        patients={patients}
        tasks={carepathTasks}
        documents={generatedDocuments}
        fractions={fractionLogEntries}
      />
    </div>
  );
}
