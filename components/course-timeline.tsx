import { cn } from "@/lib/workflow";
import type { CarepathWorkflowPhase } from "@/lib/types";
import { carepathPhaseLabels, orderedCarepathPhases } from "@/lib/workflow";

export function CourseTimeline({ currentPhase }: { currentPhase: CarepathWorkflowPhase }) {
  const activeIndex = orderedCarepathPhases.indexOf(currentPhase);
  return (
    <div className="scrollbar-soft overflow-x-auto rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-card)] p-3 shadow-[var(--shadow-card)]">
      <ol className="flex min-w-[900px] items-center gap-2">
        {orderedCarepathPhases.map((phase, index) => (
          <li
            key={phase}
            className={cn(
              "flex flex-1 items-center justify-center rounded-[var(--radius-md)] px-3 py-2 text-center type-supporting",
              index < activeIndex && "bg-[var(--status-positive-surface)] text-[var(--status-positive-text)]",
              index === activeIndex && "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
              index > activeIndex && "bg-[var(--status-neutral-surface)] text-[var(--status-neutral-text)]",
            )}
          >
            {carepathPhaseLabels[phase]}
          </li>
        ))}
      </ol>
    </div>
  );
}
