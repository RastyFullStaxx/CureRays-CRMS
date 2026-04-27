import type { Patient } from "@/lib/types";
import { diagnosisWorkflowMix } from "@/lib/workflow";
import { ProgressBar } from "@/components/progress-bar";

const labels: Record<ReturnType<typeof diagnosisWorkflowMix>[number]["diagnosis"], string> = {
  SKIN_CANCER: "Skin Cancer",
  ARTHRITIS: "Arthritis",
  DUPUYTRENS: "Dupuytren's"
};

export function DiagnosisMixPanel({ patients }: { patients: Patient[] }) {
  const mix = diagnosisWorkflowMix(patients);

  return (
    <section className="glass-panel rounded-glass p-5">
      <h3 className="text-lg font-semibold text-curerays-dark-plum">Diagnosis workflow mix</h3>
      <p className="mt-1 text-sm text-curerays-indigo">Which templates should be refined first.</p>
      <div className="mt-5 space-y-4">
        {mix.map((item) => {
          const percent = patients.length ? Math.round((item.count / patients.length) * 100) : 0;

          return (
            <div key={item.diagnosis} className="rounded-lg bg-white/52 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-curerays-dark-plum">{labels[item.diagnosis]}</p>
                <span className="text-xs font-bold text-curerays-indigo">{item.count} records</span>
              </div>
              <ProgressBar value={percent} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
