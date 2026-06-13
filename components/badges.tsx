import type {
  CarepathTaskStatus,
  DocumentStatus,
  ChartRoundsPhase,
  PatientStatus,
  ResponsibleParty,
  WorkflowItemStatus,
} from '@/lib/types';
import { cn } from '@/lib/workflow';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  SIGNED: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  UPLOADED: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  CLOSED: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
  READY_FOR_REVIEW: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  NEEDS_REVIEW: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  REVIEW_REQUIRED: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  IN_PROGRESS: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  PENDING: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  NOT_STARTED: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
  BLOCKED: 'bg-[var(--color-badge-error-bg)] text-[var(--color-badge-error-fg)] ring-[var(--color-badge-error-border)]',
  OVERDUE: 'bg-[var(--color-badge-error-bg)] text-[var(--color-badge-error-fg)] ring-[var(--color-badge-error-border)]',
  MISSING_FIELDS: 'bg-[var(--color-badge-error-bg)] text-[var(--color-badge-error-fg)] ring-[var(--color-badge-error-border)]',
  NOT_APPLICABLE: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
  DRAFT: 'bg-[var(--color-badge-info-bg)] text-[var(--color-badge-info-fg)] ring-[var(--color-badge-info-border)]',
  PENDING_NEEDED: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  ACTIVE: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  ON_HOLD: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  PAUSED: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
};

const phaseColors: Record<ChartRoundsPhase, string> = {
  UPCOMING: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  ON_TREATMENT: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  POST: 'bg-[var(--color-badge-info-bg)] text-[var(--color-badge-info-fg)] ring-[var(--color-badge-info-border)]',
};

const partyColors: Record<string, string> = {
  VA: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  MA: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  RTT: 'bg-[var(--color-badge-success-bg)] text-[var(--color-badge-success-fg)] ring-[var(--color-badge-success-border)]',
  NP_PA: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  PCP: 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]',
  RAD_ONC: 'bg-[var(--color-badge-info-bg)] text-[var(--color-badge-info-fg)] ring-[var(--color-badge-info-border)]',
  PHYSICIST: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
  BILLING: 'bg-[var(--color-badge-warning-bg)] text-[var(--color-badge-warning-fg)] ring-[var(--color-badge-warning-border)]',
  ADMIN: 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]',
};

const partyLabels: Record<string, string> = {
  VA: 'Visual Assistant',
  MA: 'Medical Assistant',
  RTT: 'Radiation Therapist',
  NP_PA: 'NP / PA',
  PCP: 'Primary Care',
  RAD_ONC: 'Radiation Oncologist',
  PHYSICIST: 'Physicist',
  BILLING: 'Billing',
  ADMIN: 'Admin',
};

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'clinical-pill px-2 py-0.5 text-xs ring-1 ring-inset',
        color
      )}
    >
      {children}
    </span>
  );
}

export function CarepathTaskStatusBadge({ status }: { status: CarepathTaskStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | WorkflowItemStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <Pill color={partyColors[party] ?? 'bg-[var(--color-badge-primary-bg)] text-[var(--color-badge-primary-fg)] ring-[var(--color-badge-primary-border)]'}>
      {partyLabels[party] ?? party}
    </Pill>
  );
}

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return <Pill color={phaseColors[phase] ?? 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]'}>{phase.replaceAll('_', ' ')}</Pill>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-[var(--color-badge-default-bg)] text-[var(--color-badge-default-fg)] ring-[var(--color-badge-default-border)]'}>{status.replaceAll('_', ' ')}</Pill>;
}
