'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BarChart3, CheckCircle2, ClipboardList, FileText, ShieldCheck, TrendingUp, UsersRound } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
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

export type ReportKpiRow = {
  label: string;
  value: string | number;
  detail: string;
  tone: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';
};

export type ReportPackRow = {
  id: string;
  title: string;
  detail: string;
  href: string;
  domain: string;
  cadence: string;
  output: string;
  readiness: string;
  source: string;
  metric: string;
  risk: string;
  insight: string;
};

type StagedReportEntry = {
  id: string;
  title: string;
  action: string;
  note: string;
};

type ReportsCommandClientProps = {
  asOfLabel: string;
  sampleNotice: string;
  kpis: ReportKpiRow[];
  reportPacks: ReportPackRow[];
};

const reportIcons = {
  workflow: ClipboardList,
  treatment: TrendingUp,
  documents: FileText,
  billing: ShieldCheck,
};

function readinessTone(readiness: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  if (readiness === 'Ready') return 'success';
  if (readiness === 'Needs Review') return 'warning';
  if (readiness === 'Blocked') return 'error';
  return 'info';
}

export function ReportsCommandClient({ asOfLabel, sampleNotice, kpis, reportPacks }: ReportsCommandClientProps) {
  const [selectedId, setSelectedId] = useState(reportPacks[0]?.id ?? '');
  const [reportAction, setReportAction] = useState('Prepare PHI-safe packet');
  const [reviewNote, setReviewNote] = useState('Demo report note: reviewed report source, readiness, risk, and analytics drilldown.');
  const [ledger, setLedger] = useState<StagedReportEntry[]>([]);

  const selectedReport = useMemo(
    () => reportPacks.find((pack) => pack.id === selectedId) ?? reportPacks[0],
    [reportPacks, selectedId]
  );

  const stageReport = () => {
    if (!selectedReport) return;

    setLedger((current) => [
      {
        id: `${Date.now()}-${current.length}`,
        title: selectedReport.title,
        action: reportAction,
        note: reviewNote.trim() || 'No PHI-free report note entered.',
      },
      ...current,
    ].slice(0, 6));
  };

  const primaryKpis = kpis.slice(0, 4);

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Reports"
        subtitle="Operational report workbench for carepath, treatment, document, billing, and risk review"
        actions={(
          <div className="flex flex-wrap gap-2">
            <PrototypeActionButton
              label="Export Report"
              icon="download"
              kind="export"
              variant="primary"
              description="Prepare a tokenized report packet for the prototype demo."
            />
            <Link href="/analytics">
              <Button type="button" variant="secondary">
                <BarChart3 className="h-4 w-4" />
                Open Analytics
              </Button>
            </Link>
          </div>
        )}
      />

      <StatGrid>
        {primaryKpis.map((kpi, index) => {
          const icons = [UsersRound, ClipboardList, ShieldCheck, TrendingUp];
          return (
            <StatCard
              key={kpi.label}
              icon={icons[index] ?? BarChart3}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.detail}
              tone={kpi.tone}
            />
          );
        })}
      </StatGrid>

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Selected report pack</p>
            <h2 className="mt-1 text-base font-bold text-[var(--color-text)]">
              {selectedReport ? selectedReport.title : 'Select a report pack'}
            </h2>
            <p className="mt-1 max-w-3xl text-sm font-semibold text-[var(--color-text-muted)]">
              {selectedReport?.detail ?? 'Report details will appear after selecting a pack.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedReport ? <Badge variant={readinessTone(selectedReport.readiness)}>{selectedReport.readiness}</Badge> : null}
            <Badge variant="info">Model as of {asOfLabel}</Badge>
          </div>
        </div>

        {selectedReport ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Card compact>
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Domain</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selectedReport.domain}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selectedReport.cadence}</p>
              </Card>
              <Card compact>
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Output</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selectedReport.output}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selectedReport.source}</p>
              </Card>
              <Card compact>
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Primary metric</p>
                <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{selectedReport.metric}</p>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{selectedReport.risk}</p>
              </Card>
              <Card compact>
                <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Analytics link</p>
                <Link className="mt-1 inline-flex text-sm font-bold text-[var(--color-primary)]" href={selectedReport.href}>
                  Open drilldown
                </Link>
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Deeper cockpit view</p>
              </Card>
            </div>

            <div className="grid gap-3">
              <Select value={reportAction} onChange={(event) => setReportAction(event.target.value)} aria-label="Report action">
                <option>Prepare PHI-safe packet</option>
                <option>Mark reviewed for huddle</option>
                <option>Stage follow-up owner</option>
                <option>Queue audit evidence export</option>
              </Select>
              <Textarea
                rows={3}
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="Add a PHI-free report review note."
              />
              <Button type="button" size="sm" onClick={stageReport}>
                <CheckCircle2 size={14} />
                Stage report action
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportPacks.map((pack) => {
          const Icon = reportIcons[pack.id as keyof typeof reportIcons] ?? BarChart3;
          const selected = pack.id === selectedReport?.id;

          return (
            <button
              key={pack.id}
              type="button"
              onClick={() => setSelectedId(pack.id)}
              className="clinical-surface clinical-focus min-h-[180px] text-left transition hover:bg-[var(--color-table-row-hover)]"
              style={{
                padding: 'var(--space-card)',
                borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
                boxShadow: selected ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
              }}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-stat-icon-bg)] text-[var(--color-primary)]">
                <Icon size={18} />
              </span>
              <div className="mt-4 flex items-start justify-between gap-3">
                <h3 className="font-heading text-base font-bold text-[var(--color-text)]">{pack.title}</h3>
                {selected ? <Badge variant="primary">Selected</Badge> : null}
              </div>
              <p className="mt-2 text-sm font-semibold leading-5 text-[var(--color-text-muted)]">{pack.detail}</p>
            </button>
          );
        })}
      </div>

      <DataTable
        keyField="id"
        className="min-h-[460px]"
        onRowClick={(row) => setSelectedId(row.id)}
        columns={[
          { key: 'title', label: 'Report Pack', render: (row) => (
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
                {row.title}
                {row.id === selectedReport?.id ? <Badge variant="primary">Selected</Badge> : null}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">{row.domain}</span>
            </div>
          ) },
          { key: 'readiness', label: 'Readiness', render: (row) => <Badge variant={readinessTone(row.readiness)}>{row.readiness}</Badge> },
          { key: 'cadence', label: 'Cadence' },
          { key: 'output', label: 'Output' },
          { key: 'metric', label: 'Metric' },
          { key: 'risk', label: 'Risk' },
        ]}
        rows={reportPacks}
        empty="No report packs are configured."
        emptyDescription="Report packs will appear when analytics telemetry is available."
        search={{ placeholder: 'Search report pack, domain, cadence, output, metric, or risk...', keys: ['title', 'domain', 'cadence', 'output', 'metric', 'risk', 'readiness'] }}
        filters={[
          { id: 'readiness', label: 'Readiness' },
          { id: 'domain', label: 'Domain' },
          { id: 'cadence', label: 'Cadence' },
        ]}
      />

      <section className="clinical-surface rounded-[var(--radius-lg)] p-[var(--space-card)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Prototype report ledger</p>
            <h2 className="mt-1 text-base font-bold text-[var(--color-text)]">Staged report actions</h2>
          </div>
          <Badge variant={ledger.length ? 'primary' : 'default'}>{ledger.length} entries</Badge>
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">{sampleNotice}</p>
        {ledger.length ? (
          <div className="scrollbar-soft mt-4 max-h-44 space-y-2 overflow-auto pr-1">
            {ledger.map((entry) => (
              <div key={entry.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{entry.title}</p>
                  <Badge variant="info">{entry.action}</Badge>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">{entry.note}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </PageStack>
  );
}
