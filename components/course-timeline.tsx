import { cn } from "@/lib/workflow";
import type { CarepathWorkflowPhase } from "@/lib/types";
import { carepathPhaseLabels, orderedCarepathPhases } from "@/lib/workflow";

export function CourseTimeline({ currentPhase }: { currentPhase: CarepathWorkflowPhase }) {
  const activeIndex = orderedCarepathPhases.indexOf(currentPhase);
  return (
    <div className="scrollbar-soft overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)]">
      <ol className="flex min-w-[900px] items-center gap-2">
        {orderedCarepathPhases.map((phase, index) => (
          <li
            key={phase}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl px-3 py-2 text-center text-xs font-bold",
              index <= activeIndex ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-elevated)] text-[var(--color-text-soft)]"
            )}
          >
            {carepathPhaseLabels[phase]}
          </li>
        ))}
      </ol>
    </div>
  );
}
