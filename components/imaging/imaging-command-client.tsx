'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Camera, CheckCircle2, FileImage, FolderKanban, Image as ImageIcon, PenLine, Route, Upload } from 'lucide-react';
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

export type ImagingCommandRow = {
  id: string;
  patientId: string;
  patient: string;
  patientRef: string;
  courseId: string;
  course: string;
  name: string;
  modality: string;
  phase: string;
  uploaded: string;
  uploader: string;
  status: string;
  filePath: string;
  notes: string;
  linkedFractions: number;
  requiredForPhase: string;
};

type ImagingCommandClientProps = {
  rows: ImagingCommandRow[];
  categories: string[];
  stats: {
    total: number;
    ultrasound: number;
    xray: number;
    photos: number;
    missingRequired: number;
  };
};

type ImagingLedgerEntry = {
  id: string;
  asset: string;
  action: string;
  note: string;
};

function statusTone(status: string): 'success' | 'warning' | 'info' {
  if (status === 'Tagged') return 'success';
  if (status === 'Queued') return 'warning';
  return 'info';
}

export function ImagingCommandClient({ rows, categories, stats }: ImagingCommandClientProps) {
  const [selectedId, setSelectedId] = useState(rows[0]?.id ?? '');
  const [imagingAction, setImagingAction] = useState('Asset metadata reviewed');
  const [note, setNote] = useState('Demo imaging note: checked category, phase, upload reference, and closeout evidence readiness.');
  const [ledger, setLedger] = useState<ImagingLedgerEntry[]>([]);

  const selected = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? rows[0],
    [rows, selectedId],
  );

  const categoryGaps = categories.filter((category) => !rows.some((row) => row.name === category));

  function stageImagingDecision() {
    if (!selected) return;

    setLedger((current) => [
      {
        id: `IMG-ACT-${Date.now().toString(36).toUpperCase()}`,
        asset: selected.name,
        action: imagingAction,
        note: note.trim() || 'No PHI-free imaging note entered.',
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Imaging"
        subtitle="Tagged imaging evidence, required-category gaps, and carepath handoff"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Upload Imaging"
              icon="upload"
              kind="upload"
              description="Stage imaging evidence with category and phase metadata."
            />
            <PrototypeActionButton
              label="New Imaging Study"
              icon="plus"
              kind="create"
              variant="primary"
              description="Create a prototype imaging study record linked to a course phase."
            />
          </div>
        )}
      />

      <StatGrid>
        <StatCard icon={ImageIcon} label="Total Assets" value={stats.total} sub="Tagged records" />
        <StatCard icon={FileImage} label="Ultrasound" value={stats.ultrasound} sub="US/IGSRT" tone="success" />
        <StatCard icon={Camera} label="X-ray" value={stats.xray} sub="Mapping" tone="primary" />
        <StatCard icon={ImageIcon} label="Clinical Photos" value={stats.photos} sub="Skin evidence" tone="warning" />
        <StatCard icon={Upload} label="Missing Required" value={stats.missingRequired} sub="Asset gaps" tone="error" />
      </StatGrid>

      <DataTable
        keyField="id"
        className="min-h-[540px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          {
            key: 'name',
            label: 'Study Name',
            render: (row) => (
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <ImageIcon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
                    {row.name}
                    {row.id === selected?.id ? <Badge variant="primary">Selected</Badge> : null}
                  </span>
                  <span className="truncate text-[11px] text-[var(--color-text-muted)]">{row.course}</span>
                </span>
              </div>
            ),
          },
          { key: 'patient', label: 'Patient' },
          { key: 'patientRef', label: 'Patient Ref' },
          { key: 'modality', label: 'Modality', render: (row) => <Badge variant="info">{row.modality}</Badge> },
          { key: 'phase', label: 'Phase', render: (row) => <Badge variant="info">{row.phase}</Badge> },
          { key: 'uploaded', label: 'Uploaded' },
          { key: 'uploader', label: 'Uploader' },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{row.status}</Badge> },
        ]}
        rows={rows}
        empty="No imaging assets are available."
        emptyDescription="Tagged imaging evidence will appear after assets are attached to a course."
        pageSize={10}
        search={{
          placeholder: 'Search modality, category, phase, patient token, uploader, status, or path...',
          keys: ['name', 'patient', 'patientRef', 'course', 'modality', 'phase', 'uploader', 'status', 'filePath', 'notes'],
        }}
        filters={[
          { id: 'modality', label: 'Modality' },
          { id: 'phase', label: 'Phase' },
          { id: 'status', label: 'Status' },
          { id: 'uploader', label: 'Uploader' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="clinical-label">Selected Imaging Asset</p>
            <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
              {selected ? selected.name : 'Select an imaging asset'}
            </h2>
            {selected ? (
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                {selected.patient} / {selected.course} / {selected.requiredForPhase}
              </p>
            ) : null}
          </div>
          {selected ? <Badge variant={statusTone(selected.status)}>{selected.status}</Badge> : null}
        </div>

        {selected ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-[300px_minmax(0,1fr)]">
              <div className="min-h-[260px] rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-4">
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-card)] text-center">
                  <ImageIcon className="h-12 w-12 text-[var(--color-primary)]" aria-hidden="true" />
                  <p className="mt-3 px-4 text-sm font-bold text-[var(--color-text)]">{selected.modality} evidence</p>
                  <p className="mt-1 px-4 text-xs font-semibold text-[var(--color-text-muted)]">Prototype preview placeholder</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                  <p className="clinical-label">File Reference</p>
                  <p className="mt-1 line-clamp-2 text-sm font-bold text-[var(--color-text)]">{selected.filePath}</p>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                  <p className="clinical-label">Phase Evidence</p>
                  <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.phase}</p>
                  <Badge variant="info">{selected.requiredForPhase}</Badge>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                  <p className="clinical-label">Treatment Link</p>
                  <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selected.linkedFractions} fraction link(s)</p>
                  <Badge variant={selected.linkedFractions ? 'success' : 'warning'}>Fraction evidence</Badge>
                </div>
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                  <p className="clinical-label">Notes</p>
                  <p className="mt-1 line-clamp-3 text-sm font-bold text-[var(--color-text)]">{selected.notes}</p>
                </div>
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
                    <FileImage size={14} />
                    Documents
                  </Button>
                </Link>
                <Link href="/audit">
                  <Button type="button" variant="secondary" size="sm" className="w-full">
                    <CheckCircle2 size={14} />
                    Audit
                  </Button>
                </Link>
              </div>
              <Select value={imagingAction} onChange={(event) => setImagingAction(event.target.value)} aria-label="Imaging action">
                <option>Asset metadata reviewed</option>
                <option>Required category gap assigned</option>
                <option>Carepath evidence linked</option>
                <option>Fraction image review staged</option>
                <option>Audit closeout evidence staged</option>
              </Select>
              <Textarea
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Add a PHI-free imaging review note."
              />
              <Button type="button" size="sm" onClick={stageImagingDecision}>
                <PenLine size={14} />
                Stage imaging update
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Required Category Matrix</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Imaging evidence by category</h2>
          </div>
          <Badge variant={categoryGaps.length ? 'warning' : 'success'}>{categoryGaps.length} gaps</Badge>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => {
            const present = rows.some((row) => row.name === category);
            return (
              <div key={category} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <p className="line-clamp-2 text-xs font-bold text-[var(--color-text)]">{category}</p>
                <div className="mt-3">
                  <Badge variant={present ? 'success' : 'warning'}>{present ? 'Present' : 'Required gap'}</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Prototype Imaging Ledger</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Local staged imaging decisions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={categoryGaps.length ? 'warning' : 'success'}>{categoryGaps.length} category gaps</Badge>
            <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} staged</Badge>
          </div>
        </div>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{entry.asset}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm font-semibold text-[var(--color-text-muted)]">
            Select an imaging asset above and stage a PHI-free evidence decision for the demo walkthrough.
          </p>
        )}
      </section>
    </PageStack>
  );
}
