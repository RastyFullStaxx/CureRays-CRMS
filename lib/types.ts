export type Phase = "Upcoming" | "On Treatment" | "Post";

export type Status = "Active" | "On Hold" | "Paused";

export type FlagSeverity = "Low" | "Medium" | "High";

export type Checklist = {
  txSummaryComplete: boolean;
  followUpScheduled: boolean;
  billingComplete: boolean;
};

export type Patient = {
  id: string;
  name: string;
  diagnosis: string;
  location: string;
  md: string;
  phase: Phase;
  status: Status;
  startDate: string;
  endDate: string | null;
  assignedStaff: string;
  nextAction: string;
  flags: string[];
  notes: string;
  checklist: Checklist;
  lastUpdated: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  time: string;
  location: string;
  staff: string;
  phase: Phase;
};

export type PriorityFlag = {
  id: string;
  patientId: string;
  patientName: string;
  severity: FlagSeverity;
  summary: string;
  owner: string;
  dueAt: string;
};

export type Activity = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
};

export type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  timestamp: string;
  accessLevel: "Clinical" | "Operations" | "Billing" | "Admin";
  summary: string;
};
