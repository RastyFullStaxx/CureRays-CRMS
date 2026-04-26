import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone: "blue" | "orange" | "plum" | "amber";
};

const tones: Record<KpiCardProps["tone"], string> = {
  blue: "from-curerays-blue/14 to-curerays-light-indigo/18 text-curerays-blue",
  orange: "from-curerays-orange/16 to-curerays-yellow/24 text-curerays-orange",
  plum: "from-curerays-plum/14 to-white/60 text-curerays-plum",
  amber: "from-curerays-amber/26 to-white/66 text-curerays-dark-plum"
};

export function KpiCard({ label, value, detail, icon: Icon, tone }: KpiCardProps) {
  return (
    <article className="glass-panel rounded-glass p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-curerays-indigo">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-curerays-dark-plum">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br ${tones[tone]}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-4 text-sm leading-5 text-curerays-dark-plum/68">{detail}</p>
    </article>
  );
}
