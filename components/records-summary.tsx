import { Database, LockKeyhole, ShieldCheck, TableProperties } from "lucide-react";
import type { Patient } from "@/lib/types";
import { countFlaggedPatients } from "@/lib/workflow";

export function RecordsSummary({ patients }: { patients: Patient[] }) {
  const cards = [
    {
      label: "Single source",
      value: `${patients.length} records`,
      detail: "All views project from one patient set.",
      icon: Database
    },
    {
      label: "Flag coverage",
      value: `${countFlaggedPatients(patients)} flagged`,
      detail: "Issues stay attached to the patient record.",
      icon: TableProperties
    },
    {
      label: "Access stance",
      value: "PHI minimized",
      detail: "Dashboard shows operational state first.",
      icon: LockKeyhole
    }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article key={card.label} className="glass-panel rounded-glass p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-curerays-indigo">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold text-curerays-dark-plum">{card.value}</p>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-curerays-blue/10 text-curerays-blue">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-sm leading-5 text-curerays-dark-plum/68">{card.detail}</p>
          </article>
        );
      })}

      <div className="glass-panel rounded-glass p-5 md:col-span-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-curerays-blue" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-semibold text-curerays-dark-plum">Master record governance</h3>
            <p className="mt-2 text-sm leading-6 text-curerays-indigo">
              The Master Records page is designed as the controlled operational index. Detailed
              clinical notes, restricted chart context, and future edit permissions should be served
              through role-aware API responses rather than exposed broadly in dashboard rows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
