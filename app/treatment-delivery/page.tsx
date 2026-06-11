'use client';
import { Activity, AlertTriangle, CalendarDays, CheckCircle2, Clock3, Plus, ShieldCheck, UsersRound } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { FilterStrip } from '@/components/shared/filter-strip';
import { FilterField } from '@/components/shared/filter-strip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { moduleSnapshot, patientLabel, statusLabel, statusTone } from "@/lib/global-page-data";
import { mapTone } from "@/lib/status-utils";

export default function TreatmentDeliveryPage() {
  const fractions = moduleSnapshot.fractions;
  const activeFractions = fractions.slice(0, 5);
  const completed = fractions.filter((fraction) => fraction.status === "COMPLETED").length;
  const held = fractions.filter((fraction) => fraction.status === "BLOCKED" || fraction.status === "OVERDUE").length || 2;

  return (
    <PageStack>
      <PageHeader
        title="Treatment Delivery"
        subtitle="Daily treatment queue and fraction recording"
        actions={
          <>
            <Button variant="secondary"><CalendarDays className="h-4 w-4" /> Today, May 6, 2026</Button>
            <Button><Plus className="h-4 w-4" /> Record Treatment</Button>
          </>
        }
      />
      <StatGrid>
        <StatCard icon={Activity} label="Today's Treatments" value={fractions.length} sub="Scheduled" />
        <StatCard icon={Clock3} label="In Progress" value={activeFractions.length - completed} sub="Active queue" tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={completed} sub="Today" tone="success" />
        <StatCard icon={AlertTriangle} label="Held/Missed" value={held} sub="Needs follow-up" tone="error" />
        <StatCard icon={UsersRound} label="OTV Due" value={3} sub="Patients" tone="warning" />
        <StatCard icon={ShieldCheck} label="Physics Check Due" value={2} sub="Patients" tone="info" />
      </StatGrid>
      <Card>
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-heading text-base font-bold text-[var(--color-text)]">
              Today&apos;s Treatment Queue ({activeFractions.length})
            </h2>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Record delivery, review alerts, and reconcile fraction approvals.</p>
          </div>
          <Badge variant="primary">Live queue</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {activeFractions.map((fraction) => (
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
      <DataTable
        columns={[
          { key: 'patient', label: 'Patient', render: (row) => (
            <span className="block truncate font-bold">{patientLabel(row.patientId)}</span>
          )},
          { key: 'course', label: 'Course', render: (row) => (
            <span className="font-bold text-[var(--color-primary)]">{row.courseId.replace("COURSE-", "C")}</span>
          )},
          { key: 'fraction', label: 'Fraction', render: (row) => {
            const course = moduleSnapshot.treatmentCourses.find((item) => item.id === row.courseId);
            return `${row.fractionNumber} of ${course?.totalFractions ?? 20}`;
          }},
          { key: 'cumulativeDose', label: 'Cumulative Dose', render: (row) => `${row.cumulativeDose} cGy` },
          { key: 'apptTime', label: 'Appt Time' },
          { key: 'room', label: 'Room' },
          { key: 'therapist', label: 'Therapist', render: (row) => row.therapistId ?? "Unassigned" },
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.status))}>{statusLabel(row.status)}</Badge>
          )},
          { key: 'alerts', label: 'Alerts', render: (row) => (
            (row._index as number) % 3 === 0 ? <Badge variant="warning">OTV</Badge> : "-"
          )},
        ]}
        rows={fractions.map((fraction, index) => {
          const course = moduleSnapshot.treatmentCourses.find((item) => item.id === fraction.courseId);
          return {
            id: fraction.id,
            _index: index,
            patientId: course?.patientId ?? "",
            courseId: fraction.courseId,
            fractionNumber: fraction.fractionNumber,
            cumulativeDose: fraction.cumulativeDose,
            apptTime: `${8 + index}:00 AM`,
            room: index % 2 ? "Room 2" : "Room 1",
            therapistId: fraction.therapistId,
            status: fraction.status,
          };
        })}
        pageSize={10}
        toolbar={
          <FilterStrip>
            <FilterField grow>
              <Input placeholder="Search patient, MRN, appointment, therapist, or fraction..." />
            </FilterField>
            <FilterField><Input placeholder="Location" /></FilterField>
            <FilterField><Input placeholder="Therapist" /></FilterField>
            <FilterField><Input placeholder="Status" /></FilterField>
          </FilterStrip>
        }
      />
    </PageStack>
  );
}
