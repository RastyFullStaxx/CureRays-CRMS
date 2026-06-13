'use client';

import { useState } from 'react';
import { CalendarDays, CheckCircle2, ClipboardCheck, FileText, Radiation, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export type IgsrtDocumentRow = {
  id: string;
  name: string;
  phase: string;
  owner: string;
  status: string;
  signature: string;
  auditReady: string;
  requiredAction: string;
};

export type IgsrtGateRow = {
  id: string;
  gate: string;
  status: string;
  detail: string;
  dueFractions: string;
  evidence: string;
};

export type IgsrtCommandSummary = {
  patientRef: string;
  courseRef: string;
  diagnosis: string;
  site: string;
  laterality: string;
  protocol: string;
  courseStatus: string;
  currentFraction: number;
  totalFractions: number;
  simulationStatus: string;
  simulationSigned: string;
  prescriptionStatus: string;
  prescriptionSigned: string;
  sensusVerified: string;
  preAuthorized: string;
  scheduleStatus: string;
  scheduledFractions: number;
  plannedFractions: number;
  recordedFractions: number;
  clinicalValidationStatus: string;
  missingInputs: string[];
};

type StagedIgsrtReview = {
  id: string;
  disposition: string;
  note: string;
};

type IgsrtCommandClientProps = {
  summary: IgsrtCommandSummary;
  documents: IgsrtDocumentRow[];
  gates: IgsrtGateRow[];
};

function toneFor(value: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  const normalized = value.toLowerCase();
  if (normalized.includes('clear') || normalized.includes('signed') || normalized.includes('ready') || normalized.includes('complete') || normalized.includes('yes')) return 'success';
  if (normalized.includes('due') || normalized.includes('required') || normalized.includes('review') || normalized.includes('pending') || normalized.includes('missing')) return 'warning';
  if (normalized.includes('blocked') || normalized.includes('void') || normalized.includes('no')) return 'error';
  if (normalized.includes('scheduled') || normalized.includes('active')) return 'primary';
  return 'default';
}

export function IgsrtCommandClient({ summary, documents, gates }: IgsrtCommandClientProps) {
  const [selectedGateId, setSelectedGateId] = useState(gates[0]?.id ?? '');
  const [disposition, setDisposition] = useState('Ready for clinical review');
  const [note, setNote] = useState('Reviewed simulation order, prescription, schedule gates, generated documents, and fraction worksheet readiness.');
  const [ledger, setLedger] = useState<StagedIgsrtReview[]>([]);
  const selectedGate = gates.find((gate) => gate.id === selectedGateId) ?? gates[0];
  const readyDocuments = documents.filter((document) => document.auditReady === 'Audit ready').length;
  const blockedGates = gates.filter((gate) => gate.status !== 'CLEAR').length;

  function selectGate(row: IgsrtGateRow) {
    setSelectedGateId(row.id);
    setNote(`Reviewed ${row.gate} gate: ${row.detail}`);
  }

  function stageReview() {
    setLedger((current) => [
      {
        id: `IGSRT-${Date.now().toString(36).toUpperCase()}`,
        disposition,
        note,
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <>
      <PageHeader
        title="IGSRT Command"
        subtitle="Skin cancer IGSRT simulation, prescription, schedule gates, generated documents, and fraction worksheet"
        actions={
          <>
            <PrototypeActionButton label="Open Patient Workspace" icon="play" kind="review" description="Stage navigation to the patient command workspace for this tokenized course." />
            <PrototypeActionButton label="Generate IGSRT Packet" icon="file" kind="document" variant="primary" description="Stage a simulated IGSRT packet from the current course evidence." />
          </>
        }
      />

      <StatGrid>
        <StatCard icon={Radiation} label="Course" value={summary.courseStatus} sub={`${summary.currentFraction}/${summary.totalFractions} fractions`} tone={toneFor(summary.courseStatus)} />
        <StatCard icon={ClipboardCheck} label="Simulation" value={summary.simulationStatus} sub={summary.simulationSigned} tone={toneFor(summary.simulationStatus)} />
        <StatCard icon={ShieldCheck} label="Prescription" value={summary.prescriptionStatus} sub={summary.prescriptionSigned} tone={toneFor(summary.prescriptionStatus)} />
        <StatCard icon={CalendarDays} label="Schedule" value={`${summary.scheduledFractions}/${summary.plannedFractions}`} sub={summary.scheduleStatus} tone={toneFor(summary.scheduleStatus)} />
        <StatCard icon={FileText} label="Documents" value={`${readyDocuments}/${documents.length}`} sub="Audit ready" tone={readyDocuments === documents.length ? 'success' : 'warning'} />
        <StatCard icon={CheckCircle2} label="Gates" value={blockedGates ? `${blockedGates} open` : 'Clear'} sub={summary.clinicalValidationStatus} tone={blockedGates ? 'warning' : 'success'} />
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Selected Course</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">{summary.patientRef} / {summary.courseRef}</h2>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
                {summary.diagnosis} / {summary.site} / {summary.laterality}
              </p>
            </div>
            <Badge variant={toneFor(summary.protocol)}>{summary.protocol}</Badge>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="clinical-muted-surface p-3">
              <p className="clinical-label">Sensus</p>
              <Badge variant={toneFor(summary.sensusVerified)}>{summary.sensusVerified}</Badge>
            </div>
            <div className="clinical-muted-surface p-3">
              <p className="clinical-label">Preauthorization</p>
              <Badge variant={toneFor(summary.preAuthorized)}>{summary.preAuthorized}</Badge>
            </div>
            <div className="clinical-muted-surface p-3">
              <p className="clinical-label">Recorded Fractions</p>
              <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{summary.recordedFractions}</p>
            </div>
            <div className="clinical-muted-surface p-3">
              <p className="clinical-label">Clinical Validation</p>
              <Badge variant={toneFor(summary.clinicalValidationStatus)}>{summary.clinicalValidationStatus}</Badge>
            </div>
          </div>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
            <p className="clinical-label">Missing Inputs</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.missingInputs.length ? summary.missingInputs.map((input) => (
                <Badge key={input} variant="warning">{input}</Badge>
              )) : (
                <Badge variant="success">Core inputs present</Badge>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Review Staging</p>
              <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">IGSRT readiness decision</h2>
            </div>
            <Badge variant="info">Prototype only</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[220px_minmax(0,1fr)_auto]">
            <label className="grid gap-1">
              <span className="clinical-label">Disposition</span>
              <Select value={disposition} onChange={(event) => setDisposition(event.target.value)}>
                <option>Ready for clinical review</option>
                <option>Needs simulation update</option>
                <option>Needs prescription signoff</option>
                <option>Ready for treatment entry</option>
                <option>Closeout review required</option>
              </Select>
            </label>
            <label className="grid gap-1">
              <span className="clinical-label">Review Note</span>
              <Textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <div className="flex items-end">
              <Button type="button" className="clinical-action-lg" onClick={stageReview}>
                Stage Review
              </Button>
            </div>
          </div>
          <div className="mt-4 grid gap-2">
            {ledger.length ? ledger.map((record) => (
              <div key={record.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 md:grid-cols-[150px_190px_minmax(0,1fr)]">
                <span className="text-xs font-bold text-[var(--color-primary)]">{record.id}</span>
                <Badge variant={toneFor(record.disposition)}>{record.disposition}</Badge>
                <span className="truncate text-sm font-semibold text-[var(--color-text-muted)]">{record.note}</span>
              </div>
            )) : (
              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 text-sm font-semibold text-[var(--color-text-muted)]">
                No IGSRT review decisions have been staged in this demo session.
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <Card>
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="clinical-label">Selected Gate</p>
              <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">{selectedGate?.gate ?? 'No gate selected'}</h2>
            </div>
            {selectedGate ? <Badge variant={toneFor(selectedGate.status)}>{selectedGate.status}</Badge> : null}
          </div>
          {selectedGate ? (
            <div className="grid gap-3">
              <div className="clinical-muted-surface p-3">
                <p className="clinical-label">Detail</p>
                <p className="mt-2 text-sm font-semibold leading-5 text-[var(--color-text)]">{selectedGate.detail}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                  <p className="clinical-label">Due Fractions</p>
                  <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{selectedGate.dueFractions}</p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                  <p className="clinical-label">Evidence</p>
                  <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{selectedGate.evidence}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">No gate information is available.</p>
          )}
        </Card>

        <DataTable
          keyField="id"
          className="min-h-[380px]"
          columns={[
            { key: 'gate', label: 'Gate', render: (row) => <span className="font-bold text-[var(--color-text)]">{row.gate}</span> },
            { key: 'status', label: 'Status', render: (row) => <Badge variant={toneFor(row.status)}>{row.status}</Badge> },
            { key: 'detail', label: 'Detail' },
            { key: 'dueFractions', label: 'Due Fx' },
            { key: 'evidence', label: 'Evidence' },
          ]}
          rows={gates}
          empty="No treatment gates are available."
          emptyDescription="Gate rows appear after the IGSRT planning service evaluates the course."
          search={{ placeholder: 'Search gate, status, detail, due fraction, or evidence...', keys: ['gate', 'status', 'detail', 'dueFractions', 'evidence'] }}
          filters={[
            { id: 'status', label: 'Status' },
            { id: 'gate', label: 'Gate' },
          ]}
          pageSize={6}
          onRowClick={selectGate}
        />
      </div>

      <DataTable
        keyField="id"
        className="min-h-[430px]"
        columns={[
          { key: 'name', label: 'Generated Document', render: (row) => <span className="font-bold text-[var(--color-text)]">{row.name}</span> },
          { key: 'phase', label: 'Phase' },
          { key: 'owner', label: 'Owner' },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={toneFor(row.status)}>{row.status}</Badge> },
          { key: 'signature', label: 'Signature', render: (row) => <Badge variant={toneFor(row.signature)}>{row.signature}</Badge> },
          { key: 'auditReady', label: 'Audit', render: (row) => <Badge variant={toneFor(row.auditReady)}>{row.auditReady}</Badge> },
          { key: 'requiredAction', label: 'Required Action' },
        ]}
        rows={documents}
        empty="No generated IGSRT documents are available."
        emptyDescription="Document rows appear after the course bundle creates required templates."
        toolbarPrefix={
          <div className="min-w-[240px]">
            <p className="clinical-label">IGSRT Document Evidence</p>
            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Simulation, prescription, fraction log, treatment summary, and audit note readiness.</p>
          </div>
        }
        toolbarActions={<PrototypeActionButton label="Render Missing Docs" icon="refresh" kind="document" size="sm" description="Stage simulated rendering for documents that still need output." />}
        search={{ placeholder: 'Search document, phase, owner, status, signature, audit, or action...', keys: ['name', 'phase', 'owner', 'status', 'signature', 'auditReady', 'requiredAction'] }}
        filters={[
          { id: 'phase', label: 'Phase' },
          { id: 'owner', label: 'Owner' },
          { id: 'status', label: 'Status' },
          { id: 'signature', label: 'Signature' },
          { id: 'auditReady', label: 'Audit' },
        ]}
        pageSize={8}
      />
    </>
  );
}
