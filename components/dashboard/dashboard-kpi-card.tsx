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
      className="group min-h-[106px] rounded-xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)] transition hover:-translate-y-0.5 hover:border-[#BFD0EE] hover:shadow-[0_12px_32px_rgba(0,51,160,0.12)]"
    >
      <div className="flex h-full items-center gap-3">
        <span className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full ${tone.icon}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#061A55]">{kpi.label}</p>
          <p className="mt-1.5 text-3xl font-bold leading-none text-[#061A55]">{kpi.value}</p>
          <p className={`mt-1.5 flex items-center gap-1 truncate text-[11px] font-bold ${tone.accent}`}>
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{kpi.comparison}</span>
          </p>
        </div>
        <div className="hidden shrink-0 sm:block">
          <MiniSparkline values={kpi.trend} color={tone.spark} />
        </div>
      </div>
    </Link>
  );
}
