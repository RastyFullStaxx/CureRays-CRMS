import type { CarepathWorkflowPhase, ResponsibleParty, WorkflowItemStatus } from "@/lib/types";

export type ClinicalFormRow = {
  id: string;
  name: string;
  description: string;
  diagnosis: string;
  phase: CarepathWorkflowPhase | "N/A";
  status: WorkflowItemStatus | "DRAFT";
  completion: number;
  lastUpdated: string;
  owner: string;
};

export type ClinicalNote = {
  id: string;
  title: string;
  category: "Clinical" | "Assessment" | "Procedure" | "Communication" | "Workflow" | "Intake" | "Administrative" | "Billing" | "Imaging" | "Audit" | "Task" | "System";
  author: string;
  role: string;
  timestamp: string;
  visibility: "Care Team" | "All Users" | "Billing";
  preview: string;
  related: string;
  source: "User-entered" | "System-generated";
  pinned?: boolean;
};

export type ImagingAssetRow = {
  id: string;
  title: string;
  description: string;
  modality: "Photo" | "Ultrasound" | "X-ray" | "Document";
  phase: CarepathWorkflowPhase | "Mapping";
  uploaded: string;
  uploadedBy: string;
  source: string;
  status: WorkflowItemStatus | "NEEDS_REVIEW";
};

export type ImagingGuidanceRow = {
  id: string;
  date: string;
  modality: string;
  energy: string;
  applicator: string;
  doi: string;
  coverage: string;
  reviewer: string;
  status: WorkflowItemStatus | "NEEDS_REVIEW";
};

export type BillingCodeRow = {
  id: string;
  family: string;
  code: string;
  code2025: string;
  code2026: string;
  description: string;
  frequency: string;
  planned: number;
  billed: number;
  document: string;
  status: WorkflowItemStatus | "NEEDS_REVIEW";
  notes: string;
};

export type DocumentActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
  status: WorkflowItemStatus;
};

export type AuditDetail = {
  id: string;
  title: string;
  steps: string[];
  evidence: string[];
  documents: string[];
  codes: string[];
  parties: ResponsibleParty[];
  history: string[];
};

export const clinicalForms: ClinicalFormRow[] = [
  {
    id: "CLIN-ARTH-MAP",
    name: "Hand Arthritis X-ray Mapping Note",
    description: "Joint mapping and KL grading",
    diagnosis: "Arthritis",
    phase: "CHART_PREP",
    status: "READY_FOR_REVIEW",
    completion: 85,
    lastUpdated: "Apr 26, 2026",
    owner: "Mika Alvarez"
  },
  {
    id: "CLIN-TX-PARAM",
    name: "IGSRT Treatment Parameters",
    description: "Energy, applicator and dose settings",
    diagnosis: "Skin Cancer",
    phase: "PLANNING",
    status: "SIGNED",
    completion: 100,
    lastUpdated: "Apr 25, 2026",
    owner: "Dr. Helena Cruz"
  },
  {
    id: "CLIN-MARGINS",
    name: "Lesion Mapping & Margins",
    description: "Ink, dermoscopy and margin mapping",
    diagnosis: "Skin Cancer",
    phase: "SIMULATION",
    status: "SIGNED",
    completion: 100,
    lastUpdated: "Apr 24, 2026",
    owner: "Mika Alvarez"
  },
  {
    id: "CLIN-ISO",
    name: "IGSRT Isodose Curve Worksheet",
    description: "Depth dose and coverage tables",
    diagnosis: "Skin Cancer",
    phase: "PLANNING",
    status: "DRAFT",
    completion: 40,
    lastUpdated: "Apr 22, 2026",
    owner: "Mika Alvarez"
  },
  {
    id: "CLIN-PHYS",
    name: "Special Physics Consult Note",
    description: "Physics consultation and review",
    diagnosis: "Skin Cancer",
    phase: "PLANNING",
    status: "SIGNED",
    completion: 100,
    lastUpdated: "Apr 20, 2026",
    owner: "Physicist"
  },
  {
    id: "CLIN-RX",
    name: "Orthovoltage Prescription",
    description: "Prescription and radiation parameters",
    diagnosis: "Skin Cancer",
    phase: "PLANNING",
    status: "SIGNED",
    completion: 100,
    lastUpdated: "Apr 18, 2026",
    owner: "Dr. Helena Cruz"
  },
  {
    id: "CLIN-INTAKE",
    name: "Clinical Intake Form",
    description: "History, allergies and intake data",
    diagnosis: "General",
    phase: "CONSULTATION",
    status: "DRAFT",
    completion: 60,
    lastUpdated: "Apr 16, 2026",
    owner: "Virtual Assistant"
  },
  {
    id: "CLIN-FOLLOW",
    name: "Follow-Up Assessment",
    description: "Post-treatment status assessment",
    diagnosis: "Skin Cancer",
    phase: "N/A",
    status: "NOT_STARTED",
    completion: 0,
    lastUpdated: "Not started",
    owner: "Care Team"
  }
];

export const clinicalNotes: ClinicalNote[] = [
  {
    id: "NOTE-1",
    title: "Weekly physics chart check",
    category: "Clinical",
    author: "Mika Alvarez",
    role: "Physicist",
    timestamp: "Apr 26, 2026 08:00 AM",
    visibility: "Care Team",
    preview: "Reviewed weekly physics chart for accuracy and completeness. No open exceptions noted.",
    related: "Weekly Physics Chart Check Note",
    source: "User-entered",
    pinned: true
  },
  {
    id: "NOTE-2",
    title: "Patient on-treatment evaluation",
    category: "Assessment",
    author: "Dr. Helena Cruz",
    role: "Physician",
    timestamp: "Apr 25, 2026 10:15 AM",
    visibility: "Care Team",
    preview: "Patient doing well. No adverse skin reactions. Continue current protocol.",
    related: "OTV / Treatment Management Notes",
    source: "User-entered",
    pinned: true
  },
  {
    id: "NOTE-3",
    title: "Simulation completed",
    category: "Procedure",
    author: "Iris Lim",
    role: "Medical Assistant",
    timestamp: "Apr 24, 2026 02:30 PM",
    visibility: "Care Team",
    preview: "Simulation performed with orthovoltage unit. Images saved and verified.",
    related: "Simulation Note",
    source: "User-entered"
  },
  {
    id: "NOTE-4",
    title: "Carepath task routed",
    category: "Workflow",
    author: "System",
    role: "Automated",
    timestamp: "Apr 24, 2026 08:48 AM",
    visibility: "All Users",
    preview: "Carepath task 'Weekly physics chart check' routed to Rad Oncology team.",
    related: "Task",
    source: "System-generated"
  },
  {
    id: "NOTE-5",
    title: "Patient communication",
    category: "Communication",
    author: "Rad Tech Team",
    role: "Staff",
    timestamp: "Apr 23, 2026 04:20 PM",
    visibility: "Care Team",
    preview: "Spoke with patient regarding upcoming schedule and expectations.",
    related: "Schedule",
    source: "User-entered"
  },
  {
    id: "NOTE-6",
    title: "Insurance verification",
    category: "Administrative",
    author: "Billing Team",
    role: "Staff",
    timestamp: "Apr 21, 2026 09:05 AM",
    visibility: "Billing",
    preview: "Insurance verified. Authorization pending. Follow up scheduled.",
    related: "Pre-auth",
    source: "User-entered"
  }
];

export const imagingRows: ImagingAssetRow[] = [
  {
    id: "IMG-HAND-XRAY",
    title: "Hand Arthritis X-ray Mapping",
    description: "Joint space evaluation and KL grading",
    modality: "X-ray",
    phase: "Mapping",
    uploaded: "Apr 25, 2026 10:24 AM",
    uploadedBy: "Mika Alvarez",
    source: "Mapping / Planning",
    status: "COMPLETED"
  },
  {
    id: "IMG-US-SIM",
    title: "US at Simulation (50 MHz)",
    description: "Dose of invasion baseline",
    modality: "Ultrasound",
    phase: "SIMULATION",
    uploaded: "Apr 24, 2026 09:15 AM",
    uploadedBy: "Iris Lim",
    source: "Simulation",
    status: "COMPLETED"
  },
  {
    id: "IMG-P1-MARGIN",
    title: "Lesion Inked - Phase I Margin",
    description: "Phase I treatment field margin",
    modality: "Photo",
    phase: "PLANNING",
    uploaded: "Apr 22, 2026 02:40 PM",
    uploadedBy: "Mika Alvarez",
    source: "Clinical Photo",
    status: "COMPLETED"
  },
  {
    id: "IMG-NOZZLE",
    title: "Shielded Nozzle View",
    description: "Nozzle configuration - frontal",
    modality: "Photo",
    phase: "PLANNING",
    uploaded: "Apr 21, 2026 11:05 AM",
    uploadedBy: "Noah Tan",
    source: "Device Photo",
    status: "SIGNED"
  },
  {
    id: "IMG-US-DAILY",
    title: "US Daily Image - Fx #12",
    description: "Treatment day ultrasound guidance",
    modality: "Ultrasound",
    phase: "ON_TREATMENT",
    uploaded: "Apr 25, 2026 08:50 AM",
    uploadedBy: "Mika Alvarez",
    source: "On Treatment",
    status: "READY_FOR_REVIEW"
  }
];

export const requiredImageAssets = [
  "Inked Target",
  "Shielded Nozzle View",
  "Side Nozzle View",
  "US image at Sim",
  "Lesion without ink",
  "Lesion inked at border",
  "Dermoscopy inked at border",
  "Lesion inked with Phase I margin",
  "Lesion inked with Phase II margin",
  "Lesion inked with all margins"
];

export const imagingGuidanceRows: ImagingGuidanceRow[] = [
  { id: "IG-12", date: "Apr 25, 2026", modality: "Ultrasound", energy: "50 kV", applicator: "2.5 cm", doi: "4 mm", coverage: "96%", reviewer: "Mika Alvarez", status: "COMPLETED" },
  { id: "IG-11", date: "Apr 24, 2026", modality: "Ultrasound", energy: "50 kV", applicator: "2.5 cm", doi: "4 mm", coverage: "95%", reviewer: "Iris Lim", status: "SIGNED" },
  { id: "IG-10", date: "Apr 23, 2026", modality: "Photo + US", energy: "50 kV", applicator: "2.5 cm", doi: "4 mm", coverage: "Review", reviewer: "Physicist", status: "READY_FOR_REVIEW" }
];

export const billingCodeRows: BillingCodeRow[] = [
  { id: "B-77436", family: "Simulation", code: "77436", code2025: "77436", code2026: "77436", description: "IGRT daily set-up", frequency: "Per treatment", planned: 20, billed: 12, document: "Image Guidance Order", status: "READY_FOR_REVIEW", notes: "Requires daily guidance documentation." },
  { id: "B-99213", family: "E/M", code: "99213", code2025: "99213", code2026: "99213", description: "Established patient visit", frequency: "As documented", planned: 2, billed: 1, document: "Consult / OTV Note", status: "SIGNED", notes: "MDM support present." },
  { id: "B-77334", family: "Device", code: "77334", code2025: "77334", code2026: "77334", description: "Complex treatment device", frequency: "Per device", planned: 1, billed: 1, document: "Construct Treatment Device Note", status: "SIGNED", notes: "Device note signed." },
  { id: "B-77370", family: "Physics", code: "77370", code2025: "77370", code2026: "77370", description: "Special physics consult", frequency: "Per consult", planned: 1, billed: 0, document: "Special Physics Consult Note", status: "READY_FOR_REVIEW", notes: "Physics signature complete; billing review pending." },
  { id: "B-77336", family: "Physics", code: "77336", code2025: "77336", code2026: "77336", description: "Weekly physics chart check", frequency: "Weekly", planned: 4, billed: 2, document: "Weekly Physics Chart Check Note", status: "READY_FOR_REVIEW", notes: "Next weekly check due." },
  { id: "B-77321", family: "Physics", code: "77321", code2025: "77321", code2026: "77321", description: "Special teletherapy port plan", frequency: "As planned", planned: 1, billed: 1, document: "Clinical Treatment Planning Note", status: "SIGNED", notes: "Plan evidence available." },
  { id: "B-77331", family: "Physics", code: "77331", code2025: "77331", code2026: "77331", description: "In-vivo dosimetry", frequency: "As ordered", planned: 1, billed: 0, document: "In-Vivo Dosimetry Note", status: "PENDING", notes: "Awaiting treatment-course evidence." },
  { id: "B-77263", family: "Planning", code: "77263", code2025: "77263", code2026: "77263", description: "Complex clinical treatment planning", frequency: "Per plan", planned: 1, billed: 1, document: "Clinical Treatment Planning Note", status: "SIGNED", notes: "Prescription and plan signed." },
  { id: "B-77300", family: "Planning", code: "77300", code2025: "77300", code2026: "77300", description: "Basic radiation dosimetry calculation", frequency: "Per calculation", planned: 2, billed: 1, document: "Isodose Curve Worksheet", status: "NEEDS_REVIEW", notes: "Isodose worksheet in draft." },
  { id: "B-77306", family: "Planning", code: "77306", code2025: "77306", code2026: "77306", description: "Simple isodose plan", frequency: "When applicable", planned: 1, billed: 0, document: "Treatment Planning Note", status: "NOT_APPLICABLE", notes: "N/A reason documented for this course." },
  { id: "B-77439", family: "IGRT", code: "77439", code2025: "77439", code2026: "77439", description: "IGRT ultrasound", frequency: "Per guidance", planned: 20, billed: 12, document: "Daily Image Guidance Log", status: "READY_FOR_REVIEW", notes: "Coverage review pending for latest image." },
  { id: "B-77437", family: "XRT", code: "77437", code2025: "77437", code2026: "77437", description: "Superficial radiation therapy", frequency: "Per fraction", planned: 20, billed: 12, document: "Fractionation Log", status: "SIGNED", notes: "Fractions 1-12 reconciled." },
  { id: "B-77438", family: "XRT", code: "77438", code2025: "77438", code2026: "77438", description: "Additional superficial therapy code", frequency: "When applicable", planned: 0, billed: 0, document: "N/A", status: "NOT_APPLICABLE", notes: "Reference row for code change review." },
  { id: "B-77427", family: "Management", code: "77427", code2025: "77427", code2026: "77427", description: "On-treatment management", frequency: "Every 5 fx", planned: 4, billed: 2, document: "OTV / Treatment Management Notes", status: "BLOCKED", notes: "Next OTV note missing signature." },
  { id: "B-77470", family: "Special treatment", code: "77470", code2025: "77470", code2026: "77470", description: "Special treatment procedure", frequency: "When documented", planned: 1, billed: 0, document: "Special Treatment Procedure", status: "PENDING", notes: "Requires Rad Onc review." }
];

export const documentActivities: DocumentActivity[] = [
  { id: "DA-1", title: "Document signed by Dr. Helena Cruz", detail: "Final Audit Sign-Off.pdf", time: "3:15 PM", status: "SIGNED" },
  { id: "DA-2", title: "New version uploaded by Mika Alvarez", detail: "IGSRT Isodose Curve Support.pdf (v1.2)", time: "10:24 AM", status: "UPLOADED" },
  { id: "DA-3", title: "Status changed to Ready for Review", detail: "OTV / Treatment Management Note.docx", time: "9:15 AM", status: "READY_FOR_REVIEW" },
  { id: "DA-4", title: "New document uploaded by Noah Tan", detail: "IGSRT Fraction Log.xlsx", time: "8:35 AM", status: "UPLOADED" }
];

export const auditDetails: AuditDetail[] = [
  {
    id: "AUDIT-DETAIL-1",
    title: "On-Treatment Management (q5 fx)",
    steps: ["Confirm OTV note exists for each 5-fraction interval", "Confirm Rad Onc signature", "Verify billing code 77427 support"],
    evidence: ["OTV note", "Fractionation log", "Signature timestamp"],
    documents: ["OTV / Treatment Management Notes", "Fractionation Log"],
    codes: ["77427"],
    parties: ["RAD_ONC", "RTT", "BILLING"],
    history: ["Apr 25: missing q5 fx note flagged", "Apr 26: routed to Rad Onc"]
  },
  {
    id: "AUDIT-DETAIL-2",
    title: "Billing Summary / Claim Review",
    steps: ["Reconcile billed quantities", "Match claim rows to signed documents", "Confirm final audit note remains editable until sign-off"],
    evidence: ["Billing code table", "Signed carepath documents", "Claim review note"],
    documents: ["Billing Summary", "Final Audit Sign-Off"],
    codes: ["77436", "77439", "77437"],
    parties: ["BILLING", "ADMIN", "RAD_ONC"],
    history: ["Apr 24: claim review started", "Apr 26: one mismatch remains"]
  }
];
