import { CalendarDays, Info, ShieldCheck, Target } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { pipelineSegments, totalPatientsInCare } from "@/lib/dashboard-data";

const segmentIcons = {
  upcoming: CalendarDays,
  active: Target,
  post: ShieldCheck
};

export function PatientPipelineCard() {
  return (
    <DashboardCard
      title="Patient Pipeline"
      action={<Info className="h-4 w-4 text-[#7DA0CA]" aria-hidden="true" />}
      className="xl:col-span-2"
    >
      <div className="p-5">
        <div className="grid overflow-hidden rounded-lg bg-[#F2F6FC] md:grid-cols-3">
          {pipelineSegments.map((segment) => {
            const Icon = segmentIcons[segment.tone];
            const active = segment.tone === "active";
            return (
              <div
                key={segment.label}
                className={`relative flex items-center gap-4 px-6 py-5 ${
                  active ? "bg-[#0033A0] text-white" : "text-[#061A55]"
                }`}
              >
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${active ? "bg-white/12" : "bg-white"}`}>
                  <Icon className={`h-6 w-6 ${active ? "text-white" : "text-[#0033A0]"}`} aria-hidden="true" />
                </span>
                <div>
                  <p className={`text-sm font-bold ${active ? "text-white" : "text-[#061A55]"}`}>{segment.label}</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{segment.value}</p>
                  <p className={`mt-1 text-sm font-bold ${active ? "text-white/88" : "text-[#0033A0]"}`}>{segment.percent}%</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[#E7EEF8] pt-4 text-sm font-bold">
          <span className="text-[#061A55]">Total Patients in Care</span>
          <span className="text-2xl text-[#061A55]">{totalPatientsInCare}</span>
        </div>
      </div>
    </DashboardCard>
  );
}
