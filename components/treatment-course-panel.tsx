import { Radiation } from "lucide-react";
import type { TreatmentCourse } from "@/lib/types";
import { chartRoundsPhaseLabels, formatDate } from "@/lib/workflow";
import { ProgressBar } from "@/components/progress-bar";

export function TreatmentCoursePanel({ course }: { course: TreatmentCourse }) {
  const fractionProgress = Math.round((course.currentFraction / course.totalFractions) * 100);

  const details = [
    ["Diagnosis", course.diagnosis],
    ["Treatment type", course.treatmentType],
    ["Modality", course.treatmentModality],
    ["Energy", course.energy ?? "Not set"],
    ["Applicator", course.applicator ?? "Not set"],
    ["Dose", course.dose ?? "Not set"],
    ["Target depth", course.targetDepth ?? "Not set"],
    ["Course status", course.status.replaceAll("_", " ")]
  ];

  return (
    <section className="glass-panel rounded-glass p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-curerays-orange">{chartRoundsPhaseLabels[course.chartRoundsPhase]}</p>
          <h3 className="mt-2 text-2xl font-semibold text-curerays-dark-plum">{course.protocolName}</h3>
          <p className="mt-2 text-sm leading-6 text-curerays-indigo">{course.notes}</p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-lg bg-curerays-orange/10 text-curerays-orange">
          <Radiation className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-5">
        <ProgressBar value={fractionProgress} label={`${course.currentFraction}/${course.totalFractions} fractions`} />
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white/54 p-3">
            <p className="text-xs font-bold text-curerays-indigo">{label}</p>
            <p className="mt-2 text-sm font-semibold text-curerays-dark-plum">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs font-semibold text-curerays-indigo">
        Start {formatDate(course.startDate)} - End {formatDate(course.endDate)}
      </p>
    </section>
  );
}
