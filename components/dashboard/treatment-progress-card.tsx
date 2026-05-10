import Link from "next/link";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { treatmentProgressItems } from "@/lib/dashboard-data";

const barStyles = {
  blue: "bg-[#0033A0]",
  orange: "bg-[#FF6620]",
  indigo: "bg-[#2B2F5F]"
};

export function TreatmentProgressCard() {
  return (
    <DashboardCard title="Treatment Progress Overview" action={<Link href="/patients" className="text-xs font-bold text-[#FF6620]">View all patients</Link>} className="xl:col-span-4">
      <div className="space-y-3 p-4">
        {treatmentProgressItems.map((item) => (
          <Link key={item.label} href={item.href} className="grid grid-cols-[92px_1fr_64px] items-center gap-3">
            <span className="truncate text-[13px] font-bold text-[#061A55]">{item.label}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-[#EDF2F9]">
              <span className={`block h-full rounded-full ${barStyles[item.tone]}`} style={{ width: `${item.percent}%` }} />
            </span>
            <span className="text-right text-[13px] font-bold text-[#061A55]">
              {item.count} <span className="text-[#3D5A80]">({item.percent}%)</span>
            </span>
          </Link>
        ))}
      </div>
    </DashboardCard>
  );
}
