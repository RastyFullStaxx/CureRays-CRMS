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
  Upload,
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
  PatientPrefillField,
  PatientPrefillResult,
  PatientStatus,
} from '@/lib/types';
import type { PatientRegistryRow } from '@/lib/services/patient-service';
import { phaseTone, statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';

type PatientRegistryClientProps = {
  rows: PatientRegistryRow[];
  title?: string;
  subtitle?: string;
  showAddPatient?: boolean;
  empty?: string;
};

type PatientFormState = PatientCreateInput & {
  chartRoundsPhase: ChartRoundsPhase;
  status: PatientStatus;
};

type FormStep = 'start' | 'detected' | 'identity' | 'clinical' | 'course' | 'review';
type PatientFieldId =
  | keyof PatientFormState
  | 'initialCourse.protocol'
  | 'initialCourse.bodyRegion'
  | 'initialCourse.treatmentModality'
  | 'initialCourse.totalFractions'
  | 'changeReason';
type FieldCheck = { label: string; complete: boolean; field: PatientFieldId };

const formSteps: Array<{ id: FormStep; label: string; detail: string }> = [
  { id: 'identity', label: 'Patient Identity', detail: 'Name and reference' },
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

function checksForStep(form: PatientFormState, step: FormStep, isEdit: boolean, changeReason: string): FieldCheck[] {
  if (step === 'identity') {
    return [
      { label: 'First Name', complete: requiredText(form.firstName), field: 'firstName' },
      { label: 'Last Name', complete: requiredText(form.lastName), field: 'lastName' },
    ];
  }

  if (step === 'clinical') {
    return [
      { label: 'Diagnosis', complete: requiredText(form.diagnosis), field: 'diagnosis' },
      { label: 'Location', complete: requiredText(form.location), field: 'location' },
      { label: 'Physician', complete: requiredText(form.physician), field: 'physician' },
      { label: 'Assigned Staff', complete: requiredText(form.assignedStaff), field: 'assignedStaff' },
    ];
  }

  if (step === 'course') {
    return [
      { label: 'Protocol', complete: requiredText(form.initialCourse?.protocol), field: 'initialCourse.protocol' },
      { label: 'Body Region', complete: requiredText(form.initialCourse?.bodyRegion), field: 'initialCourse.bodyRegion' },
      { label: 'Fractions', complete: Number(form.initialCourse?.totalFractions ?? 0) > 0, field: 'initialCourse.totalFractions' },
      { label: 'Modality', complete: requiredText(form.initialCourse?.treatmentModality), field: 'initialCourse.treatmentModality' },
    ];
  }

  return isEdit
    ? [{ label: 'Change Reason', complete: requiredText(changeReason), field: 'changeReason' }]
    : [];
}

function firstInvalidStep(form: PatientFormState, isEdit: boolean, changeReason: string) {
  return formSteps.find((step) => checksForStep(form, step.id, isEdit, changeReason).some((check) => !check.complete))?.id;
}

function missingLabels(form: PatientFormState, step: FormStep, isEdit: boolean, changeReason: string) {
  return missingChecks(form, step, isEdit, changeReason).map((check) => check.label);
}

function missingChecks(form: PatientFormState, step: FormStep, isEdit: boolean, changeReason: string) {
  return checksForStep(form, step, isEdit, changeReason).filter((check) => !check.complete);
}

function focusPatientField(field: PatientFieldId | undefined) {
  if (!field) return;
  window.setTimeout(() => {
    const target = document.querySelector<HTMLElement>(
      `[data-patient-field="${field}"] input, [data-patient-field="${field}"] select, [data-patient-field="${field}"] textarea`
    );
    target?.focus();
  }, 0);
}

function Field({
  label,
  required = false,
  field,
  helper,
  className = '',
  children,
}: {
  label: string;
  required?: boolean;
  field?: PatientFieldId;
  helper?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label data-patient-field={field} className={`grid gap-1.5 type-supporting text-[var(--color-text-muted)] ${className}`}>
      <span>{label}{required ? <span className="ml-1 text-[var(--status-negative-text)]">*</span> : null}</span>
      {children}
      {helper ? <span className="type-supporting text-[var(--color-text-muted)]">{helper}</span> : null}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] px-3 py-2">
      <p className="type-label text-[var(--color-text-muted)]">{label}</p>
      <div className="mt-1 type-body text-[var(--color-text)]">{value || '—'}</div>
    </div>
  );
}

function prefillStatusVariant(status: PatientPrefillField['status']) {
  if (status === 'FOUND') return 'positive';
  if (status === 'NEEDS_REVIEW') return 'intermediate';
  return 'neutral';
}

function applyPrefillDraft(form: PatientFormState, prefill: PatientPrefillResult): PatientFormState {
  const draft = prefill.draft;
  const nextCourse = {
    ...(form.initialCourse ?? {}),
    ...(draft.initialCourse?.bodyRegion ? { bodyRegion: draft.initialCourse.bodyRegion } : {}),
    ...(draft.initialCourse?.laterality ? { laterality: draft.initialCourse.laterality } : {}),
    ...(draft.initialCourse?.protocol ? { protocol: draft.initialCourse.protocol } : {}),
    ...(draft.initialCourse?.treatmentModality ? { treatmentModality: draft.initialCourse.treatmentModality } : {}),
    ...(draft.initialCourse?.totalFractions ? { totalFractions: draft.initialCourse.totalFractions } : {}),
    ...(draft.initialCourse?.startDate ? { startDate: draft.initialCourse.startDate } : {}),
  };

  return {
    ...form,
    ...(draft.firstName ? { firstName: draft.firstName } : {}),
    ...(draft.lastName ? { lastName: draft.lastName } : {}),
    ...(draft.mrn ? { mrn: draft.mrn } : {}),
    ...(draft.diagnosis ? { diagnosis: draft.diagnosis } : {}),
    ...(draft.diagnosisCategory ? { diagnosisCategory: draft.diagnosisCategory } : {}),
    ...(draft.location ? { location: draft.location } : {}),
    ...(draft.physician ? { physician: draft.physician } : {}),
    notes: draft.notes && !form.notes ? draft.notes : form.notes,
    initialCourse: nextCourse,
  };
}

type PatientFormUpdater = <K extends keyof PatientFormState>(key: K, value: PatientFormState[K]) => void;
type CourseFormUpdater = <K extends keyof NonNullable<PatientFormState['initialCourse']>>(
  key: K,
  value: NonNullable<PatientFormState['initialCourse']>[K]
) => void;

function ClinicalFields({
  form,
  updateForm,
  compact = false,
}: {
  form: PatientFormState;
  updateForm: PatientFormUpdater;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${compact ? '' : 'xl:grid-cols-2'}`}>
      <Field label="Diagnosis Category" required>
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
      <Field label="Diagnosis" field="diagnosis" required className="sm:col-span-2">
        <Input value={form.diagnosis} onChange={(event) => updateForm('diagnosis', event.target.value)} />
      </Field>
      <Field label="Location" field="location" required>
        <Input value={form.location} onChange={(event) => updateForm('location', event.target.value)} />
      </Field>
      <Field label="Physician" field="physician" required>
        <Input value={form.physician} onChange={(event) => updateForm('physician', event.target.value)} />
      </Field>
      <Field label="Assigned Staff" field="assignedStaff" required>
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
  );
}

function CourseFields({
  form,
  updateForm,
  updateInitialCourse,
  compact = false,
}: {
  form: PatientFormState;
  updateForm: PatientFormUpdater;
  updateInitialCourse: CourseFormUpdater;
  compact?: boolean;
}) {
  const gridColumns = compact ? 'xl:grid-cols-2' : 'xl:grid-cols-3';
  return (
    <div className={`grid gap-3 sm:grid-cols-2 ${gridColumns}`}>
      <Field label="Protocol" field="initialCourse.protocol" required>
        <Select value={form.initialCourse?.protocol ?? 'IGSRT'} onChange={(event) => updateInitialCourse('protocol', event.target.value)}>
          <option value="IGSRT">Skin Cancer IGSRT</option>
          <option value="Joint">Arthritis Joint</option>
          <option value="Dupuytren's">Dupuytren&apos;s</option>
          <option value="Universal">Universal</option>
        </Select>
      </Field>
      <Field label="Body Region" field="initialCourse.bodyRegion" required>
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
      <Field label="Modality" field="initialCourse.treatmentModality" required>
        <Input value={form.initialCourse?.treatmentModality ?? ''} onChange={(event) => updateInitialCourse('treatmentModality', event.target.value)} />
      </Field>
      <Field label="Fractions" field="initialCourse.totalFractions" required>
        <Input
          type="number"
          min={1}
          value={form.initialCourse?.totalFractions ?? 0}
          onChange={(event) => updateInitialCourse('totalFractions', Number(event.target.value))}
        />
      </Field>
      <Field label="Start Date">
        <Input type="date" value={form.initialCourse?.startDate ?? ''} onChange={(event) => updateInitialCourse('startDate', event.target.value)} />
      </Field>
      <Field label="Next Action" className="xl:col-span-3">
        <Input value={form.nextAction ?? ''} onChange={(event) => updateForm('nextAction', event.target.value)} />
      </Field>
      <Field label="Notes" className="xl:col-span-3">
        <Textarea rows={3} value={form.notes ?? ''} onChange={(event) => updateForm('notes', event.target.value)} />
      </Field>
    </div>
  );
}

export function PatientRegistryClient({
  rows,
  title = 'Patients',
  subtitle = 'Tokenized operational registry with authorized patient record access.',
  showAddPatient = true,
  empty = 'No operational patient records found.',
}: PatientRegistryClientProps) {
  const router = useRouter();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [formStep, setFormStep] = useState<FormStep>('identity');
  const [form, setForm] = useState<PatientFormState>(blankForm);
  const [changeReason, setChangeReason] = useState('');
  const [editingPhiId, setEditingPhiId] = useState<string | null>(null);
  const [editingLastUpdatedAt, setEditingLastUpdatedAt] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<PatientPrefillResult | null>(null);
  const [prefillFileName, setPrefillFileName] = useState('');
  const [prefillIdentityConfirmed, setPrefillIdentityConfirmed] = useState(false);
  const [prefillPending, setPrefillPending] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const activeStepIndex = formSteps.findIndex((step) => step.id === formStep);
  const isEdit = modalMode === 'edit' && Boolean(editingPhiId);
  const isCreate = modalMode === 'create';

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
    setFormStep('start');
    setChangeReason('');
    setEditingPhiId(null);
    setEditingLastUpdatedAt(null);
    setPrefill(null);
    setPrefillFileName('');
    setPrefillIdentityConfirmed(false);
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
    if (pending || prefillPending) return;
    setModalMode(null);
    setEditingPhiId(null);
    setEditingLastUpdatedAt(null);
    setPrefill(null);
    setPrefillFileName('');
    setPrefillIdentityConfirmed(false);
    setError(null);
  };

  const startManualEntry = () => {
    setForm(blankForm);
    setPrefill(null);
    setPrefillFileName('');
    setPrefillIdentityConfirmed(false);
    setError(null);
    setFormStep('identity');
  };

  const uploadPrefillFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setError('Upload one AVS or Intake DOCX file.');
      return;
    }

    setPrefillPending(true);
    setError(null);
    setPrefill(null);
    setPrefillIdentityConfirmed(false);
    setPrefillFileName(file.name);

    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/patients/prefill', {
        method: 'POST',
        body,
      });
      const result = (await response.json()) as { prefill?: PatientPrefillResult; message?: string };
      if (!response.ok || !result.prefill) {
        throw new Error(result.message ?? 'Patient prefill could not be completed.');
      }

      setPrefill(result.prefill);
      setFormStep('detected');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Patient prefill could not be completed.');
      setFormStep('start');
    } finally {
      setPrefillPending(false);
    }
  };

  const confirmPrefill = () => {
    if (!prefill || !prefillIdentityConfirmed) {
      setError('Confirm the detected patient identity before continuing.');
      return;
    }

    setForm((current) => applyPrefillDraft(current, prefill));
    setError(null);
    setFormStep('identity');
  };

  const goNext = () => {
    const invalid = missingChecks(form, formStep, isEdit, changeReason);
    if (invalid.length) {
      setError(`Complete ${invalid.map((item) => item.label).join(', ')} before continuing.`);
      focusPatientField(invalid[0]?.field);
      return;
    }

    setError(null);
    setFormStep(formSteps[Math.min(activeStepIndex + 1, formSteps.length - 1)].id);
  };

  const goBack = () => {
    setError(null);
    if (formStep === 'identity') {
      setFormStep(prefill ? 'detected' : 'start');
      return;
    }
    setFormStep(formSteps[Math.max(activeStepIndex - 1, 0)].id);
  };

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidStep = firstInvalidStep(form, isEdit, changeReason);
    if (invalidStep) {
      const invalid = missingChecks(form, invalidStep, isEdit, changeReason);
      setFormStep(invalidStep);
      setError(`Complete ${invalid.map((item) => item.label).join(', ')} before saving.`);
      focusPatientField(invalid[0]?.field);
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
      const result = (await response.json()) as {
        message?: string;
        errors?: string[];
        data?: {
          phiRecordId?: string;
          id?: string;
          patientRef?: string;
        };
      };
      if (!response.ok) {
        throw new Error(result.errors?.join(' ') ?? result.message ?? 'Patient record could not be saved.');
      }

      setModalMode(null);
      if (!isEdit && result.data) {
        const workspaceId =
          result.data.phiRecordId ?? result.data.id ?? result.data.patientRef;
        if (workspaceId) {
          router.push(`/patients/${workspaceId}`);
        } else {
          setMessage('Patient was saved. Open workspace manually from the patient list.');
        }
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

  const canOpenCreateStep = (targetIndex: number) => {
    if (targetIndex <= activeStepIndex) return true;
    return formSteps
      .slice(0, targetIndex)
      .every((step) => missingChecks(form, step.id, false, changeReason).length === 0);
  };

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={showAddPatient ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Patient</Button> : undefined}
      />

      {message ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--status-positive-border)] bg-[var(--status-positive-surface)] px-3 py-2 type-body text-[var(--status-positive-text)]">
          {message}
        </div>
      ) : null}
      {error && !modalMode ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--status-negative-border)] bg-[var(--status-negative-surface)] px-3 py-2 type-body text-[var(--status-negative-text)]">
          {error}
        </div>
      ) : null}

      <StatGrid>
        <StatCard icon={UsersRound} label="Operational Records" value={metrics.total} tone="neutral" />
        <StatCard icon={UserRoundCheck} label="On Treatment" value={metrics.onTreatment} tone="neutral" />
        <StatCard icon={ShieldCheck} label="Upcoming" value={metrics.upcoming} tone="neutral" />
        <StatCard icon={FileWarning} label="Needs Action" value={metrics.needsAction} tone="intermediate" />
      </StatGrid>

      <DataTable
        keyField="patientRef"
        className="min-h-[620px]"
        minTableWidth="1480px"
        columns={[
          { key: 'displayLabel', label: 'Patient', render: (row) => (
            <div className="min-w-0">
              <p className="truncate type-medium text-[var(--color-text)]">{row.displayLabel}</p>
              <p className="truncate type-supporting text-[var(--color-text-muted)]">{row.phiRecordId}</p>
            </div>
          ) },
          { key: 'diagnosisCategory', label: 'Diagnosis', render: (row) => <Badge variant="neutral">{diagnosisLabels[row.diagnosisCategory]}</Badge> },
          { key: 'chartRoundsPhase', label: 'Phase', render: (row) => <Badge variant={phaseTone(row.chartRoundsPhase)}>{phaseLabels[row.chartRoundsPhase]}</Badge> },
          { key: 'status', label: 'Status', render: (row) => <Badge variant={statusTone(row.status)}>{formatUiLabel(row.status)}</Badge> },
          { key: 'course', label: 'Course', render: (row) => (
            <div className="min-w-0">
              <p className="truncate type-medium text-[var(--color-primary)]">{row.activeCourseRef}</p>
              <p className="truncate type-supporting text-[var(--color-text-muted)]">{row.protocolFamily}</p>
            </div>
          ) },
          { key: 'fractions', label: 'Fractions', render: (row) => `${row.currentFraction}/${row.totalFractions}` },
          { key: 'signals', label: 'Signals', render: (row) => (
            <span className="type-supporting text-[var(--color-text-muted)]">
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
          { id: 'status', label: 'Status', getValue: (row) => formatUiLabel(row.status) },
          { id: 'needsAction', label: 'Needs Action', getValue: (row) => row.openTasks > 0 || row.pendingDocuments > 0 || row.flags > 0 ? 'Needs Action' : 'Clear' },
        ]}
        onRowClick={openWorkspace}
        empty={empty}
      />

      <Modal
        open={modalMode !== null}
        onClose={closeModal}
        title={modalMode === 'edit' ? 'Edit Patient Record' : 'Add Patient'}
        width={isEdit ? 'var(--width-clinical-modal-xl)' : 'var(--width-clinical-modal)'}
        height={isEdit ? 'var(--height-clinical-modal-xl)' : 'var(--height-clinical-modal)'}
        contentClassName="flex flex-col"
      >
        <form className="clinical-modal-frame flex-1" onSubmit={submitForm}>
          {isCreate && (formStep === 'start' || formStep === 'detected') ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="type-body text-[var(--color-text)]">Start patient registration</p>
                  <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                    Upload AVS/Intake to prefill draft fields, or continue manually.
                  </p>
                </div>
                <Badge variant={formStep === 'detected' ? 'intermediate' : 'neutral'}>{formStep === 'detected' ? 'Review detected details' : 'Step 0'}</Badge>
              </div>
            </div>
          ) : null}

          {isCreate && formStep !== 'start' && formStep !== 'detected' ? (
            <div className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
              <div className="grid gap-2 sm:grid-cols-4">
                {formSteps.map((step, index) => {
                  const missing = missingLabels(form, step.id, false, changeReason).length;
                  const active = step.id === formStep;
                  const complete = missing === 0;
                  const canOpen = canOpenCreateStep(index);
                  return (
                    <button
                      key={step.id}
                      type="button"
                      disabled={!canOpen || pending}
                      className={`clinical-focus min-h-[74px] rounded-[var(--radius-md)] border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        active
                          ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                          : 'border-[var(--color-border-soft)] bg-[var(--color-card)] hover:bg-[var(--color-hover)]'
                      }`}
                      onClick={() => canOpen && setFormStep(step.id)}
                    >
                      <span className="type-label text-[var(--color-text-muted)]">Step {index + 1}</span>
                      <span className="mt-1 block type-body text-[var(--color-text)]">{step.label}</span>
                      <span className="mt-1 block type-supporting text-[var(--color-text-muted)]">{complete ? 'Ready' : 'Needs required info'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {isEdit ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="type-body text-[var(--color-text)]">All editable fields are shown together.</p>
                  <p className="mt-1 type-supporting text-[var(--color-text-muted)]">Save requires a change reason and validates stale edits before updating.</p>
                </div>
                <Badge variant="neutral">{editingPhiId ?? 'PHI record'}</Badge>
              </div>
            </div>
          ) : null}

          <div className="clinical-modal-body grid content-start gap-4 py-4">
            {error ? (
              <div className="clinical-alert-negative p-3 type-body" role="alert">
                {error}
              </div>
            ) : null}

            {isCreate && formStep === 'start' ? (
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        <Upload className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className=" type-body text-[var(--color-text)]">Upload AVS / Intake</p>
                        <p className="mt-1 type-body text-[var(--color-text-muted)]">
                          CRMS will read one DOCX file in memory and prefill draft fields for review.
                        </p>
                      </div>
                    </div>
                    <div className="clinical-file-picker mt-4">
                      <label className="clinical-file-picker-label" htmlFor="patient-prefill-docx-input">
                        <Upload className="h-4 w-4" aria-hidden="true" />
                        Choose DOCX
                      </label>
                      <span className="clinical-file-picker-name" title={prefillFileName || undefined}>
                        {prefillPending ? 'Reading selected DOCX...' : prefillFileName || 'No file selected'}
                      </span>
                      <input
                        id="patient-prefill-docx-input"
                        className="sr-only"
                        type="file"
                        accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        disabled={prefillPending}
                        onChange={(event) => {
                          void uploadPrefillFile(event.target.files?.[0]);
                          event.target.value = '';
                        }}
                      />
                    </div>
                    <p className="mt-2 type-supporting text-[var(--color-text-muted)]">
                      DOCX only. File is not stored after extraction.
                    </p>
                  </div>

                  <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                        <Edit3 className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className=" type-body text-[var(--color-text)]">Enter Manually</p>
                        <p className="mt-1 type-body text-[var(--color-text-muted)]">
                          Start with a blank form when there is no AVS or Intake file.
                        </p>
                      </div>
                    </div>
                    <Button type="button" className="mt-4 clinical-action-lg" disabled={prefillPending} onClick={startManualEntry}>
                      Manual Entry
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                {prefillPending ? (
                  <div className="clinical-muted-surface p-3 type-body text-[var(--color-text-muted)]">
                    Reading DOCX and detecting patient details...
                  </div>
                ) : null}
              </div>
            ) : null}

            {isCreate && formStep === 'detected' && prefill ? (
              <div className="grid gap-4">
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="clinical-label">Detected Details Review</p>
                      <h3 className="mt-1 type-heading text-[var(--color-text)]">
                        {prefill.templateType === 'AVS' ? 'AVS document' : 'Intake document'}
                      </h3>
                      <p className="mt-1 type-supporting text-[var(--color-text-muted)]">
                        {prefillFileName || 'Uploaded DOCX'} | File retained: No
                      </p>
                    </div>
                    <Badge variant="intermediate">Staff review required</Badge>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {prefill.fields.map((field) => (
                    <div key={field.key} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="clinical-label">{field.label}</p>
                          <p className="mt-1 min-h-5 break-words type-body text-[var(--color-text)]">
                            {field.value || 'Not found'}
                          </p>
                        </div>
                        <Badge variant={prefillStatusVariant(field.status)}>{formatUiLabel(field.status)}</Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <label className="clinical-muted-surface flex items-start gap-3 p-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                    checked={prefillIdentityConfirmed}
                    onChange={(event) => setPrefillIdentityConfirmed(event.target.checked)}
                  />
                  <span className="type-body text-[var(--color-text)]">
                    I reviewed the detected patient identity and understand these values are draft only.
                  </span>
                </label>

                {prefill.warnings.length ? (
                  <div className="grid gap-2">
                    {prefill.warnings.map((warning) => (
                      <div key={warning} className="clinical-alert-negative p-3 type-supporting">
                        {warning}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            {isCreate && formStep === 'identity' ? (
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="First Name" field="firstName" required>
                    <Input value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} autoFocus />
                  </Field>
                  <Field label="Last Name" field="lastName" required>
                    <Input value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} />
                  </Field>
                  <Field label="External MRN" field="mrn" className="sm:col-span-2" helper="Optional. Use the EMR/registration MRN only when it already exists.">
                    <Input value={form.mrn} onChange={(event) => updateForm('mrn', event.target.value)} />
                  </Field>
                </div>
              </div>
            ) : null}

            {isCreate && formStep === 'clinical' ? (
              <ClinicalFields form={form} updateForm={updateForm} />
            ) : null}

            {isCreate && formStep === 'course' ? (
              <CourseFields form={form} updateForm={updateForm} updateInitialCourse={updateInitialCourse} />
            ) : null}

            {isCreate && formStep === 'review' ? (
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewRow label="External MRN" value={form.mrn || 'Not recorded'} />
                  <ReviewRow label="Patient" value={`${form.firstName} ${form.lastName}`} />
                  <ReviewRow label="Diagnosis" value={`${diagnosisLabels[form.diagnosisCategory]} | ${form.diagnosis}`} />
                  <ReviewRow label="Team" value={`${form.physician} | ${form.assignedStaff}`} />
                  <ReviewRow label="Phase / Status" value={`${phaseLabels[form.chartRoundsPhase]} | ${statusLabels[form.status]}`} />
                  <ReviewRow label="Course" value={`${form.initialCourse?.protocol ?? '—'} | ${form.initialCourse?.bodyRegion ?? '—'} | ${form.initialCourse?.totalFractions ?? 0} fx`} />
                </div>
                <div className="clinical-muted-surface p-3 type-supporting text-[var(--color-text-muted)]">
                  Prototype PHI action uses server-owned session claims. Mutation responses and correction history stay redacted.
                </div>
              </div>
            ) : null}

            {isEdit ? (
              <div className="grid gap-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
                  <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                    <p className=" type-body text-[var(--color-text)]">Patient Identity</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="First Name" field="firstName" required>
                        <Input value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} autoFocus />
                      </Field>
                      <Field label="Last Name" field="lastName" required>
                        <Input value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} />
                      </Field>
                      <Field label="External MRN" field="mrn" className="sm:col-span-2" helper="Optional external/EMR identifier. Leave blank if it is not assigned yet.">
                        <Input value={form.mrn} onChange={(event) => updateForm('mrn', event.target.value)} />
                      </Field>
                    </div>
                  </div>
                  <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                    <p className=" type-body text-[var(--color-text)]">Clinical Basics</p>
                    <ClinicalFields form={form} updateForm={updateForm} compact />
                  </div>
                </div>
                <div className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-card)] p-3">
                  <p className=" type-body text-[var(--color-text)]">Course Setup</p>
                  <CourseFields form={form} updateForm={updateForm} updateInitialCourse={updateInitialCourse} compact />
                </div>
                <div>
                  <Field label="Change Reason" field="changeReason" required>
                    <Textarea rows={2} value={changeReason} onChange={(event) => setChangeReason(event.target.value)} placeholder="What changed and why" />
                  </Field>
                </div>
              </div>
            ) : null}
          </div>

          <div className="clinical-modal-footer">
            <Button type="button" variant="ghost" className="clinical-action" disabled={pending || prefillPending} onClick={closeModal}>Cancel</Button>
            <div className="flex flex-wrap gap-2">
              {isCreate && formStep === 'detected' ? (
                <>
                  <Button type="button" variant="secondary" className="clinical-action" disabled={prefillPending} onClick={() => {
                    setError(null);
                    setFormStep('start');
                  }}>
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back
                  </Button>
                  <Button type="button" variant="secondary" className="clinical-action-lg" disabled={prefillPending} onClick={startManualEntry}>
                    Enter Manually
                  </Button>
                  <Button type="button" className="clinical-action-lg" disabled={!prefillIdentityConfirmed || prefillPending} onClick={confirmPrefill}>
                    Use Detected Details
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </>
              ) : null}
              {isCreate && formStep !== 'start' && formStep !== 'detected' && (activeStepIndex > 0 || formStep === 'identity') ? (
                <Button type="button" variant="secondary" className="clinical-action" disabled={pending} onClick={goBack}>
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Button>
              ) : null}
              {isCreate && formStep !== 'start' && formStep !== 'detected' && activeStepIndex < formSteps.length - 1 ? (
                <Button type="button" className="clinical-action" disabled={pending || missingChecks(form, formStep, false, changeReason).length > 0} onClick={goNext}>
                  Continue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : null}
              {(isEdit || (isCreate && formStep === 'review')) ? (
                <Button type="submit" className="clinical-action-lg" disabled={pending}>
                  {pending ? <Save className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  {pending ? 'Saving' : isEdit ? 'Save Changes' : 'Save & Open'}
                </Button>
              ) : null}
            </div>
          </div>
        </form>
      </Modal>
    </PageStack>
  );
}
