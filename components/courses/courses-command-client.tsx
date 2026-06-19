'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  History,
  PenLine,
  Route,
} from 'lucide-react';
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
import { phaseTone, statusTone } from '@/lib/status-utils';

export type CourseCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  course: string;
  courseNumber: string;
  diagnosis: string;
  site: string;
  location: string;
  physician: string;
  phase: string;
  status: string;
  startDate: string;
  endDate: string;
  nextAction: string;
  staff: string;
  flags: string[];
  workflowSteps: number;
  openTasks: number;
  blockedTasks: number;
  documents: number;
  missingDocuments: number;
  fractionsLogged: number;
  totalFractions: number;
  planningStatus: string;
  billingStatus: string;
  auditStatus: string;
};

type CourseCommandClientProps = {
  rows: CourseCommandRow[];
  stats: {
    active: number;
    upcoming: number;
    onTreatment: number;
    post: number;
    blocked: number;
  };
};

type StagedCourseAction = {
  id: string;
  course: string;
  action: string;
  note: string;
};

function cleanLabel(value: string) {
  return value.replace(/_/g, ' ');
}

function evidenceTone(value: number) {
  return value > 0 ? 'warning' : 'success';
}

export function CoursesCommandClient({ rows, stats }: CourseCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [courseAction, setCourseAction] = useState('Course readiness reviewed');
  const [note, setNote] = useState('Demo course note: verified carepath, document, fraction, billing, and audit evidence.');
  const [ledger, setLedger] = useState<StagedCourseAction[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  const openTasks = rows.reduce((total, row) => total + row.openTasks, 0);
  const missingDocuments = rows.reduce((total, row) => total + row.missingDocuments, 0);
  const fractionProgress = selected?.totalFractions
    ? Math.round((selected.fractionsLogged / selected.totalFractions) * 100)
    : 0;

  function stageCourseAction() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `COURSE-ACT-${Date.now().toString(36).toUpperCase()}`,
        course: selected.course,
        action: courseAction,
        note: note.trim() || 'No PHI-free course note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Courses"
        subtitle="Course command center for carepath progression, evidence readiness, and handoffs"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Export Courses"
              icon="download"
              kind="export"
              description="Prepare a tokenized course readiness export for operations review."
            />
            <PrototypeActionButton
              label="New Course"
              icon="plus"
              kind="create"
              variant="primary"
              description="Stage a new course bundle with workflow, task, document, folder, and audit placeholders."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={ClipboardList} label="Active Courses" value={stats.active} sub="Across patients" tone="primary" />
        <StatCard icon={CalendarDays} label="Upcoming" value={stats.upcoming} sub="Chart prep" tone="info" />
        <StatCard icon={CheckCircle2} label="On Treatment" value={stats.onTreatment} sub="Active delivery" tone="success" />
        <StatCard icon={FolderKanban} label="Post-Tx" value={stats.post} sub="Summary and audit" tone="primary" />
        <StatCard icon={AlertTriangle} label="Needs Action" value={stats.blocked} sub="Blocked or flagged" tone="warning" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[620px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'course',
            label: 'Course',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
                  {row.course}
                  {row.id === selected?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{row.courseNumber}</span>
              </div>
            ),
          },
          { key: 'patient', label: 'Patient' },
          { key: 'diagnosis', label: 'Diagnosis' },
          { key: 'site', label: 'Site' },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.phase)}>{cleanLabel(row.phase)}</Badge> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{cleanLabel(row.status)}</Badge> },
          { key: 'openTasks', label: 'Open Tasks' },
          { key: 'missingDocuments', label: 'Doc Gaps' },
          { key: 'fractionsLogged', label: 'Fx Logged' },
          { key: 'nextAction', label: 'Next Action' },
        ]}
        rows={rows}
        empty="No treatment courses are available."
        emptyDescription="Courses will appear after a patient/course bundle is created."
        pageSize={10}
        search={{
          placeholder: 'Search course, patient token, diagnosis, site, staff, phase, or next action...',
          keys: ['course', 'courseNumber', 'patient', 'patientRef', 'diagnosis', 'site', 'location', 'physician', 'phase', 'status', 'nextAction', 'staff'],
        }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'status', label: 'Status' },
          { id: 'physician', label: 'Physician' },
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'staff', label: 'Staff' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Course</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
              {selected ? `${selected.course} carepath readiness` : 'Select a course to review'}
            </h2>
            {selected ? (
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {selected.patient} · {selected.diagnosis} · {selected.site}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {selected ? <Badge variant={phaseTone(selected.phase)}>{cleanLabel(selected.phase)}</Badge> : null}
            {selected ? <Badge variant={statusTone(selected.status)}>{cleanLabel(selected.status)}</Badge> : null}
          </div>
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Carepath</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.workflowSteps} steps</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                  {selected.openTasks} open · {selected.blockedTasks} blocked
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Documents</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.documents} linked</p>
                <Badge variant={evidenceTone(selected.missingDocuments)}>{selected.missingDocuments} gaps</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Fractions</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                  {selected.fractionsLogged}/{selected.totalFractions}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${Math.min(fractionProgress, 100)}%` }} />
                </div>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Closeout</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.auditStatus}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selected.billingStatus}</p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <Link href={`/patients/${selected.patientId}`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FolderKanban size={14} />
                    Workspace
                  </Button>
                </Link>
                <Link href={`/patients/${selected.patientId}/carepath`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <Route size={14} />
                    Carepath
                  </Button>
                </Link>
                <Link href={`/patients/${selected.patientId}/documents`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <FileText size={14} />
                    Documents
                  </Button>
                </Link>
                <Link href={`/patients/${selected.patientId}?tab=fractions`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <History size={14} />
                    Fractions
                  </Button>
                </Link>
              </div>
              <Select value={courseAction} onChange={(event) => setCourseAction(event.target.value)} aria-label="Course action">
                <option>Course readiness reviewed</option>
                <option>Carepath phase handoff staged</option>
                <option>Document gap follow-up assigned</option>
                <option>Treatment-day readiness checked</option>
                <option>Billing/audit closeout reviewed</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free course review note."
              />
              <Button type="button" size="sm" onClick={stageCourseAction}>
                <PenLine size={14} />
                Stage course update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Course Ledger</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Staged course decisions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={openTasks ? 'warning' : 'success'}>{openTasks} open tasks</Badge>
            <Badge variant={missingDocuments ? 'warning' : 'success'}>{missingDocuments} document gaps</Badge>
            <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} staged</Badge>
          </div>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{entry.course}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-[var(--color-text-muted)]">
            Select a course, review its evidence, and stage a PHI-free course decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
