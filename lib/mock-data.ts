import type { Activity, Appointment, AuditEvent, Patient, PriorityFlag } from "@/lib/types";

export const patients: Patient[] = [
  {
    id: "CR-2401",
    name: "Avery Santos",
    diagnosis: "Breast radiation course",
    location: "Main Campus",
    md: "Dr. Helena Cruz",
    phase: "On Treatment",
    status: "Active",
    startDate: "2026-04-15",
    endDate: "2026-05-10",
    assignedStaff: "Mika Alvarez",
    nextAction: "Verify weekly treatment summary",
    flags: ["Billing review"],
    notes: "Operational note only. Clinical details restricted to chart.",
    checklist: {
      txSummaryComplete: true,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdated: "2026-04-26T08:48:00+08:00"
  },
  {
    id: "CR-2402",
    name: "Noah Tan",
    diagnosis: "Head and neck treatment",
    location: "North Suite",
    md: "Dr. Mateo Reyes",
    phase: "Upcoming",
    status: "Active",
    startDate: "2026-04-30",
    endDate: null,
    assignedStaff: "Iris Lim",
    nextAction: "Confirm simulation packet",
    flags: ["Missing consent"],
    notes: "Pre-treatment checklist requires operations confirmation.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: true
    },
    lastUpdated: "2026-04-26T09:20:00+08:00"
  },
  {
    id: "CR-2403",
    name: "Lena Brooks",
    diagnosis: "Prostate treatment",
    location: "Main Campus",
    md: "Dr. Samir Patel",
    phase: "Post",
    status: "Active",
    startDate: "2026-03-02",
    endDate: "2026-04-18",
    assignedStaff: "Tessa Nguyen",
    nextAction: "Schedule post-treatment call",
    flags: [],
    notes: "Post-course follow-up coordination only.",
    checklist: {
      txSummaryComplete: true,
      followUpScheduled: false,
      billingComplete: true
    },
    lastUpdated: "2026-04-25T14:15:00+08:00"
  },
  {
    id: "CR-2404",
    name: "Ethan Keller",
    diagnosis: "Lung treatment",
    location: "East Wing",
    md: "Dr. Helena Cruz",
    phase: "On Treatment",
    status: "On Hold",
    startDate: "2026-04-08",
    endDate: "2026-05-03",
    assignedStaff: "Mika Alvarez",
    nextAction: "Resolve hold reason with MD office",
    flags: ["Clinical hold", "MD review"],
    notes: "Hold reason is restricted. Operations view shows coordination task only.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdated: "2026-04-26T10:05:00+08:00"
  },
  {
    id: "CR-2405",
    name: "Maya Chen",
    diagnosis: "Brain SRS follow-up",
    location: "North Suite",
    md: "Dr. Mateo Reyes",
    phase: "Post",
    status: "Active",
    startDate: "2026-04-01",
    endDate: "2026-04-12",
    assignedStaff: "Iris Lim",
    nextAction: "Close billing checklist",
    flags: ["Billing review"],
    notes: "Billing workflow pending verification.",
    checklist: {
      txSummaryComplete: true,
      followUpScheduled: true,
      billingComplete: false
    },
    lastUpdated: "2026-04-25T16:40:00+08:00"
  },
  {
    id: "CR-2406",
    name: "Julian Park",
    diagnosis: "GI treatment course",
    location: "Main Campus",
    md: "Dr. Priya Nair",
    phase: "Upcoming",
    status: "Paused",
    startDate: "2026-05-06",
    endDate: null,
    assignedStaff: "Tessa Nguyen",
    nextAction: "Confirm updated start date",
    flags: ["Schedule risk"],
    notes: "Start date changed; workflow remains phase-driven.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: false,
      billingComplete: false
    },
    lastUpdated: "2026-04-24T11:35:00+08:00"
  },
  {
    id: "CR-2407",
    name: "Sofia Ramirez",
    diagnosis: "Breast boost treatment",
    location: "East Wing",
    md: "Dr. Samir Patel",
    phase: "On Treatment",
    status: "Active",
    startDate: "2026-04-18",
    endDate: "2026-05-14",
    assignedStaff: "Noel Rivera",
    nextAction: "Prepare completion packet",
    flags: [],
    notes: "Completion materials queued for staff review.",
    checklist: {
      txSummaryComplete: true,
      followUpScheduled: true,
      billingComplete: false
    },
    lastUpdated: "2026-04-26T07:42:00+08:00"
  },
  {
    id: "CR-2408",
    name: "Owen Miller",
    diagnosis: "Palliative treatment",
    location: "Main Campus",
    md: "Dr. Priya Nair",
    phase: "Upcoming",
    status: "Active",
    startDate: "2026-04-28",
    endDate: null,
    assignedStaff: "Noel Rivera",
    nextAction: "Assign treatment coordinator",
    flags: [],
    notes: "Coordinator assignment needed before first visit.",
    checklist: {
      txSummaryComplete: false,
      followUpScheduled: true,
      billingComplete: true
    },
    lastUpdated: "2026-04-25T09:10:00+08:00"
  }
];

export const appointments: Appointment[] = [
  {
    id: "APT-101",
    patientId: "CR-2401",
    patientName: "Avery Santos",
    title: "Weekly treatment review",
    time: "09:30",
    location: "Main Campus",
    staff: "Mika Alvarez",
    phase: "On Treatment"
  },
  {
    id: "APT-102",
    patientId: "CR-2402",
    patientName: "Noah Tan",
    title: "Simulation packet check",
    time: "11:00",
    location: "North Suite",
    staff: "Iris Lim",
    phase: "Upcoming"
  },
  {
    id: "APT-103",
    patientId: "CR-2407",
    patientName: "Sofia Ramirez",
    title: "Completion readiness",
    time: "14:15",
    location: "East Wing",
    staff: "Noel Rivera",
    phase: "On Treatment"
  }
];

export const priorityFlags: PriorityFlag[] = [
  {
    id: "FLG-77",
    patientId: "CR-2404",
    patientName: "Ethan Keller",
    severity: "High",
    summary: "Treatment hold needs MD office response",
    owner: "Mika Alvarez",
    dueAt: "Today"
  },
  {
    id: "FLG-78",
    patientId: "CR-2402",
    patientName: "Noah Tan",
    severity: "Medium",
    summary: "Consent packet missing from intake workflow",
    owner: "Iris Lim",
    dueAt: "Today"
  },
  {
    id: "FLG-79",
    patientId: "CR-2405",
    patientName: "Maya Chen",
    severity: "Medium",
    summary: "Billing checklist requires final verification",
    owner: "Billing Queue",
    dueAt: "Tomorrow"
  }
];

export const activities: Activity[] = [
  {
    id: "ACT-01",
    actor: "Mika Alvarez",
    action: "updated phase visibility",
    target: "CR-2401",
    timestamp: "18 minutes ago"
  },
  {
    id: "ACT-02",
    actor: "Iris Lim",
    action: "added priority flag",
    target: "CR-2402",
    timestamp: "34 minutes ago"
  },
  {
    id: "ACT-03",
    actor: "System",
    action: "refreshed checklist progress",
    target: "Operational snapshot",
    timestamp: "1 hour ago"
  },
  {
    id: "ACT-04",
    actor: "Tessa Nguyen",
    action: "scheduled post-treatment follow-up",
    target: "CR-2403",
    timestamp: "2 hours ago"
  }
];

export const auditEvents: AuditEvent[] = [
  {
    id: "AUD-901",
    actor: "Mika Alvarez",
    action: "Phase update",
    entity: "CR-2401",
    timestamp: "2026-04-26 08:48",
    accessLevel: "Clinical",
    summary: "Visibility updated through phase field. No row movement performed."
  },
  {
    id: "AUD-902",
    actor: "Iris Lim",
    action: "Flag created",
    entity: "CR-2402",
    timestamp: "2026-04-26 09:20",
    accessLevel: "Operations",
    summary: "Missing consent flag added with owner and due date."
  },
  {
    id: "AUD-903",
    actor: "Billing Queue",
    action: "Checklist review",
    entity: "CR-2405",
    timestamp: "2026-04-25 16:40",
    accessLevel: "Billing",
    summary: "Billing checklist remains incomplete pending verification."
  },
  {
    id: "AUD-904",
    actor: "Clinical Admin",
    action: "Access review",
    entity: "Dashboard permissions",
    timestamp: "2026-04-25 15:05",
    accessLevel: "Admin",
    summary: "Role-based access labels reviewed for operations dashboard."
  }
];
