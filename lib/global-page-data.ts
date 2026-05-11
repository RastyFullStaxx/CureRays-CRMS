import {
  appointments,
  carepathTasks,
  generatedDocuments,
  patients,
  templateSources,
  treatmentCourses
} from "@/lib/clinical-store";
import {
  auditChecks,
  clinicalFormTemplates,
  getCourses,
  getDocumentInstances,
  getTasks,
  getTreatmentFractions,
  getTreatmentPlans,
  getWorkflowSteps,
  imagingAssets,
  imagingCategories
} from "@/lib/module-data";
import type { CarepathWorkflowPhase, ResponsibleParty, WorkflowItemStatus } from "@/lib/types";
import { carepathPhaseLabels, patientName, responsiblePartyLabels } from "@/lib/workflow";

export function patientById(id: string) {
  return patients.find((patient) => patient.id === id);
}

export function patientLabel(id: string) {
  const patient = patientById(id);
  return patient ? patientName(patient) : "Unassigned patient";
}

export function patientMrn(id: string) {
  return patientById(id)?.mrn ?? "MRN-PENDING";
}

export function courseLabel(id: string) {
  return id.replace("COURSE-", "C");
}

export function courseById(id: string) {
  return treatmentCourses.find((course) => course.id === id);
}

export function phaseLabel(phase: CarepathWorkflowPhase | string) {
  return carepathPhaseLabels[phase as CarepathWorkflowPhase] ?? phase.replaceAll("_", " ");
}

export function statusLabel(status: string) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function statusTone(status: string): "blue" | "green" | "orange" | "amber" | "purple" | "slate" | "red" {
  if (["COMPLETED", "SIGNED", "UPLOADED", "ACTIVE", "READY"].includes(status)) return "green";
  if (["BLOCKED", "OVERDUE", "MISSING_FIELDS"].includes(status)) return "red";
  if (["PENDING", "NEEDS_REVIEW"].includes(status)) return "orange";
  if (["READY_FOR_REVIEW", "IN_PROGRESS", "SCHEDULED"].includes(status)) return "blue";
  if (["NOT_APPLICABLE", "POST_TX"].includes(status)) return "purple";
  return "slate";
}

export const moduleSnapshot = {
  patients,
  treatmentCourses,
  courses: getCourses(),
  workflowSteps: getWorkflowSteps(),
  tasks: getTasks(),
  appointments,
  fractions: getTreatmentFractions(),
  documents: getDocumentInstances(),
  generatedDocuments,
  plans: getTreatmentPlans(),
  imagingAssets,
  imagingCategories,
  auditChecks,
  carepathTasks,
  templateSources,
  clinicalFormTemplates
};

export const workflowStepNames = [
  "Carepath Preauth",
  "Image Guidance Order",
  "Simulation Order",
  "Simulation Note",
  "Device Note",
  "Clinical Treatment Planning Note",
  "Physics Consult Note",
  "Orthovoltage Prescription",
  "Fractionation Log",
  "Special Treatment Procedure",
  "OTV Notes",
  "Weekly Physics Chart Check",
  "In-Vivo Dosimetry",
  "Treatment Summary",
  "Carepath Audit Sign"
];

export const adminUsers = [
  { name: "Dr. Sarah Johnson", email: "sarah.johnson@curerays.com", role: "Physician", location: "Grass Valley", status: "Active", lastLogin: "Today, 9:22 AM", mfa: "On" },
  { name: "Iris Lim, RTT", email: "iris.lim@curerays.com", role: "Radiation Therapist", location: "Grass Valley", status: "Active", lastLogin: "Today, 8:47 AM", mfa: "On" },
  { name: "Dr. Mateo Reyes", email: "mateo.reyes@curerays.com", role: "Physician", location: "Grass Valley", status: "Active", lastLogin: "Yesterday, 4:15 PM", mfa: "On" },
  { name: "John Smith, QA", email: "john.smith@curerays.com", role: "QA Specialist", location: "Grass Valley", status: "Active", lastLogin: "Yesterday, 2:31 PM", mfa: "On" },
  { name: "Amanda Lee, Billing", email: "amanda.lee@curerays.com", role: "Billing Specialist", location: "Grass Valley", status: "Active", lastLogin: "May 6, 10:02 AM", mfa: "On" },
  { name: "Tracy Chen", email: "tracy.chen@curerays.com", role: "Clinical Nurse", location: "Auburn", status: "Active", lastLogin: "May 6, 9:11 AM", mfa: "On" },
  { name: "Brian Wong", email: "brian.wong@curerays.com", role: "Medical Assistant", location: "Grass Valley", status: "Inactive", lastLogin: "Apr 30, 3:44 PM", mfa: "Off" },
  { name: "Kelly Alvarez", email: "kelly.alvarez@curerays.com", role: "Administrator", location: "Grass Valley", status: "Active", lastLogin: "Apr 30, 11:05 AM", mfa: "On" }
];

export const adminRoles = [
  { name: "Physician", description: "Reviews plans, signs clinical documents, and manages course decisions.", users: 5, status: "Active", updated: "May 6, 2026" },
  { name: "Radiation Therapist", description: "Runs treatments, uploads imaging, and completes fraction records.", users: 8, status: "Active", updated: "May 5, 2026" },
  { name: "Clinical Nurse", description: "Supports clinical documentation, follow-ups, and patient coordination.", users: 6, status: "Active", updated: "May 4, 2026" },
  { name: "Medical Assistant", description: "Completes simulation support, mapping forms, and intake tasks.", users: 5, status: "Active", updated: "May 4, 2026" },
  { name: "Billing Specialist", description: "Reviews billing readiness and eCW upload state.", users: 2, status: "Active", updated: "May 2, 2026" },
  { name: "QA Specialist", description: "Runs audit checks and manages compliance findings.", users: 2, status: "Active", updated: "Apr 30, 2026" },
  { name: "Data Analyst", description: "Views system analytics and exports operational reports.", users: 1, status: "Active", updated: "Apr 28, 2026" },
  { name: "Administrator", description: "Manages settings, roles, templates, and system controls.", users: 4, status: "Active", updated: "Apr 25, 2026" }
];

export const permissionRoles = ["Physician", "Radiation Therapist", "Clinical Nurse", "Medical Assistant", "Billing Specialist", "QA Specialist", "Administrator"];
export const permissionRows = [
  { module: "Patient Management", description: "Access patient demographic information and records", levels: ["full", "view", "view", "view", "none", "none", "full"] },
  { module: "Clinical Forms", description: "View, create, and edit clinical documentation", levels: ["full", "edit", "edit", "view", "none", "view", "full"] },
  { module: "Treatment Planning", description: "Create and manage treatment plans and parameters", levels: ["edit", "edit", "view", "na", "none", "view", "full"] },
  { module: "Imaging", description: "View and annotate imaging studies and reports", levels: ["view", "edit", "view", "na", "none", "edit", "full"] },
  { module: "Documents", description: "Upload, view, and manage documents and files", levels: ["edit", "view", "edit", "edit", "view", "edit", "full"] },
  { module: "Audit & QA", description: "Access audit logs and quality assurance tools", levels: ["view", "na", "view", "na", "na", "edit", "full"] },
  { module: "Analytics & Reports", description: "View system analytics and dashboards", levels: ["view", "view", "view", "none", "view", "view", "full"] },
  { module: "Templates", description: "Manage and use system templates", levels: ["edit", "view", "view", "view", "na", "view", "edit"] },
  { module: "System Settings", description: "Configure system settings and preferences", levels: ["none", "none", "none", "none", "none", "none", "full"] }
];

export const clinicalDocumentRows = getDocumentInstances().slice(0, 6).map((document, index) => ({
  ...document,
  formType: index % 2 === 0 ? "Mapping / Assessment" : "Carepath / Audit",
  phase: phaseLabel(document.category),
  assignedStaff: generatedDocuments.find((item) => item.id === document.id)?.assignedTo ?? "Clinical Team"
}));

export const settingsCategories = [
  { title: "General Settings", description: "Configure clinic information, branding, language, time zone, and business hours.", summary: "Clinic: CureRays Radiation Medicine" },
  { title: "User & Access Settings", description: "Manage user access, roles, authentication, and session policies.", summary: "MFA: Enforced" },
  { title: "Workflow Automation", description: "Set rules for automated tasks, status updates, reminders, and notifications.", summary: "12 automation rules" },
  { title: "Clinical Defaults", description: "Manage default clinical settings, templates, and treatment configurations.", summary: "Default workflow: Skin Cancer" },
  { title: "Document & Template Settings", description: "Manage document templates, naming conventions, and export settings.", summary: "24 templates" },
  { title: "Notification Settings", description: "Configure email, in-app alerts, reminders, and escalation preferences.", summary: "Escalation after 48 hours" },
  { title: "Security & Compliance", description: "HIPAA compliance, audit logs, data retention, and security controls.", summary: "Audit retention: 7 years" },
  { title: "Integration Settings", description: "Configure third-party integrations and external system connections.", summary: "3 integrations connected" }
];

export const templateRows = [
  ...templateSources.map((template, index) => ({
    name: template.name,
    type: template.mimeType === "PPTX" ? "Clinical Reference" : template.mimeType === "XLSX" ? "Workflow Templates" : "Document Templates",
    diagnosis: index % 3 === 0 ? "Skin Cancer" : index % 3 === 1 ? "Arthritis" : "All",
    version: index % 2 === 0 ? "v2.0" : "v1.3",
    status: template.status === "ACTIVE" ? "Active" : template.status === "DRAFT" ? "Draft" : "Needs Review",
    updated: template.modifiedAt ?? "May 6, 2026",
    owner: index % 2 === 0 ? "Dr. Sarah Johnson" : "QA Team"
  })),
  { name: "Hand Arthritis Mapping", type: "Clinical Forms", diagnosis: "Arthritis", version: "v1.1", status: "Active", updated: "Apr 28, 2026", owner: "Iris Lim, RTT" },
  { name: "IGSRT Isodose Planning", type: "IGSRT Planning", diagnosis: "Skin Cancer", version: "v1.3", status: "Active", updated: "Apr 30, 2026", owner: "Dr. Mateo Reyes" }
];

export function countByStatus<T extends { status: string }>(items: T[], status: string) {
  return items.filter((item) => item.status === status).length;
}

export function countWorkflow(statuses: WorkflowItemStatus[]) {
  return getWorkflowSteps().filter((step) => statuses.includes(step.status)).length;
}

export function responsiblePartyName(party: ResponsibleParty | string) {
  return responsiblePartyLabels[party as ResponsibleParty] ?? party;
}
