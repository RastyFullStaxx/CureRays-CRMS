import { cn } from "@/lib/workflow";
import type { CarepathWorkflowPhase } from "@/lib/types";
import { carepathPhaseLabels, orderedCarepathPhases } from "@/lib/workflow";

export function CourseTimeline({ currentPhase }: { currentPhase: CarepathWorkflowPhase }) {
  const activeIndex = orderedCarepathPhases.indexOf(currentPhase);
  return (
    <div className="scrollbar-soft overflow-x-auto rounded-2xl border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
      <ol className="flex min-w-[900px] items-center gap-2">
        {orderedCarepathPhases.map((phase, index) => (
          <li
            key={phase}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold",
              index <= activeIndex ? "bg-[#0033A0] text-white" : "bg-[#F8FBFF] text-[#3D5A80]"
            )}
          >
            {carepathPhaseLabels[phase]}
          </li>
        ))}
      </ol>
    </div>
  );
}
