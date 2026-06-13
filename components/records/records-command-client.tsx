'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { CheckCircle2, FileText, FolderKanban, History, PenLine } from 'lucide-react';
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

export type MasterRecordRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  diagnosis: string;
  phase: string;
  status: string;
  course: string;
  courseId: string;
  courseStatus: string;
  coursePhase: string;
  fractions: number;
  documents: number;
  openTasks: number;
  nextAction: string;
  assignedStaff: string;
  lastUpdatedAt: string;
  flags: string[];
  checklistReady: number;
  checklistTotal: number;
};

type StagedMaintenanceEntry = {
  id: string;
  patient: string;
  action: string;
  note: string;
};

type RecordsCommandClientProps = {
  rows: MasterRecordRow[];
  stats: {
    totalRecords: number;
    activeCourses: number;
    carepathTasks: number;
    documents: number;
    fractions: number;
  };
};

function badgeForPhase(phase: string) {
  if (phase === 'ON_TREATMENT') return 'success';
  if (phase === 'UPCOMING') return 'info';
  if (phase === 'POST') return 'default';
  return 'primary';
}

function badgeForStatus(status: string) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'ON_HOLD') return 'warning';
  if (status === 'COMPLETED') return 'default';
  return 'info';
}

function cleanLabel(value: string) {
  return value.replace(/_/g, ' ');
}

export function RecordsCommandClient({ rows, stats }: RecordsCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [maintenanceAction, setMaintenanceAction] = useState('Course status reviewed');
  const [maintenanceNote, setMaintenanceNote] = useState('Demo maintenance note: verified record alignment against course, documents, tasks, and fractions.');
  const [ledger, setLedger] = useState<StagedMaintenanceEntry[]>([]);

  const selectedRecord = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId]
  );

  const flaggedCount = rows.filter((row) => row.flags.length > 0).length;
  const openTaskCount = rows.reduce((total, row) => total + row.openTasks, 0);

  const stageMaintenance = () => {
    if (!selectedRecord) return;

    setLedger((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        patient: selectedRecord.patient,
        action: maintenanceAction,
        note: maintenanceNote.trim() || 'No PHI-free maintenance note entered.',
      },
      ...current,
    ].slice(0, 6));
  };

  return (
    <PageStack>
      <PageHeader
        title="Master Records"
        subtitle="Controlled operational index for record maintenance, course alignment, and carepath follow-through"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Register Record"
              icon="plus"
              kind="create"
              variant="primary"
              description="Stage a new master record and course bundle for this prototype session."
            />
            <PrototypeActionButton
              label="Export Index"
              icon="download"
              kind="export"
              description="Prepare a tokenized operational export without retaining PHI in the prototype action."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={FolderKanban} label="Total Records" value={stats.totalRecords} tone="primary" />
        <StatCard icon={FolderKanban} label="Active Courses" value={stats.activeCourses} tone="success" />
        <StatCard icon={History} label="Open Tasks" value={openTaskCount} tone="warning" />
        <StatCard icon={FileText} label="Documents" value={stats.documents} tone="info" />
        <StatCard icon={CheckCircle2} label="Flagged Records" value={flaggedCount} tone={flaggedCount ? 'warning' : 'success'} />
      </StatGrid>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Selected record</p>
            <h2 className="mt-1 text-base font-bold text-[var(--color-text)]">
              {selectedRecord ? `${selectedRecord.patient} maintenance review` : 'Select a record to review'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedRecord ? <Badge variant={badgeForPhase(selectedRecord.phase)}>{cleanLabel(selectedRecord.phase)}</Badge> : null}
            {selectedRecord ? <Badge variant={badgeForStatus(selectedRecord.courseStatus)}>{cleanLabel(selectedRecord.courseStatus)}</Badge> : null}
          </div>
        </div>

        {selectedRecord ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Course</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selectedRecord.course}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{cleanLabel(selectedRecord.coursePhase)}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Work remaining</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selectedRecord.openTasks} open tasks</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selectedRecord.nextAction}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Evidence</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selectedRecord.documents} documents</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selectedRecord.fractions} fractions logged</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Checklist</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                  {selectedRecord.checklistReady}/{selectedRecord.checklistTotal} ready
                </p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selectedRecord.assignedStaff}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href={`/patients/${selectedRecord.patientId}`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FolderKanban size={14} />
                    Workspace
                  </Button>
                </Link>
                <Link href={`/patients/${selectedRecord.patientId}/carepath`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <History size={14} />
                    Carepath
                  </Button>
                </Link>
                <Link href={`/patients/${selectedRecord.patientId}/documents`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FileText size={14} />
                    Documents
                  </Button>
                </Link>
                <Link href={`/patients/${selectedRecord.patientId}?tab=fractions`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <CheckCircle2 size={14} />
                    Fractions
                  </Button>
                </Link>
              </div>
              <Select value={maintenanceAction} onChange={(event) => setMaintenanceAction(event.target.value)} aria-label="Maintenance action">
                <option>Course status reviewed</option>
                <option>Record correction staged</option>
                <option>Carepath follow-up assigned</option>
                <option>Document evidence reviewed</option>
                <option>Fraction worksheet reviewed</option>
              </Select>
              <Textarea
                rows={3}
                value={maintenanceNote}
                onChange={(event) => setMaintenanceNote(event.target.value)}
                placeholder="Add a PHI-free maintenance note."
              />
              <Button type="button" size="sm" onClick={stageMaintenance}>
                <PenLine size={14} />
                Stage maintenance update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <DataTable
        keyField="id"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'patient',
            label: 'Record',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                  {row.patient}
                  {row.id === selectedRecord?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{row.patientRef}</span>
              </div>
            ),
          },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant={badgeForPhase(row.phase)}>{cleanLabel(row.phase)}</Badge> },
          { key: 'course', label: 'Course' },
          { key: 'courseStatus', label: 'Course Status', render: (row) => <Badge variant={badgeForStatus(row.courseStatus)}>{cleanLabel(row.courseStatus)}</Badge> },
          { key: 'openTasks', label: 'Open Tasks' },
          { key: 'documents', label: 'Docs' },
          { key: 'fractions', label: 'Fractions' },
          { key: 'lastUpdatedAt', label: 'Updated' },
        ]}
        rows={rows}
        empty="No master records are available."
        emptyDescription="Tokenized operational records will appear after patient records are created."
        search={{
          placeholder: 'Search master records by token, diagnosis, phase, course, staff, or next action...',
          keys: ['patient', 'patientRef', 'diagnosis', 'phase', 'course', 'courseStatus', 'nextAction', 'assignedStaff'],
        }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'courseStatus', label: 'Course Status' },
          { id: 'assignedStaff', label: 'Assigned Staff' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Local prototype ledger</p>
            <h2 className="mt-1 text-base font-bold text-[var(--color-text)]">Staged record maintenance</h2>
          </div>
          <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} entries</Badge>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{entry.patient}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">
            Select a record above and stage a PHI-free maintenance update for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
