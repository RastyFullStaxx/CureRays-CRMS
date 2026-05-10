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
      className="lg:col-span-2 xl:col-span-8"
    >
      <div className="p-4">
        <div className="grid overflow-hidden rounded-lg bg-[#F2F6FC] md:grid-cols-3">
          {pipelineSegments.map((segment) => {
            const Icon = segmentIcons[segment.tone];
            const active = segment.tone === "active";
            return (
              <div
                key={segment.label}
                className={`relative flex items-center gap-3 px-5 py-4 ${
                  active ? "bg-[#0033A0] text-white" : "text-[#061A55]"
                }`}
              >
                {active ? (
                  <>
                    <span className="absolute -left-7 top-0 hidden h-full w-7 bg-[#0033A0] [clip-path:polygon(0_0,100%_50%,0_100%)] md:block" />
                    <span className="absolute -right-7 top-0 z-10 hidden h-full w-7 bg-[#0033A0] [clip-path:polygon(0_0,100%_50%,0_100%)] md:block" />
                  </>
                ) : null}
                <span className={`relative z-20 grid h-10 w-10 shrink-0 place-items-center rounded-full ${active ? "bg-white/12" : "bg-white"}`}>
                  <Icon className={`h-5 w-5 ${active ? "text-white" : "text-[#0033A0]"}`} aria-hidden="true" />
                </span>
                <div className="relative z-20">
                  <p className={`text-[13px] font-bold ${active ? "text-white" : "text-[#061A55]"}`}>{segment.label}</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{segment.value}</p>
                  <p className={`mt-0.5 text-[13px] font-bold ${active ? "text-white/88" : "text-[#0033A0]"}`}>{segment.percent}%</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[#E7EEF8] pt-3 text-sm font-bold">
          <span className="text-[#061A55]">Total Patients in Care</span>
          <span className="text-xl text-[#061A55]">{totalPatientsInCare}</span>
        </div>
      </div>
    </DashboardCard>
  );
}
