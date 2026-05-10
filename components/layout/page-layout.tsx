import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/workflow";

export function AppPageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-5 bg-white", className)}>{children}</div>;
}

export function PageHero({
  eyebrow: _eyebrow,
  title: _title,
  description: _description,
  icon: _icon,
  stat: _stat,
  actions: _actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  stat?: string;
  actions?: ReactNode;
}) {
  return null;
}

export function SummaryCardGrid({ children, columns = 4 }: { children: ReactNode; columns?: 3 | 4 | 5 }) {
  const grid = columns === 5 ? "xl:grid-cols-5" : columns === 3 ? "xl:grid-cols-3" : "xl:grid-cols-4";
  return <section className={cn("grid gap-4 sm:grid-cols-2", grid)}>{children}</section>;
}

export function SummaryMetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "blue"
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "blue" | "orange" | "amber" | "indigo";
}) {
  const tones = {
    blue: "bg-[#EAF1FF] text-[#0033A0]",
    orange: "bg-[#FFF0E8] text-[#FF6620]",
    amber: "bg-[#FFF7D6] text-[#B46B00]",
    indigo: "bg-[#EEF3FA] text-[#2B2F5F]"
  };

  return (
    <div className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#3D5A80]">{label}</p>
          <p className="mt-2 text-3xl font-bold leading-none text-[#061A55]">{value}</p>
          <p className="mt-2 text-xs font-semibold leading-5 text-[#3D5A80]">{detail}</p>
        </div>
        <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export function ActionToolbar({
  searchPlaceholder,
  filters,
  actions
}: {
  searchPlaceholder: string;
  filters: string[];
  actions?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.06)] xl:flex-row xl:items-center">
      <label className="flex min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#D8E4F5] bg-white px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-[#0033A0]" aria-hidden="true" />
        <input
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#061A55] outline-none placeholder:text-[#3D5A80]/65"
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
      </label>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className="min-w-fit rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] px-3 py-2 text-xs font-bold text-[#061A55]"
          >
            {filter}
          </button>
        ))}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </section>
  );
}

export function ViewTabs({ tabs, active = 0 }: { tabs: string[]; active?: number }) {
  return (
    <div className="scrollbar-soft flex gap-2 overflow-x-auto rounded-2xl border border-[#D8E4F5] bg-white p-2 shadow-[0_8px_24px_rgba(0,51,160,0.06)]">
      {tabs.map((tab, index) => (
        <button
          key={tab}
          type="button"
          className={cn(
            "min-w-fit rounded-xl px-3 py-2 text-sm font-bold",
            index === active ? "bg-[#0033A0] text-white" : "text-[#3D5A80] hover:bg-[#F8FBFF]"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export function WorkspaceGrid({ main, rail }: { main: ReactNode; rail: ReactNode }) {
  return (
    <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0 space-y-4">{main}</div>
      <aside className="min-w-0 space-y-4">{rail}</aside>
    </section>
  );
}

export function DetailPanel({
  title,
  subtitle,
  children,
  actionLabel = "Open details"
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-[#061A55]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm font-semibold leading-5 text-[#3D5A80]">{subtitle}</p> : null}
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-[#0033A0]" aria-hidden="true" />
      </div>
      <div>{children}</div>
      <button type="button" className="mt-4 w-full rounded-xl bg-[#0033A0] px-3 py-2 text-sm font-bold text-white">
        {actionLabel}
      </button>
    </section>
  );
}

export function FieldList({ items }: { items: Array<{ label: string; value: ReactNode; tone?: "default" | "warning" }> }) {
  return (
    <dl className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-start justify-between gap-3 border-b border-[#E7EEF8] pb-3 last:border-0 last:pb-0">
          <dt className="text-xs font-bold uppercase tracking-wide text-[#3D5A80]">{item.label}</dt>
          <dd className={cn("text-right text-sm font-bold text-[#061A55]", item.tone === "warning" && "text-[#FF6620]")}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function PrimaryAction({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="rounded-xl bg-[#0033A0] px-4 py-2 text-sm font-bold text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)]">
      {children}
    </button>
  );
}

export function SecondaryAction({ children }: { children: ReactNode }) {
  return (
    <button type="button" className="rounded-xl border border-[#D8E4F5] bg-white px-4 py-2 text-sm font-bold text-[#0033A0]">
      {children}
    </button>
  );
}
