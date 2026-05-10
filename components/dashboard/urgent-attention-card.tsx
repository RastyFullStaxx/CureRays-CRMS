import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { urgentAttentionItems } from "@/lib/dashboard-data";

export function UrgentAttentionCard() {
  return (
    <DashboardCard
      title="Urgent Attention"
      action={<AlertTriangle className="h-4 w-4 text-[#FF6620]" aria-hidden="true" />}
      className="xl:col-span-4"
    >
      <div className="px-4 py-1.5">
        {urgentAttentionItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center justify-between border-b border-[#E7EEF8] py-2.5 text-[13px] font-bold text-[#061A55] last:border-b-0"
          >
            <span>{item.label}</span>
            <span className="flex items-center gap-4 text-[#FF6620]">
              {item.count}
              <ChevronRight className="h-4 w-4 text-[#7DA0CA]" aria-hidden="true" />
            </span>
          </Link>
        ))}
        <Link href="/tasks" className="mt-1.5 flex items-center justify-between py-2 text-[13px] font-bold text-[#0033A0]">
          View all alerts
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </DashboardCard>
  );
}
