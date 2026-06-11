import "server-only";

import type { Patient } from "@/lib/types";

export function patientName(patient: Patient) {
  return `${patient.firstName} ${patient.lastName}`;
}
