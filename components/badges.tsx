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
  COMPLETED: 'clinical-pill-success',
  SIGNED: 'clinical-pill-success',
  UPLOADED: 'clinical-pill-success',
  CLOSED: 'clinical-pill-default',
  READY_FOR_REVIEW: 'clinical-pill-warning',
  NEEDS_REVIEW: 'clinical-pill-warning',
  REVIEW_REQUIRED: 'clinical-pill-warning',
  IN_PROGRESS: 'clinical-pill-primary',
  PENDING: 'clinical-pill-primary',
  NOT_STARTED: 'clinical-pill-default',
  BLOCKED: 'clinical-pill-error',
  OVERDUE: 'clinical-pill-error',
  MISSING_FIELDS: 'clinical-pill-error',
  NOT_APPLICABLE: 'clinical-pill-default',
  DRAFT: 'clinical-pill-info',
  PENDING_NEEDED: 'clinical-pill-warning',
  ACTIVE: 'clinical-pill-success',
  ON_HOLD: 'clinical-pill-warning',
  PAUSED: 'clinical-pill-warning',
};

const phaseColors: Record<ChartRoundsPhase, string> = {
  UPCOMING: 'clinical-pill-primary',
  ON_TREATMENT: 'clinical-pill-success',
  POST: 'clinical-pill-info',
};

const partyColors: Record<string, string> = {
  VA: 'clinical-pill-primary',
  MA: 'clinical-pill-success',
  RTT: 'clinical-pill-success',
  NP_PA: 'clinical-pill-primary',
  PCP: 'clinical-pill-primary',
  RAD_ONC: 'clinical-pill-info',
  PHYSICIST: 'clinical-pill-default',
  BILLING: 'clinical-pill-warning',
  ADMIN: 'clinical-pill-default',
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
        'clinical-pill px-2 py-0.5 text-xs',
        color
      )}
    >
      {children}
    </span>
  );
}

export function CarepathTaskStatusBadge({ status }: { status: CarepathTaskStatus }) {
  return <Pill color={statusColors[status] ?? 'clinical-pill-default'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | WorkflowItemStatus }) {
  return <Pill color={statusColors[status] ?? 'clinical-pill-default'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <Pill color={partyColors[party] ?? 'clinical-pill-primary'}>
      {partyLabels[party] ?? party}
    </Pill>
  );
}

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return <Pill color={phaseColors[phase] ?? 'clinical-pill-default'}>{phase.replaceAll('_', ' ')}</Pill>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Pill color={statusColors[status] ?? 'clinical-pill-default'}>{status.replaceAll('_', ' ')}</Pill>;
}
