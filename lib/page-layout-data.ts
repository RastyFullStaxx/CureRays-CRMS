import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileCheck2,
  FileText,
  FileWarning,
  Image,
  ListChecks,
  NotebookTabs,
  PenLine,
  Radiation,
  Settings,
  ShieldCheck,
  UsersRound,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Metric = {
  label: string;
  value: string | number;
  detail: string;
  tone?: "blue" | "orange" | "amber" | "indigo";
  icon: LucideIcon;
};

export const viewTabs = {
  patients: ["All Patients", "Upcoming", "On Treatment", "Post", "Blocked", "Needs Action"],
  courses: ["Active Courses", "Upcoming", "On Treatment", "Post-Tx", "Audit", "Closed", "Blocked"],
  workflow: ["Board View", "Table View", "Phase View", "Blockers View", "Signatures View"],
  tasks: ["My Tasks", "Team Tasks", "Unassigned", "Signatures Needed", "Due Today", "Overdue", "Completed"],
  schedule: ["Day View", "Week View", "Calendar View", "Treatment Queue", "Provider Schedule"],
  forms: ["Forms Library", "Patient Forms", "Drafts", "Ready for Review", "Signed Forms"],
  planning: ["Planning Queue", "Plan Workspace", "Dose Calculator", "Physics Review", "Signed Plans"],
  imaging: ["Gallery", "Required Images", "By Patient", "By Category", "Missing Images", "Upload Queue"],
  delivery: ["Active Treatment Queue", "Fractionation Log", "Today's Treatments", "Missed/Held", "Review Needed"],
  documents: ["All Documents", "By Patient", "Templates", "Pending Signature", "Generated", "Uploaded to eCW", "Missing"],
  billing: ["Billing Dashboard", "Course Billing", "Codes Master", "Missing Documentation", "Ready to Bill", "Completed"],
  audit: ["Audit Dashboard", "Ready for Audit", "Blocked Audits", "Missing Items", "Completed Audits", "QA Review"],
  analytics: ["Overview", "Workflow Performance", "Treatment Analytics", "Documentation", "Staff Workload", "Billing/Audit"],
  settings: ["General", "Users & Roles", "Locations", "Providers", "Workflow Templates", "Document Templates", "Forms", "Billing Codes", "Security"],
  security: ["All Logs", "Patient Access", "Document Events", "Signature Events", "File Events", "Admin Changes", "Suspicious Activity"]
};

export const fakePatients = ["Patient #P-10321", "Patient #P-10387", "Patient #P-10456", "Patient #P-10522", "Patient #P-10211"];

export const pageMetrics = {
  patients: [
    { label: "Total Active Courses", value: 48, detail: "Across registry", icon: UsersRound },
    { label: "Upcoming", value: 24, detail: "Filtered phase", icon: CalendarDays },
    { label: "On Treatment", value: 27, detail: "Active delivery", icon: Activity },
    { label: "Post-Tx", value: 41, detail: "Closeout workflows", icon: CheckCircle2 },
    { label: "Blocked", value: 6, detail: "Needs attention", tone: "orange", icon: AlertTriangle },
    { label: "Missing Follow-Up", value: 5, detail: "Post-care scheduling", tone: "amber", icon: Clock3 }
  ] satisfies Metric[],
  workflow: [
    { label: "Pending Steps", value: 18, detail: "Across active courses", icon: ClipboardList },
    { label: "Ready for Review", value: 9, detail: "Awaiting clinical check", icon: PenLine },
    { label: "Signed Today", value: 6, detail: "Completed approvals", icon: FileCheck2 },
    { label: "Blocked Courses", value: 3, detail: "Needs escalation", tone: "orange", icon: AlertTriangle },
    { label: "Overdue Steps", value: 7, detail: "Past target date", tone: "orange", icon: Clock3 }
  ] satisfies Metric[],
  tasks: [
    { label: "My Open Tasks", value: 12, detail: "Assigned to current role", icon: ListChecks },
    { label: "Due Today", value: 5, detail: "Needs action", icon: Clock3 },
    { label: "Overdue", value: 7, detail: "Escalate today", tone: "orange", icon: AlertTriangle },
    { label: "Signatures Needed", value: 16, detail: "Document review", icon: PenLine },
    { label: "Completed This Week", value: 28, detail: "Closed work", icon: CheckCircle2 }
  ] satisfies Metric[],
  schedule: [
    { label: "Appointments Today", value: 6, detail: "Across providers", icon: CalendarDays },
    { label: "Treatments Today", value: 18, detail: "Active fractions", icon: Activity },
    { label: "Unscheduled Tasks", value: 4, detail: "Need timing", tone: "amber", icon: Clock3 },
    { label: "Conflicts", value: 2, detail: "Review schedule", tone: "orange", icon: AlertTriangle }
  ] satisfies Metric[],
  forms: [
    { label: "Draft Forms", value: 8, detail: "Incomplete mapping", icon: NotebookTabs },
    { label: "Pending Review", value: 5, detail: "Provider queue", icon: PenLine },
    { label: "Signed This Week", value: 12, detail: "Completed forms", icon: CheckCircle2 },
    { label: "Missing Data", value: 4, detail: "Validation needed", tone: "orange", icon: FileWarning }
  ] satisfies Metric[],
  planning: [
    { label: "Plans in Draft", value: 7, detail: "Parameter entry", icon: Radiation },
    { label: "Physics Review", value: 5, detail: "Awaiting physicist", icon: ShieldCheck },
    { label: "Rad Onc Signature", value: 4, detail: "Ready to sign", icon: PenLine },
    { label: "Signed Plans", value: 18, detail: "Locked plans", icon: CheckCircle2 },
    { label: "Blocked Plans", value: 2, detail: "Missing inputs", tone: "orange", icon: AlertTriangle }
  ] satisfies Metric[],
  imaging: [
    { label: "Required Complete", value: "8/12", detail: "Protocol checklist", icon: Image },
    { label: "Missing Images", value: 4, detail: "Needed for audit", tone: "orange", icon: FileWarning },
    { label: "Uploaded Today", value: 9, detail: "New attachments", icon: FileCheck2 },
    { label: "Upload Queue", value: 3, detail: "Pending tagging", tone: "amber", icon: Clock3 }
  ] satisfies Metric[],
  delivery: [
    { label: "Treatments Today", value: 18, detail: "Scheduled fractions", icon: Activity },
    { label: "Completed Today", value: 11, detail: "Delivered fractions", icon: CheckCircle2 },
    { label: "Held / Missed", value: 2, detail: "Needs follow-up", tone: "orange", icon: AlertTriangle },
    { label: "Reviews Needed", value: 4, detail: "Physician queue", icon: PenLine },
    { label: "Weekly Physics Due", value: 3, detail: "Chart checks", tone: "amber", icon: ShieldCheck }
  ] satisfies Metric[],
  documents: [
    { label: "Pending Signatures", value: 16, detail: "Needs review", icon: PenLine },
    { label: "Draft Documents", value: 10, detail: "In progress", icon: FileText },
    { label: "Generated This Week", value: 31, detail: "New outputs", icon: FileCheck2 },
    { label: "Missing Required", value: 5, detail: "Audit blockers", tone: "orange", icon: FileWarning },
    { label: "Uploaded to eCW", value: 22, detail: "Tracked outputs", icon: CheckCircle2 }
  ] satisfies Metric[],
  billing: [
    { label: "Ready to Bill", value: 14, detail: "Documentation ready", icon: WalletCards },
    { label: "Missing Documentation", value: 6, detail: "Needs evidence", tone: "orange", icon: FileWarning },
    { label: "Pending Preauth", value: 5, detail: "Authorization work", tone: "amber", icon: Clock3 },
    { label: "Billed This Week", value: 21, detail: "Completed items", icon: CheckCircle2 },
    { label: "Audit Issues", value: 3, detail: "Billing blockers", tone: "orange", icon: AlertTriangle }
  ] satisfies Metric[],
  audit: [
    { label: "Ready for Audit", value: 9, detail: "Can close soon", icon: ShieldCheck },
    { label: "Blocked", value: 6, detail: "Needs remediation", tone: "orange", icon: AlertTriangle },
    { label: "Missing Signatures", value: 8, detail: "Provider queue", icon: PenLine },
    { label: "Missing Documents", value: 5, detail: "Evidence gaps", tone: "orange", icon: FileWarning },
    { label: "Closed This Month", value: 17, detail: "Finalized courses", icon: CheckCircle2 }
  ] satisfies Metric[],
  analytics: [
    { label: "Patient Volume", value: 92, detail: "Total in care", icon: UsersRound },
    { label: "Consult to Simulation", value: "4.2d", detail: "Average turnaround", icon: BarChart3 },
    { label: "Sim to Treatment", value: "3.1d", detail: "Average turnaround", icon: Activity },
    { label: "Treatment Completion", value: "91%", detail: "Course completion", icon: CheckCircle2 },
    { label: "Documentation", value: "84%", detail: "Completion rate", icon: FileCheck2 }
  ] satisfies Metric[],
  settings: [
    { label: "Config Areas", value: 11, detail: "Admin sections", icon: Settings },
    { label: "Active Templates", value: 9, detail: "Workflow/document", icon: FileText },
    { label: "Roles", value: 9, detail: "Access model", icon: ShieldCheck },
    { label: "Storage Status", value: "Stub", detail: "Drive pending", tone: "amber", icon: FileWarning }
  ] satisfies Metric[],
  security: [
    { label: "Events Today", value: 24, detail: "Audit trail", icon: ShieldCheck },
    { label: "Document Events", value: 9, detail: "Generated/opened/signed", icon: FileText },
    { label: "Signature Events", value: 6, detail: "Review activity", icon: PenLine },
    { label: "Admin Changes", value: 2, detail: "Settings edits", tone: "amber", icon: Settings }
  ] satisfies Metric[]
};

export const handJointRows = [
  "1st digit - IP",
  "1st digit - MTP",
  "1st digit - CMC",
  "2nd digit - DIP",
  "2nd digit - PIP",
  "2nd digit - MCP",
  "3rd digit - DIP",
  "3rd digit - PIP",
  "3rd digit - MCP",
  "4th digit - DIP",
  "4th digit - PIP",
  "4th digit - MCP",
  "5th digit - DIP",
  "5th digit - PIP",
  "5th digit - MCP"
];

export const settingsAreas = [
  "General Settings",
  "Users & Roles",
  "Locations",
  "Providers / Staff",
  "Workflow Templates",
  "Document Templates",
  "Clinical Form Templates",
  "Billing Code Master",
  "Dropdown Values",
  "Notification Rules",
  "File Storage",
  "Security Settings"
];
