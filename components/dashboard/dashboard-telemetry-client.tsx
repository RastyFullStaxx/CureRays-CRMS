'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { DashboardEChart } from '@/components/dashboard/dashboard-echart';

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

function phaseOwnerHeatmapOption(telemetry: DashboardTelemetry, palette: DashboardPalette): EChartsCoreOption {
  const cells = telemetry.carepath.phaseOwnerHeatmap.cells;
  const max = Math.max(...cells.map((cell) => cell.value + cell.blocked * 2 + cell.needsReview), 1);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      renderMode: 'richText',
      borderColor: palette.border,
      backgroundColor: palette.card,
      textStyle: { color: palette.text, fontFamily: 'Inter' },
      formatter: (params: { data?: [number, number, number, number, number, string, string] }) => {
        const data = params.data;
        if (!data) {
          return '';
        }
        return `${data[5]}\n${data[6]}\nOpen ${data[2]} · Blocked ${data[3]} · Review ${data[4]}`;
      },
    },
    grid: { top: 14, right: 12, bottom: 54, left: 92 },
    xAxis: {
      type: 'category',
      data: telemetry.carepath.phaseOwnerHeatmap.phases,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: palette.muted, fontSize: 10, fontWeight: 700, rotate: 28 },
    },
    yAxis: {
      type: 'category',
      data: telemetry.carepath.phaseOwnerHeatmap.owners,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: palette.muted, fontSize: 10, fontWeight: 700 },
    },
    visualMap: {
      show: false,
      min: 0,
      max,
      inRange: {
        color: [palette.cardMuted, palette.info, palette.warning, palette.error],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: cells.map((cell) => [
          cell.phaseIndex,
          cell.ownerIndex,
          cell.value,
          cell.blocked + cell.overdue,
          cell.needsReview,
          cell.phaseLabel,
          cell.ownerLabel,
        ]),
        label: {
          show: true,
          formatter: (params: { data?: [number, number, number] }) => {
            const data = params.data;
            return data && data[2] > 0 ? `${data[2]}` : '';
          },
          color: palette.text,
          fontSize: 10,
          fontWeight: 800,
        },
        itemStyle: {
          borderColor: palette.card,
          borderWidth: 3,
          borderRadius: 6,
        },
      },
    ],
  };
}

function safetyMatrixOption(telemetry: DashboardTelemetry, palette: DashboardPalette): EChartsCoreOption {
  const cells = telemetry.risk.safetyMatrix.cells;
  const max = Math.max(...cells.map((cell) => cell.value), 1);

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      renderMode: 'richText',
      borderColor: palette.border,
      backgroundColor: palette.card,
      textStyle: { color: palette.text, fontFamily: 'Inter' },
      formatter: (params: { data?: [number, number, number, string, string] }) => {
        const data = params.data;
        if (!data) {
          return '';
        }
        return `${data[3]}\n${data[4]}\nUnresolved risk ${data[2]}`;
      },
    },
    grid: { top: 14, right: 10, bottom: 46, left: 104 },
    xAxis: {
      type: 'category',
      data: telemetry.risk.safetyMatrix.phases,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: palette.muted, fontSize: 10, fontWeight: 700, rotate: 28 },
    },
    yAxis: {
      type: 'category',
      data: telemetry.risk.safetyMatrix.domains,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: palette.muted, fontSize: 10, fontWeight: 700 },
    },
    visualMap: {
      show: false,
      min: 0,
      max,
      inRange: {
        color: [palette.cardMuted, palette.info, palette.warning, palette.error],
      },
    },
    series: [
      {
        type: 'heatmap',
        data: cells.map((cell) => [
          cell.phaseIndex,
          cell.domainIndex,
          cell.value,
          cell.domain,
          cell.phaseLabel,
        ]),
        label: {
          show: true,
          formatter: (params: { data?: [number, number, number] }) => {
            const data = params.data;
            return data && data[2] > 0 ? `${data[2]}` : '';
          },
          color: palette.text,
          fontSize: 10,
          fontWeight: 800,
        },
        itemStyle: {
          borderColor: palette.card,
          borderWidth: 3,
          borderRadius: 6,
        },
      },
    ],
  };
}

function riskGraphOption(telemetry: DashboardTelemetry, palette: DashboardPalette): EChartsCoreOption {
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      renderMode: 'richText',
      borderColor: palette.border,
      backgroundColor: palette.card,
      textStyle: { color: palette.text, fontFamily: 'Inter' },
    },
    legend: {
      show: false,
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: false,
        draggable: false,
        categories: [
          { name: 'domain' },
          { name: 'course' },
        ],
        data: telemetry.risk.riskGraph.nodes.map((node) => ({
          id: node.id,
          name: node.name,
          value: node.value,
          category: node.category,
          symbolSize: node.category === 'domain'
            ? Math.max(26, Math.min(58, 28 + node.value * 4))
            : Math.max(18, Math.min(42, 16 + node.value * 1.6)),
          itemStyle: {
            color: toneColor(node.tone, palette),
            borderColor: palette.card,
            borderWidth: 1,
          },
          label: {
            show: true,
            color: palette.text,
            fontSize: node.category === 'domain' ? 10 : 9,
            fontWeight: node.category === 'domain' ? 800 : 700,
          },
        })),
        links: telemetry.risk.riskGraph.links.map((link) => ({
          source: link.source,
          target: link.target,
          value: link.value,
          lineStyle: {
            color: toneColor(link.tone, palette),
            opacity: 0.34,
            width: Math.max(1, Math.min(5, link.value / 3)),
            curveness: 0.16,
          },
        })),
        force: {
          repulsion: 210,
          edgeLength: [52, 110],
          gravity: 0.08,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            opacity: 0.72,
          },
        },
      },
    ],
  };
}

function CarepathPulseSankey({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  const option = useMemo(() => carepathSankeyOption(telemetry, palette), [palette, telemetry]);

  return <DashboardEChart className="dashboard-echart dashboard-echart-sankey" option={option} ariaLabel="Carepath pulse sankey" />;
}

function PhaseOwnerHeatmap({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  const option = useMemo(() => phaseOwnerHeatmapOption(telemetry, palette), [palette, telemetry]);

  return <DashboardEChart className="dashboard-echart" option={option} ariaLabel="Carepath phase by owner heatmap" />;
}

function SafetyMatrixHeatmap({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  const option = useMemo(() => safetyMatrixOption(telemetry, palette), [palette, telemetry]);

  return <DashboardEChart className="dashboard-echart" option={option} ariaLabel="Clinical safety matrix heatmap" />;
}

function RiskConstellationGraph({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  const option = useMemo(() => riskGraphOption(telemetry, palette), [palette, telemetry]);

  return <DashboardEChart className="dashboard-echart dashboard-echart-graph" option={option} ariaLabel="Risk constellation graph" />;
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
  return (
    <div className="dashboard-signal-overlay">
      <div className="dashboard-signal-load-panel">
        <div className="dashboard-signal-load-value">
          <strong>{telemetry.signal.loadPercent}%</strong>
          <span>Carepath Load</span>
        </div>
        <p>{telemetry.signal.summary}</p>
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
            <SignalField nodes={telemetry.signal.nodes} links={telemetry.signal.links} />
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
        <PhaseOwnerHeatmap telemetry={telemetry} palette={palette} />
      </article>
      <article className="dashboard-card dashboard-audit-card">
        <SectionTitle icon={CheckCircle2} title="Audit Readiness Ribbon" meta="Ready Evidence Versus Open Evidence By Phase" />
        <AuditReadinessRibbon telemetry={telemetry} />
      </article>
    </div>
  );
}

function RiskDashboard({ palette, telemetry }: { palette: DashboardPalette; telemetry: DashboardTelemetry }) {
  return (
    <div className="dashboard-panel dashboard-panel-risk" role="tabpanel" id="dashboard-panel-risk" aria-labelledby="dashboard-tab-risk">
      <article className="dashboard-card dashboard-safety-score-card">
        <SectionTitle icon={ShieldCheck} title="Clinical Safety Score" meta="Explainable Weighted Risk Components" />
        <ClinicalSafetyScore telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-risk-graph-card">
        <SectionTitle icon={Network} title="Risk Constellation" meta="Tokenized Course-To-Risk-Domain Graph" />
        <RiskConstellationGraph telemetry={telemetry} palette={palette} />
      </article>
      <article className="dashboard-card dashboard-intervention-card">
        <SectionTitle icon={AlertTriangle} title="Intervention Queue" meta="Highest-Priority Clinical Safety Actions" />
        <InterventionQueue telemetry={telemetry} />
      </article>
      <article className="dashboard-card dashboard-safety-matrix-card">
        <SectionTitle icon={Activity} title="Safety Matrix" meta="Risk Domains By Carepath Phase" />
        <SafetyMatrixHeatmap telemetry={telemetry} palette={palette} />
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
        {activePanel === 'risk' ? <RiskDashboard telemetry={telemetry} palette={palette} /> : null}
      </div>
    </section>
  );
}
