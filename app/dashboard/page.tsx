'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  Network,
  PenLine,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalAppointments,
  operationalAuditEvents,
  operationalPatients,
  operationalPriorityFlags,
  operationalTreatmentCourses,
} from '@/lib/clinical-store';

type DashboardPanel = 'ops' | 'flow' | 'risk';

type DashboardMetric = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  trend: number[];
};

const panelTabs: Array<{ id: DashboardPanel; label: string }> = [
  { id: 'ops', label: 'Operations' },
  { id: 'flow', label: 'Carepath' },
  { id: 'risk', label: 'Risk' },
];

function SignalField({ pulse }: { pulse: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return undefined;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from({ length: 32 }, (_, index) => ({
      x: ((index * 47) % 100) / 100,
      y: ((index * 29) % 100) / 100,
      vx: ((index % 5) - 2) * 0.00018,
      vy: (((index + 2) % 7) - 3) * 0.00016,
      r: 1.8 + (index % 4) * 0.45,
    }));
    let frame = 0;
    let animationFrame = 0;

    const render = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      if (canvas.width !== Math.floor(width * scale) || canvas.height !== Math.floor(height * scale)) {
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);
      }

      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.clearRect(0, 0, width, height);
      context.fillStyle = 'transparent';
      context.fillRect(0, 0, width, height);

      const primary = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || '#0033A0';
      const accent = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim() || '#FF671F';

      nodes.forEach((node) => {
        if (!reduceMotion) {
          node.x += node.vx * (1 + pulse / 40);
          node.y += node.vy * (1 + pulse / 60);
          if (node.x < 0.03 || node.x > 0.97) node.vx *= -1;
          if (node.y < 0.05 || node.y > 0.95) node.vy *= -1;
        }
      });

      nodes.forEach((node, index) => {
        for (let next = index + 1; next < nodes.length; next += 1) {
          const other = nodes[next];
          const dx = (node.x - other.x) * width;
          const dy = (node.y - other.y) * height;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 130) {
            context.strokeStyle = primary;
            context.globalAlpha = Math.max(0.08, 1 - distance / 130);
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(node.x * width, node.y * height);
            context.lineTo(other.x * width, other.y * height);
            context.stroke();
          }
        }
      });

      context.globalAlpha = 1;
      nodes.forEach((node, index) => {
        const wave = reduceMotion ? 0 : Math.sin(frame / 24 + index) * 0.8;
        context.fillStyle = index % 5 === 0 ? accent : primary;
        context.beginPath();
        context.arc(node.x * width, node.y * height, node.r + wave, 0, Math.PI * 2);
        context.fill();
      });

      frame += 1;
      if (!reduceMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
    };
  }, [pulse]);

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
  const Icon = metric.icon;
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

function CarepathMap({ upcoming, active, post }: { upcoming: number; active: number; post: number }) {
  const nodes = [
    { label: 'Chart prep', value: upcoming, x: 14, y: 56 },
    { label: 'Planning', value: Math.max(1, Math.round((upcoming + active) / 2)), x: 38, y: 26 },
    { label: 'Delivery', value: active, x: 62, y: 56 },
    { label: 'Closeout', value: post, x: 86, y: 30 },
  ];

  return (
    <div className="dashboard-flow-map">
      <svg viewBox="0 0 100 80" role="img" aria-label="Carepath flow map">
        <path d="M14 56 C25 14, 28 14, 38 26 S52 72, 62 56 S75 8, 86 30" className="dashboard-flow-path" />
        {nodes.map((node) => (
          <g key={node.label}>
            <circle cx={node.x} cy={node.y} r={Math.max(6, Math.min(13, node.value + 5))} className="dashboard-flow-node" />
            <text x={node.x} y={node.y + 1.5} textAnchor="middle" className="dashboard-flow-value">{node.value}</text>
          </g>
        ))}
      </svg>
      <div className="dashboard-flow-labels">
        {nodes.map((node) => (
          <span key={node.label}>{node.label}</span>
        ))}
      </div>
    </div>
  );
}

function PhaseDonut({ upcoming, active, post }: { upcoming: number; active: number; post: number }) {
  const total = Math.max(upcoming + active + post, 1);
  const upcomingPct = Math.round((upcoming / total) * 100);
  const activePct = Math.round((active / total) * 100);
  const postPct = Math.max(0, 100 - upcomingPct - activePct);

  return (
    <div className="dashboard-donut-wrap">
      <div
        className="dashboard-donut"
        style={{
          background: `conic-gradient(var(--color-info) 0 ${upcomingPct}%, var(--color-success) ${upcomingPct}% ${upcomingPct + activePct}%, var(--color-primary) ${upcomingPct + activePct}% 100%)`,
        }}
      >
        <div>
          <strong>{total}</strong>
          <span>courses</span>
        </div>
      </div>
      <div className="dashboard-donut-legend">
        <span><i style={{ background: 'var(--color-info)' }} />Upcoming {upcomingPct}%</span>
        <span><i style={{ background: 'var(--color-success)' }} />On Tx {activePct}%</span>
        <span><i style={{ background: 'var(--color-primary)' }} />Post {postPct}%</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activePanel, setActivePanel] = useState<DashboardPanel>('ops');
  const patients = operationalPatients();
  const courses = operationalTreatmentCourses();
  const appointments = operationalAppointments();
  const flags = operationalPriorityFlags();
  const auditEvents = operationalAuditEvents();
  const upcoming = courses.filter((course) => course.chartRoundsPhase === 'UPCOMING').length;
  const active = courses.filter((course) => course.chartRoundsPhase === 'ON_TREATMENT').length;
  const post = courses.filter((course) => course.chartRoundsPhase === 'POST').length;
  const openTasks = carepathTasks.filter((task) => !['COMPLETED', 'SIGNED', 'CLOSED'].includes(task.status)).length;
  const blockedTasks = carepathTasks.filter((task) => task.status === 'BLOCKED').length;
  const signatureQueue = generatedDocuments.filter((document) => document.signReviewState !== 'SIGNED').length;
  const readyDocuments = generatedDocuments.filter((document) => ['SIGNED', 'EXPORTED', 'UPLOADED'].includes(document.status)).length;
  const completedFractions = fractionLogEntries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const metrics = useMemo<DashboardMetric[]>(() => [
    { label: 'Operational patients', value: patients.length, detail: 'Tokenized registry', icon: UsersRound, trend: [12, 18, 17, 24, 21, patients.length] },
    { label: 'Treatment cadence', value: appointments.length, detail: 'Today schedule', icon: CalendarDays, trend: [8, 11, 9, 14, 12, appointments.length] },
    { label: 'Open work', value: openTasks, detail: `${blockedTasks} blocked`, icon: ClipboardList, trend: [20, 17, 19, 13, 15, openTasks] },
    { label: 'Documents ready', value: readyDocuments, detail: `${signatureQueue} signatures`, icon: FileText, trend: [5, 9, 11, 10, 14, readyDocuments] },
  ], [appointments.length, blockedTasks, openTasks, patients.length, readyDocuments, signatureQueue]);
  const highFlags = flags.filter((flag) => flag.severity === 'HIGH');
  const weekShape = [18, 24, 20, 29, 25, 21, completedFractions + active];

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
            <SignalField pulse={openTasks + signatureQueue} />
            <div className="dashboard-signal-content">
              <SectionTitle icon={Network} title="Live Clinical Signal Field" meta="Workflow pressure, treatment cadence, document readiness" />
              <div className="dashboard-signal-core">
                <span>Carepath load</span>
                <strong>{Math.round(((openTasks + signatureQueue + highFlags.length) / Math.max(carepathTasks.length + generatedDocuments.length, 1)) * 100)}%</strong>
                <p>{highFlags.length} high-priority flags across operational records</p>
              </div>
            </div>
          </article>
          <div className="dashboard-metric-grid">
            {metrics.map((metric) => <MetricTile key={metric.label} metric={metric} />)}
          </div>
        </div>

        <div className="dashboard-group dashboard-group-flow" data-panel="flow">
          <article className="dashboard-card dashboard-flow-card">
            <SectionTitle icon={Activity} title="Carepath Flow Simulation" meta="Compact state map" />
            <CarepathMap upcoming={upcoming} active={active} post={post} />
          </article>
          <article className="dashboard-card dashboard-phase-card">
            <SectionTitle icon={CheckCircle2} title="Course Distribution" meta="Upcoming / on treatment / post" />
            <PhaseDonut upcoming={upcoming} active={active} post={post} />
          </article>
          <article className="dashboard-card dashboard-throughput-card">
            <SectionTitle icon={PenLine} title="Weekly Throughput" meta="Fractions plus active load" />
            <div className="dashboard-bars">
              {weekShape.map((value, index) => (
                <span key={index} style={{ height: `${Math.max(18, (value / Math.max(...weekShape)) * 100)}%` }}>
                  <i>{value}</i>
                </span>
              ))}
            </div>
          </article>
        </div>

        <div className="dashboard-group dashboard-group-risk" data-panel="risk">
          <article className="dashboard-card dashboard-attention-card">
            <SectionTitle icon={AlertTriangle} title="Attention Queue" meta="Risk signals only" />
            {[
              { label: 'High-priority flags', value: highFlags.length, tone: 'var(--color-error)' },
              { label: 'Blocked tasks', value: blockedTasks, tone: 'var(--color-warning)' },
              { label: 'Pending signatures', value: signatureQueue, tone: 'var(--color-info)' },
              { label: 'Audit events today', value: auditEvents.length, tone: 'var(--color-primary)' },
            ].map((item) => (
              <div key={item.label} className="dashboard-attention-row">
                <span>{item.label}</span>
                <strong style={{ color: item.tone }}>{item.value}</strong>
              </div>
            ))}
          </article>
          <article className="dashboard-card dashboard-schedule-card">
            <SectionTitle icon={CalendarDays} title="Schedule Density" meta="Tokenized queue" />
            <div className="dashboard-schedule-grid">
              {appointments.slice(0, 8).map((appointment) => (
                <div key={appointment.id}>
                  <strong>{appointment.time}</strong>
                  <span>{appointment.displayLabel}</span>
                  <em>{appointment.title}</em>
                </div>
              ))}
            </div>
          </article>
          <article className="dashboard-card dashboard-guardrail-card">
            <SectionTitle icon={ShieldCheck} title="HIPAA Boundary" meta="Dashboard mode" />
            <p>Operational dashboard is using tokenized patient and course references. Identifiers stay outside this command-center view.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
