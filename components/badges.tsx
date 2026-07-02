import type {
  CarepathTaskStatus,
  DocumentStatus,
  ChartRoundsPhase,
  PatientStatus,
  ResponsibleParty,
  WorkflowItemStatus,
} from '@/lib/types';
import { cn } from '@/lib/workflow';
import { phaseTone, statusTone } from '@/lib/status-utils';

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

const toneColors = {
  default: 'clinical-pill-default',
  success: 'clinical-pill-success',
  warning: 'clinical-pill-warning',
  error: 'clinical-pill-error',
  info: 'clinical-pill-info',
  primary: 'clinical-pill-primary',
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
        'clinical-pill type-label px-2 py-0.5',
        color
      )}
    >
      {children}
    </span>
  );
}

export function CarepathTaskStatusBadge({ status }: { status: CarepathTaskStatus }) {
  return <Pill color={toneColors[statusTone(status)]}>{status.replaceAll('_', ' ')}</Pill>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | WorkflowItemStatus }) {
  return <Pill color={toneColors[statusTone(status)]}>{status.replaceAll('_', ' ')}</Pill>;
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <Pill color={partyColors[party] ?? 'clinical-pill-primary'}>
      {partyLabels[party] ?? party}
    </Pill>
  );
}

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return <Pill color={toneColors[phaseTone(phase)]}>{phase.replaceAll('_', ' ')}</Pill>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Pill color={toneColors[statusTone(status)]}>{status.replaceAll('_', ' ')}</Pill>;
}
