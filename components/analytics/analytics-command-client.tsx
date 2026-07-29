'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  FileText,
  LockKeyhole,
  PieChart as PieChartIcon,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  AnalyticsBillingReadiness,
  AnalyticsDistributionDatum,
  AnalyticsHeatmapCell,
  AnalyticsInsight,
  AnalyticsPanel,
  AnalyticsPhiSignal,
  AnalyticsRiskRankDatum,
  AnalyticsRoleLoad,
  AnalyticsTelemetry,
  AnalyticsTone,
} from '@/lib/services/analytics-telemetry-service';
import { statusToneClass } from '@/lib/status-utils';
import { ChartCard } from '@/components/shared/chart-card';
import { ClinicalMatrix } from '@/components/shared/clinical-matrix';
import { StatCard } from '@/components/shared/stat-card';
import { StatGrid } from '@/components/shared/stat-grid';
import { StickyPageHeader } from '@/components/shared/sticky-page-header';
import { TabStrip } from '@/components/shared/tab-strip';
import { uiTypography } from '@/lib/ui-typography';

type AnalyticsCommandClientProps = {
  telemetry: AnalyticsTelemetry;
  initialPanel: AnalyticsPanel;
};

type AnalyticsDateRange = '7' | '14' | '30';

const tabLabels: Record<AnalyticsPanel, string> = {
  overview: 'Overview',
  workflow: 'Workflow',
  treatment: 'Treatment',
  documents: 'Documents',
  staffing: 'Staffing',
  'billing-risk': 'Billing & Risk',
};

const panelCopy: Record<AnalyticsPanel, { title: string; meta: string }> = {
  overview: {
    title: 'Operational Intelligence',
    meta: 'Recent operational activity, cohort mix, and top explainable insights',
  },
  workflow: {
    title: 'Workflow Performance',
    meta: 'Carepath phase and owner pressure across aggregate operational work',
  },
  treatment: {
    title: 'Treatment Analytics',
    meta: 'Fraction throughput, approval completion, and hold and review trends',
  },
  documents: {
    title: 'Documentation Intelligence',
    meta: 'Lifecycle funnel, signature aging, template coverage, and audit evidence gaps',
  },
  staffing: {
    title: 'Staffing And Capacity',
    meta: 'Role pressure, schedule density, provider load, and staffing risk signals',
  },
  'billing-risk': {
    title: 'Billing, Audit, And Risk',
    meta: 'Aggregate billing, audit, risk-domain, and PHI boundary signals',
  },
};

const dateRangeOptions: { label: string; value: AnalyticsDateRange }[] = [
  { label: '7-day', value: '7' },
  { label: '14-day', value: '14' },
  { label: '30-day', value: '30' },
];

const chartTooltipStyle = {
  background: 'var(--color-card)',
  border: 'var(--border-container)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--color-text)',
} as const;

const axisTick = {
  fill: 'var(--color-text-muted)',
  fontSize: uiTypography.size.label,
  fontWeight: uiTypography.weight.semibold,
} as const;

function toneVar(tone: AnalyticsTone) {
  return `var(--status-${tone}-solid)`;
}

function AnalyticsRangeFilter({
  value,
  onChange,
}: {
  value: AnalyticsDateRange;
  onChange: (value: AnalyticsDateRange) => void;
}) {
  return (
    <label className="analytics-range-filter">
      <span>Trend Range</span>
      <select
        aria-label="Analytics Trend Range"
        value={value}
        onChange={(event) => onChange(event.target.value as AnalyticsDateRange)}
      >
        {dateRangeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InsightRail({ insights, title = 'Insight Brief' }: { insights: AnalyticsInsight[]; title?: string }) {
  return (
    <aside className="analytics-insight-rail">
      <div className="analytics-insight-head">
        <span className="chart-card-icon"><BrainCircuit size={16} /></span>
        <div>
          <h2>{title}</h2>
          <p>Explainable signals, evidence, and recommended inspection path</p>
        </div>
      </div>
      <div className="analytics-insight-list">
        {insights.map((insight) => (
          <article key={insight.id} className={`analytics-insight ${statusToneClass(insight.tone)}`}>
            <div className="analytics-insight-severity-row">
              <span>{insight.severity}</span>
            </div>
            <strong className="analytics-insight-title">{insight.title}</strong>
            <p>{insight.summary}</p>
            <em>{insight.evidence}</em>
            <b>{insight.recommendation}</b>
            <small>{insight.inspection}</small>
          </article>
        ))}
      </div>
    </aside>
  );
}

function ActivityTrendChart({ dateRange, telemetry }: { dateRange: AnalyticsDateRange; telemetry: AnalyticsTelemetry }) {
  const rangeDays = Number(dateRange);
  const trend = useMemo(
    () => telemetry.overview.activityTrend.filter((point) => point.dayOffset < rangeDays),
    [rangeDays, telemetry],
  );

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200} initialDimension={{ width: 640, height: 220 }}>
      <ComposedChart data={trend} margin={{ top: 18, right: 16, bottom: 0, left: -24 }}>
        <defs>
          <linearGradient id="analyticsActivityFractions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} interval="preserveStartEnd" tick={axisTick} />
        <YAxis hide />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Area type="monotone" dataKey="fractions" name="Fractions logged" fill="url(#analyticsActivityFractions)" stroke="var(--color-primary)" strokeWidth={2} />
        <Line type="monotone" dataKey="documents" name="Document updates" stroke="var(--color-text-muted)" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="tasks" name="Task updates" stroke="color-mix(in srgb, var(--color-primary) 45%, var(--color-text-muted))" strokeWidth={2} strokeDasharray="4 4" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function DonutChart({ data, centerLabel }: { data: AnalyticsDistributionDatum[]; centerLabel: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="analytics-donut">
      <div className="analytics-donut-plot">
        <ResponsiveContainer width="100%" height="100%" minWidth={96} minHeight={96} initialDimension={{ width: 140, height: 140 }}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius="58%"
              outerRadius="82%"
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {data.map((item) => <Cell key={item.label} fill={item.color} />)}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="analytics-donut-center">
          <strong>{total}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <div className="analytics-donut-legend">
        {data.map((item) => (
          <span key={item.label}>
            <i style={{ background: item.color }} />
            {item.label} <b>{item.value}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

function PhaseLoadChart({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={230} initialDimension={{ width: 560, height: 240 }}>
      <ComposedChart data={telemetry.workflow.phaseLoad} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
        <YAxis type="category" dataKey="label" width={104} tickLine={false} axisLine={false} tick={axisTick} />
        <Tooltip cursor={{ fill: 'var(--color-hover)' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="open" name="Open" stackId="load" fill="var(--color-primary)" barSize={16} />
        <Bar dataKey="review" name="Review path" stackId="load" fill="var(--status-intermediate-solid)" barSize={16} />
        <Bar dataKey="blocked" name="Blocked" stackId="load" fill="var(--status-negative-solid)" radius={[0, 8, 8, 0]} barSize={16} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function RoleLoadChart({ rows }: { rows: AnalyticsRoleLoad[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200} initialDimension={{ width: 560, height: 220 }}>
      <ComposedChart data={rows} layout="vertical" margin={{ top: 8, right: 28, bottom: 0, left: 12 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="role" width={112} tickLine={false} axisLine={false} tick={axisTick} />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Bar dataKey="assigned" name="Assigned tasks" stackId="load" fill="var(--color-primary)" />
        <Bar dataKey="review" name="Review items" stackId="load" fill="var(--status-intermediate-solid)" />
        <Bar dataKey="overdue" name="Overdue" stackId="load" fill="var(--status-negative-solid)" radius={[0, 7, 7, 0]} />
        <Line dataKey="pressure" name="Pressure" stroke="var(--color-text-muted)" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: 'var(--color-card)' }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function RiskRankChart({ rows, name }: { rows: AnalyticsRiskRankDatum[]; name: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200} initialDimension={{ width: 460, height: 220 }}>
      <ComposedChart data={rows} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
        <YAxis type="category" dataKey="label" width={124} tickLine={false} axisLine={false} tick={axisTick} />
        <Tooltip cursor={{ fill: 'var(--color-hover)' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="value" name={name} radius={[2, 8, 8, 2]} barSize={14}>
          {rows.map((entry) => (
            <Cell key={entry.label} fill={toneVar(entry.tone)} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function TreatmentThroughput({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200} initialDimension={{ width: 620, height: 220 }}>
      <ComposedChart data={telemetry.treatment.throughput} margin={{ top: 16, right: 14, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis hide />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Bar dataKey="fractions" name="Fractions" fill="var(--color-primary)" radius={[7, 7, 2, 2]} />
        <Line type="monotone" dataKey="approvals" name="Fully approved" stroke="var(--status-positive-solid)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)' }} />
        <Line type="monotone" dataKey="reviews" name="Review issues" stroke="var(--status-intermediate-solid)" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function LifecycleChart({ data }: { data: AnalyticsDistributionDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180} initialDimension={{ width: 480, height: 210 }}>
      <ComposedChart data={data} margin={{ top: 10, right: 14, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis hide />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Bar dataKey="value" name="Documents" radius={[8, 8, 2, 2]}>
          {data.map((item) => <Cell key={item.label} fill={item.color} />)}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SignatureAgingChart({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180} initialDimension={{ width: 480, height: 210 }}>
      <ComposedChart data={telemetry.documents.signatureAging} margin={{ top: 10, right: 14, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis hide />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Bar dataKey="count" name="Documents" fill="var(--color-primary)" radius={[8, 8, 2, 2]} />
        <Line type="monotone" dataKey="signatures" name="Signature queue" stroke="var(--status-intermediate-solid)" strokeWidth={2} />
        <Line type="monotone" dataKey="risk" name="Risk" stroke="var(--status-negative-solid)" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function TemplateCoverage({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-template-list">
      {telemetry.documents.templateCoverage.map((item) => {
        const active = Math.round((item.active / Math.max(item.total, 1)) * 100);
        const mapping = Math.round((item.mapping / Math.max(item.total, 1)) * 100);
        const draft = Math.round((item.draft / Math.max(item.total, 1)) * 100);
        const missing = Math.max(0, 100 - active - mapping - draft);

        return (
          <article key={item.label} className="analytics-template-row">
            <div>
              <strong>{item.label}</strong>
              <span>{item.active}/{item.total} active sources</span>
            </div>
            <em aria-label={`${item.label} template coverage`}>
              <i className="is-active" style={{ width: `${active}%` }} />
              <i className="is-mapping" style={{ width: `${mapping}%` }} />
              <i className="is-draft" style={{ width: `${draft}%` }} />
              <i className="is-missing" style={{ width: `${missing}%` }} />
            </em>
          </article>
        );
      })}
    </div>
  );
}

function CapacityChart({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={200} initialDimension={{ width: 560, height: 220 }}>
      <ComposedChart data={telemetry.staffing.capacityBands} margin={{ top: 10, right: 14, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis hide />
        <Tooltip contentStyle={chartTooltipStyle} />
        <Area type="monotone" dataKey="treatment" name="Treatment" fill="var(--color-primary)" fillOpacity={0.16} stroke="var(--color-primary)" />
        <Area type="monotone" dataKey="simulation" name="Simulation" fill="var(--color-text-muted)" fillOpacity={0.12} stroke="var(--color-text-muted)" />
        <Line type="monotone" dataKey="review" name="Review" stroke="var(--status-intermediate-solid)" strokeWidth={2} />
        <Line type="monotone" dataKey="capacity" name="Capacity" stroke="var(--status-negative-solid)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ProviderPressure({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-provider-list">
      {telemetry.staffing.providerPressure.map((provider) => (
        <article key={provider.provider} className={`analytics-provider-row ${statusToneClass(provider.tone)}`}>
          <div>
            <strong>{provider.provider}</strong>
            <span>{provider.appointments}/{provider.capacity} appointments</span>
          </div>
          <em><i style={{ width: `${provider.pressure}%` }} /></em>
          <b>{provider.pressure}%</b>
        </article>
      ))}
    </div>
  );
}

function BillingReadiness({ rows }: { rows: AnalyticsBillingReadiness[] }) {
  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="analytics-billing-chip-grid">
      {rows.map((item) => (
        <article key={item.label} className={`analytics-billing-chip ${statusToneClass(item.tone)}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <em>{Math.round((item.value / Math.max(total, 1)) * 100)}%</em>
        </article>
      ))}
    </div>
  );
}

function PhiBoundary({ rows }: { rows: AnalyticsPhiSignal[] }) {
  return (
    <div className="analytics-phi-grid">
      {rows.map((row) => (
        <article key={row.label} className={`analytics-phi-signal ${statusToneClass(row.tone)}`}>
          <span>{row.label}</span>
          <strong>{row.value}</strong>
          <p>{row.detail}</p>
        </article>
      ))}
    </div>
  );
}

function PanelSplit({ main, rail }: { main: React.ReactNode; rail: React.ReactNode }) {
  return (
    <div className="analytics-panel-split">
      <div className="analytics-panel-main">{main}</div>
      {rail}
    </div>
  );
}

function OverviewPanel({ dateRange, telemetry }: { dateRange: AnalyticsDateRange; telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel">
      <StatGrid>
        {telemetry.overview.kpis.map((item) => (
          <StatCard key={item.label} icon={BarChart3} label={item.label} value={item.value} sub={item.detail} tone={item.tone} />
        ))}
      </StatGrid>
      <PanelSplit
        main={(
          <>
            <ChartCard
              icon={Activity}
              title={`${dateRange}-Day Activity Trend`}
              description="Recorded fraction, document, and task events per day"
              height="md"
              footer={telemetry.sampleNotice}
            >
              <ActivityTrendChart dateRange={dateRange} telemetry={telemetry} />
            </ChartCard>
            <ChartCard icon={PieChartIcon} title="Cohort Mix" description="Diagnosis and chart-rounds phase distribution" height="auto">
              <div className="analytics-mix-grid">
                <DonutChart data={telemetry.overview.diagnosisMix} centerLabel="Dx" />
                <DonutChart data={telemetry.overview.phaseMix} centerLabel="Phase" />
              </div>
            </ChartCard>
          </>
        )}
        rail={<InsightRail insights={telemetry.overview.insights} title="Top Insight Brief" />}
      />
    </div>
  );
}

function WorkflowPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel">
      <PanelSplit
        main={(
          <>
            <ChartCard
              icon={Activity}
              title="Carepath Phase Load"
              description="Open, review, and blocked work by workflow phase"
              height="lg"
            >
              <PhaseLoadChart telemetry={telemetry} />
            </ChartCard>
            <ChartCard
              icon={UsersRound}
              title="Phase × Owner Heatmap"
              description="Open tasks and document pressure by accountable role"
              height="auto"
            >
              <ClinicalMatrix
                ariaLabel="Analytics phase owner pressure matrix"
                columns={telemetry.workflow.phaseOwnerHeatmap.phases}
                rows={telemetry.workflow.phaseOwnerHeatmap.owners}
                cells={telemetry.workflow.phaseOwnerHeatmap.cells.map((cell: AnalyticsHeatmapCell) => ({
                  x: cell.x,
                  y: cell.y,
                  value: cell.value,
                  tone: cell.tone,
                  detail: `${cell.yLabel} · ${cell.xLabel}: ${cell.value} open, ${cell.blocked} blocked, ${cell.review} review`,
                }))}
              />
            </ChartCard>
          </>
        )}
        rail={<InsightRail insights={telemetry.workflow.insights} />}
      />
    </div>
  );
}

function TreatmentPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel">
      <StatGrid>
        {telemetry.treatment.signals.map((item) => (
          <StatCard key={item.label} icon={Activity} label={item.label} value={item.value} sub={item.detail} tone={item.tone} />
        ))}
      </StatGrid>
      <PanelSplit
        main={(
          <>
            <ChartCard
              icon={Activity}
              title="Fraction Throughput"
              description="Recorded fraction events with approval and review overlays"
              height="md"
            >
              <TreatmentThroughput telemetry={telemetry} />
            </ChartCard>
          </>
        )}
        rail={<InsightRail insights={telemetry.treatment.insights} />}
      />
    </div>
  );
}

function DocumentsPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel">
      <PanelSplit
        main={(
          <>
            <div className="analytics-paired-grid">
              <ChartCard icon={FileText} title="Document Lifecycle" description="Ready, review, blocked, and draft work state" height="sm">
                <LifecycleChart data={telemetry.documents.lifecycle} />
              </ChartCard>
              <ChartCard icon={CalendarDays} title="Signature Aging" description="How long document work has been waiting" height="sm">
                <SignatureAgingChart telemetry={telemetry} />
              </ChartCard>
            </div>
            <ChartCard icon={ShieldCheck} title="Audit Evidence Matrix" description="Evidence gaps by carepath phase and closeout domain" height="auto">
              <ClinicalMatrix
                ariaLabel="Analytics audit evidence matrix"
                columns={telemetry.documents.evidenceMatrix.phases}
                rows={telemetry.documents.evidenceMatrix.domains}
                cells={telemetry.documents.evidenceMatrix.cells.map((cell: AnalyticsHeatmapCell) => ({
                  x: cell.x,
                  y: cell.y,
                  value: cell.value,
                  tone: cell.tone,
                  detail: `${cell.yLabel} · ${cell.xLabel}: ${cell.value} evidence gaps, ${cell.review} signature review`,
                }))}
              />
            </ChartCard>
            <ChartCard icon={FileText} title="Template Coverage" description="Active, mapping, draft, and missing source state" height="auto">
              <TemplateCoverage telemetry={telemetry} />
            </ChartCard>
          </>
        )}
        rail={<InsightRail insights={telemetry.documents.insights} />}
      />
    </div>
  );
}

function StaffingPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel">
      <PanelSplit
        main={(
          <>
            <ChartCard
              icon={UsersRound}
              title="Role Load Matrix"
              description="Task, review, overdue, and document pressure by role"
              height="md"
            >
              <RoleLoadChart rows={telemetry.staffing.roleLoad} />
            </ChartCard>
            <ChartCard icon={CalendarDays} title="Schedule Capacity Bands" description="Time-band density by treatment, simulation, and review work" height="md">
              <CapacityChart telemetry={telemetry} />
            </ChartCard>
            <ChartCard icon={UsersRound} title="Provider Pressure" description="Appointment load against modeled daily capacity" height="auto">
              <ProviderPressure telemetry={telemetry} />
            </ChartCard>
          </>
        )}
        rail={<InsightRail insights={telemetry.staffing.insights} />}
      />
    </div>
  );
}

function BillingRiskPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel">
      <PanelSplit
        main={(
          <>
            <ChartCard icon={ShieldCheck} title="Risk Domains" description="Where aggregate weighted risk signals concentrate" height="md">
              <RiskRankChart rows={telemetry.billingRisk.riskDomains} name="Domain weight" />
            </ChartCard>
            <div className="analytics-paired-grid">
              <ChartCard icon={CheckCircle2} title="Billing Readiness" description="Billing work state tied to evidence readiness" height="auto">
                <BillingReadiness rows={telemetry.billingRisk.billingReadiness} />
              </ChartCard>
              <ChartCard icon={ShieldCheck} title="Audit Closeout Readiness" description="Closeout checks grouped by operational state" height="auto">
                <DonutChart data={telemetry.billingRisk.auditReadiness} centerLabel="Audit" />
              </ChartCard>
            </div>
            <ChartCard icon={LockKeyhole} title="PHI Boundary Assurance" description="Client payload guardrails for analytics telemetry" height="auto">
              <PhiBoundary rows={telemetry.billingRisk.phiBoundary} />
            </ChartCard>
          </>
        )}
        rail={<InsightRail insights={telemetry.billingRisk.insights} />}
      />
    </div>
  );
}

function ActivePanel({
  activePanel,
  dateRange,
  telemetry,
}: {
  activePanel: AnalyticsPanel;
  dateRange: AnalyticsDateRange;
  telemetry: AnalyticsTelemetry;
}) {
  if (activePanel === 'workflow') return <WorkflowPanel telemetry={telemetry} />;
  if (activePanel === 'treatment') return <TreatmentPanel telemetry={telemetry} />;
  if (activePanel === 'documents') return <DocumentsPanel telemetry={telemetry} />;
  if (activePanel === 'staffing') return <StaffingPanel telemetry={telemetry} />;
  if (activePanel === 'billing-risk') return <BillingRiskPanel telemetry={telemetry} />;
  return <OverviewPanel dateRange={dateRange} telemetry={telemetry} />;
}

export function AnalyticsCommandClient({ initialPanel, telemetry }: AnalyticsCommandClientProps) {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<AnalyticsPanel>(initialPanel);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('30');
  const activeCopy = panelCopy[activePanel];

  const setPanel = (panel: AnalyticsPanel) => {
    setActivePanel(panel);
    router.replace(panel === 'overview' ? '/analytics' : `/analytics?panel=${panel}`, { scroll: false });
  };

  return (
    <section className="analytics-command" data-active-panel={activePanel}>
      <StickyPageHeader
        title={activeCopy.title}
        subtitle={activeCopy.meta}
        tabs={(
          <TabStrip
            tabs={telemetry.panels.map((panel) => ({ id: panel, label: tabLabels[panel] }))}
            activeId={activePanel}
            onSelect={setPanel}
            ariaLabel="Analytics Panels"
            idPrefix="analytics"
          />
        )}
        actions={activePanel === 'overview' ? <AnalyticsRangeFilter value={dateRange} onChange={setDateRange} /> : undefined}
      />

      <div className="analytics-command-body" role="tabpanel" id={`analytics-panel-${activePanel}`} aria-labelledby={`analytics-tab-${activePanel}`}>
        <ActivePanel activePanel={activePanel} dateRange={dateRange} telemetry={telemetry} />
      </div>
    </section>
  );
}
