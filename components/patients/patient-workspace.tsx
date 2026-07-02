'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  ClipboardList,
  FileCheck2,
  Radiation,
  Route,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { DataTable } from '@/components/shared/data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { FractionWorksheetPanel } from '@/components/fraction-worksheet-panel';
import type {
  AuditCheck,
  AuditEvent,
  CarepathTask,
  ClinicalFormTemplate,
  Course,
  DocumentInstance,
  FractionLogEntry,
  GeneratedDocument,
  ImagingAsset,
  Patient,
  Phase6PlanningReadiness,
  PrescriptionPhase,
  Task,
  TreatmentCourse,
  TreatmentFraction,
  TreatmentPlan,
  WorkflowStep,
} from '@/lib/types';
import {
  carepathPhaseLabels,
  carepathProgress,
  cn,
  formatDate,
  responsiblePartyLabels,
} from '@/lib/workflow';
import { patientRef } from '@/lib/hipaa';
import { phaseTone, priorityTone, statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';
import {
  derivePatientWorkspaceState,
  type CourseGate,
  type PatientWorkspaceTab,
} from '@/lib/services/patient-workspace-service';

type PatientWorkspaceProps = {
  patient: Patient;
  course: TreatmentCourse;
  initialTab?: PatientWorkspaceTab;
  domainCourse?: Course;
  carepathTasks: CarepathTask[];
  generatedDocuments: GeneratedDocument[];
  fractionEntries: FractionLogEntry[];
  workflowSteps: WorkflowStep[];
  tasks: Task[];
  documents: DocumentInstance[];
  clinicalFormTemplates: ClinicalFormTemplate[];
  treatmentPlans: TreatmentPlan[];
  treatmentFractions: TreatmentFraction[];
  prescriptionPhases: PrescriptionPhase[];
  planningReadiness: Phase6PlanningReadiness;
  images: ImagingAsset[];
  auditChecks: AuditCheck[];
  auditEvents: AuditEvent[];
};

const tabs: Array<{ id: PatientWorkspaceTab; label: string; shortLabel?: string; icon: typeof ClipboardList }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'prepare', label: 'Prepare', icon: Route },
  { id: 'treatment', label: 'Treatment', icon: Radiation },
  { id: 'record-closeout', label: 'Record & Closeout', shortLabel: 'Closeout', icon: WalletCards },
];

function patientDisplayName(patient: Patient) {
  return `${patient.firstName} ${patient.lastName}`;
}

function currentPhaseLabel(course: TreatmentCourse) {
  if (course.chartRoundsPhase === 'UPCOMING') return 'Simulation';
  if (course.chartRoundsPhase === 'ON_TREATMENT') return 'On Treatment';
  return 'Post Treatment';
}

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--color-border-soft)]">
      <div
        className="h-full rounded-full bg-[var(--color-primary)]"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

function SectionTitle({ title, action, id }: { title: string; action?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 id={id} className="type-section-title">{title}</h2>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type PatientContextProps = {
  patient: Patient;
  course: TreatmentCourse;
  domainCourse?: Course;
  currentFraction: number;
  cumulativeDose: number;
  signalCount: number;
  nextAction: string;
  onOpenSignals: () => void;
};

function PatientContext({
  patient,
  course,
  domainCourse,
  currentFraction,
  cumulativeDose,
  signalCount,
  nextAction,
  onOpenSignals,
}: PatientContextProps) {
  return (
    <>
      <div className="patient-context-heading">
        <Link href="/patients" className="clinical-focus inline-flex items-center gap-2 type-supporting text-[var(--color-primary)]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Patients
        </Link>
        <div className="mt-3 min-w-0">
          <h1 className=" type-title text-[var(--color-text)]">
            {patientDisplayName(patient)}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={statusTone(patient.status)}>{formatUiLabel(patient.status)}</Badge>
            <Badge variant="neutral">Protected record</Badge>
          </div>
        </div>
      </div>

      <dl className="patient-context-details">
        <div>
          <dt>CRMS Reference</dt>
          <dd>{patientRef(patient.id)}</dd>
        </div>
        <div>
          <dt>External MRN</dt>
          <dd>{patient.mrn || 'Not recorded'}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{patient.location}</dd>
        </div>
      </dl>

      <div className="patient-context-section">
        <p className="clinical-label">Active Course</p>
        <p className="mt-2 type-body text-[var(--color-text)]">
          {domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'C')}
        </p>
        <p className="mt-1 type-body text-[var(--color-text)]">{course.protocolName}</p>
        <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
          {patient.diagnosisSummary ?? patient.diagnosis}
        </p>
      </div>

      <div className="patient-context-phase">
        <span>
          <span className="clinical-label block">Current phase</span>
          <strong>{currentPhaseLabel(course)}</strong>
        </span>
        <span className="patient-context-phase-mark" aria-hidden="true" />
      </div>

      <dl className="patient-context-facts">
        <div>
          <dt>Fractions</dt>
          <dd>{currentFraction}/{course.totalFractions}</dd>
        </div>
        <div>
          <dt>Logged Dose</dt>
          <dd>{cumulativeDose} cGy</dd>
        </div>
        <div>
          <dt>Signals</dt>
          <dd>{signalCount}</dd>
        </div>
      </dl>

      <div className="patient-context-next">
        <p className="clinical-label">Next Action</p>
        <p className="mt-2 type-body text-[var(--color-text)]">{nextAction}</p>
      </div>

      <Button type="button" variant="secondary" className="mt-auto w-full" onClick={onOpenSignals}>
        <Bell className="h-4 w-4" aria-hidden="true" />
        Course signals
        <Badge variant={signalCount ? 'intermediate' : 'positive'}>{signalCount}</Badge>
      </Button>
    </>
  );
}

function CourseGateBanner({ gate, action }: { gate: CourseGate; action?: React.ReactNode }) {
  const tone = gate.state === 'BLOCKED' ? 'negative' : gate.state === 'REVIEW_REQUIRED' ? 'intermediate' : 'positive';
  const title = gate.state === 'BLOCKED' ? 'Course Blocked' : gate.state === 'REVIEW_REQUIRED' ? 'Review Required' : 'Ready to Advance';

  return (
    <section className={`workspace-gate workspace-gate-${tone}`} aria-labelledby="course-gate-heading">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <h2 id="course-gate-heading" className="type-section-title">{title}</h2>
        </div>
        <p className="type-body mt-2 text-[var(--color-text)]">
          {gate.reasons[0] ?? 'All currently evaluated course requirements are clear.'}
        </p>
        {gate.reasons.length > 1 ? (
          <details className="workspace-gate-reasons mt-2">
            <summary className="clinical-focus type-meta cursor-pointer text-[var(--color-primary)]">
              Show {gate.reasons.length - 1} additional reason{gate.reasons.length === 2 ? '' : 's'}
            </summary>
            <ul className="type-meta mt-2 grid gap-1 pl-5">
              {gate.reasons.slice(1).map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
          </details>
        ) : null}
        {gate.state !== 'READY' ? (
          <p className="type-meta mt-1">Complete the listed requirement, then the course gate refreshes automatically.</p>
        ) : null}
        <p className="type-meta mt-1">Last evaluated {formatDate(gate.evaluatedAt)}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </section>
  );
}

const workspacePhases = ['Consultation', 'Chart Prep', 'Simulation', 'Planning', 'On Treatment', 'Post-Tx', 'Audit', 'Closed'];

type PatientWorkspaceNavigationProps = {
  activeTab: PatientWorkspaceTab;
  orientation: 'horizontal' | 'vertical';
  onTabChange: (tab: PatientWorkspaceTab) => void;
};

function PatientWorkspaceNavigation({ activeTab, orientation, onTabChange }: PatientWorkspaceNavigationProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const horizontal = orientation === 'horizontal';

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const previousKey = horizontal ? 'ArrowLeft' : 'ArrowUp';
    const nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
    if (![previousKey, nextKey, 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === nextKey
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    onTabChange(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <div
      className={cn('patient-workspace-navigation', `patient-workspace-navigation-${orientation}`, horizontal && 'scrollbar-soft')}
      role="tablist"
      aria-label="Patient Workspace Sections"
      aria-orientation={orientation}
    >
      {tabs.map((tab, index) => {
        const Icon = tab.icon;
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            id={`patient-${orientation}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`patient-panel-${tab.id}`}
            aria-keyshortcuts={`Alt+${index + 1}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn('patient-workspace-nav-item clinical-focus type-item-title', selected && 'patient-workspace-nav-item-selected')}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="patient-workspace-nav-label">{tab.label}</span>
            {tab.shortLabel ? <span className="patient-workspace-nav-short-label">{tab.shortLabel}</span> : null}
            {orientation === 'vertical' ? <kbd className="patient-workspace-nav-shortcut">Alt {index + 1}</kbd> : null}
          </button>
        );
      })}
    </div>
  );
}

type PatientWorkspaceHeaderProps = {
  patient: Patient;
  course: TreatmentCourse;
  domainCourse?: Course;
  currentFraction: number;
  signalCount: number;
  courseGate: CourseGate;
  onOpenDetails: () => void;
  onOpenSignals: () => void;
};

function PatientWorkspaceHeader({
  patient,
  course,
  domainCourse,
  currentFraction,
  signalCount,
  courseGate,
  onOpenDetails,
  onOpenSignals,
}: PatientWorkspaceHeaderProps) {
  const gateTone = courseGate.state === 'BLOCKED' ? 'negative' : courseGate.state === 'REVIEW_REQUIRED' ? 'intermediate' : 'positive';

  return (
    <header className="patient-workspace-header" aria-label="Patient and Active Course Context">
      <div className="patient-workspace-header-primary">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link href="/patients" className="clinical-focus type-meta inline-flex items-center gap-1.5 text-[var(--color-primary)]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Patients
            </Link>
            <span className="patient-workspace-header-divider" aria-hidden="true" />
            <h1 className="type-page-title truncate">{patientDisplayName(patient)}</h1>
            <Badge variant={statusTone(patient.status)}>{formatUiLabel(patient.status)}</Badge>
            <Badge variant="neutral">Protected record</Badge>
          </div>
          <dl className="patient-workspace-identifiers">
            <div><dt>External MRN</dt><dd>{patient.mrn || 'Not recorded'}</dd></div>
          </dl>
        </div>

        <div className="patient-workspace-header-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onOpenSignals}>
            <Bell className="h-4 w-4" aria-hidden="true" />
            Signals
            <Badge variant={signalCount ? 'intermediate' : 'positive'}>{signalCount}</Badge>
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onOpenDetails}>
            Patient details
          </Button>
        </div>
      </div>

      <div className="patient-workspace-course-row">
        <div className="patient-workspace-course-summary">
          <span className="type-label">Active Course</span>
          <strong className="type-item-title">{domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'Course ')}</strong>
          <span className="type-meta">{course.protocolName}</span>
        </div>
        <dl className="patient-workspace-course-facts">
          <div><dt>Phase</dt><dd>{currentPhaseLabel(course)}</dd></div>
          <div><dt>Logged</dt><dd>{currentFraction}/{course.totalFractions} fractions</dd></div>
          <div><dt>Course Gate</dt><dd><Badge variant={gateTone}>{formatUiLabel(courseGate.state)}</Badge></dd></div>
        </dl>
      </div>
    </header>
  );
}

type PatientWorkspaceSidebarProps = PatientWorkspaceHeaderProps & {
  activeTab: PatientWorkspaceTab;
  onTabChange: (tab: PatientWorkspaceTab) => void;
};

function PatientWorkspaceSidebar({
  patient,
  course,
  domainCourse,
  currentFraction,
  signalCount,
  courseGate,
  activeTab,
  onTabChange,
  onOpenDetails,
  onOpenSignals,
}: PatientWorkspaceSidebarProps) {
  const gateTone = courseGate.state === 'BLOCKED' ? 'negative' : courseGate.state === 'REVIEW_REQUIRED' ? 'intermediate' : 'positive';

  return (
    <aside className="patient-workspace-sidebar clinical-surface" aria-label="Patient and Active Course Context">
      <Link href="/patients" className="clinical-focus type-meta inline-flex min-h-11 items-center gap-1.5 text-[var(--color-primary)]">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Patients
      </Link>

      <section className="patient-workspace-sidebar-section patient-workspace-sidebar-identity">
        <h1 className="type-page-title break-words">{patientDisplayName(patient)}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant={statusTone(patient.status)}>{formatUiLabel(patient.status)}</Badge>
          <Badge variant="neutral">Protected record</Badge>
        </div>
        <dl className="mt-3">
          <div><dt>External MRN</dt><dd>{patient.mrn || 'Not recorded'}</dd></div>
        </dl>
      </section>

      <section className="patient-workspace-sidebar-section patient-workspace-sidebar-course">
        <p className="type-label">Active Course</p>
        <p className="type-item-title mt-1">{domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'Course ')}</p>
        <p className="type-meta patient-workspace-sidebar-diagnosis mt-1">{course.protocolName} · {patient.diagnosisSummary ?? patient.diagnosis}</p>
        <div className="patient-workspace-sidebar-gate mt-3">
          <span className="type-label">Course Gate</span>
          <Badge variant={gateTone}>{formatUiLabel(courseGate.state)}</Badge>
        </div>
        <dl className="patient-workspace-sidebar-facts mt-3">
          <div><dt>Phase</dt><dd>{currentPhaseLabel(course)}</dd></div>
          <div><dt>Logged</dt><dd>{currentFraction}/{course.totalFractions} fractions</dd></div>
        </dl>
      </section>

      <nav className="patient-workspace-sidebar-section" aria-label="Patient Workspace">
        <PatientWorkspaceNavigation activeTab={activeTab} orientation="vertical" onTabChange={onTabChange} />
      </nav>

      <div className="patient-workspace-sidebar-actions">
        <Button type="button" variant="secondary" size="sm" onClick={onOpenSignals}>
          <Bell className="h-4 w-4" aria-hidden="true" />
          Signals
          <Badge variant={signalCount ? 'intermediate' : 'positive'}>{signalCount}</Badge>
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onOpenDetails}>
          Patient details
        </Button>
      </div>
    </aside>
  );
}

export function PatientWorkspace({
  patient,
  course,
  initialTab = 'overview',
  domainCourse,
  carepathTasks,
  generatedDocuments,
  fractionEntries,
  workflowSteps: allWorkflowSteps,
  tasks,
  documents,
  clinicalFormTemplates,
  treatmentPlans,
  treatmentFractions,
  prescriptionPhases,
  planningReadiness,
  images,
  auditChecks,
  auditEvents,
}: PatientWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<PatientWorkspaceTab>(initialTab);
  const [signalsOpen, setSignalsOpen] = useState(false);
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
  const [workflowStepState, setWorkflowStepState] = useState(allWorkflowSteps);
  const selectTab = useCallback((tab: PatientWorkspaceTab) => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.pushState({ patientWorkspaceTab: tab }, '', url);
  }, []);
  useEffect(() => {
    function handleWorkspaceShortcut(event: globalThis.KeyboardEvent) {
      if (!event.altKey || event.ctrlKey || event.metaKey || !/^[1-4]$/.test(event.key)) return;
      if (document.querySelector('[role="dialog"]')) return;
      const nextTab = tabs[Number(event.key) - 1];
      if (!nextTab) return;
      event.preventDefault();
      selectTab(nextTab.id);
    }

    function handleHistoryChange() {
      const url = new URL(window.location.href);
      const requestedTab = url.searchParams.get('tab');
      setActiveTab(tabs.some((tab) => tab.id === requestedTab) ? requestedTab as PatientWorkspaceTab : 'overview');
    }

    window.addEventListener('keydown', handleWorkspaceShortcut);
    window.addEventListener('popstate', handleHistoryChange);
    return () => {
      window.removeEventListener('keydown', handleWorkspaceShortcut);
      window.removeEventListener('popstate', handleHistoryChange);
    };
  }, [selectTab]);
  const workspaceState = useMemo(
    () => derivePatientWorkspaceState({
      course,
      fallbackNextAction: patient.nextAction,
      workflowSteps: workflowStepState,
      tasks,
      carepathTasks,
      documents,
      generatedDocuments,
      fractionEntries,
      treatmentFractions,
      planningReadiness,
      auditChecks,
    }),
    [
      auditChecks,
      carepathTasks,
      course,
      documents,
      fractionEntries,
      generatedDocuments,
      patient.nextAction,
      planningReadiness,
      tasks,
      treatmentFractions,
      workflowStepState,
    ],
  );
  const {
    workflowSteps,
    blockedSteps,
    urgentTasks,
    approvedFractions,
    unsignedDocuments: unsignedDocs,
    openAuditChecks: openChecks,
    missingImageFractions,
    otvDueFractions,
    physicsDueFractions,
    upcomingScheduledFractions: scheduledFractions,
    currentFraction,
    cumulativeDose,
    readiness,
  } = workspaceState;
  const [selectedCarepathStepId, setSelectedCarepathStepId] = useState(workspaceState.workflowSteps[0]?.id ?? '');
  const currentPlan = treatmentPlans[0];
  const carepath = carepathProgress(carepathTasks);
  const clinicalValidationChecklist = planningReadiness.clinicalValidationChecklist;
  const selectedCarepathStep = useMemo(
    () => workflowSteps.find((step) => step.id === selectedCarepathStepId) ?? workflowSteps[0],
    [selectedCarepathStepId, workflowSteps],
  );
  const selectedCarepathAction = useMemo(
    () => selectedCarepathStep ? carepathStepAction(selectedCarepathStep) : null,
    [selectedCarepathStep],
  );
  const completeSelectedCarepathStep = useCallback(async ({ notes }: { notes: string }) => {
    if (!selectedCarepathStep) return;
    const nextStatus = selectedCarepathStep.requiresSignature ? 'SIGNED' : 'COMPLETED';
    const response = await fetch(`/api/workflow/steps/${encodeURIComponent(selectedCarepathStep.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        changeReason: notes || `${selectedCarepathAction?.label ?? 'Complete step'} from patient workspace`,
        expectedUpdatedAt: selectedCarepathStep.updatedAt,
      }),
    });
    const payload = await response.json() as { message?: string; blockers?: string[] };
    if (!response.ok) throw new Error(payload.blockers?.[0] ?? payload.message ?? 'The workflow step could not be updated.');
    const updatedAt = new Date().toISOString();
    setWorkflowStepState((steps) => steps.map((step) => step.id === selectedCarepathStep.id ? {
      ...step,
      status: nextStatus,
      signedAt: selectedCarepathStep.requiresSignature ? updatedAt : step.signedAt,
      updatedAt,
    } : step));
  }, [selectedCarepathAction?.label, selectedCarepathStep]);
  const reopenSelectedCarepathStep = useCallback(async ({ notes }: { notes: string }) => {
    if (!selectedCarepathStep) return;
    const response = await fetch(`/api/workflow/steps/${encodeURIComponent(selectedCarepathStep.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'IN_PROGRESS',
        reopenReason: notes,
        changeReason: notes,
        expectedUpdatedAt: selectedCarepathStep.updatedAt,
      }),
    });
    const payload = await response.json() as { message?: string; blockers?: string[] };
    if (!response.ok) throw new Error(payload.blockers?.[0] ?? payload.message ?? 'The workflow step could not be reopened.');
    const updatedAt = new Date().toISOString();
    setWorkflowStepState((steps) => steps.map((step) => step.id === selectedCarepathStep.id ? {
      ...step,
      status: 'IN_PROGRESS',
      signedAt: undefined,
      signedByUserId: undefined,
      updatedAt,
    } : step));
  }, [selectedCarepathStep]);
  const relatedCarepathWorkItems = useMemo(
    () => selectedCarepathStep
      ? tasks.filter((task) => task.workflowStepId === selectedCarepathStep.id)
      : [],
    [selectedCarepathStep, tasks],
  );
  const openAttentionItem = useCallback((item: {
    tab: PatientWorkspaceTab;
    targetKind?: 'step' | 'fraction' | 'document' | 'audit';
    targetId?: string;
  }) => {
    if (item.targetKind === 'step' && item.targetId) setSelectedCarepathStepId(item.targetId);
    selectTab(item.tab);
    if (!item.targetKind || !item.targetId) return;

    window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
      const target = document.getElementById(`workspace-target-${item.targetKind}-${item.targetId}`);
      if (!target) return;
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.focus({ preventScroll: true });
      if (item.targetKind === 'fraction') target.click();
    }));
  }, [selectTab]);
  const attentionItems = useMemo(() => workspaceState.actions.map((action) => ({
    id: action.id,
    title: action.label,
    detail: action.blocking ? 'This item blocks course advancement.' : 'Review the required patient-course work.',
    meta: `${action.owner}${action.due ? ` · Due ${formatDate(action.due)}` : ''}`,
    tone: action.blocking ? 'negative' as const : 'intermediate' as const,
    tab: action.destination,
    targetKind: action.targetKind,
    targetId: action.targetId,
  })), [workspaceState.actions]);
  const attentionGroups = useMemo(() => [
    { id: 'blocking', label: 'Blocking Course Progress', items: attentionItems.filter((item) => item.tone === 'negative') },
    { id: 'prepare', label: 'Preparation Work', items: attentionItems.filter((item) => item.tone !== 'negative' && item.tab === 'prepare') },
    { id: 'treatment', label: 'Treatment Work', items: attentionItems.filter((item) => item.tone !== 'negative' && item.tab === 'treatment') },
    { id: 'record', label: 'Record and Closeout Work', items: attentionItems.filter((item) => item.tone !== 'negative' && item.tab === 'record-closeout') },
  ].filter((group) => group.items.length > 0), [attentionItems]);

  const tabContent = useMemo(() => {
    if (activeTab === 'prepare') {
      return (
        <div className="grid min-w-0 gap-4">
          <div className="prepare-workbench-layout">
            <section className="clinical-surface overflow-hidden" aria-labelledby="course-path-heading">
              <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
                <h2 id="course-path-heading" className="type-section-title">Preparation Path</h2>
                <p className="type-meta mt-1">{blockedSteps.length} blocked · {urgentTasks.length} priority</p>
              </div>
              <div className="prepare-step-groups">
                {(['CONSULTATION', 'CHART_PREP', 'SIMULATION', 'PLANNING'] as const).map((phase) => {
                  const phaseSteps = workflowSteps.filter((step) => step.phase === phase);
                  if (!phaseSteps.length) return null;
                  return (
                    <section key={phase} className="prepare-step-group" aria-labelledby={`prepare-phase-${phase}`}>
                      <h3 id={`prepare-phase-${phase}`} className="type-label">{carepathPhaseLabels[phase]}</h3>
                      <div className="grid gap-1.5">
                        {phaseSteps.map((step) => (
                          <button
                            key={step.id}
                            id={`workspace-target-step-${step.id}`}
                            type="button"
                            onClick={() => setSelectedCarepathStepId(step.id)}
                            className={cn('prepare-step clinical-focus', step.id === selectedCarepathStep?.id && 'prepare-step-selected')}
                            aria-pressed={step.id === selectedCarepathStep?.id}
                          >
                            <span className="prepare-step-index">{step.stepNumber}</span>
                            <span className="min-w-0 flex-1 text-left">
                              <span className="type-item-title block truncate">{step.stepName}</span>
                              <span className="type-meta mt-0.5 block truncate">{responsiblePartyLabels[step.responsibleRole]} · {step.dueDate ? formatDate(step.dueDate) : step.triggerEvent}</span>
                            </span>
                            <Badge variant={statusTone(step.status)}>{formatUiLabel(step.status)}</Badge>
                          </button>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>

            <Card className="self-start">
              {selectedCarepathStep ? (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="clinical-label">Selected Carepath Step</p>
                      <h3 className="mt-1 type-heading text-[var(--color-text)]">
                        {selectedCarepathStep.stepNumber}. {selectedCarepathStep.stepName}
                      </h3>
                      <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                        {selectedCarepathStep.dueDate ? `Due ${formatDate(selectedCarepathStep.dueDate)}` : selectedCarepathStep.triggerEvent}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge variant={phaseTone(selectedCarepathStep.phase)}>{carepathPhaseLabels[selectedCarepathStep.phase]}</Badge>
                      <Badge variant={statusTone(selectedCarepathStep.status)}>{formatUiLabel(selectedCarepathStep.status)}</Badge>
                    </div>
                  </div>

                  <div className="clinical-muted-surface p-3">
                    <p className="clinical-label">Next Action</p>
                    <p className="mt-2 type-body text-[var(--color-text)]">{selectedCarepathAction?.label ?? 'Review step'}</p>
                    <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                      {selectedCarepathAction?.detail ?? selectedCarepathStep.notes ?? selectedCarepathStep.triggerEvent}
                    </p>
                    {selectedCarepathAction ? (
                      <div className="mt-3">
                        <PrototypeActionButton
                          label={selectedCarepathAction.label}
                          icon={selectedCarepathAction.icon}
                          kind={selectedCarepathAction.kind}
                          variant="primary"
                          description={selectedCarepathAction.detail}
                          context={`${selectedCarepathStep.stepNumber}. ${selectedCarepathStep.stepName}`}
                          onComplete={['COMPLETED', 'SIGNED', 'CLOSED'].includes(selectedCarepathStep.status) ? undefined : completeSelectedCarepathStep}
                          successMessage="The workflow step was updated and the course gate was refreshed."
                        />
                        {['COMPLETED', 'SIGNED', 'CLOSED'].includes(selectedCarepathStep.status) ? (
                          <PrototypeActionButton
                            label="Reopen for Correction"
                            icon="refresh"
                            kind="review"
                            variant="secondary"
                            className="mt-2"
                            description="Reopen this completed step only when a documented correction is required."
                            context={`${selectedCarepathStep.stepNumber}. ${selectedCarepathStep.stepName}`}
                            onComplete={reopenSelectedCarepathStep}
                            requireNotes
                            successMessage="The workflow step was reopened and the correction reason was recorded."
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <div className="clinical-muted-surface p-3">
                      <p className="clinical-label">Owner</p>
                      <p className="mt-1 type-body text-[var(--color-text)]">
                        {selectedCarepathStep.assignedUserId ?? responsiblePartyLabels[selectedCarepathStep.responsibleRole]}
                      </p>
                    </div>
                    <div className="clinical-muted-surface p-3">
                      <p className="clinical-label">Signature</p>
                      <p className="mt-1 type-body text-[var(--color-text)]">
                        {selectedCarepathStep.requiresSignature ? selectedCarepathStep.signedAt ? 'Signed' : 'Required' : 'Not required'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Step Evidence" />
                    <div className="grid gap-2">
                      {(selectedCarepathStep.auditChecklist.length ? selectedCarepathStep.auditChecklist : ['Owner assigned', 'Evidence traceable']).map((item) => (
                        <div key={item} className="clinical-muted-surface flex min-w-0 items-center justify-between gap-3 p-3">
                          <span className="min-w-0 type-body text-[var(--color-text)]">{item}</span>
                          <Badge variant={selectedCarepathStep.status === 'COMPLETED' || selectedCarepathStep.status === 'SIGNED' ? 'positive' : 'intermediate'}>
                            {selectedCarepathStep.status === 'COMPLETED' || selectedCarepathStep.status === 'SIGNED' ? 'Ready' : 'Check'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Related Work Items" />
                    <div className="space-y-2">
                      {relatedCarepathWorkItems.map((task) => (
                        <div key={task.id} className="clinical-muted-surface p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate type-body text-[var(--color-text)]">{task.title}</p>
                              <p className="mt-1 line-clamp-2 type-supporting text-[var(--color-text-muted)]">{task.description}</p>
                              <p className="mt-2 type-supporting text-[var(--color-text-muted)]">
                                {task.assignedUserId ?? responsiblePartyLabels[task.assignedRole]} · {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Badge variant={priorityTone(task.priority)}>{task.priority}</Badge>
                              <Badge variant={statusTone(task.status)}>{formatUiLabel(task.status)}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      {relatedCarepathWorkItems.length === 0 ? (
                        <div className="clinical-muted-surface p-4 type-body text-[var(--color-text-muted)]">
                          No separate task rows are attached to this step. Use the next action above as the source of truth for this patient.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="clinical-muted-surface p-4 type-body text-[var(--color-text-muted)]">
                  Select a carepath step to review the required action.
                </div>
              )}
            </Card>
          </div>
        </div>
      );
    }

    if (activeTab === 'record-closeout') {
      return (
        <div className="grid min-w-0 gap-4">
          <CourseGateBanner
            gate={workspaceState.courseGate}
            action={(
              <Button type="button" onClick={() => document.getElementById('closure-readiness')?.scrollIntoView({ block: 'start' })}>
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                {openChecks.length ? 'Review closeout blockers' : 'Review course closure'}
              </Button>
            )}
          />
          <section id="closure-readiness" className="clinical-surface scroll-mt-3 p-4" aria-labelledby="closure-readiness-heading">
            <SectionTitle id="closure-readiness-heading" title="Closure Readiness" />
            <dl className="closure-readiness-grid">
              <div><dt>Documents & Signatures</dt><dd>{unsignedDocs.length ? `${unsignedDocs.length} pending` : 'Clear'}</dd></div>
              <div><dt>eClinicalWorks Uploads (eCW)</dt><dd>{documents.filter((document) => !document.uploadedToEcwAt && !document.ecwUploadReference).length} pending</dd></div>
              <div><dt>Treatment Completion</dt><dd>{currentFraction}/{course.totalFractions} logged</dd></div>
              <div><dt>Audit Checks</dt><dd>{openChecks.length ? `${openChecks.length} open` : 'Clear'}</dd></div>
              <div><dt>Billing Evidence</dt><dd>{documents.some((document) => document.category === 'BILLING') ? 'Recorded' : 'Review Required'}</dd></div>
              <div><dt>AVS & Follow-Up</dt><dd>{workflowSteps.some((step) => step.phase === 'POST_TX' && ['COMPLETED', 'SIGNED'].includes(step.status)) ? 'Recorded' : 'Pending'}</dd></div>
            </dl>
          </section>
          <DataTable
            keyField="id"
            pageSize={0}
            className="min-h-[360px]"
            minTableWidth="1240px"
            search={{ placeholder: 'Search documents...', keys: ['title', 'category', 'status'] }}
            toolbarPrefix={
              <div className="min-w-[220px]">
                <p className=" type-body text-[var(--color-text)]">Course documents</p>
                <p className="type-meta mt-1">Generate, review, sign, and transfer course records.</p>
              </div>
            }
            toolbarActions={<PrototypeActionButton label="Generate Document" icon="file" kind="document" description="Queue a simulated document render from mapped course fields." />}
            columns={[
              { key: 'title', label: 'Document', render: (row) => <span className="type-medium">{row.title}</span> },
              { key: 'category', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.category)}>{formatUiLabel(row.category)}</Badge> },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{formatUiLabel(row.status)}</Badge> },
              { key: 'output', label: 'Output', render: (row) => (
                <div className="flex flex-wrap gap-1">
                  <Badge variant={row.outputStatus ? statusTone(row.outputStatus) : 'neutral'}>{row.outputStatus ? formatUiLabel(row.outputStatus) : 'No Output'}</Badge>
                  {row.manualEditExceptionAt ? <Badge variant="intermediate">Manual Edit</Badge> : null}
                </div>
              ) },
              { key: 'version', label: 'Version' },
              { key: 'signed', label: 'Signature', render: (row) => <Badge variant={row.signed ? 'positive' : 'intermediate'}>{row.signed ? 'Signed' : 'Pending'}</Badge> },
              { key: 'ecw', label: 'eClinicalWorks (eCW)', render: (row) => <Badge variant={row.uploadedToEcwAt || row.ecwUploadReference ? 'positive' : 'neutral'}>{row.uploadedToEcwAt || row.ecwUploadReference ? 'Uploaded' : 'Pending'}</Badge> },
              { key: 'updated', label: 'Updated' },
            ]}
            rows={documents.map((document) => ({
              id: document.id,
              title: document.title,
              category: document.category,
              status: document.status,
              outputStatus: document.latestOutputStatus,
              manualEditExceptionAt: document.manualEditExceptionAt,
              version: `v${document.version}`,
              signed: Boolean(document.signedAt),
              uploadedToEcwAt: document.uploadedToEcwAt,
              ecwUploadReference: document.ecwUploadReference,
              updated: document.generatedAt ? formatDate(document.generatedAt) : 'Pending',
            }))}
            getRowId={(row) => `workspace-target-document-${row.id}`}
            empty="No document records are available for this patient course."
            emptyDescription="Generated or uploaded documents will appear after document requirements are initialized."
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <Card compact>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle title="Clinical Forms" />
                <PrototypeActionButton label="Open Form Builder" icon="file" kind="create" description="Open a prototype structured-form workflow for this course." />
              </div>
              <div className="mt-3 grid gap-2">
                {clinicalFormTemplates.slice(0, 4).map((template) => (
                  <div key={template.id} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate type-body text-[var(--color-text)]">{template.name}</span>
                      <span className="type-supporting text-[var(--color-text-muted)]">{template.diagnosisType}</span>
                    </span>
                    <Badge variant="neutral">{template.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                ))}
                {clinicalFormTemplates.length === 0 ? (
                  <div className="clinical-muted-surface p-4 type-body text-[var(--color-text-muted)]">
                    No clinical form templates are available for this workspace.
                  </div>
                ) : null}
              </div>
            </Card>

            <Card compact>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className=" type-heading text-[var(--color-text)]">Outstanding Closeout</h2>
                <Badge variant={openChecks.length ? 'intermediate' : 'positive'}>{openChecks.length ? `${openChecks.length} open` : 'Clear'}</Badge>
              </div>
              <div className="space-y-2">
                {(openChecks.length ? openChecks : auditChecks).map((check) => (
                  <div id={`workspace-target-audit-${check.id}`} tabIndex={-1} key={check.id} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate type-body text-[var(--color-text)]">{check.label}</p>
                      <p className="type-supporting text-[var(--color-text-muted)]">{check.category}</p>
                    </div>
                    <Badge variant={statusTone(check.status)}>{formatUiLabel(check.status)}</Badge>
                  </div>
                ))}
                {auditChecks.length === 0 ? (
                  <div className="clinical-muted-surface p-4 type-body text-[var(--color-text-muted)]">
                    No audit checks are available for this patient course.
                  </div>
                ) : null}
              </div>
              {openChecks.length > 0 && auditChecks.length > openChecks.length ? (
                <details className="mt-3 border-t border-[var(--color-border-soft)] pt-3">
                  <summary className="clinical-focus cursor-pointer type-supporting text-[var(--color-primary)]">
                    Show {auditChecks.length - openChecks.length} completed check(s)
                  </summary>
                  <div className="mt-3 space-y-2">
                    {auditChecks.filter((check) => !openChecks.includes(check)).map((check) => (
                      <div id={`workspace-target-audit-${check.id}`} tabIndex={-1} key={check.id} className="flex items-center justify-between gap-3 px-1 py-2">
                        <span className="type-body text-[var(--color-text)]">{check.label}</span>
                        <Badge variant={statusTone(check.status)}>{formatUiLabel(check.status)}</Badge>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </Card>
          </div>

          <section className="clinical-surface overflow-hidden" aria-labelledby="activity-heading">
            <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
              <h2 id="activity-heading" className=" type-heading text-[var(--color-text)]">Activity</h2>
              <p className="mt-1 type-supporting text-[var(--color-text-muted)]">Redacted course and patient record events.</p>
            </div>
            <div className="divide-y divide-[var(--color-border-soft)]">
              {auditEvents.map((event) => (
                <div key={event.id} className="grid gap-2 px-4 py-3 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
                  <div className="min-w-0">
                    <time className="type-meta" dateTime={event.timestamp}>{formatDate(event.timestamp)}</time>
                    <p className="type-item-title mt-1 truncate">{event.userName}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="type-item-title">{event.action}</p>
                    <p className="type-meta mt-1">{event.reason || `Updated ${formatUiLabel(event.entityType)} record`}</p>
                  </div>
                </div>
              ))}
              {auditEvents.length === 0 ? (
                <div className="p-5 type-body text-[var(--color-text-muted)]">
                  No redacted activity events are available for this patient course.
                </div>
              ) : null}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'treatment') {
      return (
        <div className="grid min-w-0 gap-4">
          <CourseGateBanner
            gate={workspaceState.courseGate}
            action={(
              <Button type="button" onClick={() => document.getElementById('fraction-workflow')?.scrollIntoView({ block: 'start' })}>
                <FileCheck2 className="h-4 w-4" aria-hidden="true" />
                {workspaceState.courseGate.state === 'READY' ? 'Record next fraction' : 'Review treatment requirements'}
              </Button>
            )}
          />
          <div id="fraction-workflow" className="scroll-mt-3">
            <FractionWorksheetPanel
              initialEntries={fractionEntries}
              course={course}
              phases={prescriptionPhases}
              scheduledFractions={treatmentFractions}
              title="Fraction Worksheet"
            />
          </div>

          <Card compact>
            <SectionTitle title="Treatment Status" />
            <dl className="workspace-snapshot-grid">
              <div><dt>Upcoming Scheduled</dt><dd>{scheduledFractions.length}</dd></div>
              <div><dt>Logged Dose</dt><dd>{cumulativeDose} cGy</dd></div>
              <div><dt>Imaging</dt><dd>{missingImageFractions.length ? `${missingImageFractions.length} missing` : 'Clear'}</dd></div>
              <div><dt>On-Treatment Visit</dt><dd>{otvDueFractions.length ? `${otvDueFractions.length} due` : 'Clear'}</dd></div>
              <div><dt>Physics</dt><dd>{physicsDueFractions.length ? `${physicsDueFractions.length} due` : 'Clear'}</dd></div>
              <div><dt>Plan</dt><dd>{currentPlan?.lockedAt ? 'Locked' : 'Open'}</dd></div>
            </dl>
          </Card>

          <details className="clinical-surface overflow-hidden" open={clinicalValidationChecklist.productionUseBlocked}>
            <summary className="clinical-focus flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span>
                <span className="block type-body text-[var(--color-text)]">Plan and Phase 6 Readiness</span>
                <span className="mt-1 block type-supporting text-[var(--color-text-muted)]">
                  Reference {clinicalValidationChecklist.referenceVersion}
                </span>
              </span>
              <Badge variant={clinicalValidationChecklist.productionUseBlocked ? 'intermediate' : 'positive'}>
                {clinicalValidationChecklist.productionUseBlocked ? 'Clinical Validation Required' : planningReadiness.clinicianSignoffStatus}
              </Badge>
            </summary>
            <div className="border-t border-[var(--color-border-soft)] p-4">
              <dl className="workspace-snapshot-grid">
                <div><dt>Site</dt><dd>{currentPlan?.site ?? course.diagnosis}</dd></div>
                <div><dt>Energy</dt><dd>{currentPlan?.energy ?? course.energy ?? 'Pending'}</dd></div>
                <div><dt>Applicator</dt><dd>{currentPlan?.applicatorSize ?? course.applicator ?? 'Pending'}</dd></div>
                <div><dt>Dose per Fraction</dt><dd>{currentPlan?.dosePerFraction ?? course.dose ?? 'Pending'}</dd></div>
                <div><dt>Target Depth</dt><dd>{currentPlan?.depthOfInvasion ?? course.targetDepth ?? 'Pending'}</dd></div>
                <div><dt>Coverage</dt><dd>{currentPlan?.percentDepthDose ? `${currentPlan.percentDepthDose}%` : 'Pending'}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className=" type-heading text-[var(--color-text)]">Clinical Sign-Off Gate</h3>
                <Badge variant={clinicalValidationChecklist.productionUseBlocked ? 'intermediate' : 'positive'}>
                  {planningReadiness.clinicianSignoffStatus}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {clinicalValidationChecklist.items.map((item) => (
                  <div key={item.id} className="clinical-muted-surface flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="type-body text-[var(--color-text)]">{item.label}</p>
                      <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                        {responsiblePartyLabels[item.ownerRole]} evidence required
                      </p>
                    </div>
                    <Badge variant="intermediate">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </details>

          <DataTable
            keyField="id"
            pageSize={0}
            className="min-h-[320px]"
            minTableWidth="980px"
            search={{ placeholder: 'Search imaging evidence...', keys: ['category', 'phase', 'notes'] }}
            toolbarPrefix={
              <div className="min-w-[220px]">
                <p className="clinical-label">Imaging Evidence</p>
                <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{missingImageFractions.length} missing image gate(s)</p>
              </div>
            }
            toolbarActions={<PrototypeActionButton label="Attach Image" icon="upload" kind="upload" description="Stage imaging evidence linked to this course." />}
            columns={[
              { key: 'category', label: 'Image / Evidence', render: (row) => <span className="type-medium">{row.category}</span> },
              { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.phase)}>{formatUiLabel(row.phase)}</Badge> },
              { key: 'uploaded', label: 'Uploaded' },
              { key: 'uploader', label: 'Uploaded By' },
              { key: 'notes', label: 'Notes', render: (row) => <span className="line-clamp-2 text-[var(--color-text-muted)]">{row.notes}</span> },
            ]}
            rows={images.map((image) => ({
              id: image.id,
              category: image.category,
              phase: image.phase,
              uploaded: image.uploadedAt ? formatDate(image.uploadedAt) : 'Pending',
              uploader: image.uploadedByUserId ?? 'Unassigned',
              notes: image.notes ?? 'No notes',
            }))}
            empty="No imaging evidence is available for this patient course."
            emptyDescription="Tagged imaging assets will appear after they are attached to the course."
          />

        </div>
      );
    }

    return (
      <div className="grid min-w-0 gap-4">
        <CourseGateBanner
          gate={workspaceState.courseGate}
          action={(
            <Button type="button" onClick={() => selectTab(workspaceState.nextAction.destination)}>
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              {workspaceState.nextAction.label}
            </Button>
          )}
        />

        <section className="clinical-surface p-4" aria-labelledby="phase-progress-heading">
          <SectionTitle id="phase-progress-heading" title="Course Progress" />
          <div className="workspace-phase-scroll scrollbar-soft">
            <ol className="workspace-phase-tracker">
              {workspacePhases.map((phase, index) => {
                const currentIndex = Math.max(0, workspacePhases.indexOf(currentPhaseLabel(course)));
                const state = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';
                return <li key={phase} data-state={state}><span aria-hidden="true" />{phase}</li>;
              })}
            </ol>
          </div>
        </section>

        <section className="clinical-surface overflow-hidden" aria-labelledby="attention-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-4 py-3">
            <div>
              <h2 id="attention-heading" className=" type-heading text-[var(--color-text)]">Needs Attention</h2>
              <p className="mt-1 type-supporting text-[var(--color-text-muted)]">Blocking and role-ready work grouped by destination.</p>
            </div>
          </div>
          <div className="attention-groups">
            {attentionGroups.map((group) => (
              <details key={group.id} open={group.id === 'blocking'}>
                <summary className="clinical-focus attention-group-summary">
                  <span className="type-item-title">{group.label}</span>
                  <span className="type-meta">{group.items.length} item{group.items.length === 1 ? '' : 's'}</span>
                </summary>
                <div className="divide-y divide-[var(--color-border-soft)] border-t border-[var(--color-border-soft)]">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openAttentionItem(item)}
                      className="clinical-focus grid w-full gap-2 px-4 py-3 text-left transition hover:bg-[var(--color-hover)] md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-center"
                    >
                      <span className="min-w-0">
                        <span className="type-item-title block truncate">{item.title}</span>
                        <span className="type-meta mt-1 block line-clamp-2">{item.detail}</span>
                      </span>
                      <span className="type-meta">{item.meta}</span>
                      <span className="type-item-title justify-self-start text-[var(--color-primary)] md:justify-self-end">Open</span>
                    </button>
                  ))}
                </div>
              </details>
            ))}
            {attentionItems.length === 0 ? (
              <div className="p-5 type-body text-[var(--color-text-muted)]">No urgent course work is currently recorded.</div>
            ) : null}
          </div>
        </section>

        <section className="clinical-surface p-4" aria-labelledby="snapshot-heading">
          <SectionTitle id="snapshot-heading" title="Course Snapshot" />
          <dl className="workspace-snapshot-grid">
            <div><dt>Carepath</dt><dd>{carepath.completed}/{carepath.total} complete</dd></div>
            <div><dt>Documents</dt><dd>{unsignedDocs.length} unsigned</dd></div>
            <div><dt>Approvals</dt><dd>{approvedFractions.length}/{currentFraction} logged approved</dd></div>
            <div><dt>Imaging</dt><dd>{missingImageFractions.length ? `${missingImageFractions.length} missing` : 'Clear'}</dd></div>
            <div><dt>On-Treatment Visit</dt><dd>{otvDueFractions.length ? `${otvDueFractions.length} due` : 'Clear'}</dd></div>
            <div><dt>Physics</dt><dd>{physicsDueFractions.length ? `${physicsDueFractions.length} due` : 'Clear'}</dd></div>
          </dl>
        </section>

        <section className="clinical-surface overflow-hidden" aria-labelledby="recent-activity-heading">
          <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
            <h2 id="recent-activity-heading" className="type-section-title">Recent Course Activity</h2>
          </div>
          <div className="divide-y divide-[var(--color-border-soft)]">
            {auditEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="grid gap-1 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <div><p className="type-item-title">{event.action}</p><p className="type-meta mt-1">{event.userName}</p></div>
                <time className="type-meta" dateTime={event.timestamp}>{formatDate(event.timestamp)}</time>
              </div>
            ))}
            {auditEvents.length === 0 ? <p className="type-body p-4 text-[var(--color-text-muted)]">No course activity has been recorded.</p> : null}
          </div>
        </section>
      </div>
    );
  }, [
    activeTab,
    approvedFractions.length,
    auditChecks,
    auditEvents,
    blockedSteps,
    carepath.completed,
    carepath.total,
    clinicalFormTemplates,
    completeSelectedCarepathStep,
    course,
    currentPlan,
    cumulativeDose,
    documents,
    fractionEntries,
    images,
    clinicalValidationChecklist,
    missingImageFractions,
    openChecks,
    openAttentionItem,
    otvDueFractions,
    workspaceState.nextAction.label,
    workspaceState.nextAction.destination,
    workspaceState.courseGate,
    planningReadiness.clinicianSignoffStatus,
    physicsDueFractions,
    prescriptionPhases,
    readiness,
    scheduledFractions.length,
    selectTab,
    selectedCarepathAction,
    selectedCarepathStep,
    treatmentFractions,
    relatedCarepathWorkItems,
    reopenSelectedCarepathStep,
    attentionItems,
    attentionGroups,
    currentFraction,
    unsignedDocs,
    urgentTasks,
    workflowSteps,
  ]);

  const signalCount = workspaceState.actions.length;
  return (
    <div className="patient-workspace">
      <div className="patient-workspace-layout">
        <PatientWorkspaceSidebar
          patient={patient}
          course={course}
          domainCourse={domainCourse}
          currentFraction={currentFraction}
          signalCount={signalCount}
          courseGate={workspaceState.courseGate}
          activeTab={activeTab}
          onTabChange={selectTab}
          onOpenDetails={() => setPatientDetailsOpen(true)}
          onOpenSignals={() => setSignalsOpen(true)}
        />

        <main className="patient-workspace-main">
          <div className="patient-workspace-compact clinical-surface">
            <PatientWorkspaceHeader
              patient={patient}
              course={course}
              domainCourse={domainCourse}
              currentFraction={currentFraction}
              signalCount={signalCount}
              courseGate={workspaceState.courseGate}
              onOpenDetails={() => setPatientDetailsOpen(true)}
              onOpenSignals={() => setSignalsOpen(true)}
            />
            <PatientWorkspaceNavigation activeTab={activeTab} orientation="horizontal" onTabChange={selectTab} />
          </div>

          <section
            id={`patient-panel-${activeTab}`}
            role="tabpanel"
            aria-label={`${tabs.find((tab) => tab.id === activeTab)?.label ?? 'Patient'} workspace`}
            className="patient-workspace-surface patient-workspace-canvas"
          >
            <div className="min-w-0">{tabContent}</div>
          </section>
        </main>
      </div>

      <Modal open={signalsOpen} onClose={() => setSignalsOpen(false)} title="Course Signals" width={520}>
        <ContextRail
          urgentTasks={urgentTasks.length}
          blockedSteps={blockedSteps.length}
          unsignedDocs={unsignedDocs.length}
          openChecks={openChecks.length}
          readiness={readiness}
          nextAction={workspaceState.nextAction.label}
        />
      </Modal>

      <Modal open={patientDetailsOpen} onClose={() => setPatientDetailsOpen(false)} title="Patient Details" width={520}>
        <div className="patient-context-modal">
          <PatientContext
            patient={patient}
            course={course}
            domainCourse={domainCourse}
            currentFraction={currentFraction}
            cumulativeDose={cumulativeDose}
            signalCount={signalCount}
            nextAction={workspaceState.nextAction.label}
            onOpenSignals={() => {
              setPatientDetailsOpen(false);
              setSignalsOpen(true);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}

function carepathStepAction(step: WorkflowStep) {
  if (step.status === 'BLOCKED' || step.blockers.length > 0) {
    return {
      label: 'Resolve Blocker',
      detail: step.blockers[0] ?? step.notes ?? 'Clear the blocker before this course can advance.',
      kind: 'review' as const,
      icon: 'play' as const,
    };
  }

  if (step.status === 'COMPLETED' || step.status === 'SIGNED' || step.status === 'CLOSED') {
    return {
      label: 'Review Record',
      detail: 'This step is already complete. Open it only when a correction or audit check is needed.',
      kind: 'review' as const,
      icon: 'check' as const,
    };
  }

  if (step.requiresSignature && !step.signedAt) {
    return {
      label: 'Review & sign',
      detail: 'Review the generated evidence and capture the required signature before advancing.',
      kind: 'document' as const,
      icon: 'file' as const,
    };
  }

  if (step.linkedDocumentId || step.requirementIds?.length) {
    return {
      label: 'Generate Document',
      detail: 'Complete the mapped fields, preview the output, then finalize the generated document record.',
      kind: 'document' as const,
      icon: 'file' as const,
    };
  }

  return {
    label: 'Review Step',
    detail: step.notes ?? step.triggerEvent,
    kind: 'review' as const,
    icon: 'play' as const,
  };
}

function ContextRail({
  urgentTasks,
  blockedSteps,
  unsignedDocs,
  openChecks,
  readiness,
  nextAction,
}: {
  urgentTasks: number;
  blockedSteps: number;
  unsignedDocs: number;
  openChecks: number;
  readiness: number;
  nextAction: string;
}) {
  const signals = [
    { label: 'Urgent Tasks', value: urgentTasks, icon: AlertTriangle, variant: urgentTasks ? 'intermediate' : 'positive' },
    { label: 'Blocked Steps', value: blockedSteps, icon: Route, variant: blockedSteps ? 'negative' : 'positive' },
    { label: 'Unsigned Docs', value: unsignedDocs, icon: FileCheck2, variant: unsignedDocs ? 'intermediate' : 'positive' },
    { label: 'Open Audit Checks', value: openChecks, icon: ShieldCheck, variant: openChecks ? 'intermediate' : 'positive' },
  ] as const;

  return (
    <div className="min-w-0">
      <div className="divide-y divide-[var(--color-border-soft)] border-y border-[var(--color-border-soft)]">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div key={signal.label} className="flex items-center justify-between gap-3 py-3">
              <span className="flex min-w-0 items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                <span className="truncate type-body text-[var(--color-text)]">{signal.label}</span>
              </span>
              <Badge variant={signal.variant}>{signal.value}</Badge>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="clinical-label">Next Action</p>
        <p className="mt-2 type-body text-[var(--color-text)]">{nextAction}</p>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between type-supporting text-[var(--color-text-muted)]">
            <span>Closeout readiness</span>
            <span>{readiness}%</span>
          </div>
          <ProgressLine value={readiness} />
        </div>
      </div>
    </div>
  );
}
