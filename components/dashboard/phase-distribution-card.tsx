import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { phaseDistribution, totalPatientsInCare } from "@/lib/dashboard-data";

export function PhaseDistributionCard() {
  return (
    <DashboardCard title="Patient Phase Distribution">
      <div className="grid gap-6 p-5 md:grid-cols-[190px_1fr] md:items-center">
        <div className="relative mx-auto h-44 w-44 rounded-full bg-[conic-gradient(#0033A0_0_29%,#7DA0CA_29%_74%,#FF6620_74%_100%)]">
          <div className="absolute inset-10 grid place-items-center rounded-full bg-white text-center">
            <span>
              <span className="block text-4xl font-bold text-[#061A55]">{totalPatientsInCare}</span>
              <span className="block text-sm font-bold text-[#3D5A80]">Total</span>
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {phaseDistribution.map((item) => (
            <div key={item.label} className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm font-bold">
              <span className="inline-flex items-center gap-3 text-[#061A55]">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="text-[#061A55]">{item.value} <span className="text-[#3D5A80]">({item.percent}%)</span></span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
