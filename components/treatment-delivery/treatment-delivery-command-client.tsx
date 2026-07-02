'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, CalendarCheck2, CheckCircle2, Clock3, FolderKanban, PenLine, Radiation, ShieldCheck, UsersRound } from 'lucide-react';
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
import { TreatmentDeliveryTabs } from '@/components/treatment-delivery/treatment-delivery-tabs';
import { phaseTone, statusTone } from '@/lib/status-utils';

export type TreatmentDeliveryCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  courseId: string;
  course: string;
  fractionNumber: number;
  fractionLabel: string;
  phase: string;
  treatmentDate: string;
  apptTime: string;
  room: string;
  therapist: string;
  plannedDose: number;
  deliveredDose: number | null;
  cumulativeDose: number;
  totalFractions: number;
  progressPct: number;
  imageGuidanceStatus: string;
  imageGuidanceCompleted: boolean;
  imageEvidence: number;
  otvRequired: boolean;
  otvComplete: boolean;
  physicsRequired: boolean;
  physicsComplete: boolean;
  status: string;
  alerts: string;
  notes: string;
};

type TreatmentDeliveryCommandClientProps = {
  rows: TreatmentDeliveryCommandRow[];
  stats: {
    scheduled: number;
    inProgress: number;
    completed: number;
    held: number;
    otvDue: number;
    physicsDue: number;
  };
};

type DeliveryLedgerEntry = {
  id: string;
  treatment: string;
  action: string;
  note: string;
};

export function TreatmentDeliveryCommandClient({ rows, stats }: TreatmentDeliveryCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [deliveryAction, setDeliveryAction] = useState('Treatment queue reviewed');
  const [note, setNote] = useState('Demo delivery note: checked treatment status, imaging guidance, OTV, physics check, and worksheet handoff.');
  const [ledger, setLedger] = useState<DeliveryLedgerEntry[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  const activeRows = rows.slice(0, 5);

  function stageDeliveryDecision() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `TX-ACT-${Date.now().toString(36).toUpperCase()}`,
        treatment: `${selected.course} fraction ${selected.fractionNumber}`,
        action: deliveryAction,
        note: note.trim() || 'No PHI-free treatment delivery note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Treatment Delivery"
        subtitle="Daily treatment queue, fraction gates, and worksheet handoff"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Today, May 6, 2026"
              icon="calendar"
              kind="schedule"
              description="Review the active treatment day and staged queue changes."
            />
            <PrototypeActionButton
              label="Record Treatment"
              icon="plus"
              kind="review"
              variant="primary"
              description="Stage a treatment event here, or open a patient workspace Fractions tab for full worksheet entry."
            />
          </div>
        )}
      />

      <TreatmentDeliveryTabs active="queue" />

      <StatGrid>
        <StatCard icon={Activity} label="Today's Treatments" value={stats.scheduled} sub="Scheduled" />
        <StatCard icon={Clock3} label="In Progress" value={stats.inProgress} sub="Active queue" tone="warning" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} sub="Today" tone="success" />
        <StatCard icon={AlertTriangle} label="Held/Missed" value={stats.held} sub="Needs follow-up" tone="error" />
        <StatCard icon={UsersRound} label="OTV Due" value={stats.otvDue} sub="Scheduled checks" tone="warning" />
        <StatCard icon={ShieldCheck} label="Physics Due" value={stats.physicsDue} sub="Weekly checks" tone="info" />
      </StatGrid>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Today&apos;s Treatment Queue</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">{activeRows.length} active treatment cards</h2>
          </div>
          <Badge variant="primary">Live queue</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {activeRows.length === 0 ? (
            <div className="clinical-muted-surface p-4 type-body text-[var(--color-text-muted)]">
              No treatments are available in the queue.
            </div>
          ) : activeRows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelectedId(row.id)}
              className="clinical-focus clinical-muted-surface p-4 text-left transition hover:border-[var(--color-primary)]/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate type-body text-[var(--color-text)]">{row.patient}</p>
                  <p className="mt-1 type-supporting text-[var(--color-primary)]">{row.course}</p>
                </div>
                <Badge variant={statusTone(row.status)}>{row.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 type-supporting text-[var(--color-text-muted)]">
                <span>Fraction <b className="block text-[var(--color-text)]">{row.fractionNumber}</b></span>
                <span>Room <b className="block text-[var(--color-text)]">{row.room}</b></span>
                <span>Dose <b className="block text-[var(--color-text)]">{row.plannedDose} cGy</b></span>
                <span>Alerts <b className="block text-[var(--color-text)]">{row.alerts}</b></span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
                <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${row.progressPct}%` }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <DataTable
        keyField="id"
        className="min-h-[540px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'patient',
            label: 'Patient',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 type-body text-[var(--color-primary)]">
                  {row.patient}
                  {row.id === selected?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
                <span className="type-supporting text-[var(--color-text-muted)]">{row.patientRef}</span>
              </div>
            ),
          },
          { key: 'course', label: 'Course' },
          { key: 'fractionLabel', label: 'Fraction' },
          { key: 'cumulativeDose', label: 'Cumulative Dose' },
          { key: 'apptTime', label: 'Appt Time' },
          { key: 'room', label: 'Room' },
          { key: 'therapist', label: 'Therapist' },
          { key: 'imageGuidanceStatus', label: 'Image Gate', render: (row) => <Badge variant={statusTone(row.imageGuidanceStatus)}>{row.imageGuidanceStatus}</Badge> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{row.status}</Badge> },
          { key: 'alerts', label: 'Alerts' },
        ]}
        rows={rows}
        empty="No treatment queue rows are available."
        emptyDescription="Scheduled fraction rows will appear after treatment delivery data is initialized."
        pageSize={10}
        search={{
          placeholder: 'Search patient token, course, room, therapist, gate, alert, or fraction...',
          keys: ['patient', 'patientRef', 'course', 'fractionLabel', 'apptTime', 'room', 'therapist', 'status', 'alerts', 'imageGuidanceStatus'],
        }}
        filters={[
          { id: 'room', label: 'Location' },
          { id: 'therapist', label: 'Therapist' },
          { id: 'status', label: 'Status' },
          { id: 'alerts', label: 'Alerts' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Treatment Review</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">
              {selected ? `${selected.course} fraction ${selected.fractionNumber}` : 'Select a treatment'}
            </h2>
            {selected ? (
              <p className="mt-1 type-body text-[var(--color-text-muted)]">
                {selected.patient} / {selected.room} / {selected.apptTime}
              </p>
            ) : null}
          </div>
          {selected ? <Badge variant={statusTone(selected.status)}>{selected.status}</Badge> : null}
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Dose</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.plannedDose} cGy planned</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{selected.cumulativeDose} cGy cumulative</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Image Guidance</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.imageGuidanceStatus}</p>
                <Badge variant={selected.imageGuidanceCompleted ? 'success' : 'warning'}>{selected.imageEvidence} evidence</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">OTV</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.otvRequired ? 'Required' : 'Not required'}</p>
                <Badge variant={selected.otvRequired && !selected.otvComplete ? 'warning' : 'success'}>{selected.otvComplete ? 'Complete' : 'Open'}</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Physics</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.physicsRequired ? 'Required' : 'Not required'}</p>
                <Badge variant={selected.physicsRequired && !selected.physicsComplete ? 'warning' : 'success'}>{selected.physicsComplete ? 'Complete' : 'Open'}</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Worksheet</p>
                <p className="mt-1 type-body text-[var(--color-text)]">{selected.fractionLabel}</p>
                <Badge variant={phaseTone(selected.phase)}>{selected.phase}</Badge>
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
                <Link href={`/patients/${selected.patientId}?tab=fractions`}>
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <Radiation size={14} />
                    Worksheet
                  </Button>
                </Link>
                <Link href="/imaging">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <ShieldCheck size={14} />
                    Imaging
                  </Button>
                </Link>
                <Link href="/treatment-delivery/fraction-logs">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <CalendarCheck2 size={14} />
                    Fraction Logs
                  </Button>
                </Link>
              </div>
              <Select value={deliveryAction} onChange={(event) => setDeliveryAction(event.target.value)} aria-label="Treatment delivery action">
                <option>Treatment queue reviewed</option>
                <option>Imaging guidance follow-up staged</option>
                <option>OTV check routed</option>
                <option>Physics check routed</option>
                <option>Worksheet handoff staged</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free treatment delivery review note."
              />
              <Button type="button" size="sm" onClick={stageDeliveryDecision}>
                <PenLine size={14} />
                Stage delivery update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Delivery Ledger</p>
            <h2 className="mt-1 type-heading text-[var(--color-text)]">Local staged treatment decisions</h2>
          </div>
          <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} staged</Badge>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="type-body text-[var(--color-text)]">{entry.treatment}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 type-body text-[var(--color-text-muted)]">
            Select a treatment above and stage a PHI-free delivery decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
