'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  FileText,
  Image as ImageIcon,
  NotebookTabs,
  Radiation,
  Route,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/shared/data-table';
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
  documentProgress,
  formatDate,
  patientName,
  responsiblePartyLabels,
} from '@/lib/workflow';

type WorkspaceTab =
  | 'command'
  | 'workflow'
  | 'tasks'
  | 'clinical'
  | 'planning'
  | 'imaging'
  | 'documents'
  | 'fractions'
  | 'billing-audit'
  | 'activity';

type PatientWorkspaceProps = {
  patient: Patient;
  course: TreatmentCourse;
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
  images: ImagingAsset[];
  auditChecks: AuditCheck[];
  auditEvents: AuditEvent[];
};

const tabs: Array<{ id: WorkspaceTab; label: string; icon: typeof ClipboardList }> = [
  { id: 'command', label: 'Command', icon: Activity },
  { id: 'workflow', label: 'Workflow', icon: Route },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'clinical', label: 'Clinical', icon: NotebookTabs },
  { id: 'planning', label: 'Planning', icon: Radiation },
  { id: 'imaging', label: 'Imaging', icon: ImageIcon },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'fractions', label: 'Fractions', icon: CalendarDays },
  { id: 'billing-audit', label: 'Billing / Audit', icon: WalletCards },
  { id: 'activity', label: 'Activity', icon: ShieldCheck },
];

const phaseOrder = ['Consult', 'Chart Prep', 'Simulation', 'Planning', 'On Tx', 'Post', 'Audit'];

function statusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' {
  if (['COMPLETED', 'SIGNED', 'UPLOADED', 'ACTIVE', 'CLOSED'].includes(status)) return 'success';
  if (['BLOCKED', 'OVERDUE', 'MISSING_FIELDS', 'ON_HOLD'].includes(status)) return 'error';
  if (['READY_FOR_REVIEW', 'NEEDS_REVIEW', 'PENDING', 'IN_PROGRESS'].includes(status)) return 'warning';
  if (['UPCOMING', 'NOT_STARTED'].includes(status)) return 'info';
  return 'default';
}

function titleCase(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
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

function Metric({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="clinical-muted-surface min-w-0 p-3">
      <p className="clinical-label truncate">{label}</p>
      <p className="mt-1 truncate font-heading text-xl font-bold leading-none text-[var(--color-text)]">{value}</p>
      {detail ? <p className="mt-1 truncate text-xs font-semibold text-[var(--color-text-muted)]">{detail}</p> : null}
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

function ApprovalBadge({ approved, label }: { approved: boolean; label: string }) {
  return <Badge variant={approved ? 'success' : 'warning'}>{label}</Badge>;
}

export function PatientWorkspace({
  patient,
  course,
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
  images,
  auditChecks,
  auditEvents,
}: PatientWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('command');
  const currentPlan = treatmentPlans[0];
  const carepath = carepathProgress(carepathTasks);
  const docs = documentProgress(generatedDocuments);
  const readiness = auditReadinessScore(carepathTasks, generatedDocuments, fractionEntries);
  const completedFractions = fractionEntries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const currentFraction = Math.max(course.currentFraction, completedFractions);
  const fractionPercent = Math.round((currentFraction / Math.max(course.totalFractions, 1)) * 100);
  const cumulativeDose = fractionEntries.at(-1)?.cumulativeDose ?? treatmentFractions.at(-1)?.cumulativeDose ?? 0;
  const urgentTasks = tasks.filter((task) => ['URGENT', 'HIGH'].includes(task.priority) || task.status === 'READY_FOR_REVIEW');
  const blockedSteps = workflowSteps.filter((step) => step.status === 'BLOCKED' || step.blockers.length > 0);
  const unsignedDocs = documents.filter((document) => !document.signedAt);
  const openChecks = auditChecks.filter((check) => !['COMPLETED', 'SIGNED', 'UPLOADED', 'CLOSED'].includes(check.status));

  const tabContent = useMemo(() => {
    if (activeTab === 'workflow') {
      return (
        <DataTable
          keyField="id"
          pageSize={0}
          columns={[
            { key: 'step', label: 'Step', render: (row) => <span className="font-bold text-[var(--color-primary)]">{row.step}</span> },
            { key: 'phase', label: 'Phase', render: (row) => <Badge variant="primary">{row.phase}</Badge> },
            { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge> },
            { key: 'role', label: 'Owner' },
            { key: 'due', label: 'Due / Trigger' },
            { key: 'signature', label: 'Signature', render: (row) => row.signature ? <Badge variant={row.signed ? 'success' : 'warning'}>{row.signed ? 'Signed' : 'Required'}</Badge> : '-' },
            { key: 'blocker', label: 'Blocker', render: (row) => row.blocker || '-' },
          ]}
          rows={workflowSteps.map((step) => ({
            id: step.id,
            step: `${step.stepNumber}. ${step.stepName}`,
            phase: carepathPhaseLabels[step.phase],
            status: step.status,
            role: responsiblePartyLabels[step.responsibleRole],
            due: step.dueDate ?? step.triggerEvent,
            signature: step.requiresSignature,
            signed: Boolean(step.signedAt),
            blocker: step.blockers[0],
          }))}
        />
      );
    }

    if (activeTab === 'tasks') {
      return (
        <DataTable
          keyField="id"
          pageSize={0}
          columns={[
            { key: 'title', label: 'Task', render: (row) => <span className="font-bold">{row.title}</span> },
            { key: 'priority', label: 'Priority', render: (row) => <Badge variant={row.priority === 'URGENT' ? 'error' : row.priority === 'HIGH' ? 'warning' : 'default'}>{row.priority}</Badge> },
            { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge> },
            { key: 'owner', label: 'Owner' },
            { key: 'due', label: 'Due' },
            { key: 'description', label: 'Action', render: (row) => <span className="line-clamp-2 text-[var(--color-text-muted)]">{row.description}</span> },
          ]}
          rows={tasks.map((task) => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            status: task.status,
            owner: task.assignedUserId ?? responsiblePartyLabels[task.assignedRole],
            due: task.dueDate ? formatDate(task.dueDate) : 'No due date',
            description: task.description,
          }))}
        />
      );
    }

    if (activeTab === 'clinical') {
      return (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {clinicalFormTemplates.map((template) => (
            <Card key={template.id} compact>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="clinical-label">{template.diagnosisType}</p>
                  <h3 className="mt-1 truncate font-heading text-base font-bold text-[var(--color-text)]">{template.name}</h3>
                </div>
                <Badge variant={template.active ? 'success' : 'default'}>{template.active ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="mt-4 grid gap-2">
                {template.schema.slice(0, 3).map((section) => (
                  <div key={section.id} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                    <span className="truncate text-sm font-semibold text-[var(--color-text)]">{section.title}</span>
                    <span className="text-xs font-bold text-[var(--color-text-muted)]">{section.fields.length} fields</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (activeTab === 'planning') {
      return (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card>
            <SectionTitle title="Treatment Plan" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Site" value={currentPlan?.site ?? course.diagnosis} />
              <Metric label="Energy" value={currentPlan?.energy ?? course.energy ?? 'Pending'} />
              <Metric label="Applicator" value={currentPlan?.applicatorSize ?? course.applicator ?? 'Pending'} />
              <Metric label="Coverage" value={currentPlan?.percentDepthDose ? `${currentPlan.percentDepthDose}%` : 'Pending'} />
              <Metric label="Dose / Fx" value={currentPlan?.dosePerFraction ?? course.dose ?? 'Pending'} />
              <Metric label="Fractions" value={currentPlan?.totalFractions ?? course.totalFractions} />
              <Metric label="Target Depth" value={currentPlan?.depthOfInvasion ?? course.targetDepth ?? 'Pending'} />
              <Metric label="Plan Lock" value={currentPlan?.lockedAt ? 'Locked' : 'Open'} />
            </div>
          </Card>
          <Card>
            <SectionTitle title="Reviews" />
            <div className="space-y-3">
              <div className="clinical-muted-surface p-3">
                <p className="clinical-label">Physics</p>
                <Badge variant={statusVariant(currentPlan?.physicistReviewStatus ?? 'PENDING')}>{titleCase(currentPlan?.physicistReviewStatus ?? 'PENDING')}</Badge>
              </div>
              <div className="clinical-muted-surface p-3">
                <p className="clinical-label">Rad Onc</p>
                <Badge variant={statusVariant(currentPlan?.radOncSignatureStatus ?? 'PENDING')}>{titleCase(currentPlan?.radOncSignatureStatus ?? 'PENDING')}</Badge>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === 'imaging') {
      return (
        <DataTable
          keyField="id"
          pageSize={0}
          columns={[
            { key: 'category', label: 'Image / Evidence', render: (row) => <span className="font-bold">{row.category}</span> },
            { key: 'phase', label: 'Phase', render: (row) => <Badge variant="info">{titleCase(row.phase)}</Badge> },
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
        />
      );
    }

    if (activeTab === 'documents') {
      return (
        <DataTable
          keyField="id"
          pageSize={0}
          columns={[
            { key: 'title', label: 'Document', render: (row) => <span className="font-bold">{row.title}</span> },
            { key: 'category', label: 'Phase', render: (row) => <Badge variant="info">{titleCase(row.category)}</Badge> },
            { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{titleCase(row.status)}</Badge> },
            { key: 'version', label: 'Version' },
            { key: 'signed', label: 'Signature', render: (row) => <Badge variant={row.signed ? 'success' : 'warning'}>{row.signed ? 'Signed' : 'Pending'}</Badge> },
            { key: 'updated', label: 'Updated' },
          ]}
          rows={documents.map((document) => ({
            id: document.id,
            title: document.title,
            category: document.category,
            status: document.status,
            version: `v${document.version}`,
            signed: Boolean(document.signedAt),
            updated: document.generatedAt ? formatDate(document.generatedAt) : 'Pending',
          }))}
        />
      );
    }

    if (activeTab === 'fractions') {
      return <FractionWorkspace entries={fractionEntries} course={course} />;
    }

    if (activeTab === 'billing-audit') {
      return (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <SectionTitle title="Audit Checks" />
            <div className="space-y-2">
              {auditChecks.map((check) => (
                <div key={check.id} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-text)]">{check.label}</p>
                    <p className="text-xs font-semibold text-[var(--color-text-muted)]">{check.category}</p>
                  </div>
                  <Badge variant={statusVariant(check.status)}>{titleCase(check.status)}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Closeout Readiness" />
            <div className="space-y-4">
              <Metric label="Readiness" value={`${readiness}%`} detail="Tasks, documents, fractions" />
              <ProgressLine value={readiness} />
              <div className="grid grid-cols-2 gap-3">
                <Metric label="Unsigned Docs" value={unsignedDocs.length} />
                <Metric label="Open Checks" value={openChecks.length} />
              </div>
            </div>
          </Card>
        </div>
      );
    }

    if (activeTab === 'activity') {
      return (
        <div className="space-y-3">
          {auditEvents.slice(0, 12).map((event) => (
            <Card key={event.id} compact>
              <div className="grid gap-3 md:grid-cols-[180px_minmax(0,1fr)_160px] md:items-center">
                <div>
                  <p className="clinical-label">{event.timestamp}</p>
                  <p className="mt-1 text-sm font-bold text-[var(--color-text)]">{event.userName}</p>
                </div>
                <p className="min-w-0 text-sm font-semibold text-[var(--color-text)]">{event.action}</p>
                <Badge variant="primary">{event.entityType}</Badge>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <SectionTitle title="Today's Action Board" />
          <div className="grid gap-3 md:grid-cols-2">
            {urgentTasks.slice(0, 6).map((task) => (
              <div key={task.id} className="clinical-muted-surface p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-text)]">{task.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs font-semibold text-[var(--color-text-muted)]">{task.description}</p>
                  </div>
                  <Badge variant={task.priority === 'URGENT' ? 'error' : 'warning'}>{task.priority}</Badge>
                </div>
              </div>
            ))}
            {urgentTasks.length === 0 ? (
              <div className="clinical-muted-surface p-4 text-sm font-semibold text-[var(--color-text-muted)]">
                No urgent course tasks.
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Readiness" />
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
                <span>Carepath</span>
                <span>{carepath.percent}%</span>
              </div>
              <ProgressLine value={carepath.percent} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
                <span>Documents</span>
                <span>{docs.percent}%</span>
              </div>
              <ProgressLine value={docs.percent} />
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
                <span>Fractions</span>
                <span>{fractionPercent}%</span>
              </div>
              <ProgressLine value={fractionPercent} />
            </div>
          </div>
        </Card>
      </div>
    );
  }, [
    activeTab,
    auditChecks,
    auditEvents,
    carepath.percent,
    clinicalFormTemplates,
    course,
    currentPlan,
    docs.percent,
    documents,
    fractionEntries,
    fractionPercent,
    images,
    openChecks.length,
    readiness,
    tasks,
    unsignedDocs.length,
    urgentTasks,
    workflowSteps,
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <Card className="sticky top-0 z-20 p-0">
        <div className="border-b border-[var(--color-border-soft)] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Link href="/patients" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)]">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Patients
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate font-heading text-2xl font-bold text-[var(--color-text)]">{patientName(patient)}</h1>
                <Badge variant={statusVariant(patient.status)}>{titleCase(patient.status)}</Badge>
                <Badge variant="primary">PHI controlled</Badge>
              </div>
              <p className="mt-2 text-sm font-semibold text-[var(--color-text-muted)]">
                MRN {patient.mrn} · {patient.diagnosisSummary ?? patient.diagnosis} · {patient.location}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/patients/${patient.id}/carepath`}><Button variant="secondary">Carepath</Button></Link>
              <Link href={`/patients/${patient.id}/documents`}><Button variant="secondary">Documents</Button></Link>
              <Link href={`/patients/${patient.id}/fraction-log`}><Button>Fraction Log</Button></Link>
            </div>
          </div>
        </div>

        <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
          <Metric label="Course" value={domainCourse?.courseNumber ?? course.id.replace('COURSE-', 'C')} detail={course.protocolName} />
          <Metric label="Phase" value={titleCase(course.chartRoundsPhase)} detail={domainCourse ? titleCase(domainCourse.currentPhase) : undefined} />
          <Metric label="Fractions" value={`${currentFraction}/${course.totalFractions}`} detail={`${fractionPercent}% complete`} />
          <Metric label="Cumulative Dose" value={`${cumulativeDose} cGy`} detail="Logged dose" />
          <Metric label="Carepath" value={`${carepath.percent}%`} detail={`${carepath.completed}/${carepath.total} items`} />
          <Metric label="Documents" value={`${docs.percent}%`} detail={`${unsignedDocs.length} unsigned`} />
          <Metric label="Audit" value={`${readiness}%`} detail={`${blockedSteps.length + openChecks.length} blockers`} />
        </div>

        <div className="border-t border-[var(--color-border-soft)] px-3 py-3">
          <div className="grid gap-2 md:grid-cols-7">
            {phaseOrder.map((phase, index) => {
              const activeIndex = course.chartRoundsPhase === 'UPCOMING' ? 2 : course.chartRoundsPhase === 'ON_TREATMENT' ? 4 : 5;
              const isDone = index < activeIndex;
              const isActive = index === activeIndex;
              return (
                <div key={phase} className="min-w-0">
                  <div
                    className={cn(
                      'h-1.5 rounded-full',
                      isDone ? 'bg-[var(--color-success)]' : isActive ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-soft)]',
                    )}
                  />
                  <p className={cn('mt-1 truncate text-[11px] font-bold', isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]')}>
                    {phase}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="scrollbar-soft flex shrink-0 gap-1 overflow-x-auto border-b border-[var(--color-border-soft)] pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'clinical-focus inline-flex h-10 min-w-fit items-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-bold transition',
                activeTab === tab.id
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">{tabContent}</div>
        <ContextRail
          urgentTasks={urgentTasks.length}
          blockedSteps={blockedSteps.length}
          unsignedDocs={unsignedDocs.length}
          openChecks={openChecks.length}
          readiness={readiness}
          nextAction={patient.nextAction}
        />
      </section>
    </div>
  );
}

function FractionWorkspace({ entries, course }: { entries: FractionLogEntry[]; course: TreatmentCourse }) {
  const complete = entries.filter((entry) => entry.mdApproval && entry.dotApproval).length;
  const next = entries.find((entry) => !entry.mdApproval || !entry.dotApproval);
  const cumulativeDose = entries.at(-1)?.cumulativeDose ?? 0;
  const phaseOne = entries.filter((entry) => entry.phase.toLowerCase().includes('phase i')).length;
  const phaseTwo = entries.length - phaseOne;

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle title="Fractionation Record" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Completed" value={`${complete}/${course.totalFractions}`} detail="MD + DOT approved" />
          <Metric label="Cumulative Dose" value={`${cumulativeDose} cGy`} detail="Delivered dose" />
          <Metric label="Phase I" value={phaseOne} detail={course.phaseOne ?? 'Protocol phase'} />
          <Metric label="Phase II" value={phaseTwo} detail={course.phaseTwo ?? 'Boost / closeout'} />
          <Metric label="Next Due" value={next ? `Fx ${next.fractionNumber}` : 'Complete'} detail={next ? formatDate(next.date) : 'All logged'} />
        </div>
        <div className="mt-4">
          <ProgressLine value={Math.round((complete / Math.max(course.totalFractions, 1)) * 100)} />
        </div>
      </Card>

      <DataTable
        keyField="id"
        pageSize={0}
        columns={[
          { key: 'fraction', label: 'Fx' },
          { key: 'date', label: 'Date' },
          { key: 'phase', label: 'Phase' },
          { key: 'energy', label: 'Energy' },
          { key: 'ssd', label: 'SSD / Applicator' },
          { key: 'dose', label: 'Dose' },
          { key: 'cumulative', label: 'Cumulative' },
          { key: 'depth', label: 'Depth' },
          { key: 'isodose', label: 'Isodose' },
          { key: 'approvals', label: 'Approvals', render: (row) => (
            <div className="flex flex-wrap gap-1">
              <ApprovalBadge approved={row.md} label="MD" />
              <ApprovalBadge approved={row.dot} label="DOT" />
            </div>
          ) },
          { key: 'review', label: 'Review', render: (row) => <Badge variant={row.md && row.dot ? 'success' : 'warning'}>{row.md && row.dot ? 'Complete' : 'Needs Review'}</Badge> },
          { key: 'notes', label: 'Notes', render: (row) => <span className="line-clamp-2 text-[var(--color-text-muted)]">{row.notes}</span> },
        ]}
        rows={entries.map((entry) => ({
          id: entry.id,
          fraction: entry.fractionNumber,
          date: formatDate(entry.date),
          phase: entry.phase,
          energy: entry.energy,
          ssd: entry.ssd,
          dose: `${entry.dosePerFraction} cGy`,
          cumulative: `${entry.cumulativeDose} cGy`,
          depth: entry.depthOfTarget,
          isodose: `${entry.isodosePercent}%`,
          md: entry.mdApproval,
          dot: entry.dotApproval,
          notes: entry.notes,
        }))}
      />
    </div>
  );
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
    <aside className="min-w-0 space-y-4">
      <Card>
        <SectionTitle title="Course Signals" />
        <div className="space-y-2">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.label} className="clinical-muted-surface flex items-center justify-between gap-3 px-3 py-2">
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
                  <span className="truncate text-sm font-bold text-[var(--color-text)]">{signal.label}</span>
                </span>
                <Badge variant={signal.variant}>{signal.value}</Badge>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Next Action" />
        <p className="text-sm font-semibold leading-6 text-[var(--color-text)]">{nextAction}</p>
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-xs font-bold text-[var(--color-text-muted)]">
            <span>Closeout readiness</span>
            <span>{readiness}%</span>
          </div>
          <ProgressLine value={readiness} />
        </div>
      </Card>
    </aside>
  );
}
