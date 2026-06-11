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
  COMPLETED: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  SIGNED: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  UPLOADED: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  CLOSED: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
  READY_FOR_REVIEW: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  NEEDS_REVIEW: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  REVIEW_REQUIRED: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  IN_PROGRESS: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  PENDING: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  NOT_STARTED: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
  BLOCKED: 'bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)]',
  OVERDUE: 'bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)]',
  MISSING_FIELDS: 'bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] text-[var(--color-error)]',
  NOT_APPLICABLE: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
  DRAFT: 'bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]',
  PENDING_NEEDED: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  ACTIVE: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  ON_HOLD: 'bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]',
  PAUSED: 'bg-[color-mix(in_srgb,var(--color-warning)_12%,transparent)] text-[var(--color-warning)]',
};

const phaseColors: Record<ChartRoundsPhase, string> = {
  UPCOMING: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  ON_TREATMENT: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  POST: 'bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]',
};

const partyColors: Record<string, string> = {
  VA: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  MA: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  RTT: 'bg-[color-mix(in_srgb,var(--color-success)_12%,transparent)] text-[var(--color-success)]',
  NP_PA: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  PCP: 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]',
  RAD_ONC: 'bg-[color-mix(in_srgb,var(--color-info)_12%,transparent)] text-[var(--color-info)]',
  PHYSICIST: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
  BILLING: 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]',
  ADMIN: 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]',
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
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ring-1 ring-inset',
        color
      )}
    >
      {children}
    </span>
  );
}

export function CarepathTaskStatusBadge({ status }: { status: CarepathTaskStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | WorkflowItemStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <Pill color={partyColors[party] ?? 'bg-[var(--color-primary-soft)] text-[var(--color-primary)]'}>
      {partyLabels[party] ?? party}
    </Pill>
  );
}

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return <Pill color={phaseColors[phase] ?? 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]'}>{phase.replaceAll('_', ' ')}</Pill>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-[var(--color-card-muted)] text-[var(--color-text-muted)]'}>{status.replaceAll('_', ' ')}</Pill>;
}
