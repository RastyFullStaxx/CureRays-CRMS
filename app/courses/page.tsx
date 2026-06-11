'use client';
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Flag, Plus } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, patientMrn, phaseLabel, statusLabel, statusTone } from "@/lib/global-page-data";
import { mapTone } from "@/lib/status-utils";

export default function CoursesPage() {
  const courses = moduleSnapshot.courses;
  const active = courses.filter((course) => course.status !== "COMPLETED").length;
  const upcoming = courses.filter((course) => course.simpleDashboardPhase === "UPCOMING").length;
  const onTreatment = courses.filter((course) => course.simpleDashboardPhase === "ON_TREATMENT").length;
  const post = courses.filter((course) => course.simpleDashboardPhase === "POST").length;
  const blocked = courses.filter((course) => course.flagsIssues.length || course.status === "BLOCKED").length;

  return (
    <PageStack>
      <PageHeader
        title="Courses"
        subtitle="Manage treatment courses across all patients"
        actions={
          <>
            <Button variant="secondary" disabled title="Prototype placeholder"><CalendarDays className="h-4 w-4" /> Export</Button>
            <Button disabled title="Prototype placeholder"><Plus className="h-4 w-4" /> New Course</Button>
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
      <DataTable
        columns={[
          { key: 'course', label: 'Course', render: (row) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--color-primary)]">{row.id.replace("COURSE-", "C")}</p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)]">{row.courseNumber}</p>
            </div>
          )},
          { key: 'patient', label: 'Patient', render: (row) => (
            <span className="block truncate font-bold">{patientLabel(row.patientId)}</span>
          )},
          { key: 'mrn', label: 'MRN', render: (row) => patientMrn(row.patientId) },
          { key: 'diagnosis', label: 'Diagnosis', render: (row) => (
            <Badge variant={row.diagnosisType === "Skin" ? "info" : row.diagnosisType === "Arthritis" ? "success" : "primary"}>{row.diagnosisType}</Badge>
          )},
          { key: 'site', label: 'Site', render: (row) => (
            <span className="block truncate">{row.treatmentSite}</span>
          )},
          { key: 'location', label: 'Location', render: (row) => (
            <span className="block truncate text-[var(--color-text-muted)]">{row.location}</span>
          )},
          { key: 'physician', label: 'Physician', render: (row) => (
            <span className="block truncate">{row.physicianId ?? "Unassigned"}</span>
          )},
          { key: 'phase', label: 'Phase', render: (row) => (
            <Badge variant={mapTone(statusTone(row.currentPhase))}>{phaseLabel(row.currentPhase)}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
          )},
          { key: 'startDate', label: 'Start Date', render: (row) => row.startDate ? new Date(row.startDate).toLocaleDateString() : "-" },
          { key: 'endDate', label: 'End Date', render: (row) => row.endDate ? new Date(row.endDate).toLocaleDateString() : "-" },
          { key: 'nextAction', label: 'Next Action', render: (row) => (
            <span className="line-clamp-2">{row.nextAction}</span>
          )},
          { key: 'flags', label: 'Flags', render: (row) => (
            row.flagsIssues.length ? <Flag className="h-4 w-4 text-[var(--color-error)]" aria-hidden="true" /> : <span className="text-[var(--color-text-muted)]">-</span>
          )},
          { key: 'staff', label: 'Staff', render: (row) => (
            <span className="block truncate">{row.assignedStaff.join(", ")}</span>
          )},
        ]}
        rows={courses}
        pageSize={10}
        search={{
          placeholder: 'Search patient, MRN, diagnosis, course, or next action...',
          getText: (row) => [
            row.id,
            row.courseNumber,
            patientLabel(row.patientId),
            patientMrn(row.patientId),
            row.diagnosisType,
            row.treatmentSite,
            row.location,
            row.physicianId,
            row.status,
            row.nextAction,
          ].join(' '),
        }}
        filters={[
          { id: 'phase', label: 'Phase', getValue: (row) => phaseLabel(row.currentPhase) },
          { id: 'status', label: 'Status', getValue: (row) => statusLabel(row.status) },
          { id: 'physician', label: 'Physician', getValue: (row) => row.physicianId ?? 'Unassigned' },
          { id: 'diagnosisType', label: 'Diagnosis' },
        ]}
      />
    </PageStack>
  );
}
