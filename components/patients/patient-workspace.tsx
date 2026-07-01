'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
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
  auditReadinessScore,
  carepathPhaseLabels,
  carepathProgress,
  cn,
  formatDate,
  responsiblePartyLabels,
} from '@/lib/workflow';
import { patientRef } from '@/lib/hipaa';
import { phaseTone, priorityTone, statusTone } from '@/lib/status-utils';

type WorkspaceTab =
  | 'command'
  | 'carepath'
  | 'treatment'
  | 'documents-billing'
  | 'activity';

type PatientWorkspaceProps = {
  patient: Patient;
  course: TreatmentCourse;
  initialTab?: WorkspaceTab;
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

const tabs: Array<{ id: WorkspaceTab; label: string; icon: typeof ClipboardList }> = [
  { id: 'command', label: 'Overview', icon: Activity },
  { id: 'carepath', label: 'Carepath', icon: Route },
  { id: 'treatment', label: 'Treatment', icon: Radiation },
  { id: 'documents-billing', label: 'Documents & Billing', icon: WalletCards },
  { id: 'activity', label: 'Activity', icon: ShieldCheck },
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
      <h2 className="font-heading text-base font-bold text-[var(--color-text)]">{title}</h2>
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
  onOpenSignals: () => void;
};

function PatientContext({
  patient,
  course,
  domainCourse,
  currentFraction,
  cumulativeDose,
  signalCount,
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
        <p className="mt-2 text-sm font-bold leading-5 text-[var(--color-text)]">{patient.nextAction}</p>
      </div>

      <Button type="button" variant="secondary" className="mt-auto w-full" onClick={onOpenSignals}>
        <Bell className="h-4 w-4" aria-hidden="true" />
        Course signals
        <Badge variant={signalCount ? 'warning' : 'success'}>{signalCount}</Badge>
      </Button>
    </>
  );
}

export function PatientWorkspace({
  patient,
  course,
  initialTab = 'command',
  domainCourse,
  carepathTasks,
  generatedDocuments,
  fractionEntries,
  workflowSteps,
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
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [signalsOpen, setSignalsOpen] = useState(false);
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(false);
  const [selectedCarepathStepId, setSelectedCarepathStepId] = useState(workflowSteps[0]?.id ?? '');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const currentPlan = treatmentPlans[0];
  const carepath = carepathProgress(carepathTasks);
  const readiness = auditReadinessScore(carepathTasks, generatedDocuments, fractionEntries);
  const completedFractions = fractionEntries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const currentFraction = Math.max(course.currentFraction, completedFractions);
  const cumulativeDose = fractionEntries.at(-1)?.cumulativeDose ?? treatmentFractions.at(-1)?.cumulativeDose ?? 0;
  const urgentTasks = useMemo(
    () => tasks.filter((task) => ['URGENT', 'HIGH'].includes(task.priority) || task.status === 'READY_FOR_REVIEW'),
    [tasks],
  );
  const blockedSteps = useMemo(
    () => workflowSteps.filter((step) => step.status === 'BLOCKED' || step.blockers.length > 0),
    [workflowSteps],
  );
  const unsignedDocs = useMemo(() => documents.filter((document) => !document.signedAt), [documents]);
  const openChecks = useMemo(
    () => auditChecks.filter((check) => !['COMPLETED', 'SIGNED', 'UPLOADED', 'CLOSED'].includes(check.status)),
    [auditChecks],
  );
  const scheduledFractions = useMemo(
    () => treatmentFractions.filter((fraction) => fraction.scheduledFromPrescription),
    [treatmentFractions],
  );
  const missingImageFractions = useMemo(
    () => treatmentFractions.filter((fraction) => fraction.imageGuidanceStatus === 'MISSING'),
    [treatmentFractions],
  );
  const otvDueFractions = useMemo(
    () => treatmentFractions.filter((fraction) => fraction.otvRequired && !fraction.otvCompletedAt),
    [treatmentFractions],
  );
  const physicsDueFractions = useMemo(
    () => treatmentFractions.filter((fraction) => fraction.physicsCheckRequired && !fraction.physicsCheckCompletedAt),
    [treatmentFractions],
  );
  const clinicalValidationChecklist = planningReadiness.clinicalValidationChecklist;
  const carepathRows = useMemo(
    () => workflowSteps.map((step) => ({
      id: step.id,
      step: `${step.stepNumber}. ${step.stepName}`,
      stepNumber: step.stepNumber,
      stepName: step.stepName,
      phase: carepathPhaseLabels[step.phase],
      status: step.status,
      role: responsiblePartyLabels[step.responsibleRole],
      due: step.dueDate ?? step.triggerEvent,
      signature: step.requiresSignature,
      signed: Boolean(step.signedAt),
      blocker: step.blockers[0],
      source: step,
    })),
    [workflowSteps],
  );
  const selectedCarepathStep = useMemo(
    () => workflowSteps.find((step) => step.id === selectedCarepathStepId) ?? workflowSteps[0],
    [selectedCarepathStepId, workflowSteps],
  );
  const selectedCarepathAction = useMemo(
    () => selectedCarepathStep ? carepathStepAction(selectedCarepathStep) : null,
    [selectedCarepathStep],
  );
  const relatedCarepathWorkItems = useMemo(
    () => selectedCarepathStep
      ? tasks.filter((task) => task.workflowStepId === selectedCarepathStep.id)
      : [],
    [selectedCarepathStep, tasks],
  );
  const attentionItems = useMemo(() => [
    ...blockedSteps.map((step) => ({
      id: `step-${step.id}`,
      title: `${step.stepNumber}. ${step.stepName}`,
      detail: step.blockers[0] ?? step.notes ?? 'Review blocked carepath step.',
      meta: 'Carepath blocker',
      tone: 'error' as const,
      tab: 'carepath' as const,
    })),
    ...urgentTasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.title,
      detail: task.description,
      meta: `${task.assignedUserId ?? responsiblePartyLabels[task.assignedRole]}${task.dueDate ? ` · Due ${formatDate(task.dueDate)}` : ''}`,
      tone: task.priority === 'URGENT' ? 'error' as const : 'warning' as const,
      tab: 'carepath' as const,
    })),
    ...unsignedDocs.map((document) => ({
      id: `document-${document.id}`,
      title: document.title,
      detail: `${titleCase(document.category)} document requires signature.`,
      meta: `Version ${document.version}`,
      tone: 'warning' as const,
      tab: 'documents-billing' as const,
    })),
  ], [blockedSteps, unsignedDocs, urgentTasks]);

  const tabContent = useMemo(() => {
    if (activeTab === 'carepath') {
      return (
        <div className="grid min-w-0 gap-4">
          <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <DataTable
              keyField="id"
              pageSize={9}
              className="min-h-[460px]"
              minTableWidth="980px"
              onRowClick={(row) => setSelectedCarepathStepId(row.id)}
              toolbarPrefix={
                <div className="min-w-[240px] flex-1">
                  <p className="font-heading text-base font-bold text-[var(--color-text)]">Course path</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    {blockedSteps.length} blocked step(s), {urgentTasks.length} priority task(s)
                  </p>
                </div>
              }
              toolbarActions={selectedCarepathAction ? (
                <PrototypeActionButton
                  label={selectedCarepathAction.label}
                  icon={selectedCarepathAction.icon}
                  kind={selectedCarepathAction.kind}
                  description={selectedCarepathAction.detail}
                  context={selectedCarepathStep ? `${selectedCarepathStep.stepNumber}. ${selectedCarepathStep.stepName}` : undefined}
                />
              ) : null}
              columns={[
                { key: 'step', label: 'Step', width: '27%', render: (row) => (
                  <span className="flex min-w-0 flex-wrap items-center gap-2">
                    <span className="font-bold text-[var(--color-primary)]">{row.step}</span>
                    {row.id === selectedCarepathStep?.id ? <Badge variant="primary">Selected</Badge> : null}
                  </span>
                ) },
                { key: 'phase', label: 'Phase', width: '12%', render: (row) => <Badge variant={phaseTone(row.phase)}>{row.phase}</Badge> },
                { key: 'status', label: 'Status', width: '13%', render: (row) => <Badge variant={statusTone(row.status)}>{titleCase(row.status)}</Badge> },
                { key: 'role', label: 'Owner', width: '15%' },
                { key: 'due', label: 'Due / Trigger', width: '13%' },
                { key: 'signature', label: 'Signature', width: '10%', render: (row) => row.signature ? <Badge variant={row.signed ? 'success' : 'warning'}>{row.signed ? 'Signed' : 'Required'}</Badge> : '-' },
                { key: 'blocker', label: 'Blocker', width: '10%', render: (row) => row.blocker || '-' },
              ]}
              rows={carepathRows}
              empty="No workflow steps are available for this patient course."
              emptyDescription="Carepath steps will appear after the course workflow is initialized."
            />

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

    if (activeTab === 'documents-billing') {
      return (
        <div className="grid min-w-0 gap-4">
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
        </div>
      );
    }

    if (activeTab === 'treatment') {
      return (
        <div className="grid min-w-0 gap-4">
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
              <div><dt>Schedule</dt><dd>{scheduledFractions.length}/{course.totalFractions}</dd></div>
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

    if (activeTab === 'activity') {
      return (
        <section className="clinical-surface overflow-hidden" aria-labelledby="activity-heading">
          <div className="border-b border-[var(--color-border-soft)] px-4 py-3">
            <h2 id="activity-heading" className="font-heading text-base font-bold text-[var(--color-text)]">Activity</h2>
            <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">Redacted course and patient record events.</p>
          </div>
          <div className="divide-y divide-[var(--color-border-soft)]">
            {auditEvents.map((event) => (
              <div key={event.id} className="grid gap-2 px-4 py-3 md:grid-cols-[170px_minmax(0,1fr)_140px] md:items-center">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--color-text-muted)]">{event.timestamp}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-[var(--color-text)]">{event.userName}</p>
                </div>
                <p className="min-w-0 text-sm font-semibold leading-5 text-[var(--color-text)]">{event.action}</p>
                <div className="md:justify-self-end">
                  <Badge variant="primary">{event.entityType}</Badge>
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
      );
    }

    return (
      <div className="grid min-w-0 gap-4">
        <section className="clinical-surface overflow-hidden" aria-labelledby="next-action-heading">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="min-w-0">
              <p className="clinical-label">Next action</p>
              <h2 id="next-action-heading" className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
                {patient.nextAction}
              </h2>
            </div>
            <PrototypeActionButton label="Review course" icon="play" kind="review" description="Open the next patient-course review action." />
          </div>
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
            {attentionItems.slice(0, 8).map((item) => (
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
      </div>
    );
  }, [
    activeTab,
    auditChecks,
    auditEvents,
    blockedSteps,
    carepathRows,
    carepath.completed,
    carepath.total,
    clinicalFormTemplates,
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
    patient.nextAction,
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
  ]);

  const signalCount = urgentTasks.length + blockedSteps.length + unsignedDocs.length + openChecks.length;
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? tabs.length - 1
        : event.key === 'ArrowRight'
          ? (index + 1) % tabs.length
          : (index - 1 + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    setActiveTab(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="patient-workspace">
      <aside className="patient-context-rail clinical-surface" aria-label="Patient and active course context">
        <PatientContext
          patient={patient}
          course={course}
          domainCourse={domainCourse}
          currentFraction={currentFraction}
          cumulativeDose={cumulativeDose}
          signalCount={signalCount}
          onOpenSignals={() => setSignalsOpen(true)}
        />
      </aside>

      <div className="patient-workspace-main">
        <div className="patient-context-compact clinical-surface">
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate font-heading text-base font-bold text-[var(--color-text)]">{patientDisplayName(patient)}</h1>
              <Badge variant={statusTone(patient.status)}>{titleCase(patient.status)}</Badge>
            </div>
            <p className="mt-1 truncate text-xs font-semibold text-[var(--color-text-muted)]">
              {currentPhaseLabel(course)} · Fx {currentFraction}/{course.totalFractions} · {signalCount} signals
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => setPatientDetailsOpen(true)}>
            Patient details
          </Button>
        </div>

        <div className="patient-workspace-surface clinical-surface">
          <div className="patient-workspace-tabs scrollbar-soft" role="tablist" aria-label="Patient workspace sections">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const selected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  id={`patient-tab-${tab.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`patient-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn(
                    'clinical-focus inline-flex h-10 min-w-fit items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-bold transition',
                    selected
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)]'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <section
            id={`patient-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`patient-tab-${activeTab}`}
            className="patient-workspace-canvas"
          >
            <div className="min-w-0">{tabContent}</div>
          </section>
        </div>
      </div>

      <Modal open={signalsOpen} onClose={() => setSignalsOpen(false)} title="Course Signals" width={520}>
        <ContextRail
          urgentTasks={urgentTasks.length}
          blockedSteps={blockedSteps.length}
          unsignedDocs={unsignedDocs.length}
          openChecks={openChecks.length}
          readiness={readiness}
          nextAction={patient.nextAction}
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
