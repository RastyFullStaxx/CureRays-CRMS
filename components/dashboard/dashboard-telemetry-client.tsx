'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
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
  forceCenter,
  forceCollide,
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
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  DashboardMetric,
  DashboardPanel,
  DashboardSignalLink,
  DashboardSignalNode,
  DashboardSignalStageId,
  DashboardTelemetry,
} from '@/lib/services/dashboard-telemetry-service';

type DashboardTelemetryClientProps = {
  telemetry: DashboardTelemetry;
};

type SignalSimulationNode = DashboardSignalNode & SimulationNodeDatum & {
  phaseSeed: number;
};
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
  if (group === 'stage') return 'var(--color-primary)';
  if (group === 'task') return 'var(--color-accent)';
  if (group === 'course') return 'var(--color-success)';
  return 'var(--color-primary)';
}

const stageAnchors: Record<DashboardSignalStageId, { x: number; y: number }> = {
  'chart-prep': { x: 0.36, y: 0.5 },
  planning: { x: 0.48, y: 0.36 },
  delivery: { x: 0.64, y: 0.5 },
  closeout: { x: 0.52, y: 0.66 },
};

function anchorForNode(node: DashboardSignalNode) {
  const stage = node.stage ? stageAnchors[node.stage] : undefined;
  if (!stage) {
    return { x: 0.5, y: 0.5 };
  }

  if (node.group === 'patient') {
    return { x: stage.x - 0.08, y: stage.y + 0.03 };
  }

  if (node.group === 'course') {
    return { x: stage.x + 0.08, y: stage.y + 0.02 };
  }

  if (node.group === 'document') {
    return { x: Math.min(0.72, stage.x + 0.14), y: stage.y + 0.08 };
  }

  if (node.group === 'risk' || node.group === 'task') {
    return { x: Math.min(0.7, stage.x + 0.12), y: Math.max(0.3, stage.y - 0.12) };
  }

  return stage;
}

function resolvedNode(value: string | number | SignalSimulationNode | undefined) {
  return typeof value === 'object' && value !== null ? value : undefined;
}

function nodeRadius(node: DashboardSignalNode) {
  if (node.group === 'stage') {
    return Math.max(8, Math.min(15, 7 + node.value * 0.35));
  }

  if (node.group === 'patient') {
    return Math.max(4.5, Math.min(8.5, 4 + node.value * 0.4));
  }

  if (node.group === 'course') {
    return Math.max(4.5, Math.min(10, 4 + node.value * 0.18));
  }

  return Math.max(5, Math.min(10, 4 + node.value * 0.35));
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
    let animationFrame = 0;
    const initialRect = canvas.getBoundingClientRect();
    width = Math.max(1, initialRect.width || canvas.clientWidth || 560);
    height = Math.max(1, initialRect.height || canvas.clientHeight || 300);
    const simulationNodes: SignalSimulationNode[] = nodes.map((node, index) => ({
      ...node,
      phaseSeed: index * 1.47,
      x: anchorForNode(node).x * width + Math.cos(index * 1.7) * 24,
      y: anchorForNode(node).y * height + Math.sin(index * 1.7) * 24,
    }));
    const simulationLinks: SignalSimulationLink[] = links.map((link) => ({ ...link }));
    const centerForce = forceCenter<SignalSimulationNode>(width / 2, height / 2).strength(0.18);
    const simulation = forceSimulation<SignalSimulationNode>(simulationNodes)
      .force(
        'link',
        forceLink<SignalSimulationNode, SignalSimulationLink>(simulationLinks)
          .id((node) => node.id)
          .distance((link) => 28 + Math.max(1, 9 - link.value) * 5)
          .strength(0.36),
      )
      .force('charge', forceManyBody<SignalSimulationNode>().strength((node) => (node.group === 'stage' ? -92 : -36)))
      .force('collide', forceCollide<SignalSimulationNode>((node) => nodeRadius(node) + 9).strength(0.72))
      .force('center', centerForce)
      .force('x', forceX<SignalSimulationNode>((node) => anchorForNode(node).x * width).strength((node) => (node.group === 'stage' ? 0.42 : 0.18)))
      .force('y', forceY<SignalSimulationNode>((node) => anchorForNode(node).y * height).strength((node) => (node.group === 'stage' ? 0.42 : 0.18)));

    const draw = (time = 0) => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      width = Math.max(1, rect.width || canvas.clientWidth || width);
      height = Math.max(1, rect.height || canvas.clientHeight || height);
      centerForce.x(width / 2).y(height / 2);

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

      const renderPositions = new Map<string, { x: number; y: number }>();

      simulationNodes.forEach((node) => {
        const radius = nodeRadius(node);
        const labelReserve = node.group === 'stage' || node.group === 'task' || node.group === 'document' || node.group === 'risk' ? 28 : 10;
        const anchor = anchorForNode(node);
        const anchorX = anchor.x * width;
        const anchorY = anchor.y * height;
        const orbitRadius = reduceMotion
          ? 0
          : node.group === 'stage'
            ? 7
            : node.group === 'patient'
              ? 18
              : node.group === 'course'
                ? 15
                : 11;
        const orbitSpeed = node.group === 'stage' ? 2100 : node.group === 'patient' ? 1350 : 1650;
        const orbitAngle = time / orbitSpeed + node.phaseSeed;
        node.x = Math.min(Math.max(node.x ?? 0, radius + 12), width - radius - 12);
        node.y = Math.min(Math.max(node.y ?? 0, radius + 12), height - radius - labelReserve);
        const orbitX = Math.cos(orbitAngle) * orbitRadius;
        const orbitY = Math.sin(orbitAngle) * orbitRadius;
        const tetherX = ((node.x ?? anchorX) * 0.68) + (anchorX * 0.32);
        const tetherY = ((node.y ?? anchorY) * 0.68) + (anchorY * 0.32);
        renderPositions.set(node.id, {
          x: Math.min(Math.max(tetherX + orbitX, radius + 12), width - radius - 12),
          y: Math.min(Math.max(tetherY + orbitY, radius + 12), height - radius - labelReserve),
        });
      });

      simulationLinks.forEach((link) => {
        const source = resolvedNode(link.source);
        const target = resolvedNode(link.target);
        const sourcePosition = source ? renderPositions.get(source.id) : undefined;
        const targetPosition = target ? renderPositions.get(target.id) : undefined;
        if (!sourcePosition || !targetPosition) {
          return;
        }

        context.beginPath();
        context.moveTo(sourcePosition.x, sourcePosition.y);
        context.lineTo(targetPosition.x, targetPosition.y);
        context.strokeStyle = primary;
        context.globalAlpha = Math.min(0.38, 0.1 + link.value / 42);
        context.lineWidth = Math.max(1, Math.min(3.5, link.value / 7));
        context.stroke();
      });

      context.globalAlpha = 1;
      simulationNodes.forEach((node) => {
        const position = renderPositions.get(node.id) ?? { x: node.x ?? 0, y: node.y ?? 0 };
        const x = position.x;
        const y = position.y;
        const radius = nodeRadius(node);
        const color = cssVar(signalColor(node.group).replace('var(', '').replace(')', ''), primary);
        const pulse = reduceMotion ? 0 : (Math.sin(time / 620 + node.phaseSeed) + 1) / 2;

        context.beginPath();
        context.arc(x, y, radius + 6 + pulse * 4, 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = node.group === 'stage' ? 0.16 : 0.08 + pulse * 0.08;
        context.fill();

        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = color;
        context.globalAlpha = node.group === 'stage' ? 0.96 : 0.82;
        context.fill();

        if (node.group === 'stage' || node.group === 'task' || node.group === 'document' || node.group === 'risk') {
          context.globalAlpha = 0.9;
          context.fillStyle = text;
          context.font = `700 10px ${cssVar('--font-body', 'Inter, sans-serif')}`;
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
      const animate = (time: number) => {
        draw(time);
        animationFrame = window.requestAnimationFrame(animate);
      };
      animationFrame = window.requestAnimationFrame(animate);
    }

    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
      simulation.stop();
      window.removeEventListener('resize', handleResize);
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

function CarepathSimulation({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-carepath-lanes" role="img" aria-label="Animated carepath lane simulation">
      {telemetry.carepathLanes.map((lane, laneIndex) => (
        <div key={lane.id} className="dashboard-carepath-lane" data-stage={lane.id}>
          <div className="dashboard-carepath-lane-head">
            <span>{lane.label}</span>
            <strong>{lane.count}</strong>
          </div>
          <div className="dashboard-carepath-track" aria-label={`${lane.label} pressure ${lane.pressure}%`}>
            <i className="dashboard-carepath-pressure" style={{ width: `${lane.pressure}%` }} />
            {lane.tokens.map((token, tokenIndex) => (
              <span
                key={token.id}
                className="dashboard-carepath-token"
                data-tone={token.tone}
                style={{
                  '--token-offset': `${token.offset}%`,
                  '--token-delay': `${(laneIndex * 0.62 + tokenIndex * 0.48).toFixed(2)}s`,
                } as CSSProperties}
              >
                <i />
                <b>{token.label}</b>
              </span>
            ))}
          </div>
          <em>{lane.handoff} handoffs</em>
        </div>
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
          <ComposedChart data={capacityTrend} margin={{ top: 10, right: 8, bottom: 0, left: -24 }}>
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
        <span><i className="is-treatment" />Treatment</span>
        <span><i className="is-simulation" />Simulation</span>
        <span><i className="is-review" />Review</span>
      </div>
      <div className="dashboard-provider-load">
        <span className="dashboard-provider-load-title">Provider load</span>
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
  const { links, nodes } = telemetry.phiBoundary;
  const nodesById = useMemo(() => {
    return nodes.reduce<Record<string, (typeof nodes)[number]>>((current, node) => {
      current[node.id] = node;
      return current;
    }, {});
  }, [nodes]);

  return (
    <div className="dashboard-phi">
      <svg viewBox="0 0 100 82" role="img" aria-label="PHI isolation graph">
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
    </div>
  );
}

function SignalLoad({ telemetry }: { telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-signal-overlay">
      <div className="dashboard-signal-core">
        <span>Carepath load</span>
        <strong>{telemetry.signal.loadPercent}%</strong>
        <p>{telemetry.signal.summary}</p>
      </div>
      <div className="dashboard-signal-stage-chips" aria-label="Carepath stage load">
        {telemetry.signal.stages.map((stage) => (
          <span key={stage.id} data-stage={stage.id}>
            <i style={{ width: `${stage.pressure}%` }} />
            <b>{stage.label}</b>
            <em>{stage.count}</em>
          </span>
        ))}
      </div>
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
            <SectionTitle icon={Network} title="Live Clinical Signal Field" meta="Tokenized patient-course-task graph" />
            <div className="dashboard-signal-body">
              <div className="dashboard-signal-plot">
                <SignalField nodes={telemetry.signal.nodes} links={telemetry.signal.links} />
              </div>
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
