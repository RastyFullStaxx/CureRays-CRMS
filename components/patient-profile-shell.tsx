import Link from "next/link";
import type { ReactNode } from "react";
import type { Patient } from "@/lib/types";
import { cn, patientName } from "@/lib/workflow";

const tabs = [
  { label: "Overview", href: "" },
  { label: "Carepath", href: "/carepath" },
  { label: "Documents", href: "/documents" },
  { label: "Fraction Log", href: "/fraction-log" },
  { label: "Notes", href: "#notes" },
  { label: "Audit Trail", href: "#audit" }
];

export function PatientProfileShell({
  patient,
  active,
  children
}: {
  patient: Patient;
  active: "overview" | "carepath" | "documents" | "fraction-log";
  children: ReactNode;
}) {
  const base = `/patients/${patient.id}`;

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-glass p-5">
        <p className="text-sm font-semibold text-curerays-orange">Patient workspace</p>
        <h1 className="mt-2 text-3xl font-semibold text-curerays-dark-plum">{patientName(patient)}</h1>
        <nav className="scrollbar-soft mt-5 flex gap-2 overflow-x-auto" aria-label="Patient profile sections">
          {tabs.map((tab) => {
            const key = tab.href === "" ? "overview" : tab.href.slice(1);
            const href = tab.href.startsWith("#") ? tab.href : `${base}${tab.href}`;
            const isActive = active === key;

            return (
              <Link
                key={tab.label}
                href={href}
                className={cn(
                  "min-w-fit rounded-full px-4 py-2 text-sm font-semibold transition",
                  isActive ? "bg-curerays-dark-plum text-white" : "bg-white/58 text-curerays-indigo hover:bg-white"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </section>
      {children}
    </div>
  );
}
