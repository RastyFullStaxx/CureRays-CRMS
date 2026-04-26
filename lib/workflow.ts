import type { Checklist, Patient, Phase, Status } from "@/lib/types";

export function checklistScore(checklist: Checklist) {
  const completed = [
    checklist.txSummaryComplete,
    checklist.followUpScheduled,
    checklist.billingComplete
  ].filter(Boolean).length;

  return {
    completed,
    total: 3,
    percent: Math.round((completed / 3) * 100)
  };
}

export function patientsByPhase(patients: Patient[], phase: Phase) {
  return patients.filter((patient) => patient.phase === phase);
}

export function phaseCounts(patients: Patient[]) {
  return patients.reduce<Record<Phase, number>>(
    (counts, patient) => {
      counts[patient.phase] += 1;
      return counts;
    },
    {
      Upcoming: 0,
      "On Treatment": 0,
      Post: 0
    }
  );
}

export function countFlaggedPatients(patients: Patient[]) {
  return patients.filter((patient) => patient.flags.length > 0).length;
}

export function averageChecklistPercent(patients: Patient[]) {
  if (patients.length === 0) {
    return 0;
  }

  const total = patients.reduce((sum, patient) => sum + checklistScore(patient.checklist).percent, 0);
  return Math.round(total / patients.length);
}

export function statusCounts(patients: Patient[]) {
  return patients.reduce<Record<Status, number>>(
    (counts, patient) => {
      counts[patient.status] += 1;
      return counts;
    },
    {
      Active: 0,
      "On Hold": 0,
      Paused: 0
    }
  );
}

export function formatDate(value: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

export function formatLastUpdated(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
