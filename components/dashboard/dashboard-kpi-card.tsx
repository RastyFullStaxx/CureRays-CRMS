import Link from "next/link";
import { ArrowUp } from "lucide-react";
import type { DashboardKpi } from "@/lib/dashboard-data";
import { MiniSparkline } from "@/components/dashboard/mini-sparkline";

const toneStyles = {
  blue: {
    icon: "bg-[#EAF1FF] text-[#0033A0]",
    accent: "text-[#0033A0]",
    spark: "#114DFF"
  },
  orange: {
    icon: "bg-[#FFF0E8] text-[#FF6620]",
    accent: "text-[#FF6620]",
    spark: "#FF6620"
  },
  amber: {
    icon: "bg-[#FFF4D1] text-[#FF6620]",
    accent: "text-[#FF6620]",
    spark: "#FF8A00"
  }
};

export function DashboardKpiCard({ kpi }: { kpi: DashboardKpi }) {
  const Icon = kpi.icon;
  const tone = toneStyles[kpi.tone];

  return (
    <Link
      href={kpi.href}
      className="group rounded-lg border border-[#DDE6F5] bg-white p-5 shadow-[0_16px_40px_rgba(43,47,95,0.08)] transition hover:-translate-y-0.5 hover:border-[#BFD0EE] hover:shadow-[0_18px_44px_rgba(0,51,160,0.12)]"
    >
      <div className="flex items-center gap-4">
        <span className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${tone.icon}`}>
          <Icon className="h-8 w-8" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-[#061A55]">{kpi.label}</p>
          <p className="mt-2 text-4xl font-bold leading-none text-[#061A55]">{kpi.value}</p>
          <p className={`mt-2 flex items-center gap-1 text-xs font-bold ${tone.accent}`}>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{kpi.comparison}</span>
          </p>
        </div>
        <MiniSparkline values={kpi.trend} color={tone.spark} />
      </div>
    </Link>
  );
}
