import type { ReactNode } from "react";
import type { Patient } from "@/lib/types";

export function PatientProfileShell({
  patient: _patient,
  active: _active,
  children
}: {
  patient: Patient;
  active: "overview" | "carepath" | "documents" | "fractions";
  children: ReactNode;
}) {
  return <div className="space-y-5 bg-[var(--color-bg)]">{children}</div>;
}
