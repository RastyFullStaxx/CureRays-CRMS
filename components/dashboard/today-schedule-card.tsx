import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { todayScheduleItems } from "@/lib/dashboard-data";

const badgeStyles = {
  blue: "bg-[#EAF1FF] text-[#0033A0]",
  orange: "bg-[#FFF0E8] text-[#FF6620]",
  neutral: "bg-[#F3F6FB] text-[#0033A0]"
};

export function TodayScheduleCard() {
  return (
    <DashboardCard
      title="Today's Schedule"
      action={<Link href="/schedule" className="text-xs font-bold text-[#FF6620]">View full schedule</Link>}
      className="xl:row-span-2"
    >
      <div className="px-5 py-4">
        <div className="space-y-1 border-l border-[#DDE6F5]">
          {todayScheduleItems.map((item) => (
            <Link key={`${item.time}-${item.title}`} href="/schedule" className="grid grid-cols-[74px_1fr] gap-4 py-3">
              <span className="text-sm font-bold text-[#061A55]">{item.time}</span>
              <span className="flex min-w-0 items-start justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#061A55]">{item.title}</span>
                  <span className="mt-1 block text-xs font-semibold text-[#3D5A80]">{item.subtitle}</span>
                </span>
                <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-bold ${badgeStyles[item.tone]}`}>
                  {item.status}
                </span>
              </span>
            </Link>
          ))}
        </div>
        <Link href="/schedule" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#0033A0]">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          6 Appointments
        </Link>
      </div>
    </DashboardCard>
  );
}
