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
      <FilterStrip>
        <FilterField grow>
          <Input placeholder="Search patient, MRN, appointment, therapist, or fraction..." />
        </FilterField>
        <FilterField><Input placeholder="Location" /></FilterField>
        <FilterField><Input placeholder="Therapist" /></FilterField>
        <FilterField><Input placeholder="Status" /></FilterField>
      </FilterStrip>
      <div
        className="rounded-[var(--radius-lg)] p-4"
        style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="mb-4 text-base font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)' }}>
          Today&apos;s Treatment Queue ({activeFractions.length})
        </h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {activeFractions.map((fraction) => (
            <div key={fraction.id} className="rounded-lg border p-4" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-card)', boxShadow: '0 6px 18px rgba(0,0,0,0.04)' }}>
              <p className="truncate text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                {patientLabel(moduleSnapshot.treatmentCourses.find((course) => course.id === fraction.courseId)?.patientId ?? "")}
              </p>
              <p className="mt-1 text-xs font-bold" style={{ color: 'var(--color-primary)' }}>{fraction.courseId.replace("COURSE-", "C")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                <span>Fraction <b className="block" style={{ color: 'var(--color-text)' }}>{fraction.fractionNumber}</b></span>
                <span>Phase <b className="block" style={{ color: 'var(--color-text)' }}>{fraction.phase}</b></span>
                <span>Dose <b className="block" style={{ color: 'var(--color-text)' }}>{fraction.plannedDose} cGy</b></span>
                <span>Total <b className="block" style={{ color: 'var(--color-text)' }}>{fraction.cumulativeDose} cGy</b></span>
              </div>
              <div className="mt-4"><Badge variant={mapTone(statusTone(fraction.status)) as any}>{statusLabel(fraction.status)}</Badge></div>
            </div>
          ))}
        </div>
      </div>
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
            <Badge variant={mapTone(statusTone(row.status)) as any}>{statusLabel(row.status)}</Badge>
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
      />
    </PageStack>
  );
}
