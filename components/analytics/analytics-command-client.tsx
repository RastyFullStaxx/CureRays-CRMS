'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { EChartsCoreOption } from 'echarts/core';
import {
  Activity,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  Network,
  PieChart as PieChartIcon,
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
  AnalyticsBillingReadiness,
  AnalyticsDistributionDatum,
  AnalyticsHeatmapCell,
  AnalyticsInsight,
  AnalyticsPanel,
  AnalyticsPhiSignal,
  AnalyticsRoleLoad,
  AnalyticsTelemetry,
  AnalyticsTone,
} from '@/lib/services/analytics-telemetry-service';
import { DashboardEChart } from '@/components/dashboard/dashboard-echart';
import { NeuronSignalField } from '@/components/shared/neuron-signal-field';
import type { NeuronSignalLink, NeuronSignalNode } from '@/components/shared/neuron-signal-field';

type AnalyticsCommandClientProps = {
  telemetry: AnalyticsTelemetry;
  initialPanel: AnalyticsPanel;
};

type AnalyticsDateRange = '7' | '14' | '30';

type Palette = {
  primary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  text: string;
  muted: string;
  border: string;
  softBorder: string;
  card: string;
  cardMuted: string;
};

const defaultPalette: Palette = {
  primary: 'CanvasText',
  accent: 'Highlight',
  success: 'CanvasText',
  warning: 'CanvasText',
  error: 'CanvasText',
  info: 'Highlight',
  text: 'CanvasText',
  muted: 'GrayText',
  border: 'GrayText',
  softBorder: 'GrayText',
  card: 'Canvas',
  cardMuted: 'Canvas',
};

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
    meta: '30-day model view, current carepath pressure, and top explainable insights',
  },
  workflow: {
    title: 'Workflow Performance',
    meta: 'Carepath movement, owner pressure, bottlenecks, and tokenized inspection queues',
  },
  treatment: {
    title: 'Treatment Analytics',
    meta: 'Fraction throughput, course progression, hold signals, and approval control points',
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
    meta: 'Closeout readiness, billing evidence, risk constellation, and PHI boundary assurance',
  },
};

const toneClasses: Record<AnalyticsTone, string> = {
  primary: 'is-primary',
  success: 'is-success',
  warning: 'is-warning',
  error: 'is-error',
  info: 'is-info',
  neutral: 'is-neutral',
};

const dateRangeOptions: { label: string; value: AnalyticsDateRange }[] = [
  { label: '7-day', value: '7' },
  { label: '14-day', value: '14' },
  { label: '30-day', value: '30' },
];

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readPalette(): Palette {
  return {
    primary: cssVar('--color-primary', defaultPalette.primary),
    accent: cssVar('--color-accent', defaultPalette.accent),
    success: cssVar('--color-success', defaultPalette.success),
    warning: cssVar('--color-warning', defaultPalette.warning),
    error: cssVar('--color-error', defaultPalette.error),
    info: cssVar('--color-accent', defaultPalette.info),
    text: cssVar('--color-text', defaultPalette.text),
    muted: cssVar('--color-text-muted', defaultPalette.muted),
    border: cssVar('--color-border', defaultPalette.border),
    softBorder: cssVar('--color-border-soft', defaultPalette.softBorder),
    card: cssVar('--color-card', defaultPalette.card),
    cardMuted: cssVar('--color-card-muted', defaultPalette.cardMuted),
  };
}

function usePalette() {
  const [palette, setPalette] = useState<Palette>(defaultPalette);

  useEffect(() => {
    const update = () => setPalette(readPalette());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', update);
    };
  }, []);

  return palette;
}

function toneColor(tone: AnalyticsTone, palette: Palette) {
  if (tone === 'success') return palette.success;
  if (tone === 'warning') return palette.warning;
  if (tone === 'error') return palette.error;
  if (tone === 'info') return palette.info;
  if (tone === 'neutral') return palette.muted;
  return palette.primary;
}

function tooltipStyle() {
  return {
    background: 'var(--color-card)',
    border: 'var(--border-container)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
  };
}

function forecastDay(label: string) {
  if (label === 'Now') return 0;
  const dayMatch = label.match(/\+(\d+)d/);
  return dayMatch ? Number(dayMatch[1]) : 0;
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
      <span>Date range</span>
      <select
        aria-label="Analytics date range"
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

function SectionTitle({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta: string }) {
  return (
    <div className="analytics-card-title">
      <span className="analytics-card-icon"><Icon size={16} /></span>
      <div>
        <h2>{title}</h2>
        <p>{meta}</p>
      </div>
    </div>
  );
}

function ChartFrame({
  children,
  icon,
  title,
  meta,
  change,
  matters,
  inspect,
  className = '',
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
  meta: string;
  change: string;
  matters: string;
  inspect: string;
  className?: string;
}) {
  return (
    <article className={`analytics-card ${className}`}>
      <SectionTitle icon={icon} title={title} meta={meta} />
      <div className="analytics-chart-frame">{children}</div>
      <div className="analytics-chart-legend">
        <span><b>Changed</b>{change}</span>
        <span><b>Matters</b>{matters}</span>
        <span><b>Inspect</b>{inspect}</span>
      </div>
    </article>
  );
}

type AnalyticsMatrixDatum = {
  x: number;
  y: number;
  value: number;
  tone: AnalyticsTone;
  detail: string;
};

function analyticsMatrixGridStyle(columnCount: number): CSSProperties {
  return {
    gridTemplateColumns: `minmax(112px, 0.72fr) repeat(${columnCount}, minmax(30px, 1fr))`,
  };
}

function AnalyticsMatrix({
  ariaLabel,
  columns,
  rows,
  cells,
}: {
  ariaLabel: string;
  columns: string[];
  rows: string[];
  cells: AnalyticsMatrixDatum[];
}) {
  const cellMap = useMemo(() => {
    const next = new Map<string, AnalyticsMatrixDatum>();
    cells.forEach((cell) => next.set(`${cell.x}:${cell.y}`, cell));
    return next;
  }, [cells]);

  return (
    <div className="clinical-matrix analytics-matrix" role="table" aria-label={ariaLabel}>
      <div className="clinical-matrix-grid" style={analyticsMatrixGridStyle(columns.length)}>
        <span className="clinical-matrix-corner" aria-hidden="true" />
        {columns.map((column) => (
          <span key={column} className="clinical-matrix-column-label">
            {column}
          </span>
        ))}
        {rows.map((row, y) => (
          <div key={row} className="clinical-matrix-row" role="row">
            <span className="clinical-matrix-row-label">{row}</span>
            {columns.map((column, x) => {
              const cell = cellMap.get(`${x}:${y}`) ?? {
                x,
                y,
                value: 0,
                tone: 'neutral' as AnalyticsTone,
                detail: `${row} · ${column}: no open signal`,
              };

              return (
                <span
                  key={`${row}-${column}`}
                  className="clinical-matrix-cell"
                  data-empty={cell.value === 0 ? 'true' : 'false'}
                  data-tone={cell.tone}
                  title={cell.detail}
                  aria-label={cell.detail}
                >
                  {cell.value > 0 ? cell.value : ''}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiStrip({ items }: { items: AnalyticsTelemetry['overview']['kpis'] }) {
  return (
    <div className="analytics-kpi-strip">
      {items.map((item) => (
        <article key={item.label} className={`analytics-kpi ${toneClasses[item.tone]}`}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
          <em>{item.delta}</em>
        </article>
      ))}
    </div>
  );
}

function InsightRail({ insights, title = 'Insight Brief' }: { insights: AnalyticsInsight[]; title?: string }) {
  return (
    <aside className="analytics-insight-rail">
      <div className="analytics-insight-head">
        <span className="analytics-card-icon"><BrainCircuit size={16} /></span>
        <div>
          <h2>{title}</h2>
          <p>Explainable signals, evidence, and recommended inspection path</p>
        </div>
      </div>
      <div className="analytics-insight-list">
        {insights.map((insight) => (
          <article key={insight.id} className={`analytics-insight ${toneClasses[insight.tone]}`}>
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

function ForecastChart({ dateRange, telemetry }: { dateRange: AnalyticsDateRange; telemetry: AnalyticsTelemetry }) {
  const rangeDays = Number(dateRange);
  const forecast = useMemo(
    () => telemetry.overview.forecast.filter((point) => forecastDay(point.label) <= rangeDays),
    [rangeDays, telemetry],
  );

  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180} initialDimension={{ width: 640, height: 220 }}>
      <ComposedChart data={forecast} margin={{ top: 18, right: 16, bottom: 14, left: -18 }}>
        <defs>
          <linearGradient id="analyticsForecastLoad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle()} />
        <Area type="monotone" dataKey="workload" name="Modeled workload" fill="url(#analyticsForecastLoad)" stroke="var(--color-primary)" strokeWidth={2} />
        <Line type="monotone" dataKey="risk" name="Risk weight" stroke="var(--color-error)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)' }} />
        <Line type="monotone" dataKey="capacity" name="Capacity band" stroke="var(--color-success)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
        <Bar dataKey="projectedCourses" name="Projected courses" fill="var(--color-accent)" opacity={0.28} radius={[7, 7, 2, 2]} />
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
            <Tooltip contentStyle={tooltipStyle()} />
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

function sankeyOption(telemetry: AnalyticsTelemetry, palette: Palette): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      renderMode: 'richText',
      borderColor: palette.border,
      backgroundColor: palette.card,
      textStyle: { color: palette.text, fontFamily: 'Inter' },
    },
    series: [
      {
        type: 'sankey',
        data: telemetry.workflow.sankey.nodes.map((node) => ({
          name: node.name,
          value: node.value,
          itemStyle: {
            color: toneColor(node.tone, palette),
            borderColor: palette.card,
            borderWidth: 1,
          },
          label: {
            color: palette.text,
            fontSize: 11,
            fontWeight: 700,
          },
        })),
        links: telemetry.workflow.sankey.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value,
          lineStyle: {
            color: toneColor(link.tone, palette),
            opacity: link.blocked > 0 ? 0.46 : 0.24,
            curveness: 0.56,
          },
        })),
        nodeAlign: 'justify',
        nodeGap: 16,
        nodeWidth: 14,
        draggable: false,
        layoutIterations: 42,
        emphasis: { focus: 'adjacency' },
      },
    ],
  };
}

function constellationAnchor(index: number, total: number, category: 'course' | 'domain') {
  const safeTotal = Math.max(total, 1);
  const angle = (index / safeTotal) * Math.PI * 2 - Math.PI / 2;
  const radiusX = category === 'domain' ? 0.28 : 0.17;
  const radiusY = category === 'domain' ? 0.24 : 0.15;

  return {
    x: 0.5 + Math.cos(angle) * radiusX,
    y: 0.5 + Math.sin(angle) * radiusY,
  };
}

function analyticsRiskNeuronField(telemetry: AnalyticsTelemetry) {
  const domains = telemetry.billingRisk.riskGraph.nodes.filter((node) => node.category === 'domain');
  const courses = telemetry.billingRisk.riskGraph.nodes.filter((node) => node.category === 'course');
  const nodes: NeuronSignalNode[] = telemetry.billingRisk.riskGraph.nodes.map((node) => {
    const peers = node.category === 'domain' ? domains : courses;
    const index = peers.findIndex((peer) => peer.id === node.id);

    return {
      id: node.id,
      label: node.name,
      group: node.category === 'domain' ? 'domain' : 'course',
      value: node.value,
      tone: node.tone,
      anchor: constellationAnchor(index, peers.length, node.category),
    };
  });
  const links: NeuronSignalLink[] = telemetry.billingRisk.riskGraph.links.map((link) => ({
    source: link.source,
    target: link.target,
    value: link.value,
    tone: link.tone,
  }));

  return { links, nodes };
}

function RoleLoadChart({ rows }: { rows: AnalyticsRoleLoad[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180} initialDimension={{ width: 560, height: 220 }}>
      <ComposedChart data={rows} layout="vertical" margin={{ top: 8, right: 28, bottom: 18, left: 12 }}>
        <CartesianGrid horizontal={false} stroke="var(--color-border-soft)" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="role" width={112} tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }} />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="assigned" name="Assigned tasks" stackId="load" fill="var(--color-primary)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="review" name="Review items" stackId="load" fill="var(--color-accent)" radius={[0, 0, 0, 0]} />
        <Bar dataKey="overdue" name="Overdue" stackId="load" fill="var(--color-error)" radius={[0, 7, 7, 0]} />
        <Line dataKey="pressure" name="Pressure" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)' }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function QueueDrilldown({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <article className="analytics-card analytics-drilldown">
      <SectionTitle icon={ClipboardList} title="Tokenized Inspection Queue" meta="Course refs only, sorted by modeled pressure" />
      <div className="analytics-queue-list">
        {telemetry.workflow.courseDrilldown.map((item, index) => (
          <article key={item.id} className={`analytics-queue-item ${toneClasses[item.tone]}`}>
            <span className="analytics-queue-rank">{index + 1}</span>
            <div>
              <strong>{item.courseRef}</strong>
              <p>{item.label}</p>
              <em>{item.phase} · {item.owner}</em>
            </div>
            <span className="analytics-queue-state">
              {item.status}
              <b>{item.signal}</b>
            </span>
          </article>
        ))}
      </div>
    </article>
  );
}

function TreatmentProgressList({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <article className="analytics-card analytics-progress-card">
      <SectionTitle icon={Activity} title="Active Course Progress" meta="Tokenized course progress against planned fractions" />
      <div className="analytics-progress-list">
        {telemetry.treatment.courseProgress.map((course) => (
          <article key={course.courseRef} className={`analytics-progress-row ${toneClasses[course.tone]}`}>
            <div>
              <strong>{course.courseRef}</strong>
              <span>{course.protocol}</span>
            </div>
            <em aria-label={`${course.courseRef} treatment progress`}>
              <i style={{ width: `${course.percent}%` }} />
            </em>
            <p>{course.completed}/{course.total} Fx</p>
            <b>{course.status}</b>
          </article>
        ))}
      </div>
    </article>
  );
}

function TreatmentThroughput({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180} initialDimension={{ width: 620, height: 220 }}>
      <ComposedChart data={telemetry.treatment.throughput} margin={{ top: 16, right: 14, bottom: 20, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="fractions" name="Fractions" fill="var(--color-primary)" radius={[7, 7, 2, 2]} />
        <Line type="monotone" dataKey="approvals" name="Fully approved" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)' }} />
        <Line type="monotone" dataKey="reviews" name="Review issues" stroke="var(--color-warning)" strokeWidth={2} />
        <Line type="monotone" dataKey="controlLimit" name="Control limit" stroke="var(--color-error)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function LifecycleChart({ data }: { data: AnalyticsDistributionDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={170} initialDimension={{ width: 480, height: 210 }}>
      <ComposedChart data={data} margin={{ top: 10, right: 14, bottom: 22, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="value" name="Documents" radius={[8, 8, 2, 2]}>
          {data.map((item) => <Cell key={item.label} fill={item.color} />)}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function SignatureAgingChart({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={170} initialDimension={{ width: 480, height: 210 }}>
      <ComposedChart data={telemetry.documents.signatureAging} margin={{ top: 10, right: 14, bottom: 22, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="bucket" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle()} />
        <Bar dataKey="count" name="Documents" fill="var(--color-accent)" radius={[8, 8, 2, 2]} />
        <Line type="monotone" dataKey="signatures" name="Signature queue" stroke="var(--color-warning)" strokeWidth={2} />
        <Line type="monotone" dataKey="risk" name="Risk" stroke="var(--color-error)" strokeWidth={2} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function TemplateCoverage({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <article className="analytics-card analytics-template-card">
      <SectionTitle icon={FileText} title="Template Coverage" meta="Active, mapping, draft, and missing source state" />
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
    </article>
  );
}

function CapacityChart({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={180} initialDimension={{ width: 560, height: 220 }}>
      <ComposedChart data={telemetry.staffing.capacityBands} margin={{ top: 10, right: 14, bottom: 20, left: -18 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700 }} />
        <YAxis hide />
        <Tooltip contentStyle={tooltipStyle()} />
        <Area type="monotone" dataKey="treatment" name="Treatment" fill="var(--color-primary)" fillOpacity={0.16} stroke="var(--color-primary)" />
        <Area type="monotone" dataKey="simulation" name="Simulation" fill="var(--color-accent)" fillOpacity={0.12} stroke="var(--color-accent)" />
        <Line type="monotone" dataKey="review" name="Review" stroke="var(--color-accent)" strokeWidth={2} />
        <Line type="monotone" dataKey="capacity" name="Capacity" stroke="var(--color-error)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function ProviderPressure({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <article className="analytics-card analytics-provider-card">
      <SectionTitle icon={CalendarDays} title="Provider Pressure" meta="Appointment load against modeled daily capacity" />
      <div className="analytics-provider-list">
        {telemetry.staffing.providerPressure.map((provider) => (
          <article key={provider.provider} className={`analytics-provider-row ${toneClasses[provider.tone]}`}>
            <div>
              <strong>{provider.provider}</strong>
              <span>{provider.appointments}/{provider.capacity} appointments</span>
            </div>
            <em><i style={{ width: `${provider.pressure}%` }} /></em>
            <b>{provider.pressure}%</b>
          </article>
        ))}
      </div>
    </article>
  );
}

function BillingReadiness({ rows }: { rows: AnalyticsBillingReadiness[] }) {
  const total = rows.reduce((sum, item) => sum + item.value, 0);
  const data = rows.map((item) => ({
    label: item.label,
    value: item.value,
    tone: item.tone,
    color: `var(--color-${item.tone === 'primary' ? 'primary' : item.tone === 'neutral' ? 'text-muted' : item.tone})`,
  }));

  return (
    <div className="analytics-billing-grid">
      <div className="analytics-billing-chip-grid">
        {rows.map((item) => (
          <article key={item.label} className={`analytics-billing-chip ${toneClasses[item.tone]}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <em>{Math.round((item.value / Math.max(total, 1)) * 100)}%</em>
          </article>
        ))}
      </div>
      <div className="analytics-billing-summary">
        <DonutChart data={data} centerLabel="Billing" />
      </div>
    </div>
  );
}

function PhiBoundary({ rows }: { rows: AnalyticsPhiSignal[] }) {
  return (
    <article className="analytics-card analytics-phi-card">
      <SectionTitle icon={LockKeyhole} title="PHI Boundary Assurance" meta="Client payload guardrails for analytics telemetry" />
      <div className="analytics-phi-grid">
        {rows.map((row) => (
          <article key={row.label} className={`analytics-phi-signal ${toneClasses[row.tone]}`}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <p>{row.detail}</p>
          </article>
        ))}
      </div>
    </article>
  );
}

function OverviewPanel({ dateRange, telemetry }: { dateRange: AnalyticsDateRange; telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel analytics-panel-overview">
      <KpiStrip items={telemetry.overview.kpis} />
      <ChartFrame
        icon={BarChart3}
        title={`${dateRange}-Day Operational Forecast`}
        meta="Model-derived workload, risk, capacity, and course volume."
        change="Workload, capacity, and risk are projected together instead of as separate vanity trends."
        matters="The huddle can see whether risk is rising faster than staff capacity."
        inspect="Workflow, staffing, and billing-risk tabs."
        className="analytics-forecast-card"
      >
        <ForecastChart dateRange={dateRange} telemetry={telemetry} />
      </ChartFrame>
      <article className="analytics-card analytics-mix-card">
        <SectionTitle icon={PieChartIcon} title="Cohort Mix" meta="Diagnosis and chart-rounds phase distribution" />
        <div className="analytics-mix-grid">
          <DonutChart data={telemetry.overview.diagnosisMix} centerLabel="Dx" />
          <DonutChart data={telemetry.overview.phaseMix} centerLabel="Phase" />
        </div>
      </article>
      <InsightRail insights={telemetry.overview.insights} title="Top Insight Brief" />
    </div>
  );
}

function WorkflowPanel({ telemetry, palette }: { telemetry: AnalyticsTelemetry; palette: Palette }) {
  const sankey = useMemo(() => sankeyOption(telemetry, palette), [palette, telemetry]);

  return (
    <div className="analytics-panel analytics-panel-workflow">
      <ChartFrame
        icon={Network}
        title="Carepath Pressure Flow"
        meta="Phase-to-phase pressure with blocked handoff weighting"
        change="Blocked phases are weighted into the carepath flow instead of hidden in flat counts."
        matters="A single stuck handoff can delay planning, treatment release, or audit closeout."
        inspect="Tokenized queue and phase-owner heatmap."
        className="analytics-sankey-card"
      >
        <DashboardEChart className="analytics-echart analytics-echart-sankey" option={sankey} ariaLabel="Analytics carepath pressure Sankey" />
      </ChartFrame>
      <ChartFrame
        icon={UsersRound}
        title="Phase x Owner Heatmap"
        meta="Open tasks and document pressure by accountable role"
        change="Review and blocked work are fused into one role pressure map."
        matters="The next bottleneck is usually a role lane, not a single page."
        inspect="Staffing tab and tokenized inspection queue."
        className="analytics-heatmap-card"
      >
        <AnalyticsMatrix
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
      </ChartFrame>
      <ChartFrame
        icon={BarChart3}
        title="Bottleneck Pareto"
        meta="Assigned, review, overdue, and document load by role"
        change="Role queues are sorted by modeled pressure rather than alphabetically."
        matters="This identifies where staffing or routing relief will unlock the most work."
        inspect="Staffing role pressure and source task/document queues."
        className="analytics-pareto-card"
      >
        <RoleLoadChart rows={telemetry.workflow.bottlenecks} />
      </ChartFrame>
      <QueueDrilldown telemetry={telemetry} />
      <InsightRail insights={telemetry.workflow.insights} />
    </div>
  );
}

function TreatmentPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel analytics-panel-treatment">
      <KpiStrip items={telemetry.treatment.signals} />
      <ChartFrame
        icon={Activity}
        title="Fraction Throughput Control"
        meta="Actual fraction events plus short modeled forward signal"
        change="Throughput is plotted with approvals, reviews, and a control limit."
        matters="Treatment should not only move fast; it must move with complete approvals."
        inspect="Treatment delivery and fraction worksheet records."
        className="analytics-treatment-card"
      >
        <TreatmentThroughput telemetry={telemetry} />
      </ChartFrame>
      <TreatmentProgressList telemetry={telemetry} />
      <InsightRail insights={telemetry.treatment.insights} />
    </div>
  );
}

function DocumentsPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel analytics-panel-documents">
      <ChartFrame
        icon={FileText}
        title="Document Lifecycle Funnel"
        meta="Ready, review, blocked, and draft work state"
        change="Document state is grouped into operational risk lanes."
        matters="Signature and missing-field friction directly affects audit and billing readiness."
        inspect="Documents page and generated document route states."
        className="analytics-lifecycle-card"
      >
        <LifecycleChart data={telemetry.documents.lifecycle} />
      </ChartFrame>
      <ChartFrame
        icon={CalendarDays}
        title="Signature Aging"
        meta="How long document work has been waiting"
        change="Aging buckets show the queue that can quietly become an audit blocker."
        matters="Old review-required documents deserve attention before new low-risk work."
        inspect="Pending signature and review-required documents."
        className="analytics-aging-card"
      >
        <SignatureAgingChart telemetry={telemetry} />
      </ChartFrame>
      <ChartFrame
        icon={ShieldCheck}
        title="Audit Evidence Matrix"
        meta="Evidence gaps by carepath phase and closeout domain"
        change="Evidence gaps are mapped where they block closeout, not just counted globally."
        matters="Closeout failure usually appears as a cross-domain pattern."
        inspect="Audit, billing, document, and fraction records."
        className="analytics-evidence-card"
      >
        <AnalyticsMatrix
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
      </ChartFrame>
      <TemplateCoverage telemetry={telemetry} />
      <InsightRail insights={telemetry.documents.insights} />
    </div>
  );
}

function StaffingPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  return (
    <div className="analytics-panel analytics-panel-staffing">
      <ChartFrame
        icon={UsersRound}
        title="Role Load Matrix"
        meta="Task, review, overdue, and document pressure"
        change="Role pressure combines work type, urgency, and document load."
        matters="A balanced schedule can still fail if one review lane is overloaded."
        inspect="Tasks, documents, and responsible-party queues."
        className="analytics-role-card"
      >
        <RoleLoadChart rows={telemetry.staffing.roleLoad} />
      </ChartFrame>
      <ChartFrame
        icon={CalendarDays}
        title="Schedule Capacity Bands"
        meta="Time-band density by treatment, simulation, and review work"
        change="Appointments are grouped into capacity bands instead of a single count."
        matters="The huddle can see which hours are carrying hidden review pressure."
        inspect="Schedule and treatment delivery pages."
        className="analytics-capacity-card"
      >
        <CapacityChart telemetry={telemetry} />
      </ChartFrame>
      <ProviderPressure telemetry={telemetry} />
      <InsightRail insights={telemetry.staffing.insights} />
    </div>
  );
}

function BillingRiskPanel({ telemetry }: { telemetry: AnalyticsTelemetry }) {
  const field = useMemo(() => analyticsRiskNeuronField(telemetry), [telemetry]);

  return (
    <div className="analytics-panel analytics-panel-billing">
      <ChartFrame
        icon={Network}
        title="Risk Constellation"
        meta="Tokenized course refs connected to risk domains"
        change="Clinical, document, fraction, and billing signals are linked in one graph."
        matters="The highest-risk course is often the one with several smaller weak signals."
        inspect="Workflow, treatment, documents, and billing/audit pages."
        className="analytics-risk-card"
      >
        <div className="analytics-neuron-field analytics-echart analytics-echart-graph">
          <NeuronSignalField
            ariaLabel="Analytics risk constellation graph"
            className="dashboard-signal-canvas"
            links={field.links}
            nodes={field.nodes}
          />
        </div>
      </ChartFrame>
      <article className="analytics-card analytics-billing-card">
        <SectionTitle icon={CheckCircle2} title="Billing Readiness" meta="Billing work state tied to evidence readiness" />
        <BillingReadiness rows={telemetry.billingRisk.billingReadiness} />
      </article>
      <article className="analytics-card analytics-audit-card">
        <SectionTitle icon={ShieldCheck} title="Audit Closeout Readiness" meta="Closeout checks grouped by operational state" />
        <DonutChart data={telemetry.billingRisk.auditReadiness} centerLabel="Audit" />
      </article>
      <PhiBoundary rows={telemetry.billingRisk.phiBoundary} />
      <InsightRail insights={telemetry.billingRisk.insights} />
    </div>
  );
}

function ActivePanel({
  activePanel,
  dateRange,
  palette,
  telemetry,
}: {
  activePanel: AnalyticsPanel;
  dateRange: AnalyticsDateRange;
  palette: Palette;
  telemetry: AnalyticsTelemetry;
}) {
  if (activePanel === 'workflow') return <WorkflowPanel telemetry={telemetry} palette={palette} />;
  if (activePanel === 'treatment') return <TreatmentPanel telemetry={telemetry} />;
  if (activePanel === 'documents') return <DocumentsPanel telemetry={telemetry} />;
  if (activePanel === 'staffing') return <StaffingPanel telemetry={telemetry} />;
  if (activePanel === 'billing-risk') return <BillingRiskPanel telemetry={telemetry} />;
  return <OverviewPanel dateRange={dateRange} telemetry={telemetry} />;
}

export function AnalyticsCommandClient({ initialPanel, telemetry }: AnalyticsCommandClientProps) {
  const router = useRouter();
  const palette = usePalette();
  const [activePanel, setActivePanel] = useState<AnalyticsPanel>(initialPanel);
  const [dateRange, setDateRange] = useState<AnalyticsDateRange>('30');
  const activeCopy = panelCopy[activePanel];

  const setPanel = (panel: AnalyticsPanel) => {
    setActivePanel(panel);
    router.replace(panel === 'overview' ? '/analytics' : `/analytics?panel=${panel}`, { scroll: false });
  };

  return (
    <section className="analytics-command" data-active-panel={activePanel}>
      <header className="analytics-command-header">
        <div>
          <p className="clinical-label">CureRays Analytics Cockpit</p>
          <h1>{activeCopy.title}</h1>
          <span>{activeCopy.meta}</span>
        </div>
        <div className="analytics-command-actions">
          <div className="analytics-command-tabs" role="tablist" aria-label="Analytics Panels">
            {telemetry.panels.map((panel) => (
              <button
                key={panel}
                type="button"
                role="tab"
                aria-selected={activePanel === panel}
                id={`analytics-tab-${panel}`}
                aria-controls={`analytics-panel-${panel}`}
                onClick={() => setPanel(panel)}
              >
                {tabLabels[panel]}
              </button>
            ))}
          </div>
          <AnalyticsRangeFilter value={dateRange} onChange={setDateRange} />
        </div>
      </header>

      <div className="analytics-command-body" role="tabpanel" id={`analytics-panel-${activePanel}`} aria-labelledby={`analytics-tab-${activePanel}`}>
        <ActivePanel activePanel={activePanel} dateRange={dateRange} telemetry={telemetry} palette={palette} />
      </div>
    </section>
  );
}
