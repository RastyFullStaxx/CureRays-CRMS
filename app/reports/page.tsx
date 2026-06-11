export const dynamic = 'force-dynamic';

import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  FileText,
  ShieldCheck,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAnalyticsTelemetry } from '@/lib/services/analytics-telemetry-service';

const reportTiles = [
  {
    title: 'Workflow Performance',
    detail: 'Carepath flow, owner pressure, and tokenized inspection queues.',
    href: '/analytics?panel=workflow',
    icon: ClipboardList,
  },
  {
    title: 'Treatment Analytics',
    detail: 'Fraction throughput, approvals, held courses, and course progress.',
    href: '/analytics?panel=treatment',
    icon: TrendingUp,
  },
  {
    title: 'Document Intelligence',
    detail: 'Lifecycle funnel, signature aging, template coverage, and evidence gaps.',
    href: '/analytics?panel=documents',
    icon: FileText,
  },
  {
    title: 'Billing & Risk',
    detail: 'Audit closeout readiness, billing state, risk graph, and PHI boundary assurance.',
    href: '/analytics?panel=billing-risk',
    icon: ShieldCheck,
  },
];

export default function ReportsPage() {
  const telemetry = getAnalyticsTelemetry();
  const [cohort, pressure, audit, intervention] = telemetry.overview.kpis;

  return (
    <PageStack>
      <PageHeader
        title="Reports"
        subtitle="Current-state reporting doorway for the deeper Analytics cockpit"
        actions={(
          <Link href="/analytics">
            <Button>
              <BarChart3 className="h-4 w-4" />
              Open Analytics
            </Button>
          </Link>
        )}
      />

      <StatGrid>
        <StatCard icon={UsersRound} label={cohort.label} value={cohort.value} sub={cohort.detail} tone="primary" />
        <StatCard icon={ClipboardList} label={pressure.label} value={pressure.value} sub={pressure.detail} tone="warning" />
        <StatCard icon={ShieldCheck} label={audit.label} value={audit.value} sub={audit.detail} tone="success" />
        <StatCard icon={TrendingUp} label={intervention.label} value={intervention.value} sub={intervention.detail} tone="error" />
      </StatGrid>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="clinical-label">Reports Relationship</p>
              <h2 className="mt-2 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
                Reports summarize; Analytics explains.
              </h2>
              <p className="mt-2 max-w-3xl text-sm font-semibold text-[var(--color-text-muted)]">
                This page keeps the lightweight report doorway. The Analytics cockpit is the center for bottleneck
                patterns, model-labeled projections, and operational insight across workflow, treatment, documents,
                staffing, billing, audit, and risk.
              </p>
            </div>
            <span className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] px-3 py-2 text-xs font-bold text-[var(--color-text-muted)]">
              Model as of {telemetry.asOfLabel}
            </span>
          </div>
        </Card>

        <Card>
          <p className="clinical-label">Prototype Forecast Guardrail</p>
          <h2 className="mt-2 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
            Projection charts are labeled.
          </h2>
          <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
            {telemetry.sampleNotice}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportTiles.map((tile) => {
          const Icon = tile.icon;

          return (
            <Card key={tile.title} className="flex min-h-[190px] flex-col justify-between">
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-stat-icon-bg)] text-[var(--color-primary)]">
                  <Icon size={18} />
                </span>
                <h2 className="mt-4 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
                  {tile.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
                  {tile.detail}
                </p>
              </div>
              <Link className="mt-4 inline-flex text-sm font-bold text-[var(--color-primary)]" href={tile.href}>
                Open panel
              </Link>
            </Card>
          );
        })}
      </div>
    </PageStack>
  );
}
