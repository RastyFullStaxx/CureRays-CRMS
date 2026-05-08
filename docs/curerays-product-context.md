# CureRays Product Context

CureRays CWS is a clinical workflow automation system for CureRays Radiation Medicine. It is not a generic healthcare dashboard. Its job is to replace and augment the current manual workflow that depends on Google Sheets, Google Docs, Word templates, PowerPoint planning files, manual routing, and manual status tracking.

The system is patient-course centered. A patient can have multiple treatment courses, and each course owns its workflow phase, required documents, forms, treatment plan, images, fractions, tasks, billing readiness, audit checks, generated files, and activity history.

The core operating model is:

Patients -> Courses -> Workflow Steps -> Tasks -> Forms/Documents -> Signatures -> Treatment Delivery -> Summary -> Audit -> Closeout.

The dashboard is only a compact command center. The real work happens in module pages: patient registry, patient workspace, workflow, tasks, schedule, clinical forms, treatment planning, imaging, treatment delivery, documents, billing, audit, analytics, settings, and security logs.

## Manual Workflow Being Replaced

- Chart rounds tracking in Google Sheets.
- Carepath / Preauth / Audit documents.
- Clinical mapping forms.
- Isodose and treatment planning PowerPoint files.
- Manual routing to VA, MA, RTT, NP/PA, Doctor/PCP, Doctor/Rad Onc, Medical Physicist, Billing Staff, and Admin.
- Treatment phase and fractionation tracking.
- Treatment summary generation and final audit/signature.

## Product Principle

The app database is the source of truth. Documents, spreadsheets, PDFs, and PPTX files are generated or synced outputs. Staff should update structured app fields first; those updates drive workflow state, document generation, signatures, billing readiness, and audit closeout.
