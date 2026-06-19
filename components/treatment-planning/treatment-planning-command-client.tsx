'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AlertTriangle, CalendarCheck2, FileText, FolderKanban, PenLine, Radiation, ShieldCheck } from 'lucide-react';
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

export type TreatmentPlanningChecklistItem = {
  id: string;
  label: string;
  owner: string;
  status: string;
  evidenceRequired: string;
};

export type TreatmentPlanningCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  courseId: string;
  course: string;
  diagnosis: string;
  site: string;
  energy: string;
  applicator: string;
  depth: string;
  dose: string;
  totalDose: string;
  fractions: string;
  coverage: string;
  readiness: string;
  missingInputs: string[];
  schedule: string;
  scheduledFractions: number;
  plannedFractions: number;
  imagingGate: string;
  imagingDue: number;
  otvGate: string;
  otvDue: number;
  physicsGate: string;
  physicsDue: number;
  physicistReview: string;
  radOncSignature: string;
  locked: boolean;
  clinicalValidationStatus: string;
  referenceVersion: string;
  checklist: TreatmentPlanningChecklistItem[];
};

type TreatmentPlanningCommandClientProps = {
  rows: TreatmentPlanningCommandRow[];
  stats: {
    open: number;
    physics: number;
    radOnc: number;
    scheduled: number;
    total: number;
    gated: number;
    clinicalGate: number;
  };
};

type PlanningLedgerEntry = {
  id: string;
  plan: string;
  action: string;
  note: string;
};

export function TreatmentPlanningCommandClient({ rows, stats }: TreatmentPlanningCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [planningAction, setPlanningAction] = useState('Planning readiness reviewed');
  const [note, setNote] = useState('Demo planning note: checked prescription parameters, schedule readiness, clinical gates, and validation checklist.');
  const [ledger, setLedger] = useState<PlanningLedgerEntry[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  function stagePlanningDecision() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `PLAN-ACT-${Date.now().toString(36).toUpperCase()}`,
        plan: selected.id,
        action: planningAction,
        note: note.trim() || 'No PHI-free treatment planning note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Treatment Planning"
        subtitle="Plan parameters, schedule generation, clinical gates, and validation sign-off"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Export Planning Worklist"
              icon="download"
              kind="export"
              description="Prepare a tokenized planning readiness worklist."
            />
            <PrototypeActionButton
              label="New Plan"
              icon="plus"
              kind="create"
              variant="primary"
              description="Stage a treatment plan with prescription, review, and schedule gates."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={Radiation} label="Plans in Progress" value={stats.open} sub="Open planning work" />
        <StatCard icon={ShieldCheck} label="Physics Review" value={stats.physics} sub="Physicist queue" tone="info" />
        <StatCard icon={PenLine} label="Rad Onc Signature" value={stats.radOnc} sub="Ready to sign" tone="primary" />
        <StatCard icon={CalendarCheck2} label="Schedules" value={`${stats.scheduled}/${stats.total}`} sub="Generated from Rx" tone="success" />
        <StatCard icon={AlertTriangle} label="Gated" value={stats.gated} sub="Imaging or review gates" tone="warning" />
        <StatCard icon={ShieldCheck} label="Clinical Gate" value={stats.clinicalGate} sub="Production sign-off required" tone="warning" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[560px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'id',
            label: 'Plan ID',
            render: (row) => (
              <div className="flex flex-col">
                <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
                  {row.id}
                  {row.id === selected?.id ? <Badge variant="primary">Selected</Badge> : null}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">{row.course}</span>
              </div>
            ),
          },
          { key: 'patient', label: 'Patient' },
          { key: 'patientRef', label: 'Patient Ref' },
          { key: 'diagnosis', label: 'Diagnosis', render: (row) => <Badge variant={row.diagnosis === 'Skin' ? 'info' : 'primary'}>{row.diagnosis}</Badge> },
          { key: 'site', label: 'Site' },
          { key: 'energy', label: 'Energy' },
          { key: 'applicator', label: 'Applicator' },
          { key: 'dose', label: 'Dose' },
          { key: 'totalDose', label: 'Total Dose' },
          { key: 'fractions', label: 'Fractions' },
          { key: 'readiness', label: 'Readiness', render: (row) => <Badge variant={statusTone(row.readiness)}>{row.readiness}</Badge> },
          { key: 'schedule', label: 'Schedule' },
          { key: 'physicistReview', label: 'Physics', render: (row) => <Badge variant={statusTone(row.physicistReview)}>{row.physicistReview}</Badge> },
          { key: 'radOncSignature', label: 'Rad Onc', render: (row) => <Badge variant={statusTone(row.radOncSignature)}>{row.radOncSignature}</Badge> },
        ]}
        rows={rows}
        empty="No treatment plans are available."
        emptyDescription="Plan rows will appear after course planning data is initialized."
        pageSize={10}
        search={{
          placeholder: 'Search patient token, diagnosis, site, energy, missing inputs, gates, or plan status...',
          keys: ['id', 'patient', 'patientRef', 'course', 'diagnosis', 'site', 'energy', 'applicator', 'readiness', 'physicistReview', 'radOncSignature', 'missingInputs'],
        }}
        filters={[
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'readiness', label: 'Readiness' },
          { id: 'physicistReview', label: 'Physics' },
          { id: 'radOncSignature', label: 'Rad Onc' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Plan Review</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
              {selected ? `${selected.id} planning evidence` : 'Select a treatment plan'}
            </h2>
            {selected ? (
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {selected.patient} / {selected.site} / {selected.course}
              </p>
            ) : null}
          </div>
          {selected ? <Badge variant={statusTone(selected.readiness)}>{selected.readiness}</Badge> : null}
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Prescription</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.energy} / {selected.applicator}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selected.dose} x {selected.fractions}</p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Schedule</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.schedule}</p>
                <Badge variant={selected.scheduledFractions >= selected.plannedFractions ? 'success' : 'warning'}>Fractions generated</Badge>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Missing Inputs</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.missingInputs.length}</p>
                <p className="mt-1 line-clamp-2 text-xs font-semibold text-[var(--color-text-muted)]">
                  {selected.missingInputs.join(', ') || 'Required planning inputs are present.'}
                </p>
              </div>
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="clinical-label">Validation</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">Reference {selected.referenceVersion}</p>
                <Badge variant="warning">{selected.clinicalValidationStatus}</Badge>
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
                    <FileText size={14} />
                    Carepath
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
              </div>
              <Select value={planningAction} onChange={(event) => setPlanningAction(event.target.value)} aria-label="Treatment planning action">
                <option>Planning readiness reviewed</option>
                <option>Schedule generation staged</option>
                <option>Physics review routed</option>
                <option>Rad Onc signature requested</option>
                <option>Clinical validation blocker acknowledged</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free treatment planning review note."
              />
              <Button type="button" size="sm" onClick={stagePlanningDecision}>
                <PenLine size={14} />
                Stage planning update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      {selected ? (
        <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Clinical Gates</p>
              <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Schedule and treatment delivery blockers</h2>
            </div>
            <Badge variant="warning">Clinical validation required</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              { label: 'Imaging Guidance', status: selected.imagingGate, due: selected.imagingDue },
              { label: 'OTV', status: selected.otvGate, due: selected.otvDue },
              { label: 'Physics Check', status: selected.physicsGate, due: selected.physicsDue },
            ].map((gate) => (
              <div key={gate.label} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{gate.label}</p>
                  <Badge variant={statusTone(gate.status)}>{gate.status}</Badge>
                </div>
                <p className="mt-2 text-xs font-semibold text-[var(--color-text-muted)]">{gate.due} fraction(s) due</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {selected ? (
        <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Phase 6 Clinical Sign-Off Checklist</p>
              <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Reference {selected.referenceVersion}</h2>
            </div>
            <Badge variant="warning">{selected.clinicalValidationStatus}</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {selected.checklist.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{item.label}</p>
                  <Badge variant="warning">{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs font-bold uppercase text-[var(--color-text-muted)]">{item.owner}</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">{item.evidenceRequired}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Planning Ledger</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Local staged planning decisions</h2>
          </div>
          <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} staged</Badge>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{entry.plan}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-[var(--color-text-muted)]">
            Select a plan above and stage a PHI-free planning decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
