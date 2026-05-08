import { cn } from "@/lib/workflow";
import type { CarepathWorkflowPhase } from "@/lib/types";
import { carepathPhaseLabels, orderedCarepathPhases } from "@/lib/workflow";

export function CourseTimeline({ currentPhase }: { currentPhase: CarepathWorkflowPhase }) {
  const activeIndex = orderedCarepathPhases.indexOf(currentPhase);
  return (
    <div className="scrollbar-soft overflow-x-auto rounded-lg bg-white/42 p-3">
      <ol className="flex min-w-[900px] items-center gap-2">
        {orderedCarepathPhases.map((phase, index) => (
          <li
            key={phase}
            className={cn(
              "flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-center text-xs font-bold",
              index <= activeIndex ? "bg-curerays-blue text-white" : "bg-white/68 text-curerays-indigo"
            )}
          >
            {carepathPhaseLabels[phase]}
          </li>
        ))}
      </ol>
    </div>
  );
}
