# CureRays File Storage And Documents

Files live in three conceptual layers.

## 1. Template Library

Master templates live in the Drive template folder or app template library. They are read-only except for admins.

Examples:
- Carepath / Preauth / Audit templates.
- Hand Arthritis Mapping template.
- IGSRT Isodose / Planning templates.

Template references should remain configurable through the template registry or future admin settings. Do not hardcode credentials.

## 2. Patient/Course Generated Files

Generated files belong to a patient treatment course.

Suggested logical structure:

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

## 3. App Database / App State

The app database is the source of truth. Store document status, links, versions, signatures, upload state, lock state, and audit events in the app.

Documents, spreadsheets, PDFs, and PPTX files are generated/synced outputs. Direct manual edits should be audited exceptions with version history. Signed documents should be locked or versioned carefully.

## Service Boundaries

- templateService
- documentGenerationService
- fileStorageService
- driveSyncService
- chartRoundsSyncService
- auditLogService

Pending integrations include Google Drive fetching, Google Docs/Sheets syncing, DOCX/PPTX/PDF generation, eCW integration, electronic signature, and HIPAA-grade storage/security hardening.
