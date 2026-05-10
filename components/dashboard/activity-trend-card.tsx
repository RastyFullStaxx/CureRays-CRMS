import { ChevronDown } from "lucide-react";
import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { treatmentActivityTrend } from "@/lib/dashboard-data";

function linePoints(key: "treatments" | "newStarts") {
  const values = treatmentActivityTrend.map((item) => item[key]);
  const max = 45;
  const width = 520;
  const height = 140;
  return values
    .map((value, index) => {
      const x = 28 + (index / (values.length - 1)) * width;
      const y = 12 + (1 - value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function ActivityTrendCard() {
  return (
    <DashboardCard
      title="Treatment Activity Trend"
      action={
        <button type="button" className="inline-flex items-center gap-2 rounded-md border border-[#DDE6F5] px-3 py-2 text-xs font-bold text-[#061A55]">
          This Week
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      }
      className="xl:col-span-2"
    >
      <div className="p-5">
        <div className="mb-2 flex gap-5 text-xs font-bold">
          <span className="inline-flex items-center gap-2 text-[#0033A0]"><span className="h-2 w-2 rounded-full bg-[#0033A0]" />Treatments</span>
          <span className="inline-flex items-center gap-2 text-[#FF6620]"><span className="h-2 w-2 rounded-full bg-[#FF6620]" />New Starts</span>
        </div>
        <svg viewBox="0 0 590 190" className="h-48 w-full" role="img" aria-label="Treatment activity trend">
          {[0, 10, 20, 30, 40].map((tick) => (
            <g key={tick}>
              <line x1="28" x2="560" y1={152 - tick * 3.5} y2={152 - tick * 3.5} stroke="#EDF2F9" strokeWidth="1" />
              <text x="0" y={156 - tick * 3.5} className="fill-[#3D5A80] text-[11px] font-bold">{tick}</text>
            </g>
          ))}
          <polyline points={linePoints("treatments")} fill="none" stroke="#0033A0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={linePoints("newStarts")} fill="none" stroke="#FF6620" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {treatmentActivityTrend.map((item, index) => (
            <text key={item.day} x={28 + (index / 6) * 520} y="184" textAnchor="middle" className="fill-[#061A55] text-[12px] font-bold">
              {item.day}
            </text>
          ))}
        </svg>
      </div>
    </DashboardCard>
  );
}
