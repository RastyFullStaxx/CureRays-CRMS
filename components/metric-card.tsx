import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
};

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <article className="glass-panel rounded-glass p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-curerays-indigo">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-curerays-dark-plum">{value}</p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/64 text-curerays-blue">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-5 text-curerays-dark-plum/68">{detail}</p>
    </article>
  );
}
