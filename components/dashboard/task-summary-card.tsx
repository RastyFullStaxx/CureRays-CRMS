import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { taskSummaryItems } from "@/lib/dashboard-data";

const countStyles = {
  blue: "text-[#0033A0]",
  orange: "text-[#FF6620]",
  neutral: "text-[#061A55]"
};

export function TaskSummaryCard() {
  return (
    <DashboardCard title="Tasks Summary" action={<Link href="/tasks" className="text-xs font-bold text-[#FF6620]">View all tasks</Link>} className="xl:col-span-3">
      <div className="px-4 py-1.5">
        {taskSummaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} href={item.href} className="flex items-center gap-2.5 border-b border-[#E7EEF8] py-2.5 last:border-b-0">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#F3F6FB] text-[#0033A0]">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-bold text-[#061A55]">{item.label}</span>
              <span className={`text-[13px] font-bold ${countStyles[item.tone]}`}>{item.count}</span>
              <ChevronRight className="h-4 w-4 text-[#7DA0CA]" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}
