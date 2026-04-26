import type { Phase, Status } from "@/lib/types";
import { cn } from "@/lib/workflow";

const phaseStyles: Record<Phase, string> = {
  Upcoming: "bg-curerays-blue/10 text-curerays-blue ring-curerays-blue/12",
  "On Treatment": "bg-curerays-orange/12 text-curerays-orange ring-curerays-orange/16",
  Post: "bg-curerays-plum/12 text-curerays-plum ring-curerays-plum/16"
};

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  "On Hold": "bg-curerays-yellow/28 text-curerays-dark-plum ring-curerays-amber/24",
  Paused: "bg-curerays-light-indigo/18 text-curerays-blue ring-curerays-light-indigo/24"
};

export function PhaseBadge({ phase }: { phase: Phase }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        phaseStyles[phase]
      )}
    >
      {phase}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ring-1",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}
