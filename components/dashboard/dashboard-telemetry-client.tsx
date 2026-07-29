'use client';

import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitBranch,
  LockKeyhole,
  PenLine,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
  CarepathHeatmapCell,
  DashboardMetric,
  DashboardPanel,
  DashboardTelemetry,
  DashboardTone,
} from '@/lib/services/dashboard-telemetry-service';
import { ChartCard } from '@/components/shared/chart-card';
import { ClinicalMatrix } from '@/components/shared/clinical-matrix';
import { StatCard } from '@/components/shared/stat-card';
import { StatGrid } from '@/components/shared/stat-grid';
import { StickyPageHeader } from '@/components/shared/sticky-page-header';
import { TabStrip } from '@/components/shared/tab-strip';
import { uiTypography } from '@/lib/ui-typography';

type DashboardTelemetryClientProps = {
  telemetry: DashboardTelemetry;
};

const panelTabs: Array<{ id: DashboardPanel; label: string }> = [
  { id: 'ops', label: 'Operations' },
  { id: 'flow', label: 'Carepath' },
  { id: 'risk', label: 'Risk' },
];

const metricIcons: Record<DashboardMetric['icon'], LucideIcon> = {
  patients: UsersRound,
  schedule: CalendarDays,
  tasks: ClipboardList,
  documents: FileText,
};

const carepathKpiIcons: LucideIcon[] = [GitBranch, FileText, CheckCircle2, PenLine];

function toneVar(tone: DashboardTone) {
  return `var(--status-${tone}-solid)`;
}

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

function carepathHeatmapTone(cell: CarepathHeatmapCell): DashboardTone {
  if (cell.blocked + cell.overdue > 0) return 'negative';
  if (cell.needsReview > 0) return 'intermediate';
  return 'neutral';
}

function PhaseOwnerMatrix({ telemetry }: { telemetry: DashboardTelemetry }) {
  const heatmap = telemetry.carepath.phaseOwnerHeatmap;

  return (
    <ClinicalMatrix
      ariaLabel="Carepath phase by owner pressure matrix"
      columns={heatmap.phases}
      rows={heatmap.owners}
      cells={heatmap.cells.map((cell) => ({
        x: cell.phaseIndex,
        y: cell.ownerIndex,
        value: cell.value,
        tone: carepathHeatmapTone(cell),
        detail: `${cell.ownerLabel} · ${cell.phaseLabel}: ${cell.value} open, ${cell.blocked + cell.overdue} blocked or overdue, ${cell.needsReview} review`,
      }))}
    />
  );
}

function StageLoadChart({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={170} initialDimension={{ width: 460, height: 180 }}>
      <ComposedChart data={telemetry.stageLoad.stages} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
        <YAxis type="category" dataKey="label" width={84} tickLine={false} axisLine={false} tick={axisTick} />
        <Tooltip cursor={{ fill: 'var(--color-hover)' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="count" name="Active items" fill="var(--color-primary)" radius={[2, 8, 8, 2]} barSize={18} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function PhaseLoadChart({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={230} initialDimension={{ width: 460, height: 240 }}>
      <ComposedChart data={telemetry.carepath.phaseLoad} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
        <YAxis type="category" dataKey="label" width={104} tickLine={false} axisLine={false} tick={axisTick} />
        <Tooltip cursor={{ fill: 'var(--color-hover)' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="open" name="Open" stackId="load" fill="var(--color-primary)" barSize={16} />
        <Bar dataKey="needsReview" name="Needs review" stackId="load" fill="var(--status-intermediate-solid)" barSize={16} />
        <Bar dataKey="blocked" name="Blocked" stackId="load" fill="var(--status-negative-solid)" radius={[0, 8, 8, 0]} barSize={16} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function TopCourseRiskChart({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={230} initialDimension={{ width: 460, height: 240 }}>
      <ComposedChart data={telemetry.risk.topCourseRisks} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide domain={[0, 'dataMax + 2']} />
        <YAxis type="category" dataKey="courseRef" width={92} tickLine={false} axisLine={false} tick={axisTick} />
        <Tooltip cursor={{ fill: 'var(--color-hover)' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="value" name="Risk weight" radius={[2, 8, 8, 2]} barSize={16}>
          {telemetry.risk.topCourseRisks.map((entry) => (
            <Cell key={entry.courseRef} fill={toneVar(entry.tone)} />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function HandoffRunway({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-runway-list">
      {telemetry.carepath.handoffs.map((item, index) => (
        <article key={item.id} className="dashboard-runway-item" data-tone={item.tone}>
          <span className="dashboard-runway-rank">{index + 1}</span>
          <div>
            <strong>{item.courseRef}</strong>
            <p>{item.title}</p>
            <em>{item.phase} · {item.owner}</em>
          </div>
          <span className="dashboard-runway-state">{item.reasonCategory}<b>{item.dueState}</b></span>
        </article>
      ))}
    </div>
  );
}

function TemplateCoverageStrip({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-template-coverage">
      {telemetry.carepath.templateCoverage.map((item) => {
        const active = Math.round((item.active / Math.max(item.total, 1)) * 100);
        const mapping = Math.round((item.mapping / Math.max(item.total, 1)) * 100);
        const draft = Math.round((item.draft / Math.max(item.total, 1)) * 100);
        const missing = Math.max(0, 100 - active - mapping - draft);

        return (
          <article key={item.label} className="dashboard-template-row">
            <div>
              <strong>{item.label}</strong>
              <span>{item.active}/{item.total} Active</span>
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

function AuditReadinessRibbon({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-audit-ribbon">
      {telemetry.carepath.auditReadiness.map((item) => (
        <article key={item.phase} data-tone={item.blockers > 0 ? 'negative' : item.notReady > 0 ? 'intermediate' : 'positive'}>
          <div>
            <strong>{item.percent}%</strong>
            <span>{item.label}</span>
          </div>
          <em>
            <i style={{ width: `${item.percent}%` }} />
          </em>
          <p>{item.ready} Ready · {item.notReady} Open</p>
        </article>
      ))}
    </div>
  );
}

function RiskDomainLoad({ telemetry }: { telemetry: DashboardTelemetry }) {
  const sortedComponents = [...telemetry.risk.safetyScore.components].sort((a, b) => b.points - a.points);
  const maxPoints = Math.max(...sortedComponents.map((component) => component.points), 1);

  return (
    <div className="dashboard-risk-domain-load">
      {sortedComponents.map((component) => (
        <article key={component.label} data-tone={component.tone}>
          <div>
            <strong>{component.label}</strong>
            <span>{component.detail}</span>
          </div>
          <b>{component.value}</b>
          <em aria-label={`${component.label}: ${component.points} weighted risk points`}>
            <i style={{ width: `${Math.max(4, Math.round((component.points / maxPoints) * 100))}%` }} />
          </em>
        </article>
      ))}
    </div>
  );
}

function FractionApprovalWatch({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-watch-list">
      {telemetry.risk.fractionWatch.map((item) => (
        <article key={item.id} data-tone={item.tone}>
          <div>
            <strong>{item.courseRef} · {item.fraction}</strong>
            <span>{item.issue}</span>
          </div>
          <p>{item.approvalState}</p>
          <em>{item.calculation}</em>
        </article>
      ))}
    </div>
  );
}

function InterventionQueue({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-intervention-list">
      {telemetry.risk.interventions.map((item) => (
        <article key={item.id} data-tone={item.tone}>
          <div className="dashboard-intervention-main">
            <div>
              <strong>{item.courseRef}</strong>
              <span>{item.reasonCategory}</span>
            </div>
            <p>{item.action}</p>
          </div>
          <div className="dashboard-intervention-meta">
            <span>{item.phase}</span>
            <span>{item.owner}</span>
            <b>{item.dueState}</b>
          </div>
        </article>
      ))}
    </div>
  );
}

function PhiAssuranceMini({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-phi-assurance">
      {telemetry.risk.phiAssurance.map((item) => (
        <article key={item.label} data-tone={item.tone}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <em>{item.detail}</em>
        </article>
      ))}
    </div>
  );
}

function CourseDistribution({ telemetry }: { telemetry: DashboardTelemetry }) {
  const total = telemetry.courseDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="dashboard-donut-wrap">
      <div className="dashboard-donut-chart" role="img" aria-label="Course distribution donut chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={128} minHeight={128} initialDimension={{ width: 176, height: 176 }}>
          <PieChart>
            <Pie
              data={telemetry.courseDistribution}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="80%"
              paddingAngle={3}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {telemetry.courseDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={chartTooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="dashboard-donut-center">
          <strong>{total}</strong>
          <span>Courses</span>
        </div>
      </div>
      <div className="dashboard-donut-legend">
        {telemetry.courseDistribution.map((item) => {
          const percent = Math.round((item.value / Math.max(total, 1)) * 100);
          return (
            <span key={item.name}>
              <i style={{ background: item.color }} />
              {item.name} {percent}%
            </span>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyThroughput({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={170} initialDimension={{ width: 460, height: 180 }}>
      <ComposedChart data={telemetry.throughput} margin={{ top: 18, right: 4, bottom: 0, left: -28 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={axisTick} />
        <YAxis hide />
        <Tooltip cursor={{ fill: 'var(--color-hover)' }} contentStyle={chartTooltipStyle} />
        <Bar dataKey="fractions" name="Fractions logged" fill="var(--color-primary)" radius={[8, 8, 2, 2]} />
        <Line type="monotone" dataKey="approved" name="MD + DOT approved" stroke="var(--color-text-muted)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)', strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function CapacityMatrix({ telemetry }: { telemetry: DashboardTelemetry }) {
  const capacityTrend = telemetry.capacityBands.map((band) => ({
    label: band.label,
    treatment: band.treatment,
    simulation: band.simulation,
    review: band.review,
  }));

  return (
    <div className="dashboard-capacity">
      <div className="dashboard-capacity-chart" role="img" aria-label="Capacity pressure line chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={150} initialDimension={{ width: 380, height: 170 }}>
          <ComposedChart data={capacityTrend} margin={{ top: 8, right: 6, bottom: -4, left: -28 }}>
            <CartesianGrid stroke="var(--color-border-soft)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} />
            <YAxis hide domain={[0, 'dataMax + 2']} />
            <Tooltip cursor={{ stroke: 'var(--color-border)', strokeDasharray: '3 3' }} contentStyle={chartTooltipStyle} />
            <Area type="monotone" dataKey="treatment" name="Treatment" fill="var(--color-primary)" fillOpacity={0.16} stroke="var(--color-primary)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="simulation" name="Simulation" fill="var(--color-text-muted)" fillOpacity={0.12} stroke="var(--color-text-muted)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="review" name="Review" stroke="var(--status-intermediate-solid)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)', strokeWidth: 2 }} activeDot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="dashboard-capacity-legend">
        <span><i className="is-treatment" />Tx</span>
        <span><i className="is-simulation" />Sim</span>
        <span><i className="is-review" />Review</span>
      </div>
      <div className="dashboard-provider-load">
        <span className="dashboard-provider-load-title">Provider Load</span>
        {telemetry.providerLoad.map((provider) => (
          <div key={provider.provider}>
            <span>{provider.provider}</span>
            <em>
              <i style={{ width: `${Math.min(100, Math.round((provider.appointments / provider.capacity) * 100))}%` }} />
            </em>
            <strong>{provider.appointments}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationsDashboard({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-panel" role="tabpanel" id="dashboard-panel-ops" aria-labelledby="dashboard-tab-ops">
      <StatGrid>
        {telemetry.metrics.map((metric) => (
          <StatCard
            key={metric.label}
            icon={metricIcons[metric.icon]}
            label={metric.label}
            value={metric.value}
            sub={metric.detail}
          />
        ))}
      </StatGrid>
      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <ChartCard
          icon={Activity}
          title="Carepath Stage Load"
          description={`${telemetry.stageLoad.loadPercent}% of tracked work is open`}
          height="sm"
          footer={telemetry.stageLoad.summary}
        >
          <StageLoadChart telemetry={telemetry} />
        </ChartCard>
        <ChartCard icon={CheckCircle2} title="Course Distribution" description="Upcoming / On Treatment / Post" height="auto">
          <CourseDistribution telemetry={telemetry} />
        </ChartCard>
      </div>
      <div className="grid gap-2.5 xl:grid-cols-2">
        <ChartCard icon={PenLine} title="Treatment Throughput" description="Fractions logged per treatment day" height="sm">
          <WeeklyThroughput telemetry={telemetry} />
        </ChartCard>
        <ChartCard icon={CalendarDays} title="Capacity Matrix" description="Time-band density and provider pressure" height="auto">
          <CapacityMatrix telemetry={telemetry} />
        </ChartCard>
      </div>
    </div>
  );
}

function CarepathDashboard({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-panel" role="tabpanel" id="dashboard-panel-flow" aria-labelledby="dashboard-tab-flow">
      <StatGrid>
        {telemetry.carepath.metrics.map((item, index) => (
          <StatCard
            key={item.label}
            icon={carepathKpiIcons[index % carepathKpiIcons.length]}
            label={item.label}
            value={item.value}
            sub={item.detail}
            tone={item.tone}
          />
        ))}
      </StatGrid>
      <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)] xl:items-stretch">
        <ChartCard
          icon={Activity}
          title="Phase Load"
          description={`Open, review, and blocked work by phase as of ${telemetry.carepath.asOfLabel}`}
          height="lg"
        >
          <PhaseLoadChart telemetry={telemetry} />
        </ChartCard>
        <div className="grid gap-2.5 content-start">
          <ChartCard icon={GitBranch} title="Next Handoff Runway" description="Top releases to move courses forward" height="auto" className="dashboard-runway-card">
            <HandoffRunway telemetry={telemetry} />
          </ChartCard>
          <ChartCard icon={FileText} title="Template Coverage" description="Active, draft, mapping, and missing states" height="auto" className="dashboard-template-card">
            <TemplateCoverageStrip telemetry={telemetry} />
          </ChartCard>
        </div>
      </div>
      <ChartCard icon={UsersRound} title="Phase × Owner Pressure" description="Open work by workflow lane and accountable role" height="auto" className="dashboard-owner-heatmap-card">
        <PhaseOwnerMatrix telemetry={telemetry} />
      </ChartCard>
      <ChartCard icon={CheckCircle2} title="Audit Readiness" description="Ready evidence versus open evidence by phase" height="auto" className="dashboard-audit-card">
        <AuditReadinessRibbon telemetry={telemetry} />
      </ChartCard>
    </div>
  );
}

function RiskDashboard({ telemetry }: { telemetry: DashboardTelemetry }) {
  const score = telemetry.risk.safetyScore;
  const headlineComponents = score.components.slice(0, 3);

  return (
    <div className="dashboard-panel" role="tabpanel" id="dashboard-panel-risk" aria-labelledby="dashboard-tab-risk">
      <StatGrid>
        <StatCard
          icon={ShieldCheck}
          label="Clinical Safety Score"
          value={score.score}
          sub={`${score.label} · ${score.detail}`}
          tone={score.score >= 85 ? 'positive' : score.score >= 70 ? 'intermediate' : 'negative'}
        />
        {headlineComponents.map((component) => (
          <StatCard
            key={component.label}
            icon={AlertTriangle}
            label={component.label}
            value={component.value}
            sub={component.detail}
            tone={component.tone}
          />
        ))}
      </StatGrid>
      <ChartCard icon={ShieldCheck} title="Safety Matrix" description="Open risk signals by domain and carepath phase" height="auto">
        <ClinicalMatrix
          ariaLabel="Safety matrix by risk domain and phase"
          columns={telemetry.risk.safetyMatrix.phases}
          rows={telemetry.risk.safetyMatrix.domains}
          cells={telemetry.risk.safetyMatrix.cells.map((cell) => ({
            x: cell.phaseIndex,
            y: cell.domainIndex,
            value: cell.value,
            tone: cell.severity,
            detail: `${cell.domain} · ${cell.phaseLabel}: ${cell.value} open signals`,
          }))}
        />
      </ChartCard>
      <div className="grid gap-2.5 xl:grid-cols-2">
        <ChartCard icon={AlertTriangle} title="Top Course Risk" description="Highest weighted risk by course" height="lg">
          <TopCourseRiskChart telemetry={telemetry} />
        </ChartCard>
        <ChartCard icon={Activity} title="Risk Domain Load" description="Sorted by weighted signal pressure" height="auto">
          <RiskDomainLoad telemetry={telemetry} />
        </ChartCard>
      </div>
      <ChartCard icon={AlertTriangle} title="Intervention Queue" description="Highest-priority clinical safety actions" height="auto" className="dashboard-intervention-card">
        <InterventionQueue telemetry={telemetry} />
      </ChartCard>
      <ChartCard icon={ClipboardList} title="Fraction Approval Watch" description="MD / DOT / override exceptions only" height="auto" className="dashboard-fraction-watch-card">
        <FractionApprovalWatch telemetry={telemetry} />
      </ChartCard>
      <ChartCard icon={LockKeyhole} title="PHI Boundary" description="Dashboard payload assurance" height="auto" className="dashboard-phi-mini-card">
        <PhiAssuranceMini telemetry={telemetry} />
      </ChartCard>
    </div>
  );
}

export function DashboardTelemetryClient({ telemetry }: DashboardTelemetryClientProps) {
  const [activePanel, setActivePanel] = useState<DashboardPanel>('ops');

  return (
    <section className="dashboard-command" data-active-panel={activePanel}>
      <StickyPageHeader
        title="Clinical Operations"
        subtitle="Command view of today's clinical workload"
        tabs={(
          <TabStrip
            tabs={panelTabs}
            activeId={activePanel}
            onSelect={setActivePanel}
            ariaLabel="Dashboard Panes"
            idPrefix="dashboard"
          />
        )}
      />

      <div className="dashboard-command-grid">
        {activePanel === 'ops' ? <OperationsDashboard telemetry={telemetry} /> : null}
        {activePanel === 'flow' ? <CarepathDashboard telemetry={telemetry} /> : null}
        {activePanel === 'risk' ? <RiskDashboard telemetry={telemetry} /> : null}
      </div>
    </section>
  );
}
