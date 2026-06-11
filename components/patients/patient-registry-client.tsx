'use client';

import { useMemo, useState, type FormEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Edit3, FileWarning, Plus, ShieldCheck, UserRoundCheck, UsersRound } from 'lucide-react';
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

function statusVariant(status: PatientStatus) {
  if (status === 'ACTIVE') return 'success';
  if (status === 'ON_HOLD') return 'warning';
  return 'info';
}

function formatDate(value: string) {
  return value.slice(0, 10);
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

export function PatientRegistryClient({ rows }: PatientRegistryClientProps) {
  const router = useRouter();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<PatientFormState>(blankForm);
  const [editingPhiId, setEditingPhiId] = useState<string | null>(null);
  const [editingLastUpdatedAt, setEditingLastUpdatedAt] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);

    try {
      const isEdit = modalMode === 'edit' && editingPhiId;
      const payload = isEdit
        ? {
            ...form,
            expectedLastUpdatedAt: editingLastUpdatedAt ?? undefined,
            changeReason: 'Pilot record maintenance correction from patient registry.',
          }
        : form;
      const response = await fetch(isEdit ? `/api/patients/${editingPhiId}` : '/api/patients', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { message?: string; errors?: string[] };
      if (!response.ok) {
        throw new Error(result.errors?.join(' ') ?? result.message ?? 'Patient record could not be saved.');
      }

      setModalMode(null);
      setMessage(isEdit ? 'Patient record updated with redacted correction history.' : 'Patient, course, workflow, tasks, documents, audit checks, and folder placeholders created.');
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

      <Modal open={modalMode !== null} onClose={closeModal} title={modalMode === 'edit' ? 'Edit PHI Record' : 'Add Patient'} width={620}>
        <form className="grid gap-3" onSubmit={submitForm}>
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3 text-xs font-semibold text-[var(--color-text-muted)]">
            Prototype PHI action uses server-owned session claims. Mutation responses and correction history stay redacted.
          </div>
          {error ? <p className="text-sm font-semibold text-[var(--color-error)]">{error}</p> : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              First name
              <Input value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Last name
              <Input value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              MRN
              <Input value={form.mrn} onChange={(event) => updateForm('mrn', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Diagnosis category
              <Select value={form.diagnosisCategory} onChange={(event) => updateForm('diagnosisCategory', event.target.value as DiagnosisCategory)}>
                <option value="SKIN_CANCER">Skin Cancer</option>
                <option value="ARTHRITIS">Arthritis</option>
                <option value="DUPUYTRENS">Dupuytren&apos;s</option>
              </Select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)] sm:col-span-2">
              Diagnosis
              <Input value={form.diagnosis} onChange={(event) => updateForm('diagnosis', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Location
              <Input value={form.location} onChange={(event) => updateForm('location', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Physician
              <Input value={form.physician} onChange={(event) => updateForm('physician', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Assigned staff
              <Input value={form.assignedStaff} onChange={(event) => updateForm('assignedStaff', event.target.value)} required />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Phase
              <Select value={form.chartRoundsPhase} onChange={(event) => updateForm('chartRoundsPhase', event.target.value as ChartRoundsPhase)}>
                <option value="UPCOMING">Upcoming</option>
                <option value="ON_TREATMENT">On Treatment</option>
                <option value="POST">Post-Treatment</option>
              </Select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Status
              <Select value={form.status} onChange={(event) => updateForm('status', event.target.value as PatientStatus)}>
                <option value="ACTIVE">Active</option>
                <option value="ON_HOLD">On Hold</option>
                <option value="PAUSED">Paused</option>
              </Select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Next action
              <Input value={form.nextAction ?? ''} onChange={(event) => updateForm('nextAction', event.target.value)} />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)] sm:col-span-2">
              Notes
              <Input value={form.notes ?? ''} onChange={(event) => updateForm('notes', event.target.value)} />
            </label>
          </div>

          <div className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 sm:grid-cols-3">
            <p className="text-xs font-bold uppercase text-[var(--color-text-muted)] sm:col-span-3">Initial course</p>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Protocol
              <Select value={form.initialCourse?.protocol ?? 'IGSRT'} onChange={(event) => updateInitialCourse('protocol', event.target.value)}>
                <option value="IGSRT">Skin Cancer IGSRT</option>
                <option value="Joint">Arthritis Joint</option>
                <option value="Dupuytren's">Dupuytren&apos;s</option>
                <option value="Universal">Universal</option>
              </Select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Body region
              <Select value={form.initialCourse?.bodyRegion ?? 'SITE'} onChange={(event) => updateInitialCourse('bodyRegion', event.target.value)}>
                <option value="SITE">Site</option>
                <option value="HAND">Hand</option>
                <option value="FOOT">Foot</option>
                <option value="KNEE">Knee</option>
              </Select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Laterality
              <Select value={form.initialCourse?.laterality ?? 'UNSPECIFIED'} onChange={(event) => updateInitialCourse('laterality', event.target.value)}>
                <option value="UNSPECIFIED">Unspecified</option>
                <option value="LEFT">Left</option>
                <option value="RIGHT">Right</option>
                <option value="BILATERAL">Bilateral</option>
              </Select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Modality
              <Input value={form.initialCourse?.treatmentModality ?? ''} onChange={(event) => updateInitialCourse('treatmentModality', event.target.value)} />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Fractions
              <Input
                type="number"
                min={1}
                value={form.initialCourse?.totalFractions ?? 0}
                onChange={(event) => updateInitialCourse('totalFractions', Number(event.target.value))}
              />
            </label>
            <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
              Start date
              <Input type="date" value={form.initialCourse?.startDate ?? ''} onChange={(event) => updateInitialCourse('startDate', event.target.value)} />
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" disabled={pending} onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={pending}>{pending ? 'Saving' : 'Save'}</Button>
          </div>
        </form>
      </Modal>
    </PageStack>
  );
}
