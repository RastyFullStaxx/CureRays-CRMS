import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { phaseDistribution, totalPatientsInCare } from "@/lib/dashboard-data";

export function PhaseDistributionCard() {
  return (
    <DashboardCard title="Patient Phase Distribution" className="xl:col-span-3">
      <div className="grid gap-3 p-4 md:grid-cols-[132px_1fr] md:items-center xl:grid-cols-1 2xl:grid-cols-[132px_1fr]">
        <div className="relative mx-auto h-32 w-32 rounded-full bg-[conic-gradient(#0033A0_0_29%,#7DA0CA_29%_74%,#FF6620_74%_100%)]">
          <div className="absolute inset-8 grid place-items-center rounded-full bg-white text-center">
            <span>
              <span className="block text-3xl font-bold leading-none text-[#061A55]">{totalPatientsInCare}</span>
              <span className="block text-xs font-bold text-[#3D5A80]">Total</span>
            </span>
          </div>
        </div>
        <div className="space-y-2.5">
          {phaseDistribution.map((item) => (
            <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-3 text-[13px] font-bold">
              <span className="inline-flex items-center gap-3 text-[#061A55]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="truncate">{item.label}</span>
              </span>
              <span className="text-[#061A55]">{item.value} <span className="text-[#3D5A80]">({item.percent}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
