# CureRays Drive Template Registry

- **Status:** Canonical template inventory and registry-mapping reference
- **Implementation status:** See [current state](../status/current-state.md)
**Workflow requirements:** See [clinical workflow requirements](../requirements/clinical-workflow.md)

This file maps the current Google Drive template library into the structure the CureRays Clinical Workflow System should use. The Drive files are historical/manual workflow artifacts; the app should treat them as template sources and generated-document references, not as the workflow state itself.

Current normalized source folder: `docs/2026_TEMPLATES`

Original uploaded folder: `docs/2026 TEMPLATES`

Drive folder ID: `1o2QbI-hgBI9yOx7BnK0YakkCX9admhCm`

## Core Rule

The database remains the source of truth for patient/course workflow state, document lifecycle status, assignment, audit readiness, versioning, lock state, and generated file links. Google Drive remains the template library and generated file storage boundary.

Do not manually move patients between folders, tabs, or files to represent status. Patient phase and workflow status must be stored as course/workflow state in the app.

## Phase 4 Pilot Registry Implementation

Phase 4 registry metadata now lives in `lib/template-registry-data.json`. `lib/template-registry.ts` is the typed loader/helper layer, and app pages should consume registry exports from the server-only operational page service where possible.

Current Phase 4 pilot guarantees:

- Template source records include version, SHA-256, approval status, and pilot approval metadata.
- Document requirements include diagnosis/protocol/body-region/laterality/modality applicability, phase, owner role, reviewer role, required fields, output formats, CPT relevance, pilot scope, and generation-readiness metadata.
- Field maps are tracked as structured `TemplateFieldMap` records using the same form-section and form-field vocabulary as internal clinical forms.
- `lib/server/template-registry-verification.ts` verifies recorded SHA-256 values against normalized local files.
- `scripts/phase4-template-registry.mjs` validates registry integrity, source hashes, approved deferrals/placeholders, workflow references, field-map coverage, and applicability scenarios.

Explicit Phase 4 boundaries:

- Billing pre-authorization mapping is visible but explicitly deferred; it must not auto-create tasks or generated documents.
- Gynecomastia, duplicate Arthritis mapping, and API-in-process prescription sources are future/draft placeholders, not pilot workflow requirements.
- Phase 4 does not implement DOCX/PPTX/XLSX/PDF generation, live Drive sync, eCW upload, electronic signatures, or generated-output storage.

## Implemented Local Template Structure

```text
docs/2026_TEMPLATES/
  00_UNIVERSAL/
  01_SKIN_CANCER_IGSRT/
    00_CAREPATH_PREAUTH_AUDIT/
    02_SIMULATION_AND_CTP_ORDER/
    07_PRESCRIPTION/
    09_ISODOSE_CURVES/
    12_FRACTIONATION_LOG/
    90_API_IN_PROCESS/
  02_ARTHRITIS/
    HAND/
    FOOT/
    KNEE/
  03_DUPUYTRENS/
    02_SIMULATION_AND_CTP_ORDER/
    07_PRESCRIPTION/
    09_ISODOSE_CURVES/
    12_FRACTIONATION_LOG/
    US_MAPPING/
  90_ON_GOING_REVISION/
  99_DUPLICATE_REVIEW/
```

## Normalization Manifest

See [`normalization-manifest.md`](normalization-manifest.md) for the full move manifest with original path, normalized path, diagnosis, workflow step, app category, status, SHA-256 hash, and draft/duplicate notes.

## Recommended Naming Convention

Use this pattern for source templates:

```text
<stepNumber>_<workflowDocumentType>.<diagnosisOrProtocol>.<anatomicRegionOrSite>.<laterality>.<datePlaceholder>.<patientNamePlaceholder>.<extension>
```

Use normalized placeholders:

- `ANATOMIC_REGION` instead of mixed `ANATOMICREGION`, `SITE`, `LOCATION`, or body-region-specific text when the template is generic.
- `LATERALITY` instead of mixed `laterality`, `LATERALITY`, or blanks.
- `DDMMYY` for treatment template naming unless a file-specific date format is clinically required.
- `LastName.FirstName` unless a legacy template must preserve comma formatting for merge compatibility.
- Correct spelling to `ARTHRITIS`; several current templates say `ARTHITIS`.
- Remove `Copy of` from production templates once validated.

## Original Folder Inventory and Normalized Names

### Root of `2026 TEMPLATES`

| Current name | Target folder | Recommended name | App category | Notes |
|---|---|---|---|---|
| `AVS PCP Template.docx` | `00_UNIVERSAL/` | `AVS_PCP.Universal.Template.docx` | Universal document | General after-visit / PCP communication template. |
| `Intake Form Template_08APR2025.docx` | `00_UNIVERSAL/` | `Intake_Form.Universal.08APR2025.Template.docx` | Universal intake | Universal patient intake template. |
| `Copy of 0. 2026 CarepathPreAuthAudit.SKIN.lesion#.SkinCancer30fx.DDMMYY.LastName.FirstName.docx` | `01_SKIN_CANCER_IGSRT/00_CAREPATH_PREAUTH_AUDIT/` | `00_Carepath_PreAuth_Audit.SKIN_CANCER.IGSRT.30fx.LesionNumber.DDMMYY.LastName.FirstName.docx` | Carepath / pre-auth / audit | Remove `Copy of` after clinical approval. |
| `Copy of 0. 2026 CarepathPreAuthAudit.SKIN.lesion#.SkinCancer20fx.DDMMYY.LastName.FirstName.docx` | `01_SKIN_CANCER_IGSRT/00_CAREPATH_PREAUTH_AUDIT/` | `00_Carepath_PreAuth_Audit.SKIN_CANCER.IGSRT.20fx.LesionNumber.DDMMYY.LastName.FirstName.docx` | Carepath / pre-auth / audit | Remove `Copy of` after clinical approval. |
| `Copy of 9. IGSRT Isodose Curves.ANATOMICREGION.laterality.SKIN CANCER.DDMMYY.LastName.FirstName.pptx` | `01_SKIN_CANCER_IGSRT/09_ISODOSE_CURVES/` | `09_Isodose_Curves.SKIN_CANCER.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.pptx` | Isodose / treatment planning | Root-level copy should move under Skin Cancer. |
| `Joint Mapping.HAND.LATERALITY.ARTHRITIS.MM_DD_YY.LastName,FirstName.docx` | `99_DUPLICATE_REVIEW/` | `Duplicate_01_Joint_Mapping.ARTHRITIS.HAND.LATERALITY.MMDDYY.LastName.FirstName.docx` | Mapping / simulation prep | Root-level duplicate is isolated for manual replacement review. |
| `9. IGSRT Isodose Curves.ANATOMICREGION.laterality.DUPUYTRENS.DDMMYY.LastName.FirstName.pptx` | `03_DUPUYTRENS/09_ISODOSE_CURVES/` | `09_Isodose_Curves.DUPUYTRENS.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.pptx` | Isodose / treatment planning | Root-level file should move under Dupuytren's. |

### Skin Cancer / IGSRT

Current folder: `SKIN CANCERS`

Recommended folder: `01_SKIN_CANCER_IGSRT`

| Current name | Target subfolder | Recommended name | App category | Workflow phase |
|---|---|---|---|---|
| `12. FX Log.SITE.laterality.SKIN.DDMMYY.LastName.First Name.xlsx` | `12_FRACTIONATION_LOG/` | `12_Fractionation_Log.SKIN_CANCER.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Fractionation log | On-Treatment |
| `API versions (Hess, in process)` | `90_API_IN_PROCESS/` | `90_API_Versions.Hess.In_Process` | Draft / API mapping | Draft / unmapped |
| `2. CTP_SIM_IGSRTorder.LOCATION.laterality.SKIN.DDMMYY.LastName.FirstName.docx` | `02_SIMULATION_AND_CTP_ORDER/` | `02_SIM_CTP_IGSRT_Order.SKIN_CANCER.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx` | Simulation / CTP order | Chart Prep / Simulation |
| `7. Prescription.LOCATION.laterality.SCC_BCC.DDMMYY.LastName.FirstName.docx` | `07_PRESCRIPTION/` | `07_Prescription.SKIN_CANCER.SCC_BCC.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx` | Prescription | Planning / On-Treatment readiness |

### Arthritis

Current folder: `ARTHRITIS`

Recommended folder: `02_ARTHRITIS`

#### Hand

| Current name | Recommended name | App category | Workflow phase |
|---|---|---|---|
| `12. FX Log.HAND.laterality.ARTHITIS.DDMMYY.LastName.First Name.xlsx` | `12_Fractionation_Log.ARTHRITIS.HAND.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Fractionation log | On-Treatment |
| `7. Prescription.HAND.laterality.ARTHRITIS.DDMMMYY.LN,fn.docx` | `07_Prescription.ARTHRITIS.HAND.LATERALITY.DDMMYY.LastName.FirstName.docx` | Prescription | Planning / On-Treatment readiness |
| `Joint Mapping.HAND.LATERALITY.ARTHRITIS.MM_DD_YY.LastName,FirstName.docx` | `01_Joint_Mapping.ARTHRITIS.HAND.LATERALITY.MMDDYY.LastName.FirstName.docx` | Joint mapping | Consultation / Chart Prep |
| `2. SIM_CTP.IGRT.HAND.laterality.ARTHRITIS.DDMMYY.LastName.FirstName.docx` | `02_SIM_CTP_IGRT.ARTHRITIS.HAND.LATERALITY.DDMMYY.LastName.FirstName.docx` | Simulation / CTP / IGRT order | Chart Prep / Simulation |

#### Foot

| Current name | Recommended name | App category | Workflow phase |
|---|---|---|---|
| `12. FX Log.FOOT.laterality.ARTHITIS.DDMMYY.LastName.First Name.xlsx` | `12_Fractionation_Log.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Fractionation log | On-Treatment |
| `7. Prescription.FOOT.laterality.ARTHRITIS.DDMMMYY.LN,fn.docx` | `07_Prescription.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.docx` | Prescription | Planning / On-Treatment readiness |
| `JointMapping.FOOT.laterality.ARTHRITIS.DDMMYY.LastName.FirstName.docx` | `01_Joint_Mapping.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.docx` | Joint mapping | Consultation / Chart Prep |
| `2. SIM_CTP.IGRT.FOOT.laterality.ARTHRITIS.DDMMYY.LastName.FirstName.docx` | `02_SIM_CTP_IGRT.ARTHRITIS.FOOT.LATERALITY.DDMMYY.LastName.FirstName.docx` | Simulation / CTP / IGRT order | Chart Prep / Simulation |

#### Knee

| Current name | Recommended name | App category | Workflow phase |
|---|---|---|---|
| `12. FX Log.KNEE.laterality.ARTHITIS.DDMMYY.LastName.First Name.xlsx` | `12_Fractionation_Log.ARTHRITIS.KNEE.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Fractionation log | On-Treatment |
| `2. SIM_CTP.IGRT.KNEE.laterality.ARTHRITIS.DDMMYY.LastName.FirstName.docx` | `02_SIM_CTP_IGRT.ARTHRITIS.KNEE.LATERALITY.DDMMYY.LastName.FirstName.docx` | Simulation / CTP / IGRT order | Chart Prep / Simulation |
| `7. Prescription.KNEE.laterality.ARTHRITIS.DDMMYY.LastName.FirstName.docx` | `07_Prescription.ARTHRITIS.KNEE.LATERALITY.DDMMYY.LastName.FirstName.docx` | Prescription | Planning / On-Treatment readiness |

### Dupuytren's

Current folder: `DUPUYTREN_S`

Recommended folder: `03_DUPUYTRENS`

| Current name | Target subfolder | Recommended name | App category | Workflow phase |
|---|---|---|---|---|
| `2. SIM_CTP_IGRT.LOCATION.laterality.DUPUYTREN_S.DDMMYY.LastName.FirstName.docx` | `02_SIMULATION_AND_CTP_ORDER/` | `02_SIM_CTP_IGRT.DUPUYTRENS.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx` | Simulation / CTP / IGRT order | Chart Prep / Simulation |
| `FX Log.HAND.laterality.DUPUYTRENS.DDMMYY.LastName.First Name.xlsx` | `12_FRACTIONATION_LOG/` | `12_Fractionation_Log.DUPUYTRENS.HAND.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Fractionation log | On-Treatment |
| `7. Prescription.LOCATION.laterality.DUPUYTRENS.DDMMYY.LastName.FirstName.docx` | `07_PRESCRIPTION/` | `07_Prescription.DUPUYTRENS.LOCATION.LATERALITY.DDMMYY.LastName.FirstName.docx` | Prescription | Planning / On-Treatment readiness |
| `USMapping.HAND.laterality.DUPUYTRENS.DDMMYY.LastName.FirstName.docx` | `US_MAPPING/` | `01_US_Mapping.DUPUYTRENS.HAND.LATERALITY.DDMMYY.LastName.FirstName.docx` | US mapping | Consultation / Chart Prep |
| `9. IGSRT Isodose Curves.ANATOMICREGION.laterality.DUPUYTRENS.DDMMYY.LastName.FirstName.pptx` | `09_ISODOSE_CURVES/` | `09_Isodose_Curves.DUPUYTRENS.IGSRT.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.pptx` | Isodose / planning | Planning / On-Treatment readiness |

### On-going Revision

Current folder: `On-going Revision`

Recommended folder: `90_ON_GOING_REVISION`

| Current name | Recommended name | App category | Notes |
|---|---|---|---|
| `12. FX Log.SITE.laterality.ARTHITIS.DDMMYY.LastName.First Name.xlsx` | `Draft_12_Fractionation_Log.ARTHRITIS.SITE.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Draft / revision | Correct `ARTHITIS` to `ARTHRITIS` when promoted. |
| `Copy of 12. FX Log.SITE.laterality.ARTHITIS.DDMMYY.LastName.First Name.xlsx` | `Draft_Copy_12_Fractionation_Log.ARTHRITIS.SITE.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Draft / revision | Keep in revision folder until validated. |
| `Copy of 12. FX Log.ANATOMICREGION.laterality.ARTHRITIS.DDMMYY.LastName.First Name.xlsx` | `Draft_Copy_12_Fractionation_Log.ARTHRITIS.ANATOMIC_REGION.LATERALITY.DDMMYY.LastName.FirstName.xlsx` | Draft / revision | More generic than site-specific version. |
| `Copy of 12. FX Log.BREAST.laterality.Gynecomastia.DD.MM.YYYY..LAST, first.xlsx` | `Draft_Copy_12_Fractionation_Log.GYNECOMASTIA.BREAST.LATERALITY.DDMMYYYY.LastName.FirstName.xlsx` | Draft / possible future protocol | Do not include in active registry until workflow is confirmed. |

## Registry Status Values

Use these values in the app template registry:

- `ACTIVE`: production source template that should appear in active workflow coverage.
- `MAPPING_IN_PROGRESS`: source template is understood enough for workflow tracking but not full generation.
- `DRAFT`: not production-ready or retained only for revision/duplicate review.
- `RETIRED`: retained for history only.
- `MISSING`: expected template is not currently present.

## Suggested App Mapping

| Template family | App entity | Main page/module |
|---|---|---|
| Intake / AVS | `DocumentTemplate`, `ClinicalFormTemplate` | Intake, Patient Workspace, Documents |
| Carepath PreAuth Audit | `WorkflowStep`, `Task`, `DocumentTemplate`, `AuditCheck`, `BillingItem` | Workflow/Carepath, Documents, Audit & QA |
| Mapping templates | `ClinicalFormTemplate`, `DocumentTemplate`, `ImagingAsset` | Clinical Forms, Imaging, Treatment Planning |
| SIM / CTP / IGRT orders | `WorkflowStep`, `DocumentTemplate`, `Task` | Chart Prep, Simulation, Treatment Planning |
| Prescription templates | `TreatmentPlan`, `DocumentTemplate`, `Task` | Treatment Planning, Documents |
| Isodose curves | `TreatmentPlan`, `ImagingAsset`, `DocumentTemplate` | Treatment Planning, Imaging, Documents |
| Fractionation logs | `TreatmentFraction`, `DocumentTemplate`, `AuditCheck` | Treatment Delivery, Audit & QA |

## Generated Patient/Course Files

Generated files should not live in the template folder. Use this future structure for output files:

```text
Patients/
  MRN_LastName_FirstName/
    Course-YYYY-###_Diagnosis_Site/
      01_ChartPrep/
      02_Simulation/
      03_Planning/
      04_OnTreatment/
      05_PostTx/
      06_Audit/
      Images/
```

## Implementation Notes

1. The app should select templates by diagnosis, protocol, anatomic region/site, laterality, course year, and workflow step.
2. The app should show `unmapped`, `draft`, or `missing` states explicitly instead of hiding incomplete workflow coverage.
3. Signed/generated documents should be locked or versioned carefully.
4. Any direct manual edit to a generated patient/course document should be treated as an audited exception.
5. Do not store raw PHI in operational dashboards, queues, analytics, or registry metadata. Store PHI only inside the PHI boundary once production infrastructure is ready.
