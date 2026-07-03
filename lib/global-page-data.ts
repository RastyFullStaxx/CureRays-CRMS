import {
  carepathTasks,
  generatedDocuments,
  operationalAppointments,
  operationalPatients,
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
import type { CarepathWorkflowPhase, ResponsibleParty, TemplateSource, WorkflowItemStatus } from "@/lib/types";
import { roleMatrix } from "@/lib/rbac";
import { carepathPhaseLabels, responsiblePartyLabels } from "@/lib/workflow";
import { statusTone as sharedStatusTone, type StatusTone } from "@/lib/status-utils";
import { formatUiLabel } from "@/lib/ui-copy";

export function patientById(id: string) {
  return operationalPatients().find(
    (patient) => patient.id === id || patient.patientRef === id || patient.phiRecordId === id
  );
}

export function patientLabel(id: string) {
  const patient = patientById(id);
  return patient?.displayLabel ?? "Restricted patient";
}

export function patientMrn(id: string) {
  return patientById(id)?.patientRef ?? "PREF-PENDING";
}

export function courseLabel(id: string) {
  return id.replace("COURSE-", "C");
}

export function courseById(id: string) {
  return treatmentCourses.find((course) => course.id === id);
}

export function phaseLabel(phase: CarepathWorkflowPhase | string) {
  return carepathPhaseLabels[phase as CarepathWorkflowPhase] ?? formatUiLabel(phase);
}

export function statusLabel(status: string) {
  return formatUiLabel(status);
}

export function statusTone(status: string): StatusTone {
  return sharedStatusTone(status);
}

export const moduleSnapshot = {
  patients: operationalPatients(),
  treatmentCourses,
  courses: getCourses(),
  workflowSteps: getWorkflowSteps(),
  tasks: getTasks(),
  appointments: operationalAppointments(),
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

export const adminRoles = roleMatrix.map((role, index) => ({
  name: role.label,
  description: `${role.actions.length} prototype action grant(s); module access is shared with API role gates.`,
  users: [2, 5, 8, 4, 1, 5, 2, 2, 4][index] ?? 1,
  status: "Active",
  updated: "June 11, 2026"
}));

export const permissionRoles = roleMatrix.map((role) => role.label);
export const permissionRows = [
  { module: "Patient Management", description: "Tokenized registry plus guarded PHI actions", key: "patients" },
  { module: "Tasks", description: "Task queues and assignment workflow", key: "tasks" },
  { module: "Schedule", description: "Appointment calendar and treatment timing", key: "schedule" },
  { module: "Documents", description: "Document lifecycle and signature evidence", key: "documents" },
  { module: "Billing", description: "Billing readiness and evidence review", key: "billing" },
  { module: "Audit & QA", description: "Audit closeout and compliance review", key: "audit" },
  { module: "System Settings", description: "Security, templates, and configuration", key: "settings" }
].map((row) => ({
  module: row.module,
  description: row.description,
  levels: roleMatrix.map((role) => role.moduleAccess[row.key] ?? "none")
}));

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

export type TemplateTableRow = {
  id: string;
  name: string;
  type: string;
  diagnosis: string;
  workflowStep: string;
  fileType: string;
  status: string;
  registryStatus: string;
  updated: string;
  owner: string;
  sourcePath: string;
};

function templateText(template: TemplateSource) {
  return `${template.name} ${template.sourceFileName}`.toUpperCase();
}

function inferTemplateDiagnosis(template: TemplateSource) {
  const text = templateText(template);
  if (text.includes("UNIVERSAL")) return "Universal";
  if (text.includes("SKIN_CANCER") || text.includes("SKIN CANCER") || text.includes(".SKIN.")) return "Skin Cancer";
  if (text.includes("ARTHRITIS")) return "Arthritis";
  if (text.includes("DUPUYTREN")) return "Dupuytren's";
  if (text.includes("GYNECOMASTIA")) return "Gynecomastia";
  return "All";
}

function inferTemplateType(template: TemplateSource) {
  const text = templateText(template);
  if (text.includes("INTAKE")) return "Universal Intake";
  if (text.includes("AVS")) return "AVS / PCP Communication";
  if (text.includes("CAREPATH") || text.includes("PREAUTH")) return "Carepath / Preauth Audit";
  if (text.includes("JOINT_MAPPING") || text.includes("US_MAPPING") || text.includes("MAPPING")) return "Mapping / Simulation Prep";
  if (text.includes("SIM_CTP") || text.includes("SIMULATION")) return "Simulation / CTP Order";
  if (text.includes("PRESCRIPTION")) return "Prescription";
  if (text.includes("ISODOSE")) return "Isodose / Planning";
  if (text.includes("FRACTIONATION_LOG") || text.includes("FX LOG")) return "Fractionation Log";
  if (text.includes("API")) return "API Mapping Draft";
  if (template.mimeType === "PPTX") return "Treatment Planning Support";
  if (template.mimeType === "XLSX") return "Treatment Delivery Record";
  return "Document Template";
}

function inferWorkflowStep(template: TemplateSource) {
  const path = template.sourceFileName;
  const fileName = path.split("/").pop() ?? path;
  const match = fileName.match(/^(\d{2})[_\s.]/);
  if (match) return `Step ${match[1]}`;
  if (fileName.toUpperCase().includes("INTAKE")) return "Intake";
  if (fileName.toUpperCase().includes("AVS")) return "Post-treatment";
  if (path.includes("90_")) return "Revision / Draft";
  if (path.includes("99_")) return "Duplicate Review";
  return "Workflow Support";
}

function templateOwner(status: TemplateSource["status"]) {
  if (status === "ACTIVE") return "Clinical Operations";
  if (status === "DRAFT") return "QA Review";
  if (status === "RETIRED") return "Archive";
  return "Template Mapping";
}

export function normalizeTemplateRows(sources: TemplateSource[]): TemplateTableRow[] {
  return sources.map((template) => ({
    id: template.id,
    name: template.name,
    type: inferTemplateType(template),
    diagnosis: inferTemplateDiagnosis(template),
    workflowStep: inferWorkflowStep(template),
    fileType: template.mimeType,
    status: statusLabel(template.status),
    registryStatus: template.status,
    updated: template.modifiedAt ?? "Pending registry timestamp",
    owner: templateOwner(template.status),
    sourcePath: template.sourceFileName
  }));
}

export const templateRows = normalizeTemplateRows(templateSources);

export function countByStatus<T extends { status: string }>(items: T[], status: string) {
  return items.filter((item) => item.status === status).length;
}

export function countWorkflow(statuses: WorkflowItemStatus[]) {
  return getWorkflowSteps().filter((step) => statuses.includes(step.status)).length;
}

export function responsiblePartyName(party: ResponsibleParty | string) {
  return responsiblePartyLabels[party as ResponsibleParty] ?? party;
}
