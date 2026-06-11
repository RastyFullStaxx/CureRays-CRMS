'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  GitBranch,
  LockKeyhole,
  Network,
  PenLine,
  RadioTower,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from 'd3-force';
import type { SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { SankeyNodeProps } from 'recharts';
import type {
  DashboardMetric,
  DashboardPanel,
  DashboardSignalLink,
  DashboardSignalNode,
  DashboardTelemetry,
} from '@/lib/services/dashboard-telemetry-service';

type DashboardTelemetryClientProps = {
  telemetry: DashboardTelemetry;
};

type SignalSimulationNode = DashboardSignalNode & SimulationNodeDatum;
type SignalSimulationLink = DashboardSignalLink & SimulationLinkDatum<SignalSimulationNode>;

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

const phiIcons: Record<string, LucideIcon> = {
  client: RadioTower,
  api: GitBranch,
  ops: Database,
  redaction: ShieldCheck,
  audit: Activity,
  phi: LockKeyhole,
};

function cssVar(name: string, fallback: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function signalColor(group: DashboardSignalNode['group']) {
  if (group === 'risk') return 'var(--color-error)';
  if (group === 'document') return 'var(--color-info)';
  if (group === 'task') return 'var(--color-accent)';
  if (group === 'course') return 'var(--color-success)';
  return 'var(--color-primary)';
}

function signalTargetX(group: DashboardSignalNode['group']) {
  if (group === 'patient') return 0.14;
  if (group === 'course') return 0.34;
  if (group === 'task') return 0.56;
  if (group === 'document') return 0.78;
  return 0.88;
}

function signalTargetY(group: DashboardSignalNode['group'], index: number) {
  if (group === 'risk') return 0.3;
  if (group === 'document') return 0.68;
  return 0.22 + ((index * 19) % 55) / 100;
}

function resolvedNode(value: string | number | SignalSimulationNode | undefined) {
  return typeof value === 'object' && value !== null ? value : undefined;
}

function SignalField({ nodes, links }: { nodes: DashboardSignalNode[]; links: DashboardSignalLink[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 1;
    let height = 1;
    const simulationNodes: SignalSimulationNode[] = nodes.map((node, index) => ({
      ...node,
      x: 40 + (index % 8) * 36,
      y: 40 + (index % 5) * 34,
    }));
    const simulationLinks: SignalSimulationLink[] = links.map((link) => ({ ...link }));
    const simulation = forceSimulation<SignalSimulationNode>(simulationNodes)
      .force(
        'link',
        forceLink<SignalSimulationNode, SignalSimulationLink>(simulationLinks)
          .id((node) => node.id)
          .distance((link) => 34 + Math.max(1, 8 - link.value) * 7)
          .strength(0.42),
      )
      .force('charge', forceManyBody<SignalSimulationNode>().strength(-72))
      .force('x', forceX<SignalSimulationNode>((node) => signalTargetX(node.group) * width).strength(0.16))
      .force('y', forceY<SignalSimulationNode>((node, index) => signalTargetY(node.group, index) * height).strength(0.12));

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);

      if (canvas.width !== Math.floor(width * scale) || canvas.height !== Math.floor(height * scale)) {
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
      }

      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, width, height);

      const primary = cssVar('--color-primary', 'CanvasText');
      const text = cssVar('--color-text-muted', 'GrayText');
      const card = cssVar('--color-card', 'Canvas');

      context.save();
      const glow = context.createRadialGradient(width * 0.48, height * 0.48, 20, width * 0.48, height * 0.48, Math.max(width, height) * 0.68);
      glow.addColorStop(0, primary);
      glow.addColorStop(1, card);
      context.globalAlpha = 0.08;
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
      context.restore();

      simulationLinks.forEach((link) => {
        const source = resolvedNode(link.source);
        const target = resolvedNode(link.target);
        if (!source?.x || !source.y || !target?.x || !target.y) {
          return;
        }

        context.beginPath();
        context.moveTo(source.x, source.y);
        context.lineTo(target.x, target.y);
        context.strokeStyle = primary;
        context.globalAlpha = Math.min(0.42, 0.1 + link.value / 40);
        context.lineWidth = Math.max(1, Math.min(4, link.value / 6));
        context.stroke();
      });

      context.globalAlpha = 1;
      simulationNodes.forEach((node) => {
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const radius = Math.max(3.5, Math.min(12, 3 + node.value * 0.45));
        const color = cssVar(signalColor(node.group).replace('var(', '').replace(')', ''), primary);

        context.beginPath();
        context.arc(x, y, radius + 7, 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = 0.1;
        context.fill();

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = 0.9;
        context.fill();

        if (node.group === 'task' || node.group === 'document' || node.group === 'risk') {
          context.globalAlpha = 0.9;
          context.fillStyle = text;
          context.font = '700 10px var(--font-body)';
          context.textAlign = 'center';
          context.fillText(node.label, x, y + radius + 14);
        }
      });
    };

    if (reduceMotion) {
      simulation.tick(120);
      draw();
    } else {
      simulation.on('tick', draw);
      simulation.alpha(0.9).restart();
    }

    window.addEventListener('resize', draw);

    return () => {
      simulation.stop();
      window.removeEventListener('resize', draw);
    };
  }, [links, nodes]);

  return <canvas ref={canvasRef} className="dashboard-signal-canvas" aria-hidden="true" />;
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

function CarepathNode(props: SankeyNodeProps) {
  const label = typeof props.payload.name === 'string' ? props.payload.name : `Stage ${props.index + 1}`;
  const labelX = props.x + props.width + 8;
  const labelY = props.y + props.height / 2 + 4;

  return (
    <g>
      <rect
        x={props.x}
        y={props.y}
        width={props.width}
        height={props.height}
        rx={4}
        className="dashboard-sankey-node"
      />
      <text x={labelX} y={labelY} className="dashboard-sankey-label">
        {label}
      </text>
    </g>
  );
}

function CarepathSimulation({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-chart-shell dashboard-sankey-shell">
      <ResponsiveContainer width="100%" height="100%">
        <Sankey
          data={telemetry.carepath}
          dataKey="value"
          nameKey="name"
          node={CarepathNode}
          nodePadding={26}
          nodeWidth={12}
          iterations={72}
          margin={{ top: 12, right: 78, bottom: 12, left: 10 }}
          link={{ stroke: 'var(--color-primary)', strokeOpacity: 0.24 }}
        >
          <Tooltip
            contentStyle={{
              background: 'var(--color-card)',
              border: 'var(--border-container)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
            }}
          />
        </Sankey>
      </ResponsiveContainer>
    </div>
  );
}

function CourseDistribution({ telemetry }: { telemetry: DashboardTelemetry }) {
  const total = telemetry.courseDistribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="dashboard-donut-wrap">
      <div className="dashboard-donut-chart" role="img" aria-label="Course distribution donut chart">
        <ResponsiveContainer width="100%" height="100%">
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
          <span>courses</span>
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
      <ResponsiveContainer width="100%" height="100%">
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

function AttentionQueue({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-attention-list">
      {telemetry.attention.map((item) => (
        <div key={item.label} className="dashboard-attention-row">
          <span>{item.label}</span>
          <strong style={{ color: item.color }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function CapacityMatrix({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-capacity">
      <div className="dashboard-capacity-grid">
        {telemetry.capacityBands.map((band) => {
          const pressure = Math.min(100, Math.round((band.total / Math.max(band.capacity, 1)) * 100));
          const treatment = Math.round((band.treatment / Math.max(band.total, 1)) * 100);
          const simulation = Math.round((band.simulation / Math.max(band.total, 1)) * 100);
          const review = Math.max(0, 100 - treatment - simulation);

          return (
            <div key={band.label} className="dashboard-capacity-band">
              <div className="dashboard-capacity-band-head">
                <span>{band.label}</span>
                <strong>{pressure}%</strong>
              </div>
              <div className="dashboard-capacity-track" aria-label={`${band.label} capacity ${pressure}%`}>
                <div className="dashboard-capacity-stack" style={{ width: `${pressure}%` }}>
                  <i className="is-treatment" style={{ width: `${treatment}%` }} />
                  <i className="is-simulation" style={{ width: `${simulation}%` }} />
                  <i className="is-review" style={{ width: `${review}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="dashboard-provider-load">
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

function PhiBoundaryGraph({ telemetry }: { telemetry: DashboardTelemetry }) {
  const { links, nodes, assurance } = telemetry.phiBoundary;
  const nodesById = useMemo(() => {
    return nodes.reduce<Record<string, (typeof nodes)[number]>>((current, node) => {
      current[node.id] = node;
      return current;
    }, {});
  }, [nodes]);

  return (
    <div className="dashboard-phi">
      <svg viewBox="0 0 100 74" role="img" aria-label="PHI isolation graph">
        {links.map((link) => {
          const source = nodesById[link.source];
          const target = nodesById[link.target];
          if (!source || !target) {
            return null;
          }
          const midX = (source.x + target.x) / 2;
          const midY = (source.y + target.y) / 2;

          return (
            <g key={`${link.source}-${link.target}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                className={link.isolated ? 'dashboard-phi-link is-isolated' : 'dashboard-phi-link'}
              />
              <text x={midX} y={midY - 1.5} className="dashboard-phi-link-label">{link.label}</text>
            </g>
          );
        })}
        {nodes.map((node) => {
          const Icon = phiIcons[node.id] ?? ShieldCheck;
          return (
            <g key={node.id} className="dashboard-phi-node" data-tone={node.tone} transform={`translate(${node.x} ${node.y})`}>
              <circle r="5.4" />
              <foreignObject x="-4" y="-4" width="8" height="8">
                <div className="dashboard-phi-icon"><Icon size={10} /></div>
              </foreignObject>
              <text y="10.4" textAnchor="middle">{node.label}</text>
            </g>
          );
        })}
      </svg>
      <p>{assurance}</p>
    </div>
  );
}

function SignalLoad({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-signal-core">
      <span>Carepath load</span>
      <strong>{telemetry.signal.loadPercent}%</strong>
      <p>{telemetry.signal.summary}</p>
    </div>
  );
}

export function DashboardTelemetryClient({ telemetry }: DashboardTelemetryClientProps) {
  const [activePanel, setActivePanel] = useState<DashboardPanel>('ops');

  return (
    <section className="dashboard-command" data-active-panel={activePanel}>
      <header className="dashboard-command-header">
        <div>
          <p className="clinical-label">CureRays command center</p>
          <h1>Clinical Operations</h1>
        </div>
        <div className="dashboard-command-tabs" role="tablist" aria-label="Dashboard panes">
          {panelTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activePanel === tab.id}
              onClick={() => setActivePanel(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="dashboard-command-grid">
        <div className="dashboard-group dashboard-group-ops" data-panel="ops">
          <article className="dashboard-card dashboard-signal-card">
            <SignalField nodes={telemetry.signal.nodes} links={telemetry.signal.links} />
            <div className="dashboard-signal-content">
              <SectionTitle icon={Network} title="Live Clinical Signal Field" meta="Tokenized patient-course-task graph" />
              <SignalLoad telemetry={telemetry} />
            </div>
          </article>
          <div className="dashboard-metric-grid">
            {telemetry.metrics.map((metric) => <MetricTile key={metric.label} metric={metric} />)}
          </div>
        </div>

        <div className="dashboard-group dashboard-group-flow" data-panel="flow">
          <article className="dashboard-card dashboard-flow-card">
            <SectionTitle icon={Activity} title="Carepath Flow Simulation" meta="Stage pressure and handoff volume" />
            <CarepathSimulation telemetry={telemetry} />
          </article>
          <article className="dashboard-card dashboard-phase-card">
            <SectionTitle icon={CheckCircle2} title="Course Distribution" meta="Upcoming / on treatment / post" />
            <CourseDistribution telemetry={telemetry} />
          </article>
          <article className="dashboard-card dashboard-throughput-card">
            <SectionTitle icon={PenLine} title="Weekly Throughput" meta="Fractions plus active load" />
            <WeeklyThroughput telemetry={telemetry} />
          </article>
        </div>

        <div className="dashboard-group dashboard-group-risk" data-panel="risk">
          <article className="dashboard-card dashboard-attention-card">
            <SectionTitle icon={AlertTriangle} title="Attention Queue" meta="Risk signals only" />
            <AttentionQueue telemetry={telemetry} />
          </article>
          <article className="dashboard-card dashboard-capacity-card">
            <SectionTitle icon={CalendarDays} title="Capacity Matrix" meta="Time-band density and provider pressure" />
            <CapacityMatrix telemetry={telemetry} />
          </article>
          <article className="dashboard-card dashboard-phi-card">
            <SectionTitle icon={ShieldCheck} title="PHI Isolation Graph" meta="Zero-trust dashboard boundary" />
            <PhiBoundaryGraph telemetry={telemetry} />
          </article>
        </div>
      </div>
    </section>
  );
}
