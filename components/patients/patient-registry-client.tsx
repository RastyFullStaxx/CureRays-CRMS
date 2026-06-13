'use client';

import { useMemo, useState, type FormEvent, type MouseEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  FileWarning,
  Plus,
  Save,
  ShieldCheck,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  ChartRoundsPhase,
  DiagnosisCategory,
  PatientCreateInput,
  PatientEditDto,
  PatientStatus,
} from '@/lib/types';
import type { PatientRegistryRow } from '@/lib/services/patient-service';

type PatientRegistryClientProps = {
  rows: PatientRegistryRow[];
};

type PatientFormState = PatientCreateInput & {
  chartRoundsPhase: ChartRoundsPhase;
  status: PatientStatus;
};

type FormStep = 'identity' | 'clinical' | 'course' | 'review';

const formSteps: Array<{ id: FormStep; label: string; detail: string }> = [
  { id: 'identity', label: 'Patient Identity', detail: 'Name and MRN' },
  { id: 'clinical', label: 'Clinical Basics', detail: 'Diagnosis and team' },
  { id: 'course', label: 'Course Setup', detail: 'Initial treatment course' },
  { id: 'review', label: 'Review & Save', detail: 'Confirm before saving' },
];

const blankForm: PatientFormState = {
  firstName: '',
  lastName: '',
  mrn: '',
  diagnosis: '',
  diagnosisCategory: 'SKIN_CANCER',
  location: 'Main Campus',
  physician: '',
  assignedStaff: '',
  chartRoundsPhase: 'UPCOMING',
  status: 'ACTIVE',
  nextAction: 'Create treatment course',
  notes: '',
  initialCourse: {
    protocol: 'IGSRT',
    bodyRegion: 'SITE',
    laterality: 'UNSPECIFIED',
    treatmentModality: 'IGSRT',
    totalFractions: 20,
    startDate: '',
  },
};

const phaseLabels: Record<ChartRoundsPhase, string> = {
  UPCOMING: 'Upcoming',
  ON_TREATMENT: 'On Treatment',
  POST: 'Post-Treatment',
};

const diagnosisLabels: Record<DiagnosisCategory, string> = {
  SKIN_CANCER: 'Skin Cancer',
  ARTHRITIS: 'Arthritis',
  DUPUYTRENS: "Dupuytren's",
};

const statusLabels: Record<PatientStatus, string> = {
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  PAUSED: 'Paused',
};

function statusVariant(status: PatientStatus) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'ON_HOLD') return 'warning';
  return 'info';
}

function formatDate(value: string) {
  return value.slice(0, 10);
}

function requiredText(value: string | number | null | undefined) {
  return String(value ?? '').trim().length > 0;
}

function formFromPatient(patient: PatientEditDto): PatientFormState {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    mrn: patient.mrn,
    diagnosis: patient.diagnosis,
    diagnosisCategory: patient.diagnosisCategory,
    location: patient.location,
    physician: patient.physician,
    assignedStaff: patient.assignedStaff,
    chartRoundsPhase: patient.chartRoundsPhase,
    status: patient.status,
    nextAction: patient.nextAction,
    notes: patient.notes,
    initialCourse: {
      protocol: patient.initialCourse?.protocol ?? 'IGSRT',
      bodyRegion: patient.initialCourse?.bodyRegion ?? 'SITE',
      laterality: patient.initialCourse?.laterality ?? 'UNSPECIFIED',
      treatmentModality: patient.initialCourse?.treatmentModality ?? 'IGSRT',
      totalFractions: patient.initialCourse?.totalFractions ?? 20,
      startDate: patient.initialCourse?.startDate ?? '',
    },
  };
}

function checksForStep(form: PatientFormState, step: FormStep, isEdit: boolean, changeReason: string) {
  if (step === 'identity') {
    return [
      { label: 'First name', complete: requiredText(form.firstName) },
      { label: 'Last name', complete: requiredText(form.lastName) },
      { label: 'MRN', complete: requiredText(form.mrn) },
    ];
  }

  if (step === 'clinical') {
    return [
      { label: 'Diagnosis', complete: requiredText(form.diagnosis) },
      { label: 'Location', complete: requiredText(form.location) },
      { label: 'Physician', complete: requiredText(form.physician) },
      { label: 'Assigned staff', complete: requiredText(form.assignedStaff) },
    ];
  }

  if (step === 'course') {
    return [
      { label: 'Protocol', complete: requiredText(form.initialCourse?.protocol) },
      { label: 'Body region', complete: requiredText(form.initialCourse?.bodyRegion) },
      { label: 'Fractions', complete: Number(form.initialCourse?.totalFractions ?? 0) > 0 },
      { label: 'Modality', complete: requiredText(form.initialCourse?.treatmentModality) },
    ];
  }

  return isEdit
    ? [{ label: 'Change reason', complete: requiredText(changeReason) }]
    : [];
}

function firstInvalidStep(form: PatientFormState, isEdit: boolean, changeReason: string) {
  return formSteps.find((step) => checksForStep(form, step.id, isEdit, changeReason).some((check) => !check.complete))?.id;
}

function missingLabels(form: PatientFormState, step: FormStep, isEdit: boolean, changeReason: string) {
  return checksForStep(form, step, isEdit, changeReason)
    .filter((check) => !check.complete)
    .map((check) => check.label);
}

function Field({
  label,
  required = false,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`grid gap-1.5 text-xs font-bold text-[var(--color-text-muted)] ${className}`}>
      <span>{label}{required ? <span className="ml-1 text-[var(--color-error)]">*</span> : null}</span>
      {children}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2">
      <p className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[var(--color-text)]">{value || '—'}</div>
    </div>
  );
}

export function PatientRegistryClient({ rows }: PatientRegistryClientProps) {
  const router = useRouter();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [formStep, setFormStep] = useState<FormStep>('identity');
  const [form, setForm] = useState<PatientFormState>(blankForm);
  const [changeReason, setChangeReason] = useState('');
  const [editingPhiId, setEditingPhiId] = useState<string | null>(null);
  const [editingLastUpdatedAt, setEditingLastUpdatedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeStepIndex = formSteps.findIndex((step) => step.id === formStep);
  const isEdit = modalMode === 'edit' && Boolean(editingPhiId);
  const currentMissing = missingLabels(form, formStep, isEdit, changeReason);

  const metrics = useMemo(() => {
    return {
      total: rows.length,
      onTreatment: rows.filter((row) => row.chartRoundsPhase === 'ON_TREATMENT').length,
      upcoming: rows.filter((row) => row.chartRoundsPhase === 'UPCOMING').length,
      needsAction: rows.filter((row) => row.openTasks > 0 || row.pendingDocuments > 0 || row.flags > 0).length,
    };
  }, [rows]);

  const updateForm = <K extends keyof PatientFormState>(key: K, value: PatientFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateInitialCourse = <K extends keyof NonNullable<PatientFormState['initialCourse']>>(
    key: K,
    value: NonNullable<PatientFormState['initialCourse']>[K]
  ) => {
    setForm((current) => ({
      ...current,
      initialCourse: {
        ...(current.initialCourse ?? {}),
        [key]: value,
      },
    }));
  };

  const openCreate = () => {
    setForm(blankForm);
    setFormStep('identity');
    setChangeReason('');
    setEditingPhiId(null);
    setEditingLastUpdatedAt(null);
    setError(null);
    setMessage(null);
    setModalMode('create');
  };

  const openEdit = async (row: PatientRegistryRow) => {
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch(`/api/patients/${row.phiRecordId}`);
      const result = (await response.json()) as { patient?: PatientEditDto; message?: string };
      if (!response.ok || !result.patient) {
        throw new Error(result.message ?? 'Unable to open PHI record.');
      }

      setForm(formFromPatient(result.patient));
      setFormStep('identity');
      setChangeReason('');
      setEditingPhiId(row.phiRecordId);
      setEditingLastUpdatedAt(result.patient.lastUpdatedAt);
      setModalMode('edit');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to open PHI record.');
    } finally {
      setPending(false);
    }
  };

  const openWorkspace = (row: PatientRegistryRow) => {
    router.push(`/patients/${row.phiRecordId}`);
  };

  const closeModal = () => {
    if (pending) return;
    setModalMode(null);
    setEditingPhiId(null);
    setEditingLastUpdatedAt(null);
    setError(null);
  };

  const goNext = () => {
    const invalid = missingLabels(form, formStep, isEdit, changeReason);
    if (invalid.length) {
      setError(`Complete ${invalid.join(', ')} before continuing.`);
      return;
    }

    setError(null);
    setFormStep(formSteps[Math.min(activeStepIndex + 1, formSteps.length - 1)].id);
  };

  const goBack = () => {
    setError(null);
    setFormStep(formSteps[Math.max(activeStepIndex - 1, 0)].id);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidStep = firstInvalidStep(form, isEdit, changeReason);
    if (invalidStep) {
      setFormStep(invalidStep);
      setError(`Complete ${missingLabels(form, invalidStep, isEdit, changeReason).join(', ')} before saving.`);
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const payload = isEdit
        ? {
            ...form,
            expectedLastUpdatedAt: editingLastUpdatedAt ?? undefined,
            changeReason,
          }
        : form;
      const response = await fetch(isEdit ? `/api/patients/${editingPhiId}` : '/api/patients', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string; errors?: string[]; data?: { phiRecordId?: string } };
      if (!response.ok) {
        throw new Error(result.errors?.join(' ') ?? result.message ?? 'Patient record could not be saved.');
      }

      setModalMode(null);
      if (!isEdit && result.data?.phiRecordId) {
        router.push(`/patients/${result.data.phiRecordId}`);
        router.refresh();
        return;
      }

      setMessage('Patient record updated with redacted correction history.');
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Patient record could not be saved.');
    } finally {
      setPending(false);
    }
  };

  return (
    <PageStack>
      <PageHeader
        title="Patients"
        subtitle="Tokenized operational registry with authorized patient record access."
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Patient</Button>}
      />

      {message ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-success)]">
          {message}
        </div>
      ) : null}
      {error && !modalMode ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2 text-sm font-semibold text-[var(--color-error)]">
          {error}
        </div>
      ) : null}

      <StatGrid>
        <StatCard icon={UsersRound} label="Operational Records" value={metrics.total} tone="primary" />
        <StatCard icon={UserRoundCheck} label="On Treatment" value={metrics.onTreatment} tone="success" />
        <StatCard icon={ShieldCheck} label="Upcoming" value={metrics.upcoming} tone="info" />
        <StatCard icon={FileWarning} label="Needs Action" value={metrics.needsAction} tone="warning" />
      </StatGrid>

      <DataTable
        keyField="patientRef"
        columns={[
          { key: 'displayLabel', label: 'Patient', render: (row) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--color-text)]">{row.displayLabel}</p>
              <p className="truncate text-[11px] font-semibold text-[var(--color-text-muted)]">{row.phiRecordId}</p>
            </div>
          ) },
          { key: 'diagnosisCategory', label: 'Diagnosis', render: (row) => <Badge variant="info">{diagnosisLabels[row.diagnosisCategory]}</Badge> },
          { key: 'chartRoundsPhase', label: 'Phase', render: (row) => <Badge variant="primary">{phaseLabels[row.chartRoundsPhase]}</Badge> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{row.status.replaceAll('_', ' ')}</Badge> },
          { key: 'course', label: 'Course', render: (row) => (
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--color-primary)]">{row.activeCourseRef}</p>
              <p className="truncate text-[11px] text-[var(--color-text-muted)]">{row.protocolFamily}</p>
            </div>
          ) },
          { key: 'fractions', label: 'Fractions', render: (row) => `${row.currentFraction}/${row.totalFractions}` },
          { key: 'signals', label: 'Signals', render: (row) => (
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">
              {row.openTasks} tasks | {row.pendingDocuments} docs | {row.flags} flags
            </span>
          ) },
          { key: 'nextActionCategory', label: 'Next Action' },
          { key: 'lastUpdatedAt', label: 'Updated', render: (row) => formatDate(row.lastUpdatedAt) },
          { key: 'edit', label: '', render: (row) => (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={(event: MouseEvent<HTMLButtonElement>) => {
                event.stopPropagation();
                void openEdit(row);
              }}
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) },
        ]}
        rows={rows}
        search={{
          placeholder: 'Search token, course, diagnosis, phase, or workflow signal...',
          keys: ['displayLabel', 'patientRef', 'phiRecordId', 'activeCourseRef', 'diagnosisCategory', 'chartRoundsPhase', 'status', 'protocolFamily', 'nextActionCategory'],
        }}
        filters={[
          { id: 'diagnosisCategory', label: 'Diagnosis', getValue: (row) => diagnosisLabels[row.diagnosisCategory] },
          { id: 'chartRoundsPhase', label: 'Phase', getValue: (row) => phaseLabels[row.chartRoundsPhase] },
          { id: 'status', label: 'Status', getValue: (row) => row.status.replaceAll('_', ' ') },
          { id: 'needsAction', label: 'Needs Action', getValue: (row) => row.openTasks > 0 || row.pendingDocuments > 0 || row.flags > 0 ? 'Needs Action' : 'Clear' },
        ]}
        onRowClick={openWorkspace}
        empty="No operational patient records found."
      />

      <Modal open={modalMode !== null} onClose={closeModal} title={modalMode === 'edit' ? 'Edit Patient Record' : 'Add Patient'} width={780}>
        <form className="grid gap-4" onSubmit={submitForm}>
          <div className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
            <div className="grid gap-2 sm:grid-cols-4">
              {formSteps.map((step, index) => {
                const missing = missingLabels(form, step.id, isEdit, changeReason).length;
                const active = step.id === formStep;
                const complete = missing === 0;
                return (
                  <button
                    key={step.id}
                    type="button"
                    className={`clinical-focus rounded-[var(--radius-md)] border px-3 py-3 text-left transition ${
                      active
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                        : 'border-[var(--color-border-soft)] bg-[var(--color-card)] hover:bg-[var(--color-hover)]'
                    }`}
                    onClick={() => setFormStep(step.id)}
                  >
                    <span className="text-[11px] font-bold uppercase text-[var(--color-text-muted)]">Step {index + 1}</span>
                    <span className="mt-1 block text-sm font-bold text-[var(--color-text)]">{step.label}</span>
                    <span className="mt-1 block text-xs font-semibold text-[var(--color-text-muted)]">{complete ? step.detail : `${missing} field${missing === 1 ? '' : 's'} left`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error ? (
            <div className="rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--color-error)_22%,transparent)] bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)] p-3 text-sm font-semibold text-[var(--color-error)]">
              {error}
            </div>
          ) : null}

          {formStep === 'identity' ? (
            <div className="grid gap-4">
              <div>
                <p className="font-heading text-xl font-bold text-[var(--color-text)]">Patient Identity</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{currentMissing.length ? `${currentMissing.length} required field${currentMissing.length === 1 ? '' : 's'} left` : 'Ready for clinical basics'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="First name" required>
                  <Input value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} autoFocus />
                </Field>
                <Field label="Last name" required>
                  <Input value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} />
                </Field>
                <Field label="MRN" required className="sm:col-span-2">
                  <Input value={form.mrn} onChange={(event) => updateForm('mrn', event.target.value)} />
                </Field>
              </div>
            </div>
          ) : null}

          {formStep === 'clinical' ? (
            <div className="grid gap-4">
              <div>
                <p className="font-heading text-xl font-bold text-[var(--color-text)]">Clinical Basics</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{currentMissing.length ? `${currentMissing.length} required field${currentMissing.length === 1 ? '' : 's'} left` : 'Ready for course setup'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Diagnosis category" required>
                  <Select value={form.diagnosisCategory} onChange={(event) => updateForm('diagnosisCategory', event.target.value as DiagnosisCategory)}>
                    <option value="SKIN_CANCER">Skin Cancer</option>
                    <option value="ARTHRITIS">Arthritis</option>
                    <option value="DUPUYTRENS">Dupuytren&apos;s</option>
                  </Select>
                </Field>
                <Field label="Phase" required>
                  <Select value={form.chartRoundsPhase} onChange={(event) => updateForm('chartRoundsPhase', event.target.value as ChartRoundsPhase)}>
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ON_TREATMENT">On Treatment</option>
                    <option value="POST">Post-Treatment</option>
                  </Select>
                </Field>
                <Field label="Diagnosis" required className="sm:col-span-2">
                  <Input value={form.diagnosis} onChange={(event) => updateForm('diagnosis', event.target.value)} />
                </Field>
                <Field label="Location" required>
                  <Input value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
                </Field>
                <Field label="Physician" required>
                  <Input value={form.physician} onChange={(event) => updateForm('physician', event.target.value)} />
                </Field>
                <Field label="Assigned staff" required>
                  <Input value={form.assignedStaff} onChange={(event) => updateForm('assignedStaff', event.target.value)} />
                </Field>
                <Field label="Status" required>
                  <Select value={form.status} onChange={(event) => updateForm('status', event.target.value as PatientStatus)}>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="PAUSED">Paused</option>
                  </Select>
                </Field>
              </div>
            </div>
          ) : null}

          {formStep === 'course' ? (
            <div className="grid gap-4">
              <div>
                <p className="font-heading text-xl font-bold text-[var(--color-text)]">Course Setup</p>
                <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{currentMissing.length ? `${currentMissing.length} required field${currentMissing.length === 1 ? '' : 's'} left` : 'Ready for review'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Protocol" required>
                  <Select value={form.initialCourse?.protocol ?? 'IGSRT'} onChange={(event) => updateInitialCourse('protocol', event.target.value)}>
                    <option value="IGSRT">Skin Cancer IGSRT</option>
                    <option value="Joint">Arthritis Joint</option>
                    <option value="Dupuytren's">Dupuytren&apos;s</option>
                    <option value="Universal">Universal</option>
                  </Select>
                </Field>
                <Field label="Body region" required>
                  <Select value={form.initialCourse?.bodyRegion ?? 'SITE'} onChange={(event) => updateInitialCourse('bodyRegion', event.target.value)}>
                    <option value="SITE">Site</option>
                    <option value="HAND">Hand</option>
                    <option value="FOOT">Foot</option>
                    <option value="KNEE">Knee</option>
                  </Select>
                </Field>
                <Field label="Laterality">
                  <Select value={form.initialCourse?.laterality ?? 'UNSPECIFIED'} onChange={(event) => updateInitialCourse('laterality', event.target.value)}>
                    <option value="UNSPECIFIED">Unspecified</option>
                    <option value="LEFT">Left</option>
                    <option value="RIGHT">Right</option>
                    <option value="BILATERAL">Bilateral</option>
                  </Select>
                </Field>
                <Field label="Modality" required>
                  <Input value={form.initialCourse?.treatmentModality ?? ''} onChange={(event) => updateInitialCourse('treatmentModality', event.target.value)} />
                </Field>
                <Field label="Fractions" required>
                  <Input
                    type="number"
                    min={1}
                    value={form.initialCourse?.totalFractions ?? 0}
                    onChange={(event) => updateInitialCourse('totalFractions', Number(event.target.value))}
                  />
                </Field>
                <Field label="Start date">
                  <Input type="date" value={form.initialCourse?.startDate ?? ''} onChange={(event) => updateInitialCourse('startDate', event.target.value)} />
                </Field>
                <Field label="Next action" className="xl:col-span-3">
                  <Input value={form.nextAction ?? ''} onChange={(event) => updateForm('nextAction', event.target.value)} />
                </Field>
                <Field label="Notes" className="xl:col-span-3">
                  <Textarea rows={3} value={form.notes ?? ''} onChange={(event) => updateForm('notes', event.target.value)} />
                </Field>
              </div>
            </div>
          ) : null}

          {formStep === 'review' ? (
            <div className="grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-heading text-xl font-bold text-[var(--color-text)]">Review & Save</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{isEdit ? 'Correction history will stay redacted.' : 'Saving creates the patient-course bundle.'}</p>
                </div>
                <Badge variant={currentMissing.length ? 'warning' : 'success'}>{currentMissing.length ? 'Needs reason' : 'Ready'}</Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ReviewRow label="Patient" value={`${form.firstName} ${form.lastName}`} />
                <ReviewRow label="MRN" value={form.mrn} />
                <ReviewRow label="Diagnosis" value={`${diagnosisLabels[form.diagnosisCategory]} | ${form.diagnosis}`} />
                <ReviewRow label="Team" value={`${form.physician} | ${form.assignedStaff}`} />
                <ReviewRow label="Phase / Status" value={`${phaseLabels[form.chartRoundsPhase]} | ${statusLabels[form.status]}`} />
                <ReviewRow label="Course" value={`${form.initialCourse?.protocol ?? '—'} | ${form.initialCourse?.bodyRegion ?? '—'} | ${form.initialCourse?.totalFractions ?? 0} fx`} />
              </div>

              {isEdit ? (
                <Field label="Change reason" required>
                  <Textarea rows={3} value={changeReason} onChange={(event) => setChangeReason(event.target.value)} placeholder="What changed and why" />
                </Field>
              ) : null}

              <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3 text-xs font-semibold text-[var(--color-text-muted)]">
                Prototype PHI action uses server-owned session claims. Mutation responses and correction history stay redacted.
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border-soft)] pt-3">
            <Button type="button" variant="ghost" disabled={pending} onClick={closeModal}>Cancel</Button>
            <div className="flex flex-wrap gap-2">
              {activeStepIndex > 0 ? (
                <Button type="button" variant="secondary" disabled={pending} onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              ) : null}
              {activeStepIndex < formSteps.length - 1 ? (
                <Button type="button" disabled={pending} onClick={goNext}>
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button type="submit" disabled={pending}>
                  {pending ? <Save className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  {pending ? 'Saving' : isEdit ? 'Save Changes' : 'Save & Open'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Modal>
    </PageStack>
  );
}
