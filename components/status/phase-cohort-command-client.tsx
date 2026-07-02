'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ClipboardList, FileText, History, RadioTower } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { statusTone } from '@/lib/status-utils';

export type PhaseCohortMode = 'upcoming' | 'on-treatment' | 'post';

export type PhaseCohortRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  diagnosis: string;
  phase: string;
  course: string;
  courseId: string;
  courseStatus: string;
  coursePhase: string;
  currentFraction: number;
  totalFractions: number;
  documents: number;
  openTasks: number;
  blockedTasks: number;
  nextAction: string;
  assignedStaff: string;
  lastUpdatedAt: string;
};

type PhaseCohortStats = {
  cohortCount: number;
  totalCourses: number;
  carepathTasks: number;
  documents: number;
  fractions: number;
};

type StagedCohortAction = {
  id: string;
  patient: string;
  action: string;
  note: string;
};

type PhaseCohortCommandClientProps = {
  mode: PhaseCohortMode;
  title: string;
  subtitle: string;
  rows: PhaseCohortRow[];
  stats: PhaseCohortStats;
};

const modeCopy: Record<PhaseCohortMode, { primaryLabel: string; reviewAction: string; tone: 'primary' | 'success' | 'info' }> = {
  upcoming: {
    primaryLabel: 'Upcoming Patients',
    reviewAction: 'Planning readiness reviewed',
    tone: 'info',
  },
  'on-treatment': {
    primaryLabel: 'On Treatment',
    reviewAction: 'Treatment-day readiness reviewed',
    tone: 'success',
  },
  post: {
    primaryLabel: 'Post-Treatment',
    reviewAction: 'Closeout readiness reviewed',
    tone: 'primary',
  },
};

function cleanLabel(value: string) {
  return value.replace(/_/g, ' ');
}

export function PhaseCohortCommandClient({ mode, title, subtitle, rows, stats }: PhaseCohortCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [action, setAction] = useState(modeCopy[mode].reviewAction);
  const [note, setNote] = useState('Demo cohort note: reviewed course state, carepath tasks, documents, and fraction evidence.');
  const [ledger, setLedger] = useState<StagedCohortAction[]>([]);

  const selectedRow = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId]
  );
  const openTaskCount = rows.reduce((total, row) => total + row.openTasks, 0);
  const blockedTaskCount = rows.reduce((total, row) => total + row.blockedTasks, 0);
  const averageProgress = rows.length
    ? Math.round(rows.reduce((total, row) => total + (row.totalFractions ? (row.currentFraction / row.totalFractions) * 100 : 0), 0) / rows.length)
    : 0;

  const stageAction = () => {
    if (!selectedRow) return;

    setLedger((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        patient: selectedRow.patient,
        action,
        note: note.trim() || 'No PHI-free cohort note entered.',
      },
      ...current,
    ].slice(0, 6));
  };

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Schedule Review"
              icon="calendar"
              kind="schedule"
              variant="primary"
              description="Stage a cohort scheduling/review action for the prototype demo."
            />
            <PrototypeActionButton
              label="Export Cohort"
              icon="download"
              kind="export"
              description="Prepare a tokenized cohort export for operations review."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={RadioTower} label={modeCopy[mode].primaryLabel} value={stats.cohortCount} tone={modeCopy[mode].tone} />
        <StatCard icon={CalendarDays} label="Total Courses" value={stats.totalCourses} tone="primary" />
        <StatCard icon={ClipboardList} label="Open Tasks" value={openTaskCount} tone={openTaskCount ? 'warning' : 'success'} />
        <StatCard icon={FileText} label="Documents" value={stats.documents} tone="info" />
        <StatCard icon={CheckCircle2} label="Avg Fraction Progress" value={`${averageProgress}%`} />
      </StatGrid>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="type-supporting uppercase text-[var(--color-text-muted)]">Selected cohort record</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">
              {selectedRow ? `${selectedRow.patient} operational review` : 'Select a patient to review'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRow ? <Badge variant={statusTone(selectedRow.courseStatus)}>{cleanLabel(selectedRow.courseStatus)}</Badge> : null}
            {blockedTaskCount ? <Badge variant="warning">{blockedTaskCount} blocked</Badge> : <Badge variant="success">No blocked tasks</Badge>}
          </div>
        </div>

        {selectedRow ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="type-supporting uppercase text-[var(--color-text-muted)]">Course</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selectedRow.course}</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{cleanLabel(selectedRow.coursePhase)}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="type-supporting uppercase text-[var(--color-text-muted)]">Fractions</p>
                <p className="mt-1 type-body text-[var(--color-text)]">
                  {selectedRow.currentFraction}/{selectedRow.totalFractions}
                </p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{stats.fractions} total logged</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="type-supporting uppercase text-[var(--color-text-muted)]">Carepath</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selectedRow.openTasks} open tasks</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{selectedRow.nextAction}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="type-supporting uppercase text-[var(--color-text-muted)]">Documents</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selectedRow.documents} linked</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{selectedRow.assignedStaff}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href={`/patients/${selectedRow.patientId}`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <RadioTower size={14} />
                    Workspace
                  </Button>
                </Link>
                <Link href={`/patients/${selectedRow.patientId}/carepath`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <History size={14} />
                    Carepath
                  </Button>
                </Link>
                <Link href={`/patients/${selectedRow.patientId}/documents`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FileText size={14} />
                    Documents
                  </Button>
                </Link>
                <Link href={`/schedule`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <CalendarDays size={14} />
                    Schedule
                  </Button>
                </Link>
              </div>
              <Select value={action} onChange={(event) => setAction(event.target.value)} aria-label="Cohort action">
                <option>{modeCopy[mode].reviewAction}</option>
                <option>Carepath follow-up staged</option>
                <option>Document evidence reviewed</option>
                <option>Schedule check staged</option>
                <option>Billing/audit handoff reviewed</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free cohort note."
              />
              <Button type="button" size="sm" onClick={stageAction}>
                <CheckCircle2 size={14} />
                Stage cohort update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <DataTable
        keyField="id"
        className="min-h-[560px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'patient',
            label: 'Patient',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 type-body text-[var(--color-text)]">
                  {row.patient}
                  {row.id === selectedRow?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
                <span className="type-supporting text-[var(--color-text-muted)]">{row.patientRef}</span>
              </div>
            ),
          },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'course', label: 'Course' },
          { key: 'courseStatus', label: 'Course Status', render: (row) => <Badge variant={statusTone(row.courseStatus)}>{cleanLabel(row.courseStatus)}</Badge> },
          { key: 'currentFraction', label: 'Fx' },
          { key: 'openTasks', label: 'Open Tasks' },
          { key: 'documents', label: 'Docs' },
          { key: 'nextAction', label: 'Next Action' },
        ]}
        rows={rows}
        empty={`No ${title.toLowerCase()} patients are available.`}
        emptyDescription="Patients will appear here as their chart-rounds phase changes."
        search={{
          placeholder: 'Search patient token, diagnosis, course, status, staff, or next action...',
          keys: ['patient', 'patientRef', 'diagnosis', 'course', 'courseStatus', 'assignedStaff', 'nextAction'],
        }}
        filters={[
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'courseStatus', label: 'Course Status' },
          { id: 'assignedStaff', label: 'Assigned Staff' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="type-supporting uppercase text-[var(--color-text-muted)]">Prototype cohort ledger</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">Staged phase updates</h2>
          </div>
          <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} entries</Badge>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="type-body text-[var(--color-text)]">{entry.patient}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 type-body text-[var(--color-text-muted)]">
            Select a patient above and stage a phase-specific review action for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
