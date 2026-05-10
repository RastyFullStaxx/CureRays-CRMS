import {
  Activity,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileWarning,
  PenLine,
  ShieldAlert,
  Target,
  UsersRound
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardKpi = {
  label: string;
  value: string;
  comparison: string;
  href: string;
  tone: "blue" | "orange" | "amber";
  icon: LucideIcon;
  trend: number[];
};

export type PipelineSegment = {
  label: string;
  value: number;
  percent: number;
  tone: "upcoming" | "active" | "post";
};

export type AttentionItem = {
  label: string;
  count: number;
  href: string;
};

export type ScheduleItem = {
  time: string;
  title: string;
  subtitle: string;
  status: string;
  tone: "blue" | "orange" | "neutral";
};

export type ActivityPoint = {
  day: string;
  treatments: number;
  newStarts: number;
};

export type RecentActivity = {
  label: string;
  time: string;
  icon: LucideIcon;
  tone: "blue" | "orange" | "amber";
};

export type TaskSummaryItem = {
  label: string;
  count: number;
  href: string;
  tone: "blue" | "orange" | "neutral";
  icon: LucideIcon;
};

export type TreatmentProgressItem = {
  label: string;
  count: number;
  percent: number;
  tone: "blue" | "orange" | "indigo";
  href: string;
};

export const dashboardKpis: DashboardKpi[] = [
  {
    label: "Active Patients Today",
    value: "48",
    comparison: "+12% vs yesterday",
    href: "/patients",
    tone: "blue",
    icon: UsersRound,
    trend: [18, 30, 26, 38, 31, 44, 39, 52]
  },
  {
    label: "On Treatment",
    value: "27",
    comparison: "+8% vs yesterday",
    href: "/on-treatment",
    tone: "blue",
    icon: Activity,
    trend: [12, 18, 15, 22, 19, 27, 23, 30]
  },
  {
    label: "Pending Signatures",
    value: "16",
    comparison: "+11% vs yesterday",
    href: "/documents",
    tone: "orange",
    icon: PenLine,
    trend: [8, 15, 11, 18, 14, 22, 17, 25]
  },
  {
    label: "Overdue Tasks",
    value: "7",
    comparison: "+2 vs yesterday",
    href: "/tasks",
    tone: "amber",
    icon: AlertTriangle,
    trend: [3, 6, 4, 7, 5, 8, 6, 9]
  }
];

export const pipelineSegments: PipelineSegment[] = [
  { label: "Upcoming", value: 24, percent: 26, tone: "upcoming" },
  { label: "On Treatment", value: 27, percent: 29, tone: "active" },
  { label: "Post Treatment", value: 41, percent: 45, tone: "post" }
];

export const totalPatientsInCare = 92;

export const urgentAttentionItems: AttentionItem[] = [
  { label: "Blocked Cases", count: 3, href: "/workflow" },
  { label: "Missing Documents", count: 5, href: "/documents" },
  { label: "Overdue Approvals", count: 7, href: "/tasks" },
  { label: "Plan QA Pending", count: 4, href: "/treatment-planning" }
];

export const todayScheduleItems: ScheduleItem[] = [
  { time: "9:00 AM", title: "Treatment - Head & Neck", subtitle: "RTx · MRT", status: "On Treatment", tone: "blue" },
  { time: "10:30 AM", title: "Simulation - Prostate", subtitle: "CT Sim", status: "Scheduled", tone: "neutral" },
  { time: "12:00 PM", title: "Follow-up - Breast", subtitle: "Dr. Sarah Johnson", status: "Follow-up", tone: "orange" },
  { time: "2:00 PM", title: "Treatment - Lung", subtitle: "RTx · VMAT", status: "On Treatment", tone: "blue" },
  { time: "4:00 PM", title: "New Patient Consult", subtitle: "Dr. Sarah Johnson", status: "Consult", tone: "orange" }
];

export const treatmentActivityTrend: ActivityPoint[] = [
  { day: "Mon", treatments: 28, newStarts: 10 },
  { day: "Tue", treatments: 36, newStarts: 14 },
  { day: "Wed", treatments: 33, newStarts: 12 },
  { day: "Thu", treatments: 38, newStarts: 15 },
  { day: "Fri", treatments: 26, newStarts: 7 },
  { day: "Sat", treatments: 17, newStarts: 5 },
  { day: "Sun", treatments: 13, newStarts: 3 }
];

export const recentActivities: RecentActivity[] = [
  { label: "Treatment completed for Patient #P-10321", time: "45m ago", icon: CheckCircle2, tone: "blue" },
  { label: "Plan approval requested for Patient #P-10387", time: "1h ago", icon: PenLine, tone: "blue" },
  { label: "Document uploaded: Consent Form - Patient #P-10456", time: "2h ago", icon: FileCheck2, tone: "orange" },
  { label: "New patient added: Patient #P-10522", time: "3h ago", icon: UsersRound, tone: "blue" },
  { label: "QA completed for Plan - Patient #P-10211", time: "4h ago", icon: Target, tone: "blue" }
];

export const taskSummaryItems: TaskSummaryItem[] = [
  { label: "My Tasks", count: 12, href: "/tasks", tone: "blue", icon: ClipboardCheck },
  { label: "Due Today", count: 5, href: "/tasks", tone: "neutral", icon: Clock3 },
  { label: "Overdue", count: 7, href: "/tasks", tone: "orange", icon: ShieldAlert },
  { label: "Completed This Week", count: 28, href: "/tasks", tone: "blue", icon: CheckCircle2 }
];

export const treatmentProgressItems: TreatmentProgressItem[] = [
  { label: "Planning", count: 14, percent: 15, tone: "blue", href: "/workflow" },
  { label: "Ready to Treat", count: 18, percent: 20, tone: "blue", href: "/patients" },
  { label: "On Treatment", count: 46, percent: 50, tone: "blue", href: "/treatment-delivery" },
  { label: "On Hold", count: 6, percent: 7, tone: "orange", href: "/tasks" },
  { label: "Completed", count: 8, percent: 9, tone: "indigo", href: "/patients" }
];

export const phaseDistribution = [
  { label: "On Treatment", value: 27, percent: 29, color: "#0033A0" },
  { label: "Post Treatment", value: 41, percent: 45, color: "#7DA0CA" },
  { label: "Upcoming", value: 24, percent: 26, color: "#FF6620" }
];

export const dashboardAlerts = {
  missingDocuments: 5,
  pendingSignatures: 16,
  overdueTasks: 7,
  blockedCases: 3,
  icon: FileWarning
};
