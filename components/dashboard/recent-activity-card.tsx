import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { recentActivities } from "@/lib/dashboard-data";

const toneStyles = {
  blue: "bg-[#EAF1FF] text-[#0033A0]",
  orange: "bg-[#FFF0E8] text-[#FF6620]",
  amber: "bg-[#FFF4D1] text-[#B46B00]"
};

export function RecentActivityCard() {
  return (
    <DashboardCard title="Recent Activity" className="xl:col-span-2">
      <div className="space-y-3 p-5">
        {recentActivities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.label} className="flex items-center gap-3">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${toneStyles[activity.tone]}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-[#061A55]">{activity.label}</p>
              <span className="shrink-0 text-xs font-bold text-[#3D5A80]">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </DashboardCard>
  );
}
