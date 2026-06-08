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
  COMPLETED: 'bg-emerald-500/10 text-emerald-700',
  SIGNED: 'bg-emerald-500/10 text-emerald-700',
  UPLOADED: 'bg-emerald-500/10 text-emerald-700',
  CLOSED: 'bg-slate-500/10 text-slate-700',
  READY_FOR_REVIEW: 'bg-[#FFF0E8] text-[#D94E11]',
  NEEDS_REVIEW: 'bg-[#FFF0E8] text-[#D94E11]',
  REVIEW_REQUIRED: 'bg-[#FFF0E8] text-[#D94E11]',
  IN_PROGRESS: 'bg-[#EAF1FF] text-[#0033A0]',
  PENDING: 'bg-[#EAF1FF] text-[#0033A0]',
  NOT_STARTED: 'bg-slate-500/10 text-slate-700',
  BLOCKED: 'bg-rose-500/10 text-rose-700',
  OVERDUE: 'bg-rose-500/10 text-rose-700',
  MISSING_FIELDS: 'bg-rose-500/10 text-rose-700',
  NOT_APPLICABLE: 'bg-slate-500/10 text-slate-700',
  DRAFT: 'bg-violet-500/10 text-violet-700',
  PENDING_NEEDED: 'bg-[#FFF0E8] text-[#D94E11]',
  ACTIVE: 'bg-emerald-500/10 text-emerald-700',
  ON_HOLD: 'bg-amber-500/10 text-amber-700',
  PAUSED: 'bg-amber-500/10 text-amber-700',
};

const phaseColors: Record<ChartRoundsPhase, string> = {
  UPCOMING: 'bg-[#EAF1FF] text-[#0033A0]',
  ON_TREATMENT: 'bg-emerald-500/10 text-emerald-700',
  POST: 'bg-violet-500/10 text-violet-700',
};

const partyColors: Record<string, string> = {
  VA: 'bg-[#EAF1FF] text-[#0033A0]',
  MA: 'bg-emerald-500/10 text-emerald-700',
  RTT: 'bg-emerald-500/10 text-emerald-700',
  NP_PA: 'bg-[#EAF1FF] text-[#0033A0]',
  PCP: 'bg-[#EAF1FF] text-[#0033A0]',
  RAD_ONC: 'bg-violet-500/10 text-violet-700',
  PHYSICIST: 'bg-slate-500/10 text-slate-700',
  BILLING: 'bg-[#FFF0E8] text-[#D94E11]',
  ADMIN: 'bg-slate-500/10 text-slate-700',
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
  return <Pill color={statusColors[status] ?? 'bg-slate-500/10 text-slate-700'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus | WorkflowItemStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-slate-500/10 text-slate-700'}>{status.replaceAll('_', ' ')}</Pill>;
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <Pill color={partyColors[party] ?? 'bg-[#EAF1FF] text-[#0033A0]'}>
      {partyLabels[party] ?? party}
    </Pill>
  );
}

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return <Pill color={phaseColors[phase] ?? 'bg-slate-500/10 text-slate-700'}>{phase.replaceAll('_', ' ')}</Pill>;
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return <Pill color={statusColors[status] ?? 'bg-slate-500/10 text-slate-700'}>{status.replaceAll('_', ' ')}</Pill>;
}
