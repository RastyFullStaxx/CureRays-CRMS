import Link from "next/link";
import type { ReactNode } from "react";
import type { Patient } from "@/lib/types";
import { cn, patientName } from "@/lib/workflow";

const tabs = [
  { label: "Overview", href: "" },
  { label: "Course Workflow", href: "/carepath" },
  { label: "Tasks", href: "#tasks" },
  { label: "Clinical Forms", href: "#clinical-forms" },
  { label: "Treatment Planning", href: "#treatment-planning" },
  { label: "Imaging", href: "#imaging" },
  { label: "Documents", href: "/documents" },
  { label: "Treatment Delivery", href: "/fraction-log" },
  { label: "Billing / Audit", href: "#billing-audit" },
  { label: "Activity Timeline", href: "#audit" }
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
    <div className="space-y-5 bg-white">
      <section className="rounded-2xl border border-[#D8E4F5] bg-white p-5 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
        <p className="text-xs font-bold uppercase tracking-wide text-[#FF6620]">Patient workspace</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#061A55]">{patientName(patient)}</h1>
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
                  "min-w-fit rounded-xl px-3 py-2 text-sm font-bold transition",
                  isActive ? "bg-[#0033A0] text-white shadow-[0_8px_20px_rgba(0,51,160,0.18)]" : "text-[#3D5A80] hover:bg-[#F8FBFF]"
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
