export const dynamic = 'force-dynamic';

import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Flag } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { moduleSnapshot, patientLabel, patientMrn, phaseLabel, statusLabel, statusTone } from "@/lib/services/operational-page-service";

export default function CoursesPage() {
  const courses = moduleSnapshot.courses;
  const active = courses.filter((course) => course.status !== "COMPLETED").length;
  const upcoming = courses.filter((course) => course.simpleDashboardPhase === "UPCOMING").length;
  const onTreatment = courses.filter((course) => course.simpleDashboardPhase === "ON_TREATMENT").length;
  const post = courses.filter((course) => course.simpleDashboardPhase === "POST").length;
  const blocked = courses.filter((course) => course.flagsIssues.length || course.status === "BLOCKED").length;
  const rows: SerializedTableRow[] = courses.map((course) => ({
    id: course.id,
    course: course.id.replace("COURSE-", "C"),
    courseNumber: course.courseNumber,
    patient: patientLabel(course.patientId),
    mrn: patientMrn(course.patientId),
    diagnosis: course.diagnosisType,
    diagnosisVariant: course.diagnosisType === "Skin" ? "info" : course.diagnosisType === "Arthritis" ? "success" : "primary",
    site: course.treatmentSite,
    location: course.location,
    physician: course.physicianId ?? "Unassigned",
    phase: phaseLabel(course.currentPhase),
    phaseTone: statusTone(course.currentPhase),
    status: statusLabel(course.status),
    statusTone: statusTone(course.status),
    startDate: course.startDate ?? "",
    endDate: course.endDate ?? "",
    nextAction: course.nextAction,
    flags: course.flagsIssues.length > 0,
    staff: course.assignedStaff.join(", "),
  }));

  return (
    <PageStack>
      <PageHeader
        title="Courses"
        subtitle="Manage treatment courses across all patients"
        actions={
          <>
            <PrototypeActionButton label="Export" icon="calendar" kind="export" description="Prepare a tokenized course list for operations review." />
            <PrototypeActionButton label="New Course" icon="plus" kind="create" variant="primary" description="Stage a new course bundle with workflow, task, document, folder, and audit placeholders." />
          </>
        }
      />
      <StatGrid>
        <StatCard icon={ClipboardList} label="Active Courses" value={active} sub="Across patients" />
        <StatCard icon={CalendarDays} label="Upcoming" value={upcoming} sub="Chart prep" tone="info" />
        <StatCard icon={CheckCircle2} label="On Treatment" value={onTreatment} sub="Active delivery" tone="success" />
        <StatCard icon={Flag} label="Post-Tx" value={post} sub="Summary and audit" tone="primary" />
        <StatCard icon={AlertTriangle} label="Needs Action" value={blocked} sub="Blocked or flagged" tone="warning" />
      </StatGrid>
      <SerializedDataTable
        columns={[
          { key: 'course', label: 'Course', kind: 'primary', subKey: 'courseNumber' },
          { key: 'patient', label: 'Patient', kind: 'primary' },
          { key: 'mrn', label: 'MRN' },
          { key: 'diagnosis', label: 'Diagnosis', kind: 'badge', variant: 'info' },
          { key: 'site', label: 'Site' },
          { key: 'location', label: 'Location', kind: 'muted' },
          { key: 'physician', label: 'Physician' },
          { key: 'phase', label: 'Phase', kind: 'status', toneKey: 'phaseTone' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'startDate', label: 'Start Date', kind: 'date' },
          { key: 'endDate', label: 'End Date', kind: 'date' },
          { key: 'nextAction', label: 'Next Action', kind: 'longText' },
          { key: 'flags', label: 'Flags', kind: 'flag' },
          { key: 'staff', label: 'Staff' },
        ]}
        rows={rows}
        empty="No treatment courses are available."
        emptyDescription="Courses will appear after a patient/course bundle is created."
        pageSize={10}
        search={{
          placeholder: 'Search patient, MRN, diagnosis, course, or next action...',
          keys: ['course', 'courseNumber', 'patient', 'mrn', 'diagnosis', 'site', 'location', 'physician', 'status', 'nextAction'],
        }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'status', label: 'Status' },
          { id: 'physician', label: 'Physician' },
          { id: 'diagnosis', label: 'Diagnosis' },
        ]}
      />
    </PageStack>
  );
}
