import type {
  CarepathTaskStatus,
  DocumentStatus,
  ChartRoundsPhase,
  PatientStatus,
  ResponsibleParty,
  WorkflowItemStatus,
} from '@/lib/types';
import { statusTone } from '@/lib/status-utils';
import { formatUiLabel } from '@/lib/ui-copy';
import { Badge } from '@/components/ui/badge';

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

export function CarepathTaskStatusBadge({ status }: { status: CarepathTaskStatus }) {
  return <Badge variant={statusTone(status)}>{formatUiLabel(status)}</Badge>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | WorkflowItemStatus }) {
  return <Badge variant={statusTone(status)}>{formatUiLabel(status)}</Badge>;
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <Badge variant="neutral">
      {partyLabels[party] ?? party}
    </Badge>
  );
}

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return <Badge variant="neutral">{formatUiLabel(phase)}</Badge>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Badge variant={statusTone(status)}>{formatUiLabel(status)}</Badge>;
}
