'use client';

import Link from 'next/link';
import { useCallback, useMemo, useRef, useState, type KeyboardEvent } from 'react';
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

const tabs: Array<{ id: PatientWorkspaceTab; label: string; icon: typeof ClipboardList }> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'prepare', label: 'Prepare', icon: Route },
  { id: 'treatment', label: 'Treatment', icon: Radiation },
  { id: 'record-closeout', label: 'Record & Closeout', icon: WalletCards },
];

function patientDisplayName(patient: Patient) {
  return `${patient.firstName} ${patient.lastName}`;
}

function titleCase(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="type-section-title">{title}</h2>
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
        <Link href="/patients" className="clinical-focus inline-flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Patients
        </Link>
        <div className="mt-3 min-w-0">
          <h1 className="font-heading text-xl font-bold leading-tight text-[var(--color-text)]">
            {patientDisplayName(patient)}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant={statusTone(patient.status)}>{titleCase(patient.status)}</Badge>
            <Badge variant="primary">PHI controlled</Badge>
          </div>
        </div>
      </div>

      <dl className="patient-context-details">
        <div>
          <dt>CRMS reference</dt>
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
        <p className="clinical-label">Active course</p>
        <p className="mt-2 text-sm font-bold text-[var(--color-text)]">
          {domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'C')}
        </p>
        <p className="mt-1 text-sm font-semibold leading-5 text-[var(--color-text)]">{course.protocolName}</p>
        <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
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
          <dt>Logged dose</dt>
          <dd>{cumulativeDose} cGy</dd>
        </div>
        <div>
          <dt>Signals</dt>
          <dd>{signalCount}</dd>
        </div>
      </dl>

      <div className="patient-context-next">
        <p className="clinical-label">Next action</p>
        <p className="mt-2 text-sm font-bold leading-5 text-[var(--color-text)]">{nextAction}</p>
      </div>

      <Button type="button" variant="secondary" className="mt-auto w-full" onClick={onOpenSignals}>
        <Bell className="h-4 w-4" aria-hidden="true" />
        Course signals
        <Badge variant={signalCount ? 'warning' : 'success'}>{signalCount}</Badge>
      </Button>
    </>
  );
}

function CourseGateBanner({ gate, action }: { gate: CourseGate; action?: React.ReactNode }) {
  const tone = gate.state === 'BLOCKED' ? 'error' : gate.state === 'REVIEW_REQUIRED' ? 'warning' : 'success';
  const title = gate.state === 'BLOCKED' ? 'Course blocked' : gate.state === 'REVIEW_REQUIRED' ? 'Review required' : 'Ready to advance';

  return (
    <section className={`workspace-gate workspace-gate-${tone}`} aria-labelledby="course-gate-heading">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <h2 id="course-gate-heading" className="type-section-title">{title}</h2>
          <Badge variant={tone}>{titleCase(gate.state)}</Badge>
        </div>
        <p className="type-body mt-2 text-[var(--color-text)]">
          {gate.reasons.length ? gate.reasons.join(' ') : 'All currently evaluated course requirements are clear.'}
        </p>
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
      aria-label="Patient workspace sections"
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
            tabIndex={selected ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn('patient-workspace-nav-item clinical-focus type-item-title', selected && 'patient-workspace-nav-item-selected')}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span>{tab.label}</span>
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
  const gateTone = courseGate.state === 'BLOCKED' ? 'error' : courseGate.state === 'REVIEW_REQUIRED' ? 'warning' : 'success';

  return (
    <header className="patient-workspace-header" aria-label="Patient and active course context">
      <div className="patient-workspace-header-primary">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Link href="/patients" className="clinical-focus type-meta inline-flex items-center gap-1.5 text-[var(--color-primary)]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Patients
            </Link>
            <span className="patient-workspace-header-divider" aria-hidden="true" />
            <h1 className="type-page-title truncate">{patientDisplayName(patient)}</h1>
            <Badge variant={statusTone(patient.status)}>{titleCase(patient.status)}</Badge>
            <Badge variant="primary">PHI controlled</Badge>
          </div>
          <dl className="patient-workspace-identifiers">
            <div><dt>External MRN</dt><dd>{patient.mrn || 'Not recorded'}</dd></div>
          </dl>
        </div>

        <div className="patient-workspace-header-actions">
          <Button type="button" variant="secondary" size="sm" onClick={onOpenSignals}>
            <Bell className="h-4 w-4" aria-hidden="true" />
            Signals
            <Badge variant={signalCount ? 'warning' : 'success'}>{signalCount}</Badge>
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={onOpenDetails}>
            Patient details
          </Button>
        </div>
      </div>

      <div className="patient-workspace-course-row">
        <div className="patient-workspace-course-summary">
          <span className="type-label">Active course</span>
          <strong className="type-item-title">{domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'Course ')}</strong>
          <span className="type-meta">{course.protocolName} · {patient.diagnosisSummary ?? patient.diagnosis}</span>
        </div>
        <dl className="patient-workspace-course-facts">
          <div><dt>Phase</dt><dd>{currentPhaseLabel(course)}</dd></div>
          <div><dt>Logged</dt><dd>{currentFraction}/{course.totalFractions} fractions</dd></div>
          <div><dt>Course gate</dt><dd><Badge variant={gateTone}>{titleCase(courseGate.state)}</Badge></dd></div>
        </dl>
      </div>
    </header>
  );
}

type PatientWorkspaceSidebarProps = Omit<PatientWorkspaceHeaderProps, 'cumulativeDose'> & {
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
  const gateTone = courseGate.state === 'BLOCKED' ? 'error' : courseGate.state === 'REVIEW_REQUIRED' ? 'warning' : 'success';

  return (
    <aside className="patient-workspace-sidebar clinical-surface" aria-label="Patient and active course context">
      <Link href="/patients" className="clinical-focus type-meta inline-flex min-h-11 items-center gap-1.5 text-[var(--color-primary)]">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Patients
      </Link>

      <section className="patient-workspace-sidebar-section patient-workspace-sidebar-identity">
        <h1 className="type-page-title break-words">{patientDisplayName(patient)}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant={statusTone(patient.status)}>{titleCase(patient.status)}</Badge>
          <Badge variant="primary">PHI controlled</Badge>
        </div>
        <dl className="mt-3">
          <div><dt>External MRN</dt><dd>{patient.mrn || 'Not recorded'}</dd></div>
        </dl>
      </section>

      <section className="patient-workspace-sidebar-section patient-workspace-sidebar-course">
        <p className="type-label">Active course</p>
        <p className="type-item-title mt-1">{domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'Course ')}</p>
        <p className="type-meta patient-workspace-sidebar-diagnosis mt-1">{course.protocolName} · {patient.diagnosisSummary ?? patient.diagnosis}</p>
        <div className="patient-workspace-sidebar-gate mt-3">
          <span className="type-label">Course gate</span>
          <Badge variant={gateTone}>{titleCase(courseGate.state)}</Badge>
        </div>
        <dl className="patient-workspace-sidebar-facts mt-3">
          <div><dt>Phase</dt><dd>{currentPhaseLabel(course)}</dd></div>
          <div><dt>Logged</dt><dd>{currentFraction}/{course.totalFractions} fractions</dd></div>
        </dl>
      </section>

      <nav className="patient-workspace-sidebar-section" aria-label="Patient workspace">
        <PatientWorkspaceNavigation activeTab={activeTab} orientation="vertical" onTabChange={onTabChange} />
      </nav>

      <div className="patient-workspace-sidebar-actions">
        <Button type="button" variant="secondary" size="sm" onClick={onOpenSignals}>
          <Bell className="h-4 w-4" aria-hidden="true" />
          Signals
          <Badge variant={signalCount ? 'warning' : 'success'}>{signalCount}</Badge>
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
  const relatedCarepathWorkItems = useMemo(
    () => selectedCarepathStep
      ? tasks.filter((task) => task.workflowStepId === selectedCarepathStep.id)
      : [],
    [selectedCarepathStep, tasks],
  );
  const attentionItems = useMemo(() => workspaceState.actions.map((action) => ({
    id: action.id,
    title: action.label,
    detail: action.blocking ? 'This item blocks course advancement.' : 'Review the required patient-course work.',
    meta: `${action.owner}${action.due ? ` · Due ${formatDate(action.due)}` : ''}`,
    tone: action.blocking ? 'error' as const : 'warning' as const,
    tab: action.destination,
  })), [workspaceState.actions]);

  const tabContent = useMemo(() => {
    if (activeTab === 'prepare') {
      return (
        <div className="grid min-w-0 gap-4">
          <div className="prepare-workbench-layout">
            <section className="clinical-surface overflow-hidden" aria-labelledby="course-path-heading">
              <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
                <h2 id="course-path-heading" className="type-section-title">Preparation path</h2>
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
                            <Badge variant={statusTone(step.status)}>{titleCase(step.status)}</Badge>
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
                      <h3 className="mt-1 font-heading text-lg font-bold leading-tight text-[var(--color-text)]">
                        {selectedCarepathStep.stepNumber}. {selectedCarepathStep.stepName}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                        {selectedCarepathStep.dueDate ? `Due ${formatDate(selectedCarepathStep.dueDate)}` : selectedCarepathStep.triggerEvent}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Badge variant={phaseTone(selectedCarepathStep.phase)}>{carepathPhaseLabels[selectedCarepathStep.phase]}</Badge>
                      <Badge variant={statusTone(selectedCarepathStep.status)}>{titleCase(selectedCarepathStep.status)}</Badge>
                    </div>
                  </div>

                  <div className="clinical-muted-surface p-3">
                    <p className="clinical-label">Next Action</p>
                    <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{selectedCarepathAction?.label ?? 'Review step'}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
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
                          onComplete={completeSelectedCarepathStep}
                          requireNotes={selectedCarepathStep.status === 'COMPLETED' || selectedCarepathStep.status === 'SIGNED'}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                    <div className="clinical-muted-surface p-3">
                      <p className="clinical-label">Owner</p>
                      <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                        {selectedCarepathStep.assignedUserId ?? responsiblePartyLabels[selectedCarepathStep.responsibleRole]}
                      </p>
                    </div>
                    <div className="clinical-muted-surface p-3">
                      <p className="clinical-label">Signature</p>
                      <p className="mt-1 text-sm font-bold text-[var(--color-text)]">
                        {selectedCarepathStep.requiresSignature ? selectedCarepathStep.signedAt ? 'Signed' : 'Required' : 'Not required'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Step Evidence" />
                    <div className="grid gap-2">
                      {(selectedCarepathStep.auditChecklist.length ? selectedCarepathStep.auditChecklist : ['Owner assigned', 'Evidence traceable']).map((item) => (
                        <div key={item} className="clinical-muted-surface flex min-w-0 items-center justify-between gap-3 p-3">
                          <span className="min-w-0 text-sm font-semibold text-[var(--color-text)]">{item}</span>
                          <Badge variant={selectedCarepathStep.status === 'COMPLETED' || selectedCarepathStep.status === 'SIGNED' ? 'success' : 'warning'}>
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
                              <p className="truncate text-sm font-bold text-[var(--color-text)]">{task.title}</p>
                              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">{task.description}</p>
                              <p className="mt-2 text-xs font-bold text-[var(--color-text-muted)]">
                                {task.assignedUserId ?? responsiblePartyLabels[task.assignedRole]} · {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                              </p>
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-1">
                              <Badge variant={priorityTone(task.priority)}>{task.priority}</Badge>
                              <Badge variant={statusTone(task.status)}>{titleCase(task.status)}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      {relatedCarepathWorkItems.length === 0 ? (
                        <div className="clinical-muted-surface p-4 text-sm font-semibold leading-6 text-[var(--color-text-muted)]">
                          No separate task rows are attached to this step. Use the next action above as the source of truth for this patient.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="clinical-muted-surface p-4 text-sm font-semibold text-[var(--color-text-muted)]">
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
            action={<PrototypeActionButton label={openChecks.length ? 'Resolve closeout blockers' : 'Close course'} icon="check" kind="review" variant="primary" description="Review the required record, billing, audit, and follow-up evidence before closure." />}
          />
          <section className="clinical-surface p-4" aria-labelledby="closure-readiness-heading">
            <SectionTitle title="Closure readiness" />
            <h2 id="closure-readiness-heading" className="sr-only">Closure readiness</h2>
            <dl className="closure-readiness-grid">
              <div><dt>Documents & signatures</dt><dd>{unsignedDocs.length ? `${unsignedDocs.length} pending` : 'Clear'}</dd></div>
              <div><dt>eCW uploads</dt><dd>{documents.filter((document) => !document.uploadedToEcwAt && !document.ecwUploadReference).length} pending</dd></div>
              <div><dt>Treatment completion</dt><dd>{currentFraction}/{course.totalFractions} logged</dd></div>
              <div><dt>Audit checks</dt><dd>{openChecks.length ? `${openChecks.length} open` : 'Clear'}</dd></div>
              <div><dt>Billing evidence</dt><dd>{documents.some((document) => document.category === 'BILLING') ? 'Recorded' : 'Review required'}</dd></div>
              <div><dt>AVS & follow-up</dt><dd>{workflowSteps.some((step) => step.phase === 'POST_TX' && ['COMPLETED', 'SIGNED'].includes(step.status)) ? 'Recorded' : 'Pending'}</dd></div>
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
                <p className="font-heading text-base font-bold text-[var(--color-text)]">Course documents</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant={unsignedDocs.length ? 'warning' : 'success'}>{unsignedDocs.length} unsigned</Badge>
                  <Badge variant={openChecks.length ? 'warning' : 'success'}>{openChecks.length} open checks</Badge>
                  <Badge variant="primary">{readiness}% ready</Badge>
                </div>
              </div>
            }
            toolbarActions={<PrototypeActionButton label="Generate document" icon="file" kind="document" description="Queue a simulated document render from mapped course fields." />}
            columns={[
              { key: 'title', label: 'Document', render: (row) => <span className="font-bold">{row.title}</span> },
              { key: 'category', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.category)}>{titleCase(row.category)}</Badge> },
              { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{titleCase(row.status)}</Badge> },
              { key: 'output', label: 'Output', render: (row) => (
                <div className="flex flex-wrap gap-1">
                  <Badge variant={row.outputStatus ? statusTone(row.outputStatus) : 'default'}>{row.outputStatus ? titleCase(row.outputStatus) : 'No Output'}</Badge>
                  {row.manualEditExceptionAt ? <Badge variant="warning">Manual Edit</Badge> : null}
                </div>
              ) },
              { key: 'version', label: 'Version' },
              { key: 'signed', label: 'Signature', render: (row) => <Badge variant={row.signed ? 'success' : 'warning'}>{row.signed ? 'Signed' : 'Pending'}</Badge> },
              { key: 'ecw', label: 'eCW', render: (row) => <Badge variant={row.uploadedToEcwAt || row.ecwUploadReference ? 'success' : 'default'}>{row.uploadedToEcwAt || row.ecwUploadReference ? 'Uploaded' : 'Pending'}</Badge> },
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
            empty="No document records are available for this patient course."
            emptyDescription="Generated or uploaded documents will appear after document requirements are initialized."
          />

          <div className="grid gap-4 xl:grid-cols-2">
            <Card compact>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <SectionTitle title="Clinical Forms" />
                <PrototypeActionButton label="Open form builder" icon="file" kind="create" description="Open a prototype structured-form workflow for this course." />
              </div>
              <div className="mt-3 grid gap-2">
                {clinicalFormTemplates.slice(0, 4).map((template) => (
                  <div key={template.id} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[var(--color-text)]">{template.name}</span>
                      <span className="text-xs font-semibold text-[var(--color-text-muted)]">{template.diagnosisType}</span>
                    </span>
                    <Badge variant={template.active ? 'success' : 'default'}>{template.active ? 'Active' : 'Inactive'}</Badge>
                  </div>
                ))}
                {clinicalFormTemplates.length === 0 ? (
                  <div className="clinical-muted-surface p-4 text-sm font-semibold text-[var(--color-text-muted)]">
                    No clinical form templates are available for this workspace.
                  </div>
                ) : null}
              </div>
            </Card>

            <Card compact>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-heading text-base font-bold text-[var(--color-text)]">Outstanding closeout</h2>
                <Badge variant={openChecks.length ? 'warning' : 'success'}>{openChecks.length ? `${openChecks.length} open` : 'Clear'}</Badge>
              </div>
              <div className="space-y-2">
                {(openChecks.length ? openChecks : auditChecks).map((check) => (
                  <div key={check.id} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--color-text)]">{check.label}</p>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)]">{check.category}</p>
                    </div>
                    <Badge variant={statusTone(check.status)}>{titleCase(check.status)}</Badge>
                  </div>
                ))}
                {auditChecks.length === 0 ? (
                  <div className="clinical-muted-surface p-4 text-sm font-semibold text-[var(--color-text-muted)]">
                    No audit checks are available for this patient course.
                  </div>
                ) : null}
              </div>
              {openChecks.length > 0 && auditChecks.length > openChecks.length ? (
                <details className="mt-3 border-t border-[var(--color-border-soft)] pt-3">
                  <summary className="clinical-focus cursor-pointer text-xs font-bold text-[var(--color-primary)]">
                    Show {auditChecks.length - openChecks.length} completed check(s)
                  </summary>
                  <div className="mt-3 space-y-2">
                    {auditChecks.filter((check) => !openChecks.includes(check)).map((check) => (
                      <div key={check.id} className="flex items-center justify-between gap-3 px-1 py-2">
                        <span className="text-sm font-semibold text-[var(--color-text)]">{check.label}</span>
                        <Badge variant={statusTone(check.status)}>{titleCase(check.status)}</Badge>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </Card>
          </div>

          <section className="clinical-surface overflow-hidden" aria-labelledby="activity-heading">
            <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
              <h2 id="activity-heading" className="font-heading text-base font-bold text-[var(--color-text)]">Activity</h2>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Redacted course and patient record events.</p>
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
                    <p className="type-meta mt-1">{event.reason || `Updated ${titleCase(event.entityType)} record`}</p>
                  </div>
                </div>
              ))}
              {auditEvents.length === 0 ? (
                <div className="p-5 text-sm font-semibold text-[var(--color-text-muted)]">
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
            action={<PrototypeActionButton label={workspaceState.courseGate.state === 'READY' ? 'Record next fraction' : 'Resolve treatment gate'} icon="check" kind="review" variant="primary" description="Complete the next required treatment action and refresh the course gate." />}
          />
          <FractionWorksheetPanel
            initialEntries={fractionEntries}
            course={course}
            phases={prescriptionPhases}
            scheduledFractions={treatmentFractions}
            title="Fraction Worksheet"
          />

          <Card compact>
            <SectionTitle title="Treatment status" />
            <dl className="workspace-snapshot-grid">
              <div><dt>Upcoming scheduled</dt><dd>{scheduledFractions.length}</dd></div>
              <div><dt>Logged dose</dt><dd>{cumulativeDose} cGy</dd></div>
              <div><dt>Imaging</dt><dd>{missingImageFractions.length ? `${missingImageFractions.length} missing` : 'Clear'}</dd></div>
              <div><dt>OTV</dt><dd>{otvDueFractions.length ? `${otvDueFractions.length} due` : 'Clear'}</dd></div>
              <div><dt>Physics</dt><dd>{physicsDueFractions.length ? `${physicsDueFractions.length} due` : 'Clear'}</dd></div>
              <div><dt>Plan</dt><dd>{currentPlan?.lockedAt ? 'Locked' : 'Open'}</dd></div>
            </dl>
          </Card>

          <details className="clinical-surface overflow-hidden" open={clinicalValidationChecklist.productionUseBlocked}>
            <summary className="clinical-focus flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3">
              <span>
                <span className="block font-heading text-base font-bold text-[var(--color-text)]">Plan and Phase 6 Readiness</span>
                <span className="mt-1 block text-xs font-semibold text-[var(--color-text-muted)]">
                  Reference {clinicalValidationChecklist.referenceVersion}
                </span>
              </span>
              <Badge variant={clinicalValidationChecklist.productionUseBlocked ? 'warning' : 'success'}>
                {clinicalValidationChecklist.productionUseBlocked ? 'Clinical Validation Required' : planningReadiness.clinicianSignoffStatus}
              </Badge>
            </summary>
            <div className="border-t border-[var(--color-border-soft)] p-4">
              <dl className="workspace-snapshot-grid">
                <div><dt>Site</dt><dd>{currentPlan?.site ?? course.diagnosis}</dd></div>
                <div><dt>Energy</dt><dd>{currentPlan?.energy ?? course.energy ?? 'Pending'}</dd></div>
                <div><dt>Applicator</dt><dd>{currentPlan?.applicatorSize ?? course.applicator ?? 'Pending'}</dd></div>
                <div><dt>Dose / Fx</dt><dd>{currentPlan?.dosePerFraction ?? course.dose ?? 'Pending'}</dd></div>
                <div><dt>Target depth</dt><dd>{currentPlan?.depthOfInvasion ?? course.targetDepth ?? 'Pending'}</dd></div>
                <div><dt>Coverage</dt><dd>{currentPlan?.percentDepthDose ? `${currentPlan.percentDepthDose}%` : 'Pending'}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading text-sm font-bold text-[var(--color-text)]">Clinical Sign-Off Gate</h3>
                <Badge variant={clinicalValidationChecklist.productionUseBlocked ? 'warning' : 'success'}>
                  {planningReadiness.clinicianSignoffStatus}
                </Badge>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {clinicalValidationChecklist.items.map((item) => (
                  <div key={item.id} className="clinical-muted-surface flex items-start justify-between gap-3 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--color-text)]">{item.label}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                        {responsiblePartyLabels[item.ownerRole]} evidence required
                      </p>
                    </div>
                    <Badge variant="warning">{item.status}</Badge>
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
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{missingImageFractions.length} missing image gate(s)</p>
              </div>
            }
            toolbarActions={<PrototypeActionButton label="Attach image" icon="upload" kind="upload" description="Stage imaging evidence linked to this course." />}
            columns={[
              { key: 'category', label: 'Image / Evidence', render: (row) => <span className="font-bold">{row.category}</span> },
              { key: 'phase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.phase)}>{titleCase(row.phase)}</Badge> },
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
          action={<PrototypeActionButton label={workspaceState.nextAction.label} icon="play" kind="review" variant="primary" description="Complete the authoritative next patient-course action." />}
        />

        <section className="clinical-surface p-4" aria-labelledby="phase-progress-heading">
          <SectionTitle title="Course progress" />
          <h2 id="phase-progress-heading" className="sr-only">Course progress</h2>
          <ol className="workspace-phase-tracker">
            {workspacePhases.map((phase, index) => {
              const currentIndex = Math.max(0, workspacePhases.indexOf(currentPhaseLabel(course)));
              const state = index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming';
              return <li key={phase} data-state={state}><span aria-hidden="true" />{phase}</li>;
            })}
          </ol>
        </section>

        <section className="clinical-surface overflow-hidden" aria-labelledby="attention-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border-soft)] px-4 py-3">
            <div>
              <h2 id="attention-heading" className="font-heading text-base font-bold text-[var(--color-text)]">Needs attention</h2>
              <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{attentionItems.length} open patient-course item(s)</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={blockedSteps.length ? 'error' : 'success'}>{blockedSteps.length} blocked</Badge>
              <Badge variant={urgentTasks.length ? 'warning' : 'success'}>{urgentTasks.length} priority</Badge>
              <Badge variant={unsignedDocs.length ? 'warning' : 'success'}>{unsignedDocs.length} unsigned</Badge>
            </div>
          </div>
          <div className="divide-y divide-[var(--color-border-soft)]">
            {attentionItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.tab)}
                className="clinical-focus grid w-full gap-2 px-4 py-3 text-left transition hover:bg-[var(--color-hover)] md:grid-cols-[minmax(0,1fr)_170px_auto] md:items-center"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[var(--color-text)]">{item.title}</span>
                  <span className="mt-1 block line-clamp-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">{item.detail}</span>
                </span>
                <span className="text-xs font-bold text-[var(--color-text-muted)]">{item.meta}</span>
                <Badge variant={item.tone} className="justify-self-start md:justify-self-end">Review</Badge>
              </button>
            ))}
            {attentionItems.length === 0 ? (
              <div className="p-5 text-sm font-semibold text-[var(--color-text-muted)]">No urgent course work is currently recorded.</div>
            ) : null}
          </div>
        </section>

        <section className="clinical-surface p-4" aria-labelledby="snapshot-heading">
          <SectionTitle title="Course snapshot" />
          <h2 id="snapshot-heading" className="sr-only">Course snapshot</h2>
          <dl className="workspace-snapshot-grid">
            <div><dt>Carepath</dt><dd>{carepath.completed}/{carepath.total} complete</dd></div>
            <div><dt>Documents</dt><dd>{unsignedDocs.length} unsigned</dd></div>
            <div><dt>Fractions</dt><dd>{currentFraction}/{course.totalFractions} logged</dd></div>
            <div><dt>Imaging</dt><dd>{missingImageFractions.length ? `${missingImageFractions.length} missing` : 'Clear'}</dd></div>
            <div><dt>OTV</dt><dd>{otvDueFractions.length ? `${otvDueFractions.length} due` : 'Clear'}</dd></div>
            <div><dt>Physics</dt><dd>{physicsDueFractions.length ? `${physicsDueFractions.length} due` : 'Clear'}</dd></div>
          </dl>
        </section>

        <section className="clinical-surface overflow-hidden" aria-labelledby="recent-activity-heading">
          <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
            <h2 id="recent-activity-heading" className="type-section-title">Recent course activity</h2>
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
    otvDueFractions,
    workspaceState.nextAction.label,
    workspaceState.courseGate,
    planningReadiness.clinicianSignoffStatus,
    physicsDueFractions,
    prescriptionPhases,
    readiness,
    scheduledFractions.length,
    selectedCarepathAction,
    selectedCarepathStep,
    treatmentFractions,
    relatedCarepathWorkItems,
    attentionItems,
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
          onTabChange={setActiveTab}
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
              cumulativeDose={cumulativeDose}
              signalCount={signalCount}
              courseGate={workspaceState.courseGate}
              onOpenDetails={() => setPatientDetailsOpen(true)}
              onOpenSignals={() => setSignalsOpen(true)}
            />
            <PatientWorkspaceNavigation activeTab={activeTab} orientation="horizontal" onTabChange={setActiveTab} />
          </div>

          <section
            id={`patient-panel-${activeTab}`}
            role="tabpanel"
            aria-label={`${tabs.find((tab) => tab.id === activeTab)?.label ?? 'Patient'} workspace`}
            className="patient-workspace-surface patient-workspace-canvas clinical-surface"
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
      label: 'Resolve blocker',
      detail: step.blockers[0] ?? step.notes ?? 'Clear the blocker before this course can advance.',
      kind: 'review' as const,
      icon: 'play' as const,
    };
  }

  if (step.status === 'COMPLETED' || step.status === 'SIGNED' || step.status === 'CLOSED') {
    return {
      label: 'Review record',
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
      label: 'Generate document',
      detail: 'Complete the mapped fields, preview the output, then finalize the generated document record.',
      kind: 'document' as const,
      icon: 'file' as const,
    };
  }

  return {
    label: 'Review step',
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
    { label: 'Urgent tasks', value: urgentTasks, icon: AlertTriangle, variant: urgentTasks ? 'warning' : 'success' },
    { label: 'Blocked steps', value: blockedSteps, icon: Route, variant: blockedSteps ? 'error' : 'success' },
    { label: 'Unsigned docs', value: unsignedDocs, icon: FileCheck2, variant: unsignedDocs ? 'warning' : 'success' },
    { label: 'Open audit checks', value: openChecks, icon: ShieldCheck, variant: openChecks ? 'warning' : 'success' },
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
                <span className="truncate text-sm font-bold text-[var(--color-text)]">{signal.label}</span>
              </span>
              <Badge variant={signal.variant}>{signal.value}</Badge>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <p className="clinical-label">Next action</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-[var(--color-text)]">{nextAction}</p>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>Closeout readiness</span>
            <span>{readiness}%</span>
          </div>
          <ProgressLine value={readiness} />
        </div>
      </div>
    </div>
  );
}
