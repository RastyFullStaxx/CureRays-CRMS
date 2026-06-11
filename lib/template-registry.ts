import type {
  CarepathTask,
  DocumentRequirement,
  DocumentTemplate,
  GeneratedDocument,
  InternalFormTemplate,
  Patient,
  TemplateSource,
  TreatmentCourse,
  WorkflowDefinition,
  WorkflowDocumentState
} from "@/lib/types";
import { completedDocumentStatuses, orderedCarepathPhases } from "@/lib/workflow";

export const templateSources: TemplateSource[] = [
  {
    id: "SRC-INTAKE",
    name: "Universal Intake Form",
    sourceFileName: "docs/2026_TEMPLATES/00_UNIVERSAL/Intake_Form.Universal.08APR2025.Template.docx",
    driveFileId: "1-lEfDuDmGyndX2zXDbtcyZoYRJXBEcnq",
    driveUrl: "https://docs.google.com/document/d/1-lEfDuDmGyndX2zXDbtcyZoYRJXBEcnq/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Universal starting document. Field mapping is intentionally incomplete in V2.",
    modifiedAt: "2026-04-29T02:01:08.000Z"
  },
  {
    id: "SRC-AVS-PCP",
    name: "Universal AVS PCP Template",
    sourceFileName: "docs/2026_TEMPLATES/00_UNIVERSAL/AVS_PCP.Universal.Template.docx",
    driveFileId: "1TxQzo7u2LAJ-VxDMlYU-3Nzxcr1qtXJf",
    driveUrl: "https://docs.google.com/document/d/1TxQzo7u2LAJ-VxDMlYU-3Nzxcr1qtXJf/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Universal post-visit communication document. V2 tracks status before automating output.",
    modifiedAt: "2026-04-29T02:01:40.000Z"
  },
  {
    id: "SRC-SKIN-CAREPATH-PREAUTH-20",
    name: "Skin Cancer Carepath PreAuth Audit - 20fx",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/00_CAREPATH_PREAUTH_AUDIT/00_Carepath_PreAuth_Audit.SKIN_CANCER.IGSRT.20fx.LesionNumber.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1bTY3iGIw367tB5NgmbAwPplv3OUChA7L",
    driveUrl: "https://docs.google.com/document/d/1bTY3iGIw367tB5NgmbAwPplv3OUChA7L/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Billing pre-auth and audit mapping are not final."
  },
  {
    id: "SRC-SKIN-CAREPATH-PREAUTH-30",
    name: "Skin Cancer Carepath PreAuth Audit - 30fx",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/00_CAREPATH_PREAUTH_AUDIT/00_Carepath_PreAuth_Audit.SKIN_CANCER.IGSRT.30fx.LesionNumber.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "30 fraction pre-auth/audit variant retained separately from the 20fx workflow source."
  },
  {
    id: "SRC-SKIN-IGSRT-SIM",
    name: "Skin Cancer IGSRT Simulation Order",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/02_SIMULATION_AND_CTP_ORDER/02_SIM_CTP_IGSRT_Order.SKIN_CANCER.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX",
    driveUrl: "https://docs.google.com/document/d/1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX/edit",
    mimeType: "DOCX",
    status: "ACTIVE",
    modifiedAt: "2026-04-22T10:47:28.000Z"
  },
  {
    id: "SRC-SKIN-IGSRT-RX",
    name: "Skin Cancer IGSRT Prescription",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/07_PRESCRIPTION/07_Prescription.SKIN_CANCER.SCC_BCC.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi",
    driveUrl: "https://docs.google.com/document/d/1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi/edit",
    mimeType: "DOCX",
    status: "ACTIVE",
    modifiedAt: "2026-04-06T16:17:34.000Z"
  },
  {
    id: "SRC-SKIN-IGSRT-FXLOG",
    name: "Skin Cancer IGSRT Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/12_FRACTIONATION_LOG/12_Fractionation_Log.SKIN_CANCER.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    driveFileId: "1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ",
    driveUrl: "https://docs.google.com/spreadsheets/d/1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ/edit",
    mimeType: "XLSX",
    status: "ACTIVE",
    modifiedAt: "2026-04-22T10:53:16.000Z"
  },
  {
    id: "SRC-SKIN-IGSRT-ISO",
    name: "Skin Cancer IGSRT Isodose Curves",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/09_ISODOSE_CURVES/09_Isodose_Curves.SKIN_CANCER.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.pptx",
    driveFileId: "17wIN9r2QXhZ6o-dIM1FGgXf-CQNXE3jn",
    driveUrl: "https://docs.google.com/presentation/d/17wIN9r2QXhZ6o-dIM1FGgXf-CQNXE3jn/edit",
    mimeType: "PPTX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Tracked as registry metadata until output rules are mapped."
  },
  {
    id: "SRC-SKIN-API-RX",
    name: "Skin Cancer IGSRT Prescription API Mapping Draft",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/90_API_IN_PROCESS/API_07_Prescription.SKIN_CANCER.SCC_BCC.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "API in-process file; not used as the production prescription source."
  },
  {
    id: "SRC-ARTHRITIS-HAND-MAP",
    name: "Arthritis Hand Joint Mapping",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/HAND/01_Joint_Mapping.ARTHRITIS.HAND.LATERALITY.MMDDYY.LastName.FirstName.docx",
    driveFileId: "13qRFW6VF8fJCuUW4O7qSHX3WtjDCQ7ta",
    driveUrl: "https://docs.google.com/document/d/13qRFW6VF8fJCuUW4O7qSHX3WtjDCQ7ta/edit",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Production source retained as mapping-in-progress until structured field generation is complete."
  },
  {
    id: "SRC-ARTHRITIS-HAND-SIM",
    name: "Arthritis Hand SIM CTP IGRT",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/HAND/02_SIM_CTP_IGRT.ARTHRITIS.HAND.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-HAND-RX",
    name: "Arthritis Hand Prescription",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/HAND/07_Prescription.ARTHRITIS.HAND.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-HAND-FXLOG",
    name: "Arthritis Hand Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/HAND/12_Fractionation_Log.ARTHRITIS.HAND.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-FOOT-MAP",
    name: "Arthritis Foot Joint Mapping",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/FOOT/01_Joint_Mapping.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Production source retained as mapping-in-progress until structured field generation is complete."
  },
  {
    id: "SRC-ARTHRITIS-FOOT-SIM",
    name: "Arthritis Foot SIM CTP IGRT",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/FOOT/02_SIM_CTP_IGRT.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-FOOT-RX",
    name: "Arthritis Foot Prescription",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/FOOT/07_Prescription.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-FOOT-FXLOG",
    name: "Arthritis Foot Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/FOOT/12_Fractionation_Log.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-KNEE-SIM",
    name: "Arthritis Knee SIM CTP IGRT",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/KNEE/02_SIM_CTP_IGRT.ARTHRITIS.KNEE.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-KNEE-RX",
    name: "Arthritis Knee Prescription",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/KNEE/07_Prescription.ARTHRITIS.KNEE.LATERALITY.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1mV6QHLk8blVk31zxDhQMXXJFDljJSJl9",
    driveUrl: "https://docs.google.com/document/d/1mV6QHLk8blVk31zxDhQMXXJFDljJSJl9/edit",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-ARTHRITIS-KNEE-FXLOG",
    name: "Arthritis Knee Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/02_ARTHRITIS/KNEE/12_Fractionation_Log.ARTHRITIS.KNEE.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "ACTIVE"
  },
  {
    id: "SRC-DUPUYTRENS-SIM",
    name: "Dupuytren's SIM CTP IGRT",
    sourceFileName:
      "docs/2026_TEMPLATES/03_DUPUYTRENS/02_SIMULATION_AND_CTP_ORDER/02_SIM_CTP_IGRT.DUPUYTRENS.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    driveFileId: "1R2FClgrgied8AUX1SrEv1T2sykF_2XUx",
    driveUrl: "https://docs.google.com/document/d/1R2FClgrgied8AUX1SrEv1T2sykF_2XUx/edit",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-DUPUYTRENS-RX",
    name: "Dupuytren's Prescription",
    sourceFileName:
      "docs/2026_TEMPLATES/03_DUPUYTRENS/07_PRESCRIPTION/07_Prescription.DUPUYTRENS.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-DUPUYTRENS-FXLOG",
    name: "Dupuytren's Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/03_DUPUYTRENS/12_FRACTIONATION_LOG/12_Fractionation_Log.DUPUYTRENS.HAND.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "ACTIVE"
  },
  {
    id: "SRC-DUPUYTRENS-US-MAP",
    name: "Dupuytren's US Mapping",
    sourceFileName:
      "docs/2026_TEMPLATES/03_DUPUYTRENS/US_MAPPING/01_US_Mapping.DUPUYTRENS.HAND.LATERALITY.DDMMYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "ACTIVE"
  },
  {
    id: "SRC-DUPUYTRENS-ISO",
    name: "Dupuytren's Isodose Curves",
    sourceFileName:
      "docs/2026_TEMPLATES/03_DUPUYTRENS/09_ISODOSE_CURVES/09_Isodose_Curves.DUPUYTRENS.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.pptx",
    mimeType: "PPTX",
    status: "MAPPING_IN_PROGRESS",
    notes: "Planning support source tracked until isodose generation rules are mapped."
  },
  {
    id: "SRC-DRAFT-ARTHRITIS-SITE-FXLOG",
    name: "Draft Arthritis Site Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/90_ON_GOING_REVISION/Draft_12_Fractionation_Log.ARTHRITIS.SITE.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "DRAFT",
    notes: "On-going revision file; excluded from active workflow requirements."
  },
  {
    id: "SRC-DRAFT-COPY-ARTHRITIS-SITE-FXLOG",
    name: "Draft Copy Arthritis Site Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/90_ON_GOING_REVISION/Draft_Copy_12_Fractionation_Log.ARTHRITIS.SITE.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "DRAFT",
    notes: "Copy retained for revision traceability."
  },
  {
    id: "SRC-DRAFT-COPY-ARTHRITIS-REGION-FXLOG",
    name: "Draft Copy Arthritis Anatomic Region Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/90_ON_GOING_REVISION/Draft_Copy_12_Fractionation_Log.ARTHRITIS.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "DRAFT",
    notes: "Generic anatomic-region draft retained for revision traceability."
  },
  {
    id: "SRC-DRAFT-COPY-GYNECOMASTIA-FXLOG",
    name: "Draft Copy Gynecomastia Fraction Log",
    sourceFileName:
      "docs/2026_TEMPLATES/90_ON_GOING_REVISION/Draft_Copy_12_Fractionation_Log.GYNECOMASTIA.BREAST.LATERALITY.DDMMYYYY.LastName.FirstName.xlsx",
    mimeType: "XLSX",
    status: "DRAFT",
    notes: "Possible future protocol; no active CureRays workflow coverage yet."
  },
  {
    id: "SRC-DUPLICATE-ARTHRITIS-HAND-MAP",
    name: "Duplicate Review Arthritis Hand Joint Mapping",
    sourceFileName:
      "docs/2026_TEMPLATES/99_DUPLICATE_REVIEW/Duplicate_01_Joint_Mapping.ARTHRITIS.HAND.LATERALITY.MMDDYY.LastName.FirstName.docx",
    mimeType: "DOCX",
    status: "DRAFT",
    notes: "Root-level duplicate candidate; kept out of active mapping until manual/hash review confirms replacement."
  },
  {
    id: "SRC-BILLING-PREAUTH-MISSING",
    name: "Billing Pre-Authorization Mapping",
    sourceFileName: "Billing pre-auth template mapping pending",
    mimeType: "UNKNOWN",
    status: "MISSING",
    notes: "Placeholder so missing billing pre-auth work remains visible without hardcoding final rules."
  }
];

export const documentRequirements: DocumentRequirement[] = [
  {
    id: "REQ-INTAKE",
    name: "Intake Form",
    workflowPhase: "CONSULTATION",
    responsibleParty: "VA",
    applicability: {
      diagnosis: "ALL",
      universal: true,
      requiredWhen: "Required at the start of every patient workflow."
    },
    templateSourceId: "SRC-INTAKE",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete intake packet and confirm required demographics/workflow fields",
    requiredFields: ["patient identifiers", "diagnosis", "contact details", "initial workflow needs"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete intake packet",
    taskNumber: "V2-01",
    timing: "Before chart prep",
    auditSteps: ["Intake complete", "Required fields reviewed"]
  },
  {
    id: "REQ-AVS-PCP",
    name: "AVS PCP Template",
    workflowPhase: "POST_TX",
    responsibleParty: "PCP",
    applicability: {
      diagnosis: "ALL",
      universal: true,
      requiredWhen: "Required when after-visit or PCP communication is part of closure."
    },
    templateSourceId: "SRC-AVS-PCP",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Prepare AVS/PCP communication when discharge or closure details are ready",
    requiredFields: ["visit summary", "follow-up plan", "PCP communication details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Prepare AVS / PCP communication",
    taskNumber: "V2-02",
    timing: "At post-treatment or visit closure",
    auditSteps: ["AVS reviewed", "Communication status confirmed"]
  },
  {
    id: "REQ-SKIN-PREAUTH-20FX",
    name: "Carepath PreAuth Audit - 20fx",
    workflowPhase: "CONSULTATION",
    responsibleParty: "ADMIN",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Use for 20 fraction IGSRT courses when payer authorization and audit evidence are required."
    },
    templateSourceId: "SRC-SKIN-CAREPATH-PREAUTH-20",
    defaultStatus: "MISSING_FIELDS",
    requiredAction: "Map billing pre-auth requirements before treating this as fully automated",
    requiredFields: ["diagnosis", "authorization outcome", "payer requirements"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "N/A",
    createsTask: false,
    autoCreate: false
  },
  {
    id: "REQ-SKIN-PREAUTH-30FX",
    name: "Carepath PreAuth Audit - 30fx",
    workflowPhase: "CONSULTATION",
    responsibleParty: "ADMIN",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Use for 30 fraction IGSRT courses when payer authorization and audit evidence are required."
    },
    templateSourceId: "SRC-SKIN-CAREPATH-PREAUTH-30",
    defaultStatus: "MISSING_FIELDS",
    requiredAction: "Map 30fx billing pre-auth requirements before treating this as fully automated",
    requiredFields: ["diagnosis", "authorization outcome", "payer requirements", "fraction count"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "N/A",
    createsTask: false,
    autoCreate: false
  },
  {
    id: "REQ-SKIN-IGSRT-SIM",
    name: "CTP / SIM IGSRT Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Before first treatment."
    },
    templateSourceId: "SRC-SKIN-IGSRT-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete simulation order and route for Rad Onc signature",
    requiredFields: ["lesion location", "margin instruction", "setup photos", "physics requirements"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77280",
    createsTask: true,
    taskTitle: "Complete simulation order",
    taskNumber: "IGSRT-01",
    timing: "Before first treatment",
    auditSteps: ["Simulation order complete", "Rad Onc signature"]
  },
  {
    id: "REQ-SKIN-IGSRT-RX",
    name: "IGSRT Prescription",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Before treatment continuation."
    },
    templateSourceId: "SRC-SKIN-IGSRT-RX",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Verify prescription parameters and route for signature",
    requiredFields: ["site", "laterality", "phase dose", "energy", "SSD", "DOT"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77300",
    createsTask: true,
    taskTitle: "Review prescription parameters",
    taskNumber: "IGSRT-02",
    timing: "Before treatment continuation",
    auditSteps: ["Prescription review", "Rad Onc signature"]
  },
  {
    id: "REQ-SKIN-IGSRT-FXLOG",
    name: "IGSRT Fraction Log",
    workflowPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "Daily during treatment."
    },
    templateSourceId: "SRC-SKIN-IGSRT-FXLOG",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Maintain treatment entries and reconcile approvals",
    requiredFields: ["fraction", "date", "dose", "DOT", "isodose", "MD approval", "DOT approval"],
    outputFormats: ["XLSX", "PDF"],
    cptCode: "77439",
    createsTask: true,
    taskTitle: "Reconcile fraction log approvals",
    taskNumber: "IGSRT-03",
    timing: "Daily during treatment",
    auditSteps: ["Daily treatment log", "MD approval", "DOT approval"]
  },
  {
    id: "REQ-SKIN-IGSRT-ISO",
    name: "IGSRT Isodose Curve Support",
    workflowPhase: "PLANNING",
    responsibleParty: "PHYSICIST",
    applicability: {
      diagnosis: "SKIN_CANCER",
      protocol: "IGSRT",
      requiredWhen: "When isodose support is needed for treatment planning."
    },
    templateSourceId: "SRC-SKIN-IGSRT-ISO",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Confirm isodose support requirements and mapping status",
    requiredFields: ["energy", "applicator", "depth of target", "isodose percentage"],
    outputFormats: ["PPTX", "PDF"],
    cptCode: "77300",
    createsTask: false
  },
  {
    id: "REQ-ARTHRITIS-HAND-MAPPING",
    name: "Arthritis Hand Joint Mapping",
    workflowPhase: "CHART_PREP",
    responsibleParty: "MA",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "HAND",
      requiredWhen: "Before simulation or planning review."
    },
    templateSourceId: "SRC-ARTHRITIS-HAND-MAP",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Capture joint scores and field design decision",
    requiredFields: ["joint space narrowing", "osteophyte", "sclerosis", "overall grade"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Joint mapping assessment",
    taskNumber: "ARTH-01",
    timing: "Before simulation",
    auditSteps: ["Mapping fields complete", "Provider review"]
  },
  {
    id: "REQ-ARTHRITIS-FOOT-MAPPING",
    name: "Arthritis Foot Joint Mapping",
    workflowPhase: "CHART_PREP",
    responsibleParty: "MA",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "FOOT",
      requiredWhen: "Before simulation or planning review."
    },
    templateSourceId: "SRC-ARTHRITIS-FOOT-MAP",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Capture joint scores and field design decision",
    requiredFields: ["joint space narrowing", "osteophyte", "sclerosis", "overall grade"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Foot joint mapping assessment",
    taskNumber: "ARTH-FOOT-01",
    timing: "Before simulation",
    auditSteps: ["Mapping fields complete", "Provider review"]
  },
  {
    id: "REQ-ARTHRITIS-HAND-SIM",
    name: "Arthritis Hand SIM / CTP / IGRT Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "HAND",
      requiredWhen: "Before treatment planning."
    },
    templateSourceId: "SRC-ARTHRITIS-HAND-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete hand simulation order and route for Rad Onc signature",
    requiredFields: ["joint site", "laterality", "field design", "setup details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete hand simulation order",
    taskNumber: "ARTH-HAND-02",
    timing: "Before first treatment",
    auditSteps: ["Simulation order complete", "Rad Onc signature"]
  },
  {
    id: "REQ-ARTHRITIS-FOOT-SIM",
    name: "Arthritis Foot SIM / CTP / IGRT Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "FOOT",
      requiredWhen: "Before treatment planning."
    },
    templateSourceId: "SRC-ARTHRITIS-FOOT-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete foot simulation order and route for Rad Onc signature",
    requiredFields: ["joint site", "laterality", "field design", "setup details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete foot simulation order",
    taskNumber: "ARTH-FOOT-02",
    timing: "Before first treatment",
    auditSteps: ["Simulation order complete", "Rad Onc signature"]
  },
  {
    id: "REQ-ARTHRITIS-KNEE-SIM",
    name: "Arthritis Knee SIM / CTP / IGRT Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "KNEE",
      requiredWhen: "Before treatment planning."
    },
    templateSourceId: "SRC-ARTHRITIS-KNEE-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Complete knee simulation order and route for Rad Onc signature",
    requiredFields: ["joint site", "laterality", "field design", "setup details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete knee simulation order",
    taskNumber: "ARTH-KNEE-02",
    timing: "Before first treatment",
    auditSteps: ["Simulation order complete", "Rad Onc signature"]
  },
  {
    id: "REQ-ARTHRITIS-HAND-RX",
    name: "Arthritis Hand Prescription",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "HAND",
      requiredWhen: "Before treatment continuation."
    },
    templateSourceId: "SRC-ARTHRITIS-HAND-RX",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Verify hand prescription parameters and route for signature",
    requiredFields: ["joint site", "laterality", "dose", "energy", "applicator"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77300",
    createsTask: true,
    taskTitle: "Review hand prescription",
    taskNumber: "ARTH-HAND-03",
    timing: "Before treatment continuation",
    auditSteps: ["Prescription review", "Rad Onc signature"]
  },
  {
    id: "REQ-ARTHRITIS-FOOT-RX",
    name: "Arthritis Foot Prescription",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "FOOT",
      requiredWhen: "Before treatment continuation."
    },
    templateSourceId: "SRC-ARTHRITIS-FOOT-RX",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Verify foot prescription parameters and route for signature",
    requiredFields: ["joint site", "laterality", "dose", "energy", "applicator"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77300",
    createsTask: true,
    taskTitle: "Review foot prescription",
    taskNumber: "ARTH-FOOT-03",
    timing: "Before treatment continuation",
    auditSteps: ["Prescription review", "Rad Onc signature"]
  },
  {
    id: "REQ-ARTHRITIS-KNEE-RX",
    name: "Arthritis Knee Prescription",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "KNEE",
      requiredWhen: "Before treatment continuation."
    },
    templateSourceId: "SRC-ARTHRITIS-KNEE-RX",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Verify knee prescription parameters and route for signature",
    requiredFields: ["joint site", "laterality", "dose", "energy", "applicator"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77300",
    createsTask: true,
    taskTitle: "Review knee prescription",
    taskNumber: "ARTH-KNEE-03",
    timing: "Before treatment continuation",
    auditSteps: ["Prescription review", "Rad Onc signature"]
  },
  {
    id: "REQ-ARTHRITIS-HAND-FXLOG",
    name: "Arthritis Hand Fraction Log",
    workflowPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "HAND",
      requiredWhen: "Daily during treatment."
    },
    templateSourceId: "SRC-ARTHRITIS-HAND-FXLOG",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Maintain hand treatment entries and reconcile approvals",
    requiredFields: ["fraction", "date", "dose", "joint site", "therapist", "approval"],
    outputFormats: ["XLSX", "PDF"],
    createsTask: true,
    taskTitle: "Reconcile hand fraction log",
    taskNumber: "ARTH-HAND-04",
    timing: "Daily during treatment",
    auditSteps: ["Daily treatment log", "Treatment approval"]
  },
  {
    id: "REQ-ARTHRITIS-FOOT-FXLOG",
    name: "Arthritis Foot Fraction Log",
    workflowPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "FOOT",
      requiredWhen: "Daily during treatment."
    },
    templateSourceId: "SRC-ARTHRITIS-FOOT-FXLOG",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Maintain foot treatment entries and reconcile approvals",
    requiredFields: ["fraction", "date", "dose", "joint site", "therapist", "approval"],
    outputFormats: ["XLSX", "PDF"],
    createsTask: true,
    taskTitle: "Reconcile foot fraction log",
    taskNumber: "ARTH-FOOT-04",
    timing: "Daily during treatment",
    auditSteps: ["Daily treatment log", "Treatment approval"]
  },
  {
    id: "REQ-ARTHRITIS-KNEE-FXLOG",
    name: "Arthritis Knee Fraction Log",
    workflowPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    applicability: {
      diagnosis: "ARTHRITIS",
      protocol: "Joint",
      bodyRegion: "KNEE",
      requiredWhen: "Daily during treatment."
    },
    templateSourceId: "SRC-ARTHRITIS-KNEE-FXLOG",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Maintain knee treatment entries and reconcile approvals",
    requiredFields: ["fraction", "date", "dose", "joint site", "therapist", "approval"],
    outputFormats: ["XLSX", "PDF"],
    createsTask: true,
    taskTitle: "Reconcile knee fraction log",
    taskNumber: "ARTH-KNEE-04",
    timing: "Daily during treatment",
    auditSteps: ["Daily treatment log", "Treatment approval"]
  },
  {
    id: "REQ-DUPUYTRENS-SIM",
    name: "Dupuytren's Simulation Order",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "DUPUYTRENS",
      protocol: "Dupuytren's",
      requiredWhen: "Before treatment planning."
    },
    templateSourceId: "SRC-DUPUYTRENS-SIM",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Map Dupuytren's simulation fields before automation",
    requiredFields: ["location", "laterality", "field design", "setup details"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete Dupuytren's simulation order",
    taskNumber: "DUP-01",
    timing: "Before first treatment",
    auditSteps: ["Simulation order complete", "Rad Onc signature"]
  },
  {
    id: "REQ-DUPUYTRENS-US-MAPPING",
    name: "Dupuytren's US Mapping",
    workflowPhase: "CHART_PREP",
    responsibleParty: "MA",
    applicability: {
      diagnosis: "DUPUYTRENS",
      protocol: "Dupuytren's",
      bodyRegion: "HAND",
      requiredWhen: "Before planning field definition."
    },
    templateSourceId: "SRC-DUPUYTRENS-US-MAP",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Capture US mapping and route for provider planning review",
    requiredFields: ["hand site", "laterality", "cord/nodule mapping", "field limits"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: true,
    taskTitle: "Complete Dupuytren's US mapping",
    taskNumber: "DUP-02",
    timing: "Before simulation",
    auditSteps: ["US mapping complete", "Provider review"]
  },
  {
    id: "REQ-DUPUYTRENS-RX",
    name: "Dupuytren's Prescription",
    workflowPhase: "PLANNING",
    responsibleParty: "RAD_ONC",
    applicability: {
      diagnosis: "DUPUYTRENS",
      protocol: "Dupuytren's",
      requiredWhen: "Before treatment continuation."
    },
    templateSourceId: "SRC-DUPUYTRENS-RX",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Verify prescription parameters and route for signature",
    requiredFields: ["location", "laterality", "dose", "energy", "applicator"],
    outputFormats: ["DOCX", "PDF"],
    cptCode: "77300",
    createsTask: true,
    taskTitle: "Review Dupuytren's prescription",
    taskNumber: "DUP-03",
    timing: "Before treatment continuation",
    auditSteps: ["Prescription review", "Rad Onc signature"]
  },
  {
    id: "REQ-DUPUYTRENS-FXLOG",
    name: "Dupuytren's Fraction Log",
    workflowPhase: "ON_TREATMENT",
    responsibleParty: "RTT",
    applicability: {
      diagnosis: "DUPUYTRENS",
      protocol: "Dupuytren's",
      requiredWhen: "Daily during treatment."
    },
    templateSourceId: "SRC-DUPUYTRENS-FXLOG",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Maintain treatment entries and reconcile approvals",
    requiredFields: ["fraction", "date", "dose", "hand site", "therapist", "approval"],
    outputFormats: ["XLSX", "PDF"],
    createsTask: true,
    taskTitle: "Reconcile Dupuytren's fraction log",
    taskNumber: "DUP-04",
    timing: "Daily during treatment",
    auditSteps: ["Daily treatment log", "Treatment approval"]
  },
  {
    id: "REQ-DUPUYTRENS-ISO",
    name: "Dupuytren's Isodose Curve Support",
    workflowPhase: "PLANNING",
    responsibleParty: "PHYSICIST",
    applicability: {
      diagnosis: "DUPUYTRENS",
      protocol: "Dupuytren's",
      requiredWhen: "When isodose support is needed for treatment planning."
    },
    templateSourceId: "SRC-DUPUYTRENS-ISO",
    defaultStatus: "PENDING_NEEDED",
    requiredAction: "Confirm isodose support requirements and mapping status",
    requiredFields: ["energy", "applicator", "depth of target", "isodose percentage"],
    outputFormats: ["PPTX", "PDF"],
    cptCode: "77300",
    createsTask: false
  },
  {
    id: "REQ-BILLING-PREAUTH-MAPPING",
    name: "Billing Pre-Authorization Mapping",
    workflowPhase: "CONSULTATION",
    responsibleParty: "ADMIN",
    applicability: {
      diagnosis: "ALL",
      requiredWhen: "Needed for workflows where billing pre-auth applies."
    },
    templateSourceId: "SRC-BILLING-PREAUTH-MISSING",
    defaultStatus: "MISSING_FIELDS",
    requiredAction: "Template mapping missing; confirm billing pre-auth workflow before automation",
    requiredFields: ["payer", "authorization status", "billing rule mapping"],
    outputFormats: ["DOCX", "PDF"],
    createsTask: false,
    autoCreate: false
  }
];

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "WF-UNIVERSAL",
    name: "Universal Patient Workflow",
    diagnosis: "ALL",
    protocol: "Universal",
    description: "Core intake and closure documents that can apply across evolving diagnosis workflows.",
    phases: orderedCarepathPhases,
    documentRequirementIds: ["REQ-INTAKE", "REQ-AVS-PCP", "REQ-BILLING-PREAUTH-MAPPING"],
    status: "ACTIVE"
  },
  {
    id: "WF-SKIN-IGSRT",
    name: "Skin Cancer IGSRT Workflow",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    description: "Skin cancer IGSRT tracking for simulation, prescription, fraction log, isodose, and pre-auth evidence.",
    phases: orderedCarepathPhases,
    documentRequirementIds: [
      "REQ-INTAKE",
      "REQ-SKIN-PREAUTH-20FX",
      "REQ-SKIN-PREAUTH-30FX",
      "REQ-SKIN-IGSRT-SIM",
      "REQ-SKIN-IGSRT-RX",
      "REQ-SKIN-IGSRT-FXLOG",
      "REQ-SKIN-IGSRT-ISO",
      "REQ-AVS-PCP"
    ],
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "WF-ARTHRITIS",
    name: "Arthritis Workflow",
    diagnosis: "ARTHRITIS",
    protocol: "Joint mapping",
    description: "Arthritis tracking by body region while template details continue to be mapped.",
    phases: orderedCarepathPhases,
    documentRequirementIds: [
      "REQ-INTAKE",
      "REQ-ARTHRITIS-HAND-MAPPING",
      "REQ-ARTHRITIS-FOOT-MAPPING",
      "REQ-ARTHRITIS-HAND-SIM",
      "REQ-ARTHRITIS-FOOT-SIM",
      "REQ-ARTHRITIS-KNEE-SIM",
      "REQ-ARTHRITIS-HAND-RX",
      "REQ-ARTHRITIS-FOOT-RX",
      "REQ-ARTHRITIS-KNEE-RX",
      "REQ-ARTHRITIS-HAND-FXLOG",
      "REQ-ARTHRITIS-FOOT-FXLOG",
      "REQ-ARTHRITIS-KNEE-FXLOG",
      "REQ-AVS-PCP"
    ],
    status: "MAPPING_IN_PROGRESS"
  },
  {
    id: "WF-DUPUYTRENS",
    name: "Dupuytren's Workflow",
    diagnosis: "DUPUYTRENS",
    protocol: "Dupuytren's",
    description: "Dupuytren's tracking with simulation, prescription, fraction log, and mapping still evolving.",
    phases: orderedCarepathPhases,
    documentRequirementIds: [
      "REQ-INTAKE",
      "REQ-DUPUYTRENS-US-MAPPING",
      "REQ-DUPUYTRENS-SIM",
      "REQ-DUPUYTRENS-RX",
      "REQ-DUPUYTRENS-FXLOG",
      "REQ-DUPUYTRENS-ISO",
      "REQ-AVS-PCP"
    ],
    status: "MAPPING_IN_PROGRESS"
  }
];

export const documentTemplates: DocumentTemplate[] = documentRequirements.map((requirement) => {
  const source = templateSources.find((item) => item.id === requirement.templateSourceId);

  return {
    id: requirement.id.replace("REQ-", "TPL-"),
    name: requirement.name,
    diagnosis: requirement.applicability.diagnosis,
    protocol: requirement.applicability.protocol ?? (requirement.applicability.universal ? "Universal" : "Registry"),
    category: requirement.workflowPhase,
    version: source?.status === "ACTIVE" ? "registry-active" : "registry-mapping",
    requiredFields: requirement.requiredFields,
    status: source?.status === "ACTIVE" ? "ACTIVE" : source?.status === "RETIRED" ? "RETIRED" : "DRAFT"
  };
});

export const internalFormTemplates: InternalFormTemplate[] = [
  {
    id: "FORM-IGSRT-SIM",
    name: "Skin Cancer IGSRT Simulation Order",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    sourceDriveFileId: "1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX",
    sourceDriveUrl: "https://docs.google.com/document/d/1WSCh-g-IeOdnkRAE-Q1e2axt0FF7c3aX/edit",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/02_SIMULATION_AND_CTP_ORDER/02_SIM_CTP_IGSRT_Order.SKIN_CANCER.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    outputFormats: ["DOCX", "PDF"],
    sections: [
      {
        id: "lesion",
        title: "Lesion and setup",
        fields: [
          { id: "lesionLocation", label: "Lesion location", kind: "text", required: true },
          { id: "laterality", label: "Laterality", kind: "select", required: true, options: ["Left", "Right", "Midline", "Bilateral"] },
          { id: "phaseIMarginInstruction", label: "Phase I margin instruction", kind: "textarea", required: true },
          { id: "chairSetup", label: "Chair setup", kind: "select", required: true, options: ["Face the wall", "Facing the cabinet", "Standard room setup"] },
          { id: "position", label: "Position", kind: "select", required: true, options: ["Upright", "Sitting reclined", "Supine", "Prone"] }
        ]
      },
      {
        id: "physics",
        title: "Physics and imaging",
        fields: [
          { id: "ultrasoundFrequencies", label: "Ultrasound frequencies", kind: "text", required: true },
          { id: "weeklyPhysicsReason", label: "Weekly physics reason", kind: "textarea", required: true },
          { id: "dateCompleted", label: "Date completed", kind: "date", required: true }
        ]
      }
    ]
  },
  {
    id: "FORM-IGSRT-RX",
    name: "Skin Cancer IGSRT Prescription",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    sourceDriveFileId: "1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi",
    sourceDriveUrl: "https://docs.google.com/document/d/1w07yZnotK_sEDcirUFwnEXhZyFSvv4bi/edit",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/07_PRESCRIPTION/07_Prescription.SKIN_CANCER.SCC_BCC.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx",
    outputFormats: ["DOCX", "PDF"],
    sections: [
      {
        id: "phase",
        title: "Phase prescription",
        fields: [
          { id: "energyKv", label: "Energy kV", kind: "number", required: true },
          { id: "phaseTotalDoseGy", label: "Phase total dose Gy", kind: "number", required: true },
          { id: "dosePerFractionGy", label: "Dose per fraction Gy", kind: "number", required: true },
          { id: "totalFractions", label: "Total fractions", kind: "number", required: true },
          { id: "ssdCm", label: "SSD cm", kind: "number", required: true },
          { id: "depthOfTargetMm", label: "Depth of target mm", kind: "number", required: true }
        ]
      }
    ]
  },
  {
    id: "FORM-IGSRT-FXLOG",
    name: "Skin Cancer IGSRT Fraction Log",
    diagnosis: "SKIN_CANCER",
    protocol: "IGSRT",
    sourceDriveFileId: "1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ",
    sourceDriveUrl: "https://docs.google.com/spreadsheets/d/1tFlY8IzDbhxUCRyWFzh-VDSwn0HxIsyJ/edit",
    sourceFileName:
      "docs/2026_TEMPLATES/01_SKIN_CANCER_IGSRT/12_FRACTIONATION_LOG/12_Fractionation_Log.SKIN_CANCER.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.xlsx",
    outputFormats: ["XLSX", "PDF"],
    sections: [
      {
        id: "daily",
        title: "Daily fraction",
        fields: [
          { id: "fractionNumber", label: "Fraction", kind: "number", required: true },
          { id: "date", label: "Date", kind: "date", required: true },
          { id: "dosePerFraction", label: "Dose per fraction cGy", kind: "number", required: true },
          { id: "depthOfTarget", label: "Depth of target", kind: "text", required: true },
          { id: "isodosePercent", label: "Isodose %", kind: "number", required: true },
          { id: "mdApproval", label: "MD approval", kind: "checkbox", required: true },
          { id: "dotApproval", label: "DOT approval", kind: "checkbox", required: true }
        ]
      }
    ]
  }
];

function sourceForRequirement(requirement: DocumentRequirement) {
  return templateSources.find((source) => source.id === requirement.templateSourceId);
}

function protocolMatches(requirementProtocol: string | undefined, course: TreatmentCourse) {
  if (!requirementProtocol) {
    return true;
  }

  const normalizedRequirement = requirementProtocol.toLowerCase();
  const normalizedCourse = `${course.protocolName} ${course.treatmentModality} ${course.treatmentType}`.toLowerCase();
  return normalizedCourse.includes(normalizedRequirement.toLowerCase()) || normalizedRequirement === "universal";
}

function bodyRegionMatches(requirementBodyRegion: string | undefined, course: TreatmentCourse) {
  if (!requirementBodyRegion) {
    return true;
  }

  const normalizedRequirement = requirementBodyRegion.toLowerCase();
  const normalizedCourse =
    `${course.diagnosis} ${course.protocolName} ${course.treatmentType} ${course.bodyRegion ?? ""} ${course.applicator ?? ""} ${course.targetDepth ?? ""}`.toLowerCase();
  const aliases: Record<string, string[]> = {
    hand: ["hand", "thumb", "finger", "palm", "wrist"],
    foot: ["foot", "toe", "ankle"],
    knee: ["knee"]
  };
  const matchTerms = aliases[normalizedRequirement] ?? [normalizedRequirement];

  return matchTerms.some((term) => normalizedCourse.includes(term));
}

export function documentRequirementAppliesToCourse(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
) {
  if (requirement.applicability.universal || requirement.applicability.diagnosis === "ALL") {
    return true;
  }

  return (
    requirement.applicability.diagnosis === patient.diagnosisCategory &&
    protocolMatches(requirement.applicability.protocol, course) &&
    bodyRegionMatches(requirement.applicability.bodyRegion, course)
  );
}

export function applicableDocumentRequirements(patient: Patient, course: TreatmentCourse) {
  return documentRequirements.filter((requirement) => documentRequirementAppliesToCourse(requirement, patient, course));
}

export function patientTrackingDocumentRequirements(patient: Patient, course: TreatmentCourse) {
  return applicableDocumentRequirements(patient, course).filter((requirement) => requirement.autoCreate !== false);
}

export function deriveDocumentStateFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse,
  documents: GeneratedDocument[]
): WorkflowDocumentState {
  const existing = documents.find(
    (document) =>
      document.courseId === course.id &&
      (document.templateId === requirement.id || document.name === requirement.name)
  );
  const source = sourceForRequirement(requirement);
  const status = existing?.status ?? requirement.defaultStatus;

  return {
    requirementId: requirement.id,
    documentId: existing?.id,
    patientId: patient.id,
    courseId: course.id,
    name: requirement.name,
    workflowPhase: requirement.workflowPhase,
    responsibleParty: requirement.responsibleParty,
    status,
    requiredAction: existing?.requiredAction ?? requirement.requiredAction,
    auditReady: existing?.auditReady ?? completedDocumentStatuses.includes(status),
    templateSourceStatus: source?.status,
    sourceDriveUrl: source?.driveUrl,
    mapped: source ? source.status === "ACTIVE" : false
  };
}

export function deriveWorkflowDocumentStates(
  patients: Patient[],
  courses: TreatmentCourse[],
  documents: GeneratedDocument[]
) {
  return patients.flatMap((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return [];
    }

    return patientTrackingDocumentRequirements(patient, course).map((requirement) =>
      deriveDocumentStateFromRequirement(requirement, patient, course, documents)
    );
  });
}

export function createGeneratedDocumentFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
): GeneratedDocument {
  return {
    id: `DOC-${patient.id.replace("CR-", "")}-${requirement.id.replace("REQ-", "")}`,
    templateId: requirement.id,
    patientId: patient.id,
    courseId: course.id,
    name: requirement.name,
    clinicalPhase: requirement.workflowPhase,
    responsibleParty: requirement.responsibleParty,
    status: requirement.defaultStatus,
    requiredAction: requirement.requiredAction,
    cptCode: requirement.cptCode,
    assignedTo: requirement.responsibleParty,
    lastUpdatedAt: patient.lastUpdatedAt,
    signReviewState:
      requirement.defaultStatus === "READY_FOR_REVIEW"
        ? "READY_FOR_SIGNATURE"
        : requirement.defaultStatus === "NEEDS_REVIEW" || requirement.defaultStatus === "MISSING_FIELDS"
          ? "REVIEW_REQUIRED"
          : "NOT_STARTED",
    auditReady: completedDocumentStatuses.includes(requirement.defaultStatus)
  };
}

export function ensureRequirementDocuments(
  patients: Patient[],
  courses: TreatmentCourse[],
  documents: GeneratedDocument[]
) {
  patients.forEach((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return;
    }

    patientTrackingDocumentRequirements(patient, course).forEach((requirement) => {
      const exists = documents.some(
        (document) =>
          document.courseId === course.id &&
          (document.templateId === requirement.id || document.name === requirement.name)
      );

      if (!exists) {
        documents.push(createGeneratedDocumentFromRequirement(requirement, patient, course));
      }
    });
  });
}

export function createTaskFromRequirement(
  requirement: DocumentRequirement,
  patient: Patient,
  course: TreatmentCourse
): CarepathTask | null {
  if (!requirement.createsTask) {
    return null;
  }

  return {
    id: `TASK-${patient.id.replace("CR-", "")}-${requirement.id.replace("REQ-", "")}`,
    courseId: course.id,
    taskNumber: requirement.taskNumber ?? requirement.id.replace("REQ-", ""),
    title: requirement.taskTitle ?? requirement.name,
    workflowPhase: requirement.workflowPhase,
    documentName: requirement.name,
    status: completedDocumentStatuses.includes(requirement.defaultStatus) ? "COMPLETED" : "PENDING",
    responsibleParty: requirement.responsibleParty,
    timing: requirement.timing ?? requirement.applicability.requiredWhen ?? "As required by workflow",
    noteAction: requirement.requiredAction,
    cptCodes: requirement.cptCode ? [requirement.cptCode] : ["N/A"],
    auditSteps: requirement.auditSteps ?? ["Document status reviewed"],
    auditReady: completedDocumentStatuses.includes(requirement.defaultStatus),
    dueDate: patient.lastUpdatedAt.slice(0, 10),
    lastUpdatedAt: patient.lastUpdatedAt,
    assignedUser: requirement.responsibleParty
  };
}

export function ensureRequirementTasks(
  patients: Patient[],
  courses: TreatmentCourse[],
  tasks: CarepathTask[]
) {
  patients.forEach((patient) => {
    const course = courses.find((item) => item.id === patient.activeCourseId);
    if (!course) {
      return;
    }

    patientTrackingDocumentRequirements(patient, course).forEach((requirement) => {
      const task = createTaskFromRequirement(requirement, patient, course);
      const exists =
        !task ||
        tasks.some((item) => item.courseId === course.id && item.documentName === requirement.name);

      if (task && !exists) {
        tasks.push(task);
      }
    });
  });
}
