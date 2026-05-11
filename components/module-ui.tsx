import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Eye,
  Filter,
  MoreVertical,
  Search
} from "lucide-react";
import { cn } from "@/lib/workflow";

type Tone = "blue" | "green" | "orange" | "amber" | "purple" | "slate" | "red";

const toneClasses: Record<Tone, string> = {
  blue: "bg-[#EAF1FF] text-[#0033A0] ring-[#0033A0]/15",
  green: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/15",
  orange: "bg-[#FFF0E8] text-[#FF6620] ring-[#FF6620]/15",
  amber: "bg-[#FFF7D6] text-[#805A00] ring-[#FFC701]/30",
  purple: "bg-[#F1E9FF] text-[#6D32C9] ring-[#6D32C9]/15",
  slate: "bg-[#EEF3FA] text-[#2B2F5F] ring-[#2B2F5F]/12",
  red: "bg-rose-500/10 text-rose-700 ring-rose-500/15"
};

export function ModulePage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-4 bg-white text-[#061A55]", className)}>{children}</div>;
}

export function ModuleActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-center justify-end gap-2">{children}</div>;
}

export function PrimaryButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0033A0] px-4 text-xs font-bold text-white shadow-[0_8px_18px_rgba(0,51,160,0.18)] transition hover:bg-[#002A84]">
      {children}
    </button>
  );
}

export function SecondaryButton({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D8E4F5] bg-white px-4 text-xs font-bold text-[#0033A0] transition hover:bg-[#F8FBFF]">
      {children}
    </button>
  );
}

export function IconButton({ label, icon }: { label: string; icon?: ReactNode }) {
  return (
    <button type="button" className="inline-grid h-8 w-8 place-items-center rounded-lg border border-[#D8E4F5] bg-white text-[#0033A0] transition hover:bg-[#F8FBFF]" aria-label={label} title={label}>
      {icon ?? <MoreVertical className="h-4 w-4" aria-hidden="true" />}
    </button>
  );
}

export function RowActions() {
  return (
    <div className="flex items-center gap-1.5">
      <IconButton label="Open" icon={<Eye className="h-4 w-4" aria-hidden="true" />} />
      <IconButton label="More actions" />
    </div>
  );
}

export function MetricTile({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <article className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-[#3D5A80]">{label}</p>
          <p className="mt-1 text-2xl font-bold leading-none text-[#061A55]">{value}</p>
          {detail ? <p className="mt-2 truncate text-xs font-semibold text-[#3D5A80]">{detail}</p> : null}
        </div>
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg ring-1", toneClasses[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

export function MetricGrid({ children, columns = 5 }: { children: ReactNode; columns?: 4 | 5 | 6 }) {
  const grid = columns === 6 ? "xl:grid-cols-6" : columns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-5";
  return <section className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", grid)}>{children}</section>;
}

export function FilterBar({
  search,
  filters,
  actions
}: {
  search: string;
  filters: string[];
  actions?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.04)] xl:flex-row xl:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3D5A80]" aria-hidden="true" />
        <input className="h-10 w-full rounded-lg border border-[#D8E4F5] bg-white pl-9 pr-3 text-xs font-semibold text-[#061A55] outline-none placeholder:text-[#3D5A80]/65 focus:border-[#0033A0]/40 focus:ring-4 focus:ring-[#0033A0]/10" placeholder={search} />
      </label>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button key={filter} type="button" className="inline-flex h-10 min-w-fit items-center gap-2 rounded-lg border border-[#D8E4F5] bg-white px-3 text-xs font-bold text-[#0033A0]">
            {filter}: All <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        ))}
        <button type="button" className="inline-flex h-10 min-w-fit items-center gap-2 rounded-lg border border-[#D8E4F5] bg-white px-3 text-xs font-bold text-[#0033A0]">
          <Filter className="h-4 w-4" aria-hidden="true" /> Filters
        </button>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

export function TabBar({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="scrollbar-soft flex overflow-x-auto border-b border-[#D8E4F5]">
      {tabs.map((tab, index) => (
        <button key={tab} type="button" className={cn("min-w-fit border-b-2 px-5 py-3 text-sm font-bold", index === active ? "border-[#0033A0] text-[#0033A0]" : "border-transparent text-[#2B2F5F] hover:text-[#0033A0]")}>
          {tab}
        </button>
      ))}
    </div>
  );
}

export function WorkGrid({ main, rail }: { main: ReactNode; rail: ReactNode }) {
  return (
    <section className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4">{main}</div>
      <aside className="min-w-0 space-y-4">{rail}</aside>
    </section>
  );
}

export function RightRailCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-[#061A55]">{title}</h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function ListItem({
  title,
  meta,
  badge,
  icon
}: {
  title: string;
  meta?: string;
  badge?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-[#E7EEF8] bg-white p-3">
      {icon ? <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]">{icon}</span> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-[#061A55]">{title}</p>
        {meta ? <p className="mt-1 truncate text-[11px] font-semibold text-[#3D5A80]">{meta}</p> : null}
      </div>
      {badge ? <div className="shrink-0">{badge}</div> : null}
    </div>
  );
}

export function QuickActions({ actions }: { actions: Array<{ label: string; meta?: string; icon: ReactNode }> }) {
  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <button key={action.label} type="button" className="flex w-full items-center gap-3 rounded-lg border border-[#D8E4F5] bg-white p-3 text-left transition hover:bg-[#F8FBFF]">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]">{action.icon}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-bold text-[#061A55]">{action.label}</span>
            {action.meta ? <span className="mt-1 block truncate text-[11px] font-semibold text-[#3D5A80]">{action.meta}</span> : null}
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[#0033A0]" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: Tone }) {
  return <span className={cn("inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-[10px] font-bold ring-1", toneClasses[tone])}><span className="truncate">{children}</span></span>;
}

export function Pagination({ label, perPage = "10 per page" }: { label: string; perPage?: string }) {
  return (
    <div className="flex flex-col gap-2 text-xs font-semibold text-[#3D5A80] sm:flex-row sm:items-center sm:justify-between">
      <span>{label}</span>
      <div className="flex items-center gap-1.5">
        {["Previous", "1", "2", "3", "Next"].map((item) => (
          <button key={item} type="button" className={cn("h-8 rounded-lg border border-[#D8E4F5] px-3 text-xs font-bold", item === "1" ? "bg-[#0033A0] text-white" : "bg-white text-[#0033A0]")}>
            {item}
          </button>
        ))}
        <button type="button" className="ml-2 h-8 rounded-lg border border-[#D8E4F5] bg-white px-3 text-xs font-bold text-[#0033A0]">{perPage}</button>
      </div>
    </div>
  );
}

export function ProgressRing({ value, label, size = 112 }: { value: number; label: string; size?: number }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E7EEF8" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#0033A0" strokeLinecap="round" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-2xl font-bold leading-none text-[#061A55]">{value}%</p>
          <p className="mt-1 text-[10px] font-bold text-[#3D5A80]">{label}</p>
        </div>
      </div>
    </div>
  );
}

export function DonutChart({
  total,
  label,
  segments
}: {
  total: string | number;
  label: string;
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const sum = segments.reduce((acc, segment) => acc + segment.value, 0) || 1;
  let start = 0;
  const gradient = segments.map((segment) => {
    const end = start + (segment.value / sum) * 100;
    const piece = `${segment.color} ${start}% ${end}%`;
    start = end;
    return piece;
  }).join(", ");
  return (
    <div className="flex items-center gap-4">
      <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-center shadow-inner">
          <div>
            <p className="text-xl font-bold leading-none text-[#061A55]">{total}</p>
            <p className="mt-1 text-[10px] font-bold text-[#3D5A80]">{label}</p>
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center justify-between gap-3 text-xs font-bold text-[#061A55]">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: segment.color }} />
              <span className="truncate">{segment.label}</span>
            </span>
            <span>{segment.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MiniBars({ rows }: { rows: Array<{ label: string; value: number; color?: string }> }) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[92px_minmax(0,1fr)_36px] items-center gap-3 text-xs font-bold text-[#061A55]">
          <span className="truncate">{row.label}</span>
          <span className="h-2 rounded-full bg-[#E7EEF8]">
            <span className="block h-full rounded-full" style={{ width: `${(row.value / max) * 100}%`, background: row.color ?? "#0033A0" }} />
          </span>
          <span className="text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

export function CompletionLine({ value, tone = "green" }: { value: number; tone?: Tone }) {
  const color = tone === "orange" ? "#FF6620" : tone === "amber" ? "#F4A500" : tone === "red" ? "#E11D48" : "#059669";
  return (
    <span className="flex items-center gap-2">
      <span className="h-2 w-20 rounded-full bg-[#E7EEF8]"><span className="block h-full rounded-full" style={{ width: `${value}%`, background: color }} /></span>
      <span className="font-bold">{value}%</span>
    </span>
  );
}

export function CheckIcon() {
  return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
}
