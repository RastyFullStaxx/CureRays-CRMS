'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import type { EChartsCoreOption } from 'echarts/core';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  GitBranch,
  LockKeyhole,
  Network,
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
  SafetyMatrixCell,
} from '@/lib/services/dashboard-telemetry-service';
import { DashboardEChart } from '@/components/dashboard/dashboard-echart';
import { NeuronSignalField } from '@/components/shared/neuron-signal-field';
import type { NeuronSignalLink, NeuronSignalNode } from '@/components/shared/neuron-signal-field';

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

type DashboardPalette = {
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

const defaultPalette: DashboardPalette = {
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

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function readDashboardPalette(): DashboardPalette {
  return {
    primary: cssVar('--color-primary', defaultPalette.primary),
    accent: cssVar('--color-accent', defaultPalette.accent),
    success: cssVar('--color-success', defaultPalette.success),
    warning: cssVar('--color-warning', defaultPalette.warning),
    error: cssVar('--color-error', defaultPalette.error),
    info: cssVar('--color-info', defaultPalette.info),
    text: cssVar('--color-text', defaultPalette.text),
    muted: cssVar('--color-text-muted', defaultPalette.muted),
    border: cssVar('--color-border', defaultPalette.border),
    softBorder: cssVar('--color-border-soft', defaultPalette.softBorder),
    card: cssVar('--color-card', defaultPalette.card),
    cardMuted: cssVar('--color-card-muted', defaultPalette.cardMuted),
  };
}

function useDashboardPalette() {
  const [palette, setPalette] = useState<DashboardPalette>(defaultPalette);

  useEffect(() => {
    const update = () => setPalette(readDashboardPalette());
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

function toneColor(tone: string, palette: DashboardPalette) {
  if (tone === 'error') return palette.error;
  if (tone === 'warning') return palette.warning;
  if (tone === 'success') return palette.success;
  if (tone === 'info') return palette.info;
  if (tone === 'neutral') return palette.muted;
  return palette.primary;
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 100;
    const y = 34 - ((value - min) / range) * 28;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 38" className="dashboard-sparkline" role="img" aria-label="Trend sparkline">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MetricTile({ metric }: { metric: DashboardMetric }) {
  const Icon = metricIcons[metric.icon];

  return (
    <article className="dashboard-metric">
      <div className="dashboard-metric-icon">
        <Icon size={18} />
      </div>
      <div className="dashboard-metric-copy">
        <p>{metric.label}</p>
        <strong>{metric.value}</strong>
        <span>{metric.detail}</span>
      </div>
      <Sparkline values={metric.trend} />
    </article>
  );
}

function SectionTitle({ icon: Icon, title, meta }: { icon: LucideIcon; title: string; meta: string }) {
  return (
    <div className="dashboard-card-title">
      <span className="dashboard-card-icon"><Icon size={16} /></span>
      <div>
        <h2>{title}</h2>
        <p>{meta}</p>
      </div>
    </div>
  );
}

function KpiStrip({ items }: { items: DashboardTelemetry['carepath']['metrics'] }) {
  return (
    <div className="dashboard-kpi-strip">
      {items.map((item) => (
        <article key={item.label} className="dashboard-kpi-chip" data-tone={item.tone}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <em>{item.detail}</em>
        </article>
      ))}
    </div>
  );
}

type ClinicalMatrixDatum = {
  x: number;
  y: number;
  value: number;
  tone: DashboardTone;
  detail: string;
};

function matrixGridStyle(columnCount: number): CSSProperties {
  return {
    gridTemplateColumns: `minmax(96px, 0.76fr) repeat(${columnCount}, minmax(42px, 1fr))`,
  };
}

function ClinicalMatrix({
  ariaLabel,
  columns,
  rows,
  cells,
}: {
  ariaLabel: string;
  columns: string[];
  rows: string[];
  cells: ClinicalMatrixDatum[];
}) {
  const cellMap = useMemo(() => {
    const next = new Map<string, ClinicalMatrixDatum>();
    cells.forEach((cell) => next.set(`${cell.x}:${cell.y}`, cell));
    return next;
  }, [cells]);

  return (
    <div className="clinical-matrix" role="table" aria-label={ariaLabel}>
      <div className="clinical-matrix-grid" style={matrixGridStyle(columns.length)}>
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
                tone: 'neutral' as DashboardTone,
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

function carepathHeatmapTone(cell: CarepathHeatmapCell): DashboardTone {
  if (cell.blocked + cell.overdue > 0) return 'error';
  if (cell.needsReview > 0) return 'warning';
  if (cell.value > 0) return 'info';
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

function SafetyMatrix({ telemetry }: { telemetry: DashboardTelemetry }) {
  const matrix = telemetry.risk.safetyMatrix;

  return (
    <ClinicalMatrix
      ariaLabel="Clinical safety risk by carepath phase matrix"
      columns={matrix.phases}
      rows={matrix.domains}
      cells={matrix.cells.map((cell: SafetyMatrixCell) => ({
        x: cell.phaseIndex,
        y: cell.domainIndex,
        value: cell.value,
        tone: cell.severity,
        detail: `${cell.domain} · ${cell.phaseLabel}: ${cell.value} unresolved risk signals`,
      }))}
    />
  );
}

function carepathSankeyOption(telemetry: DashboardTelemetry, palette: DashboardPalette): EChartsCoreOption {
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
        data: telemetry.carepath.sankey.nodes.map((node) => ({
          name: node.name,
          value: node.count,
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
        links: telemetry.carepath.sankey.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value,
          lineStyle: {
            color: toneColor(link.tone, palette),
            opacity: link.tone === 'success' ? 0.22 : 0.38,
            curveness: 0.55,
          },
        })),
        nodeAlign: 'justify',
        nodeGap: 14,
        nodeWidth: 12,
        draggable: false,
        layoutIterations: 36,
        emphasis: {
          focus: 'adjacency',
        },
        lineStyle: {
          color: 'gradient',
          opacity: 0.32,
          curveness: 0.55,
        },
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

function dashboardRiskNeuronField(telemetry: DashboardTelemetry) {
  const domains = telemetry.risk.riskGraph.nodes.filter((node) => node.category === 'domain');
  const courses = telemetry.risk.riskGraph.nodes.filter((node) => node.category === 'course');
  const nodes: NeuronSignalNode[] = telemetry.risk.riskGraph.nodes.map((node) => {
    const peers = node.category === 'domain' ? domains : courses;
    const index = peers.findIndex((peer) => peer.id === node.id);

    return {
      id: node.id,
      label: node.name,
      group: node.category === 'domain' ? 'domain' : 'course',
      value: node.value,
      detail: node.detail,
      tone: node.tone,
      anchor: constellationAnchor(index, peers.length, node.category),
    };
  });
  const links: NeuronSignalLink[] = telemetry.risk.riskGraph.links.map((link) => ({
    source: link.source,
    target: link.target,
    value: link.value,
    tone: link.tone,
  }));

  return { links, nodes };
}

function CarepathPulseSankey({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  const option = useMemo(() => carepathSankeyOption(telemetry, palette), [palette, telemetry]);

  return <DashboardEChart className="dashboard-echart dashboard-echart-sankey" option={option} ariaLabel="Carepath pulse sankey" />;
}

function RiskConstellationGraph({ telemetry }: { telemetry: DashboardTelemetry }) {
  const field = useMemo(() => dashboardRiskNeuronField(telemetry), [telemetry]);

  return (
    <div className="dashboard-neuron-field dashboard-echart dashboard-echart-graph">
      <NeuronSignalField
        ariaLabel="Risk constellation graph"
        className="dashboard-signal-canvas"
        links={field.links}
        nodes={field.nodes}
      />
    </div>
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
        <article key={item.phase} data-tone={item.blockers > 0 ? 'error' : item.notReady > 0 ? 'warning' : 'success'}>
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

function ClinicalSafetyScore({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-safety-score">
      <div
        className="dashboard-safety-ring"
        style={{ '--score-angle': `${telemetry.risk.safetyScore.score * 3.6}deg` } as CSSProperties}
      >
        <strong>{telemetry.risk.safetyScore.score}</strong>
        <span>{telemetry.risk.safetyScore.label}</span>
      </div>
      <p>{telemetry.risk.safetyScore.detail}</p>
      <div className="dashboard-safety-components">
        {telemetry.risk.safetyScore.components.map((component) => (
          <article key={component.label} data-tone={component.tone}>
            <span>{component.label}</span>
            <strong>{component.value}</strong>
            <em>{component.points} Pts</em>
          </article>
        ))}
      </div>
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
            <Tooltip
              contentStyle={{
                background: 'var(--color-card)',
                border: 'var(--border-container)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
              }}
            />
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
    <div className="dashboard-chart-shell dashboard-throughput-shell">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={126} initialDimension={{ width: 460, height: 150 }}>
        <ComposedChart data={telemetry.throughput} margin={{ top: 18, right: 4, bottom: 0, left: -28 }}>
          <CartesianGrid vertical={false} stroke="var(--color-border-soft)" />
          <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: 'var(--color-hover)' }}
            contentStyle={{
              background: 'var(--color-card)',
              border: 'var(--border-container)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
            }}
          />
          <Bar dataKey="fractions" name="Fractions" fill="var(--color-primary)" radius={[8, 8, 2, 2]} />
          <Area dataKey="activeLoad" name="Active load" fill="var(--color-info)" stroke="var(--color-info)" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function CapacityMatrix({ telemetry }: { telemetry: DashboardTelemetry }) {
  const capacityTrend = useMemo(() => {
    return telemetry.capacityBands.map((band) => ({
      label: band.label,
      treatment: band.treatment,
      simulation: band.simulation,
      review: band.review,
      pressure: Math.min(100, Math.round((band.total / Math.max(band.capacity, 1)) * 100)),
    }));
  }, [telemetry.capacityBands]);

  return (
    <div className="dashboard-capacity">
      <div className="dashboard-capacity-chart" role="img" aria-label="Capacity pressure line chart">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={150} initialDimension={{ width: 380, height: 170 }}>
          <ComposedChart data={capacityTrend} margin={{ top: 8, right: 6, bottom: -4, left: -28 }}>
            <CartesianGrid stroke="var(--color-border-soft)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 10, fontWeight: 700 }} />
            <YAxis hide domain={[0, 'dataMax + 2']} />
            <Tooltip
              cursor={{ stroke: 'var(--color-border)', strokeDasharray: '3 3' }}
              contentStyle={{
                background: 'var(--color-card)',
                border: 'var(--border-container)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text)',
              }}
            />
            <Area type="monotone" dataKey="treatment" name="Treatment" fill="var(--color-success)" fillOpacity={0.16} stroke="var(--color-success)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="simulation" name="Simulation" fill="var(--color-info)" fillOpacity={0.12} stroke="var(--color-info)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="review" name="Review" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-card)', strokeWidth: 2 }} activeDot={{ r: 4 }} />
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

function SignalLoad({ telemetry }: { telemetry: DashboardTelemetry }) {
  const summaryParts = telemetry.signal.summary.split(',').map((part) => part.trim()).filter(Boolean);

  return (
    <div className="dashboard-signal-overlay">
      <div className="dashboard-signal-load-panel">
        <div className="dashboard-signal-load-value">
          <strong>{telemetry.signal.loadPercent}%</strong>
          <span>Carepath Load</span>
        </div>
        <div className="dashboard-signal-summary-chips" aria-label={telemetry.signal.summary}>
          {summaryParts.map((part) => (
            <span key={part}>{part}</span>
          ))}
        </div>
      </div>
      <div className="dashboard-signal-stage-grid" aria-label="Carepath Stage Load">
        {telemetry.signal.stages.map((stage) => (
          <article key={stage.id} className="dashboard-signal-stage-card" data-stage={stage.id}>
            <em>{stage.count}</em>
            <div>
              <b>{stage.label}</b>
              <span>Active Items</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function OperationsDashboard({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-panel dashboard-panel-ops" role="tabpanel" id="dashboard-panel-ops" aria-labelledby="dashboard-tab-ops">
      <article className="dashboard-card dashboard-signal-card dashboard-ops-signal">
        <SectionTitle icon={Network} title="Live Clinical Signal Field" meta="Tokenized Patient-Course-Task Graph" />
        <div className="dashboard-signal-body">
          <div className="dashboard-signal-plot">
            <NeuronSignalField
              ariaLabel="Live clinical signal field"
              className="dashboard-signal-canvas"
              links={telemetry.signal.links}
              nodes={telemetry.signal.nodes}
            />
          </div>
          <SignalLoad telemetry={telemetry} />
        </div>
      </article>
      <div className="dashboard-metric-grid dashboard-ops-metrics">
        {telemetry.metrics.map((metric) => <MetricTile key={metric.label} metric={metric} />)}
      </div>
      <div className="dashboard-ops-secondary">
        <article className="dashboard-card dashboard-phase-card">
          <SectionTitle icon={CheckCircle2} title="Course Distribution" meta="Upcoming / On Treatment / Post" />
          <CourseDistribution telemetry={telemetry} />
        </article>
        <article className="dashboard-card dashboard-throughput-card">
          <SectionTitle icon={PenLine} title="Weekly Throughput" meta="Fractions Plus Active Load" />
          <WeeklyThroughput telemetry={telemetry} />
        </article>
        <article className="dashboard-card dashboard-capacity-card">
          <SectionTitle icon={CalendarDays} title="Capacity Matrix" meta="Time-Band Density And Provider Pressure" />
          <CapacityMatrix telemetry={telemetry} />
        </article>
      </div>
    </div>
  );
}

function CarepathDashboard({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-panel dashboard-panel-carepath" role="tabpanel" id="dashboard-panel-flow" aria-labelledby="dashboard-tab-flow">
      <div className="dashboard-carepath-metrics">
        <KpiStrip items={telemetry.carepath.metrics} />
      </div>
      <article className="dashboard-card dashboard-carepath-pulse-card">
        <SectionTitle icon={Activity} title="Carepath Pulse" meta={`Handoff Pressure As Of ${telemetry.carepath.asOfLabel}`} />
        <CarepathPulseSankey telemetry={telemetry} palette={palette} />
      </article>
      <div className="dashboard-carepath-side">
        <article className="dashboard-card dashboard-runway-card">
          <SectionTitle icon={GitBranch} title="Next Handoff Runway" meta="Top Releases To Move Courses Forward" />
          <HandoffRunway telemetry={telemetry} />
        </article>
        <article className="dashboard-card dashboard-template-card">
          <SectionTitle icon={FileText} title="Template Coverage" meta="Active, Draft, Mapping, And Missing States" />
          <TemplateCoverageStrip telemetry={telemetry} />
        </article>
      </div>
      <article className="dashboard-card dashboard-owner-heatmap-card">
        <SectionTitle icon={UsersRound} title="Phase x Owner Pressure" meta="Open Work By Workflow Lane And Accountable Role" />
        <PhaseOwnerMatrix telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-audit-card">
        <SectionTitle icon={CheckCircle2} title="Audit Readiness Ribbon" meta="Ready Evidence Versus Open Evidence By Phase" />
        <AuditReadinessRibbon telemetry={telemetry} />
      </article>
    </div>
  );
}

function RiskDashboard({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-panel dashboard-panel-risk" role="tabpanel" id="dashboard-panel-risk" aria-labelledby="dashboard-tab-risk">
      <article className="dashboard-card dashboard-safety-score-card">
        <SectionTitle icon={ShieldCheck} title="Clinical Safety Score" meta="Explainable Weighted Risk Components" />
        <ClinicalSafetyScore telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-risk-graph-card">
        <SectionTitle icon={Network} title="Risk Constellation" meta="Tokenized Course-To-Risk-Domain Graph" />
        <RiskConstellationGraph telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-intervention-card">
        <SectionTitle icon={AlertTriangle} title="Intervention Queue" meta="Highest-Priority Clinical Safety Actions" />
        <InterventionQueue telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-safety-matrix-card">
        <SectionTitle icon={Activity} title="Safety Matrix" meta="Risk Domains By Carepath Phase" />
        <SafetyMatrix telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-fraction-watch-card">
        <SectionTitle icon={ClipboardList} title="Fraction Approval Watch" meta="MD / DOT / Override Exceptions Only" />
        <FractionApprovalWatch telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-phi-mini-card">
        <SectionTitle icon={LockKeyhole} title="PHI Boundary" meta="Dashboard Payload Assurance" />
        <PhiAssuranceMini telemetry={telemetry} />
      </article>
    </div>
  );
}

export function DashboardTelemetryClient({ telemetry }: DashboardTelemetryClientProps) {
  const [activePanel, setActivePanel] = useState<DashboardPanel>('ops');
  const palette = useDashboardPalette();

  return (
    <section className="dashboard-command" data-active-panel={activePanel}>
      <header className="dashboard-command-header">
        <div>
          <p className="clinical-label">CureRays Command Center</p>
          <h1>Clinical Operations</h1>
        </div>
        <div className="dashboard-command-tabs" role="tablist" aria-label="Dashboard Panes">
          {panelTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activePanel === tab.id}
              id={`dashboard-tab-${tab.id}`}
              aria-controls={`dashboard-panel-${tab.id}`}
              onClick={() => setActivePanel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dashboard-command-grid">
        {activePanel === 'ops' ? <OperationsDashboard telemetry={telemetry} /> : null}
        {activePanel === 'flow' ? <CarepathDashboard telemetry={telemetry} palette={palette} /> : null}
        {activePanel === 'risk' ? <RiskDashboard telemetry={telemetry} /> : null}
      </div>
    </section>
  );
}
