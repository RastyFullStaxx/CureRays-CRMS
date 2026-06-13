export const dynamic = 'force-dynamic';

import { Activity, AlertTriangle, CheckCircle2, Clock3, ShieldCheck, UsersRound } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TreatmentDeliveryTabs } from '@/components/treatment-delivery/treatment-delivery-tabs';
import { moduleSnapshot, patientLabel, statusLabel, statusTone } from "@/lib/services/operational-page-service";
import { mapTone } from "@/lib/status-utils";

export default function TreatmentDeliveryPage() {
  const fractions = moduleSnapshot.fractions;
  const activeFractions = fractions.slice(0, 5);
  const completed = fractions.filter((fraction) => fraction.status === "COMPLETED").length;
  const held = fractions.filter((fraction) => fraction.status === "BLOCKED" || fraction.status === "OVERDUE").length || 2;
  const otvDue = fractions.filter((fraction) => fraction.otvRequired && !fraction.otvCompletedAt).length;
  const physicsDue = fractions.filter((fraction) => fraction.physicsCheckRequired && !fraction.physicsCheckCompletedAt).length;
  const rows: SerializedTableRow[] = fractions.map((fraction, index) => {
    const course = moduleSnapshot.treatmentCourses.find((item) => item.id === fraction.courseId);
    const alerts = [
      fraction.imageGuidanceStatus === "MISSING" ? "Image" : null,
      fraction.otvRequired && !fraction.otvCompletedAt ? "OTV" : null,
      fraction.physicsCheckRequired && !fraction.physicsCheckCompletedAt ? "Physics" : null,
    ].filter(Boolean).join(", ") || "Clear";

    return {
      id: fraction.id,
      patient: patientLabel(course?.patientId ?? ""),
      course: fraction.courseId.replace("COURSE-", "C"),
      fraction: `${fraction.fractionNumber} of ${course?.totalFractions ?? 20}`,
      cumulativeDose: fraction.cumulativeDose,
      apptTime: `${8 + index}:00 AM`,
      room: index % 2 ? "Room 2" : "Room 1",
      therapist: fraction.therapistId ?? "Unassigned",
      status: statusLabel(fraction.status),
      statusTone: statusTone(fraction.status),
      alerts,
    };
  });

  return (
    <PageStack>
      <PageHeader
        title="Treatment Delivery"
        actions={
          <>
            <PrototypeActionButton label="Today, May 6, 2026" icon="calendar" kind="schedule" description="Review the active treatment day and staged queue changes." />
            <PrototypeActionButton label="Record Treatment" icon="plus" kind="review" variant="primary" description="Stage a treatment event here, or open a patient workspace Fractions tab for full worksheet entry." />
          </>
        }
      />
      <TreatmentDeliveryTabs active="queue" />
      <StatGrid>
        <StatCard icon={Activity} label="Today's Treatments" value={fractions.length} sub="Scheduled" />
        <StatCard icon={Clock3} label="In Progress" value={activeFractions.length - completed} sub="Active queue" tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} sub="Today" tone="success" />
        <StatCard icon={AlertTriangle} label="Held/Missed" value={held} sub="Needs follow-up" tone="error" />
        <StatCard icon={UsersRound} label="OTV Due" value={otvDue} sub="Scheduled checks" tone="warning" />
        <StatCard icon={ShieldCheck} label="Physics Check Due" value={physicsDue} sub="Weekly checks" tone="info" />
      </StatGrid>
      <Card>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[var(--color-text)]">
              Today&apos;s Treatment Queue ({activeFractions.length})
            </h2>
          </div>
          <Badge variant="primary">Live queue</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {activeFractions.length === 0 ? (
            <div className="clinical-muted-surface p-4 text-sm font-semibold text-[var(--color-text-muted)]">
              No treatments are available in the queue.
            </div>
          ) : activeFractions.map((fraction) => (
            <div key={fraction.id} className="clinical-muted-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--color-text)]">
                    {patientLabel(moduleSnapshot.treatmentCourses.find((course) => course.id === fraction.courseId)?.patientId ?? "")}
                  </p>
                  <p className="mt-1 text-xs font-bold text-[var(--color-primary)]">{fraction.courseId.replace("COURSE-", "C")}</p>
                </div>
                <Badge variant={mapTone(statusTone(fraction.status))}>{statusLabel(fraction.status)}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-[var(--color-text-muted)]">
                <span>Fraction <b className="block text-[var(--color-text)]">{fraction.fractionNumber}</b></span>
                <span>Phase <b className="block text-[var(--color-text)]">{fraction.phase}</b></span>
                <span>Dose <b className="block text-[var(--color-text)]">{fraction.plannedDose} cGy</b></span>
                <span>Total <b className="block text-[var(--color-text)]">{fraction.cumulativeDose} cGy</b></span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
                <div
                  className="h-full rounded-full bg-[var(--color-primary)]"
                  style={{
                    width: `${Math.min(
                      Math.round((fraction.fractionNumber / (moduleSnapshot.treatmentCourses.find((course) => course.id === fraction.courseId)?.totalFractions ?? 20)) * 100),
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <SerializedDataTable
        columns={[
          { key: 'patient', label: 'Patient', kind: 'primary' },
          { key: 'course', label: 'Course', kind: 'primary' },
          { key: 'fraction', label: 'Fraction' },
          { key: 'cumulativeDose', label: 'Cumulative Dose', suffix: 'cGy' },
          { key: 'apptTime', label: 'Appt Time' },
          { key: 'room', label: 'Room' },
          { key: 'therapist', label: 'Therapist' },
          { key: 'status', label: 'Status', kind: 'status' },
          { key: 'alerts', label: 'Alerts', kind: 'longText' },
        ]}
        rows={rows}
        empty="No treatment queue rows are available."
        emptyDescription="Scheduled fraction rows will appear after treatment delivery data is initialized."
        pageSize={10}
        search={{
          placeholder: 'Search patient, MRN, appointment, therapist, or fraction...',
          keys: ['patient', 'course', 'fraction', 'apptTime', 'room', 'therapist', 'status', 'alerts'],
        }}
        filters={[
          { id: 'room', label: 'Location' },
          { id: 'therapist', label: 'Therapist' },
          { id: 'status', label: 'Status' },
          { id: 'alerts', label: 'Alerts' },
        ]}
      />
    </PageStack>
  );
}
