import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  MoreVertical,
  Search,
  SlidersHorizontal
} from "lucide-react";
import { DataTable, type DataTableColumn, type DataTableRow } from "@/components/data-table";
import { SectionCard } from "@/components/section-card";
import type { CarepathWorkflowPhase, ResponsibleParty, WorkflowItemStatus } from "@/lib/types";
import { carepathPhaseLabels, cn, responsiblePartyLabels } from "@/lib/workflow";

type Tone = "blue" | "green" | "orange" | "red" | "purple" | "slate";

const toneClasses: Record<Tone, string> = {
  blue: "bg-[#EAF1FF] text-[#0033A0] ring-[#0033A0]/15",
  green: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  orange: "bg-[#FFF0E8] text-[#D94E11] ring-[#FF6620]/15",
  red: "bg-rose-500/10 text-rose-700 ring-rose-500/15",
  purple: "bg-violet-500/10 text-violet-700 ring-violet-500/15",
  slate: "bg-slate-500/10 text-slate-700 ring-slate-500/15"
};

const statusTone: Record<string, Tone> = {
  COMPLETED: "green",
  SIGNED: "green",
  UPLOADED: "green",
  LOCKED: "slate",
  CLOSED: "slate",
  READY_FOR_REVIEW: "orange",
  NEEDS_REVIEW: "orange",
  IN_PROGRESS: "blue",
  PENDING: "blue",
  PENDING_NEEDED: "orange",
  NOT_STARTED: "slate",
  DRAFT: "purple",
  BLOCKED: "red",
  OVERDUE: "red",
  MISSING_FIELDS: "red",
  NOT_APPLICABLE: "slate"
};

const phaseTone: Record<CarepathWorkflowPhase, Tone> = {
  CONSULTATION: "purple",
  CHART_PREP: "blue",
  SIMULATION: "blue",
  PLANNING: "orange",
  ON_TREATMENT: "green",
  POST_TX: "purple",
  AUDIT: "purple",
  CLOSED: "slate"
};

export function WorkspaceButton({
  children,
  variant = "secondary",
  size = "default",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "compact";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold outline-none transition focus:ring-4 focus:ring-[#0033A0]/12",
        size === "compact" ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm",
        variant === "primary"
          ? "bg-[#0033A0] text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)] hover:bg-[#002A86]"
          : variant === "ghost"
            ? "text-[#0033A0] hover:bg-[#EAF1FF]"
            : "border border-[#D8E4F5] bg-white text-[#0033A0] hover:bg-[#F8FBFF]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "blue",
  icon,
  size = "default"
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  size?: "default" | "compact";
}) {
  return (
    <div className={cn("rounded-2xl border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.06)]", size === "compact" ? "p-3" : "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("truncate font-bold text-[#3D5A80]", size === "compact" ? "text-[11px]" : "text-xs")} title={label}>{label}</p>
          <p className={cn("mt-2 truncate font-bold leading-none text-[#061A55]", size === "compact" ? "text-xl" : "text-2xl")} title={typeof value === "string" ? value : undefined}>{value}</p>
          {detail ? <p className="mt-2 truncate text-[11px] font-semibold text-[#3D5A80]" title={typeof detail === "string" ? detail : undefined}>{detail}</p> : null}
        </div>
        {icon ? <span className={cn("grid shrink-0 place-items-center rounded-xl ring-1", size === "compact" ? "h-8 w-8" : "h-10 w-10", toneClasses[tone])}>{icon}</span> : null}
      </div>
    </div>
  );
}

export function MetricGrid({ children, columns = "xl:grid-cols-5" }: { children: ReactNode; columns?: string }) {
  return <section className={cn("grid gap-3 sm:grid-cols-2", columns)}>{children}</section>;
}

export function Pill({ children, tone = "blue", size = "default" }: { children: ReactNode; tone?: Tone; size?: "default" | "compact" }) {
  return <span className={cn("inline-flex max-w-full whitespace-nowrap rounded-full font-bold ring-1", size === "compact" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs", toneClasses[tone])}>{children}</span>;
}

export function WorkflowStatusPill({ status, size = "default", label }: { status: WorkflowItemStatus | string; size?: "default" | "compact"; label?: string }) {
  return <Pill tone={statusTone[status] ?? "blue"} size={size}>{label ?? status.replaceAll("_", " ")}</Pill>;
}

export function PhasePill({ phase, size = "default", label }: { phase: CarepathWorkflowPhase; size?: "default" | "compact"; label?: string }) {
  return <Pill tone={phaseTone[phase]} size={size}>{label ?? carepathPhaseLabels[phase]}</Pill>;
}

export function RolePill({ role, size = "default", label }: { role: ResponsibleParty; size?: "default" | "compact"; label?: string }) {
  const tone: Tone = role === "RAD_ONC" ? "purple" : role === "PHYSICIST" ? "slate" : role === "RTT" ? "green" : role === "BILLING" ? "orange" : "blue";
  return <Pill tone={tone} size={size}>{label ?? responsiblePartyLabels[role]}</Pill>;
}

export function FilterBar({
  searchPlaceholder,
  filters = ["All Phases", "All Status", "All Owners"]
}: {
  searchPlaceholder: string;
  filters?: string[];
}) {
  return (
    <div className="grid gap-2 rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.04)] lg:grid-cols-[minmax(220px,1fr)_auto]">
      <label className="relative min-w-0" aria-label={searchPlaceholder}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A80]" aria-hidden="true" />
        <input
          type="search"
          className="h-10 w-full rounded-xl border border-[#D8E4F5] bg-white pl-10 pr-3 text-sm font-semibold text-[#061A55] outline-none focus:border-[#0033A0]/40 focus:ring-4 focus:ring-[#0033A0]/10"
          placeholder={searchPlaceholder}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <WorkspaceButton key={filter} className="h-10">
            {filter}
            <ChevronRight className="h-3.5 w-3.5 rotate-90" aria-hidden="true" />
          </WorkspaceButton>
        ))}
        <WorkspaceButton className="h-10">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filters
        </WorkspaceButton>
      </div>
    </div>
  );
}

export function DonutSummary({
  value,
  label,
  segments,
  center
}: {
  value: number;
  label: string;
  center?: string;
  segments: Array<{ label: string; value: number; tone: Tone }>;
}) {
  const colorForTone: Record<Tone, string> = {
    blue: "#3B6FEA",
    green: "#20B66A",
    orange: "#F59E0B",
    red: "#EF4444",
    purple: "#7C3AED",
    slate: "#A7B0BD"
  };
  let cursor = 0;
  const total = Math.max(segments.reduce((sum, segment) => sum + segment.value, 0), 1);
  const gradient = segments
    .map((segment) => {
      const start = cursor;
      const end = cursor + (segment.value / total) * 100;
      cursor = end;
      return `${colorForTone[segment.tone]} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <SectionCard title={label}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="relative h-36 w-36 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
          aria-label={`${label}: ${value}%`}
        >
          <div className="absolute inset-0 grid place-items-center">
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center shadow-inner">
              <span className="block text-3xl font-bold leading-none text-[#061A55]">{center ?? `${value}%`}</span>
              <span className="mt-1 block max-w-16 text-[11px] font-bold leading-tight text-[#3D5A80]">{center ? "total items" : "complete"}</span>
            </div>
          </div>
        </div>
        <div className="grid flex-1 gap-2">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-3 text-sm font-bold text-[#061A55]">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorForTone[segment.tone] }} />
                {segment.label}
              </span>
              <span>{segment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

export function CompactTable({ columns, rows, minWidth = "1000px" }: { columns: DataTableColumn[]; rows: DataTableRow[]; minWidth?: string }) {
  return <DataTable compact columns={columns} rows={rows} minWidth={minWidth} />;
}

export type FixedTableColumn = {
  header: string;
  className?: string;
  width?: string;
};

export function CompactFixedTable({ columns, rows }: { columns: FixedTableColumn[]; rows: DataTableRow[] }) {
  return (
    <div className="overflow-hidden bg-white">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          {columns.map((column) => (
            <col key={column.header} style={column.width ? { width: column.width } : undefined} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-[#F8FBFF] text-left text-[10px] font-bold uppercase tracking-wide text-[#3D5A80]">
            {columns.map((column) => (
              <th key={column.header} scope="col" className={cn("px-2.5 py-2", column.className)}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E7EEF8]">
          {rows.map((row) => (
            <tr key={row.id} className="bg-white transition hover:bg-[#F8FBFF]">
              {row.cells.map((cell, index) => (
                <td key={`${row.id}-${index}`} className="min-w-0 px-2.5 py-2 align-middle text-[12px] font-semibold leading-5 text-[#061A55]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-3 border-t border-[#E7EEF8] bg-white px-3 py-2.5 text-xs font-bold text-[#3D5A80]">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-[#D8E4F5] px-2.5 py-1.5 text-[#0033A0] transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Previous
      </button>
      <span className="min-w-20 text-center">Page {page} of {totalPages}</span>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= totalPages}
        className="inline-flex items-center gap-1 rounded-lg border border-[#D8E4F5] px-2.5 py-1.5 text-[#0033A0] transition hover:bg-[#F8FBFF] disabled:cursor-not-allowed disabled:opacity-45"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

export function TruncateText({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <span className={cn("block min-w-0 truncate", className)} title={title}>
      {children}
    </span>
  );
}

export function RightRailCard({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
      <div className="mb-3 flex items-center gap-2">
        {icon ? <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#EAF1FF] text-[#0033A0] ring-1 ring-[#0033A0]/15">{icon}</span> : null}
        <h3 className="min-w-0 truncate text-lg font-bold text-[#061A55]">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function ActionCell() {
  return (
    <span className="inline-flex items-center gap-2 text-[#0033A0]">
      <Eye className="h-4 w-4" aria-hidden="true" />
      <MoreVertical className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

export function RailList({ items }: { items: Array<{ title: string; meta?: string; badge?: ReactNode; tone?: Tone }> }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={`${item.title}-${item.meta ?? ""}`} className="rounded-xl border border-[#E7EEF8] bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#061A55]">{item.title}</p>
              {item.meta ? <p className="mt-1 text-xs font-semibold leading-5 text-[#3D5A80]">{item.meta}</p> : null}
            </div>
            {item.badge ?? (item.tone ? <Pill tone={item.tone}>{item.tone}</Pill> : null)}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CheckLine({ children, state = "complete" }: { children: ReactNode; state?: "complete" | "warning" | "blocked" | "info" }) {
  const Icon = state === "complete" ? CheckCircle2 : state === "info" ? Clock3 : AlertTriangle;
  const color = state === "complete" ? "text-emerald-600" : state === "blocked" ? "text-rose-600" : state === "warning" ? "text-[#FF6620]" : "text-[#0033A0]";
  return (
    <div className="flex items-start gap-2 text-sm font-semibold text-[#061A55]">
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", color)} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function Thumbnail({ label, tone = "blue" }: { label: string; tone?: Tone }) {
  return (
    <div className={cn("grid aspect-[4/3] w-28 place-items-center rounded-lg border border-[#D8E4F5] text-center text-[11px] font-bold ring-1", toneClasses[tone])}>
      <FileText className="mb-1 h-5 w-5" aria-hidden="true" />
      {label}
    </div>
  );
}
