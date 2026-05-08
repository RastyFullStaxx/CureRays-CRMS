import type {
  CarepathTaskStatus,
  ChartRoundsPhase,
  DocumentStatus,
  PatientStatus,
  ResponsibleParty
} from "@/lib/types";
import {
  carepathTaskStatusLabels,
  chartRoundsPhaseLabels,
  documentStatusLabels,
  patientStatusLabels,
  responsiblePartyLabels
} from "@/lib/workflow";
import { cn } from "@/lib/workflow";

const phaseStyles: Record<ChartRoundsPhase, string> = {
  UPCOMING: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/12",
  ON_TREATMENT: "bg-curerays-orange/12 text-curerays-orange ring-curerays-orange/16",
  POST: "bg-curerays-plum/12 text-curerays-plum ring-curerays-plum/16"
};

const statusStyles: Record<PatientStatus, string> = {
  ACTIVE: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  ON_HOLD: "bg-curerays-yellow/28 text-curerays-dark-plum ring-curerays-amber/24",
  PAUSED: "bg-curerays-light-indigo/18 text-curerays-blue ring-curerays-light-indigo/24"
};

const documentStyles: Record<DocumentStatus, string> = {
  DRAFT: "bg-white/70 text-curerays-indigo ring-curerays-indigo/12",
  NOT_STARTED: "bg-white/70 text-curerays-indigo ring-curerays-indigo/12",
  PENDING_NEEDED: "bg-curerays-orange/10 text-curerays-orange ring-curerays-orange/15",
  PENDING: "bg-curerays-orange/10 text-curerays-orange ring-curerays-orange/15",
  IN_PROGRESS: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/15",
  MISSING_FIELDS: "bg-rose-500/10 text-rose-700 ring-rose-500/15",
  READY_FOR_REVIEW: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/15",
  SIGNED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  UPLOADED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  EXPORTED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  NOT_APPLICABLE: "bg-curerays-plum/10 text-curerays-plum ring-curerays-plum/15",
  NEEDS_REVIEW: "bg-curerays-amber/30 text-curerays-dark-plum ring-curerays-amber/30",
  COMPLETED: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/15",
  BLOCKED: "bg-rose-500/10 text-rose-700 ring-rose-500/15",
  OVERDUE: "bg-rose-500/10 text-rose-700 ring-rose-500/15",
  CLOSED: "bg-curerays-dark-plum text-white ring-curerays-dark-plum/20"
};

const carepathTaskStyles: Record<CarepathTaskStatus, string> = {
  NOT_STARTED: "bg-white/70 text-curerays-indigo ring-curerays-indigo/12",
  PENDING: "bg-curerays-orange/10 text-curerays-orange ring-curerays-orange/15",
  IN_PROGRESS: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/15",
  NEEDS_REVIEW: "bg-curerays-amber/30 text-curerays-dark-plum ring-curerays-amber/30",
  READY_FOR_REVIEW: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/15",
  SIGNED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  UPLOADED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  COMPLETED: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  BLOCKED: "bg-rose-500/10 text-rose-700 ring-rose-500/15",
  OVERDUE: "bg-rose-500/10 text-rose-700 ring-rose-500/15",
  CLOSED: "bg-curerays-dark-plum text-white ring-curerays-dark-plum/20",
  NOT_APPLICABLE: "bg-curerays-plum/10 text-curerays-plum ring-curerays-plum/15"
};

const partyStyles: Record<ResponsibleParty, string> = {
  VA: "bg-curerays-blue/8 text-curerays-blue ring-curerays-blue/12",
  MA: "bg-curerays-light-indigo/20 text-curerays-blue ring-curerays-light-indigo/24",
  RTT: "bg-curerays-orange/10 text-curerays-orange ring-curerays-orange/15",
  NP_PA: "bg-curerays-plum/10 text-curerays-plum ring-curerays-plum/15",
  PCP: "bg-curerays-amber/30 text-curerays-dark-plum ring-curerays-amber/30",
  RAD_ONC: "bg-curerays-dark-plum text-white ring-curerays-dark-plum/20",
  PHYSICIST: "bg-curerays-indigo/12 text-curerays-indigo ring-curerays-indigo/15",
  BILLING: "bg-curerays-amber/30 text-curerays-dark-plum ring-curerays-amber/30",
  ADMIN: "bg-black/8 text-curerays-dark-plum ring-black/10"
};

export function PhaseBadge({ phase }: { phase: ChartRoundsPhase }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        phaseStyles[phase]
      )}
    >
      {chartRoundsPhaseLabels[phase]}
    </span>
  );
}

export function StatusBadge({ status }: { status: PatientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusStyles[status]
      )}
    >
      {patientStatusLabels[status]}
    </span>
  );
}

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        documentStyles[status]
      )}
    >
      {documentStatusLabels[status]}
    </span>
  );
}

export function CarepathTaskStatusBadge({ status }: { status: CarepathTaskStatus }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        carepathTaskStyles[status]
      )}
    >
      {carepathTaskStatusLabels[status]}
    </span>
  );
}

export function ResponsiblePartyBadge({ party }: { party: ResponsibleParty }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        partyStyles[party]
      )}
    >
      {responsiblePartyLabels[party]}
    </span>
  );
}
