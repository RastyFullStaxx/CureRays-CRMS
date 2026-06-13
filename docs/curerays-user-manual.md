# CureRays CRMS User Manual

This manual explains how to use CureRays CRMS in everyday clinic work. It is written for staff using the released system and assumes the system is already connected to the correct patient records, templates, document storage, scheduling, billing, audit, and user permission controls.

The most important idea is simple: update the structured record in CureRays CRMS first. The system then uses that information to drive workflow status, tasks, documents, signatures, treatment delivery, billing readiness, and audit closeout.

## 1. What CureRays CRMS Does

CureRays CRMS is a patient-course centered clinical operations system for CureRays Radiation Medicine.

A patient can have one or more treatment courses. Each course has its own:

- Workflow steps
- Tasks
- Appointments
- Clinical forms
- Planning details
- Imaging evidence
- Generated documents
- Treatment fractions
- Billing items
- Audit checks
- Activity history

The system replaces manual tracking across spreadsheets, folders, Word documents, PowerPoint files, routing notes, and separate status lists. Staff should not manually move patients between separate tracking files. Instead, update the patient, course, workflow step, task, document, or fraction inside CRMS. The system updates the rest of the course record from there.

## 2. The Main Workflow

Most patient courses move through this path:

1. Patient is registered.
2. A treatment course is created.
3. The system selects the correct workflow template.
4. Carepath steps, tasks, documents, audit checks, and folders are created.
5. Consult and chart prep items are completed.
6. Simulation or mapping is scheduled and completed.
7. Planning details, prescription, imaging, and reviews are completed.
8. Treatment fractions are delivered and recorded.
9. Final treatment summary, billing evidence, follow-up, and audit items are completed.
10. Final audit is signed.
11. The course is closed and final documents are locked.

The dashboard phases are:

- Upcoming: patient is not yet actively receiving treatment.
- On Treatment: patient is actively receiving fractions.
- Post-Treatment: treatment is complete and the course is in follow-up, billing, audit, or closeout work.

The detailed course phases are:

- Consultation
- Chart Prep
- Simulation
- Planning
- On-Treatment
- Post-Tx
- Audit
- Closed

## 3. Privacy And Security Rules

CureRays CRMS contains patient information. Use it carefully.

Always:

- Use your own login only.
- Lock your screen when stepping away.
- Open only the patient records needed for your work.
- Enter clinical information in the correct patient and course.
- Use the system's upload, signature, and audit tools instead of keeping unofficial copies.
- Give a clear reason when marking something blocked, N/A, voided, corrected, or reopened.
- Report incorrect access, wrong-patient information, or missing audit history immediately.

Never:

- Share your password.
- Store patient information in personal notes, personal drives, chat apps, or screenshots.
- Put patient names, MRNs, or clinical details in unsupported external tools.
- Change a generated document outside the system unless it is handled as a manual edit exception.
- Mark an item complete just to clear a queue when the required evidence is missing.

## 4. Screen Basics

### Sidebar

The sidebar is the main navigation. It is grouped by work area:

- Overview
- Patient Management
- Clinical Operations
- Clinical Tools
- Documentation
- Intelligence
- Administration

Use the collapse button at the top of the sidebar to make the sidebar narrow or wide. Use the light/dark mode button to change the display theme. Your preference is saved on the same browser.

### Tables

Most pages use the same table pattern.

Use:

- Search box to find a patient, course, document, status, owner, code, or task.
- Filters to narrow results by phase, status, role, category, provider, or readiness.
- Column values to understand what needs action.
- Row click to open the detailed record when the row is clickable.
- Action buttons such as Edit, Update, Render, Sign, or Worksheet to work on that item.

If a table looks empty, clear the search text and filters first.

### Stat Cards

Stat cards at the top of pages summarize the current workload, such as open tasks, blocked items, ready-for-review documents, missing signatures, or treatment counts. Use these cards to decide where to focus first.

### Badges

Badges show status quickly.

Common badge meanings:

- Success or green: complete, signed, ready, uploaded, or clear.
- Warning or orange: needs review, due soon, pending, N/A, or missing information.
- Error or red: blocked, overdue, missing evidence, or failed validation.
- Info or blue: informational status, review queue, or active item.

## 5. Status Guide

Use statuses consistently. The system relies on them to route work and protect audit readiness.

| Status | Meaning | What to do |
|---|---|---|
| Not Started | Work has not begun. | Start it when the patient/course reaches that step. |
| Pending | Waiting for action. | Open the item and complete the next required field or task. |
| In Progress | Someone has started the work. | Continue or wait for the assigned owner. |
| Ready for Review | Work is prepared but needs review. | Reviewer checks content and signs, approves, or requests correction. |
| Signed | Required signature is complete. | Continue to the next workflow step or upload/lock if applicable. |
| Uploaded | File or evidence has been sent to the required external destination. | Confirm upload reference if needed. |
| Completed | Work is finished. | No action unless a correction is needed. |
| N/A | Item does not apply to this course. | Enter the reason. The reason is required. |
| Blocked | Work cannot proceed. | Enter the blocker reason and owner for resolution. |
| Overdue | Due date has passed. | Prioritize review or escalation. |
| Closed | Course or item is finalized. | Do not edit unless an authorized correction process is opened. |

## 6. Roles In The System

Your available pages and actions depend on your role. Typical roles include:

- Admin
- Virtual Assistant
- Medical Assistant
- Therapist / RTT
- Nurse Practitioner / PA
- Doctor / PCP
- Doctor / Rad Onc
- Medical Physicist / PhD
- Billing Staff

If you cannot see or update something you expect to work on, contact an administrator. Do not use another person's account.

## 7. Navigation Overview

| Page | Use it for |
|---|---|
| Dashboard | Daily command center, urgent work, safety signals, capacity, workflow pressure, pending signatures, and audit readiness. |
| Patients | Register patients, search records, open patient workspaces, edit authorized patient details, and view current course signals. |
| Courses | Review treatment courses across all patients, including diagnosis, phase, fractions, owner, status, and next action. |
| Workflow | Update Carepath steps, assign owners, set due dates, mark blockers, mark N/A with reason, and advance course phase when gates are clear. |
| Tasks | Work role-based task queues, update assignment/status/due dates, block or reopen work, and add change reasons. |
| Schedule | View appointment calendar, simulations, mapping appointments, treatment fractions, providers, rooms, and upcoming visits. |
| Treatment Delivery | Manage today's treatment queue, fraction status, held/missed treatments, OTV due items, and physics check due items. |
| Clinical Forms | Fill structured forms, edit mapped fields, review previews, and send forms for review/signature. |
| Treatment Planning | Track planning parameters, physics review, Rad Onc signature, imaging gates, and generated treatment schedules. |
| Imaging | Upload, tag, review, and link required imaging evidence such as ultrasound, X-ray, and clinical photos. |
| Documents | Create, render, review, sign, upload, lock, void, and track generated course documents. |
| Billing | Track billing codes, planned/completed/billed quantities, linked documents, pre-auth, and audit readiness. |
| Audit & QA | Validate closeout readiness, missing documents, missing signatures, follow-up, billing evidence, and final audit signoff. |
| Reports | Open summarized reporting views and jump into deeper analytics panels. |
| Analytics | Review operational trends, bottlenecks, treatment throughput, document lifecycle, risk, billing readiness, and PHI boundary assurance. |
| Users & Roles | Manage users, roles, permission levels, MFA status, and access by module. |
| Templates | Manage template sources, field maps, approval status, hash verification, document requirements, and readiness. |
| Settings | Configure system preferences, integrations, notifications, dropdowns, storage, billing, security, and workflow settings. |
| Security Logs | Review access events, signatures, system changes, PHI-related actions, and exported security history. |
| Audit Logs | Review operational system events, document changes, and administrative actions. |

## 8. Dashboard

Use the Dashboard at the start of the day and whenever you need a clinic-wide view.

What you can see:

- Active course load
- Upcoming, on-treatment, and post-treatment distribution
- Bottlenecks by workflow phase
- High-priority intervention queue
- Pending signatures
- Template coverage
- Audit readiness
- Treatment throughput
- Schedule capacity
- Safety and risk signals

How to use it:

1. Open Dashboard.
2. Review urgent warnings first.
3. Look for blocked courses, overdue tasks, missing signatures, missing imaging, or audit gaps.
4. Use the patient/course references shown on the dashboard to open the detailed page that owns the work.
5. Resolve work from the owning page, such as Tasks, Workflow, Documents, Treatment Delivery, or Audit.

Do not treat the dashboard as the place to make detailed corrections. It is a command center. The detailed record should be updated in the correct module.

## 9. Patients

Use Patients to find, create, and maintain patient records.

### Find A Patient

1. Open Patients.
2. Search by patient display label, patient reference, course reference, diagnosis, phase, status, or next action.
3. Use filters such as Diagnosis, Phase, Status, or Needs Action.
4. Click the patient row to open the patient workspace.

### Add A New Patient

1. Open Patients.
2. Select Add Patient.
3. Complete Patient Identity:
   - First name
   - Last name
   - MRN
4. Complete Clinical Basics:
   - Diagnosis category
   - Diagnosis
   - Location or treatment site
   - Physician
   - Assigned staff
   - Initial phase and status
5. Complete Course Setup:
   - Protocol
   - Body region or site
   - Laterality, if applicable
   - Planned fractions and course details required by the form
   - Next action and notes, if known
6. Review the final summary.
7. Save.

After saving, the system creates the patient record, active course, workflow steps, initial tasks, document requirements, audit checks, and course file locations. The new patient workspace opens after a successful save.

### Edit A Patient Record

1. Open Patients.
2. Find the patient.
3. Select Edit.
4. Move through the guided sections and update only the fields that need correction.
5. Enter the change reason on Review & Save.
6. Save.

The system records correction history. Do not use patient notes to hide corrections that should be made in structured fields.

## 10. Patient Workspace

The Patient Workspace is the main patient-course hub. Open it by selecting a patient row from Patients or by using a patient/course link from another page.

The workspace tabs are:

- Command
- Workflow
- Tasks
- Clinical
- Planning
- Imaging
- Documents
- Fractions
- Billing / Audit
- Activity

### Command Tab

Use Command for a quick course summary.

It shows:

- Course signals
- Urgent tasks
- Blocked steps
- Unsigned documents
- Open audit checks
- Today's action board
- Readiness status
- Next action

Start here when you open a patient and need to know what matters most.

### Workflow Tab

Use Workflow to review Carepath progress for the selected course.

You can see:

- Step number and name
- Phase
- Status
- Owner
- Due date or trigger
- Signature requirement
- Blocker

If a step is not moving, open the Workflow page or related task to update the status, owner, due date, blocked reason, or N/A reason.

### Tasks Tab

Use Tasks to see work assigned to the course.

You can see:

- Task title
- Priority
- Status
- Owner
- Due date
- Action details

Complete the task in the system when the real work is done. If it cannot be done, mark it Blocked and enter the reason.

### Clinical Tab

Use Clinical for structured clinical forms and clinical notes.

You can:

- Open forms
- Complete fields
- Review completion percentage
- Send forms for review
- View recent clinical notes
- Confirm owner and last update

Structured fields drive documents. Update the fields rather than manually editing generated output.

### Planning Tab

Use Planning for treatment plan readiness.

You can see:

- Treatment plan
- Energy
- Applicator
- Dose
- Depth or DOI values
- Physics review status
- Rad Onc signature status
- Planning readiness
- Schedule generation state

Planning should be complete, reviewed, and signed before treatment begins.

### Imaging Tab

Use Imaging to confirm required evidence.

You can:

- Review uploaded imaging assets
- Confirm modality and category
- Link imaging to phase or fraction
- See missing required imaging
- Review image guidance rows

Imaging gaps can block planning, DOT approval, treatment delivery, or audit closeout.

### Documents Tab

Use Documents to manage the course document set.

You can:

- Review required documents
- Render or regenerate outputs
- Send for review
- Sign
- Upload to eCW or required storage
- View version and lifecycle status
- Confirm locked evidence

Signed documents should be locked or versioned. If an edit is needed after signing, use the correction or exception workflow.

### Fractions Tab

Use Fractions to review the course's fractionation record.

You can see:

- Fraction number
- Date
- Phase
- Energy
- SSD/applicator
- Dose
- Cumulative dose
- Depth
- Isodose
- DOT and MD approvals
- Review status
- Notes

For active treatment entry, use the patient fraction worksheet or Treatment Delivery page.

### Billing / Audit Tab

Use Billing / Audit to confirm closeout readiness for the course.

You can see:

- Billing codes
- Planned, completed, and billed quantities
- Linked evidence documents
- Audit checks
- Missing signatures
- Follow-up state
- Closeout readiness

Billing and audit should not be completed until evidence is present and linked.

### Activity Tab

Use Activity to review what happened in the course.

You can see:

- Notes
- System-generated events
- Workflow changes
- Document actions
- Task activity
- Audit history

Use Activity when you need to answer "who changed what and when?"

## 11. Courses

Use Courses to view all treatment courses across the clinic.

What you can do:

- Search by course, patient, diagnosis, phase, provider, or status.
- Filter courses by workflow phase or readiness.
- Find courses with open blockers, missing documents, or fraction progress issues.
- Open the related patient workspace for details.

Use Courses when the patient has more than one course or when you need to manage work by course instead of by patient.

## 12. Workflow

Use Workflow to control Carepath steps and course phase advancement.

### Update A Workflow Step

1. Open Workflow.
2. Select the course from the course dropdown.
3. Find the workflow step.
4. Select Update.
5. Update:
   - Status
   - Due date
   - Assigned user
   - Blocked reason
   - N/A reason
   - Reopen reason
6. Enter a clear change reason if requested.
7. Save.

Rules:

- Mark Blocked only when work cannot continue.
- A blocked item needs a reason.
- Mark N/A only when the step truly does not apply.
- An N/A item needs a reason.
- Reopening completed work needs a reason.

### Advance A Course

1. Open Workflow.
2. Select the course.
3. Review blockers shown on the page.
4. Resolve required steps, signatures, documents, and evidence.
5. Select Advance.

If the course cannot advance, the system shows blockers. Resolve the blockers in the owning module, then try again.

## 13. Tasks

Use Tasks for daily work queues.

Common queues include:

- My role
- Team tasks
- Unassigned work
- Signatures
- Overdue
- Completed

### Work A Task

1. Open Tasks.
2. Select the queue you need.
3. Search or filter by status, role, or assigned user.
4. Open the task with Update.
5. Set the correct status.
6. Assign or reassign the owner if needed.
7. Set or update the due date.
8. Enter a blocked reason, N/A reason, or reopen reason when applicable.
9. Enter a change reason.
10. Save.

Use Refresh when you need to reload the queue after other staff have made updates.

## 14. Schedule

Use Schedule for appointment timing.

What you can see:

- Upcoming appointments
- Treatment fractions
- Simulation appointments
- Mapping appointments
- Provider schedule
- Room or location schedule
- Weekly calendar blocks

How to use it:

1. Open Schedule.
2. Review today's appointments and the next 7 days.
3. Check treatment, simulation, and provider counts.
4. Open the related patient/course if an appointment needs clinical or workflow updates.
5. Add or update appointments through the scheduling action when your role permits it.

If a course is not ready for simulation or treatment scheduling, check Workflow, Treatment Planning, Imaging, and Documents for blockers.

## 15. Treatment Delivery

Use Treatment Delivery for active treatment operations.

What you can see:

- Today's treatment queue
- In-progress treatments
- Completed treatments
- Held or missed treatments
- OTV due items
- Physics check due items
- Image guidance alerts
- Room and therapist assignments

### Work The Treatment Queue

1. Open Treatment Delivery.
2. Review Today's Treatments and Held/Missed counts.
3. Check the Alerts column:
   - IMG means image guidance evidence is missing.
   - OTV means an on-treatment visit is due.
   - PHYS means a physics check is due.
4. Open the patient/course or worksheet for the item.
5. Record or update the fraction as appropriate.

Do not approve a fraction if required imaging evidence is missing.

## 16. Fraction Worksheet

Use the fraction worksheet to record daily treatment details.

### Record A Fraction

1. Open the patient's Fraction Log or the worksheet from Treatment Planning.
2. Review the course context, Review Queue, alerts, Fraction History, and selected note/detail first.
3. Select Record Next Fraction.
4. Confirm:
   - Fraction number
   - Date
   - Phase
   - Correct patient and course context
5. Enter Treatment Values:
   - Energy
   - Field
   - Dose
   - DOT
   - SSD
   - Technician initials
6. Use Advanced Fields when needed for setup comments, notes, treatment time, override percentage, or override reason.
7. Review the Live Calculation section.
8. Resolve any warning that blocks recording.
9. Select Record Fraction.

### Review And Approve A Fraction

1. Go to the Review Queue.
2. Review warnings, imaging state, calculation status, and dose details.
3. If image guidance is missing, link or complete the imaging evidence first.
4. Select DOT Approve when DOT review is complete.
5. Select MD Approve when physician review is complete.

### Request A Revision

1. Select DOT Revision or MD Revision.
2. Enter the correction needed.
3. Confirm.

The item stays in the review queue until corrected and approved.

### Correct A Fraction

1. Open the correction form for the fraction.
2. Update the incorrect fields.
3. Save the correction.

Corrections reset approvals because the reviewed values changed.

### Void A Fraction

Void a row only when it should not count as a valid treatment record.

1. Select the void action.
2. Enter the reason.
3. Confirm.

The reason is part of the audit record.

## 17. Clinical Forms

Use Clinical Forms for structured documentation.

What you can do:

- Create or open clinical forms.
- Complete mapped fields.
- Edit structured field values.
- Review document preview.
- Track missing fields.
- Send a form for review.
- Track signatures.

How to use it:

1. Open Clinical Forms.
2. Search for the patient, form, document, MRN, status, or reviewer.
3. Open the form.
4. Complete missing fields.
5. Review the preview.
6. Send for review or signature.

If the preview is wrong, correct the structured field. Do not manually edit generated output unless using the approved exception workflow.

## 18. Treatment Planning

Use Treatment Planning to prepare a course for treatment.

What you can see:

- Plan ID
- Patient and course
- Diagnosis
- Site
- Energy
- Applicator
- DOI or depth
- Dose per fraction
- Total dose
- Total fractions
- Coverage
- Readiness
- Schedule generation state
- Imaging, physics, and OTV gates
- Physics review
- Rad Onc signature
- Locked plan status

### Complete Planning

1. Open Treatment Planning.
2. Find the plan.
3. Complete required planning parameters.
4. Resolve missing inputs shown in Readiness.
5. Confirm imaging gates are clear.
6. Send to physics review.
7. Route to Rad Onc signature.
8. Generate the treatment schedule when the plan is ready.
9. Lock the plan after final approval.

If the Worksheet button is available, use it to open the patient fraction worksheet.

## 19. Imaging

Use Imaging to manage course evidence such as ultrasound, X-ray, and clinical photos.

What you can do:

- Upload imaging.
- Create an imaging study.
- Tag image category.
- Link imaging to patient, course, phase, and fraction.
- Confirm required categories are present.
- Find missing imaging evidence.

How to use it:

1. Open Imaging.
2. Search by modality, category, phase, patient, uploader, or status.
3. Upload or open the imaging record.
4. Confirm category and phase.
5. Link it to the correct course and fraction when needed.
6. Save.

Missing imaging can block planning, DOT approval, treatment delivery, and audit readiness.

## 20. Documents

Use Documents to manage generated and uploaded course documents.

Document lifecycle:

1. Requirement is created.
2. Document is generated from template and structured fields.
3. Document is reviewed.
4. Document is signed.
5. Document is uploaded or sent to the required destination.
6. Document is locked as evidence.

What you can do:

- Create from template.
- Upload supporting documents.
- Render or regenerate a document.
- Review document version.
- Send for signature.
- Sign when authorized.
- Upload to eCW or required storage.
- Lock evidence.
- Void an incorrect output.
- Record manual edit exceptions.

How to use it:

1. Open Documents.
2. Search by document, patient, course, category, signature status, or eCW status.
3. Filter by category, status, phase, signature, eCW, storage, or lifecycle.
4. Open the document row.
5. Render or review the document.
6. Sign or route for signature when ready.
7. Upload to the required destination.
8. Confirm the upload reference.
9. Lock the document when final.

If a signed document must change, use the correction/version workflow. Do not overwrite the locked evidence.

## 21. Billing / Coding

Use Billing / Coding to track charge readiness and supporting evidence.

What you can see:

- Code
- Description
- Planned quantity
- Completed quantity
- Billed quantity
- Status
- Linked document
- Notes
- Audit issues

How to use it:

1. Open Billing.
2. Search by code, patient, course, document, or note.
3. Filter by code, documentation, or status.
4. Confirm completed quantities match treatment and documentation.
5. Link required documents.
6. Resolve audit issues.
7. Mark ready for billing only when documentation is complete.
8. Export billing report when needed.

Billing should follow evidence. If documentation is missing, resolve Documents, Treatment Delivery, or Audit first.

## 22. Audit & QA

Use Audit & QA to close a course safely.

Audit checks include:

- Required documents present
- Required signatures complete
- Treatment summary complete
- Billing evidence ready
- Follow-up scheduled
- Imaging evidence linked
- Fractions reviewed
- Exceptions explained
- Final audit signoff complete

How to use it:

1. Open Audit.
2. Search by course, patient, diagnosis, blocker, document, or audit check.
3. Filter by readiness, documents, billing, or status.
4. Review missing items.
5. Open the owning module for each missing item.
6. Complete or document each item.
7. Run the audit check.
8. Export audit report if needed.
9. Complete final audit signoff.

The course should not be closed until audit readiness is complete or authorized exceptions are recorded.

## 23. Reports

Use Reports for summarized operational reporting.

Report areas include:

- Workflow Performance
- Treatment Analytics
- Document Intelligence
- Billing & Risk

How to use it:

1. Open Reports.
2. Review high-level KPI cards.
3. Select the report tile you need.
4. Open Analytics for deeper investigation.

Reports summarize. Analytics explains the patterns behind the summary.

## 24. Analytics

Use Analytics to understand trends and bottlenecks.

Analytics panels include:

- Overview
- Workflow
- Treatment
- Documents
- Billing & Risk

What you can analyze:

- Tokenized inspection queue
- Active course progress
- Template coverage
- Provider pressure
- PHI boundary assurance
- Operational forecast
- Cohort mix
- Carepath pressure flow
- Phase by owner heatmap
- Bottleneck Pareto
- Fraction throughput
- Document lifecycle funnel
- Signature aging
- Audit evidence matrix
- Role load matrix
- Schedule capacity
- Billing readiness
- Audit closeout readiness

Use Analytics to decide where process improvement or staffing attention is needed. Use the detailed modules to make record changes.

## 25. Templates

Use Templates to manage document and form sources.

What you can see:

- Template source
- File type
- Registry status
- Approval status
- Source hash verification
- Linked requirements
- Field maps
- Disposition
- Pilot or production readiness
- Document requirements
- Owner and reviewer roles
- Applicability by diagnosis, protocol, body region, and laterality

Template statuses include:

- Active: approved production source.
- Mapping In Progress: understood but not fully field-mapped.
- Draft: not approved for clinical use yet.
- Retired: kept for history only.
- Missing: expected template is not available.

How to use it:

1. Open Templates.
2. Search by source, status, approval, hash, requirement, phase, owner, reviewer, or CPT.
3. Review template readiness.
4. Upload new templates when authorized.
5. Complete or correct field maps.
6. Approve templates only after clinical and operational validation.
7. Retire old sources rather than deleting history.

Only administrators or authorized template managers should change template sources.

## 26. Users & Roles

Use Users & Roles to manage access.

Tabs:

- Users
- Roles
- Permissions

### Users

Use Users to review:

- Name
- Email
- Role
- Location
- Status
- Last login
- MFA

Invite or deactivate users according to clinic policy.

### Roles

Use Roles to review role names, descriptions, user counts, and status.

Keep roles clean and specific. Users should have the least access needed for their job.

### Permissions

Use Permissions to review access by module and role.

Access levels:

- Full
- Edit
- View
- None

If a user cannot complete work they own, check their role and permission level.

## 27. Settings

Use Settings for system-level configuration.

Settings may include:

- Workflow setup
- Template setup
- Storage setup
- Dropdown values
- Notifications
- Billing configuration
- Security configuration
- Integration settings

Only authorized administrators should change settings. A settings change can affect routing, documents, billing, audit, or security.

## 28. Security Logs

Use Security Logs to review sensitive activity.

What you can see:

- Timestamp
- User
- Patient or course reference
- Action
- Entity type
- Entity ID
- Previous value
- New value

Use Security Logs when reviewing:

- Patient record access
- Document access
- Signatures
- Settings changes
- User and role changes
- System events

Export logs only when authorized.

## 29. Audit Logs

Use Audit Logs to review system events, document changes, and administrative actions.

Audit Logs are useful when answering:

- Who changed this?
- When did it change?
- What was the old value?
- What is the new value?
- Was the action linked to the correct patient/course?
- Was the change part of normal workflow or an exception?

## 30. Common Workflows

### Start The Day

1. Log in.
2. Open Dashboard.
3. Review urgent warnings.
4. Open Tasks and check your role queue.
5. Open Treatment Delivery for today's treatment queue.
6. Open Documents for pending signatures.
7. Open Audit for closeout blockers.
8. Work items from the owning page.

### Register A New Patient And Course

1. Open Patients.
2. Select Add Patient.
3. Enter required patient fields.
4. Enter initial course details.
5. Save.
6. Open the patient workspace.
7. Confirm workflow, tasks, documents, and audit checks were created.
8. Complete the next action.

### Prepare A Course For Simulation

1. Open the patient workspace.
2. Review Command and Workflow.
3. Complete consult and chart prep tasks.
4. Confirm required clinical forms are complete.
5. Confirm required documents are generated or ready.
6. Mark simulation order signed.
7. Schedule simulation.

### Move From Simulation To Planning

1. Complete simulation or mapping appointment.
2. Upload and tag required imaging.
3. Complete simulation note or mapping form.
4. Open Treatment Planning.
5. Enter required planning parameters.
6. Send to physics review.
7. Route to Rad Onc signature.

### Move From Planning To On-Treatment

1. Confirm planning fields are complete.
2. Confirm imaging gates are clear.
3. Confirm physics review is complete.
4. Confirm Rad Onc signature is complete.
5. Generate the treatment schedule.
6. Confirm fraction worksheet is created.
7. Advance the course in Workflow when gates are clear.

### Record A Daily Fraction

1. Open Treatment Delivery.
2. Find the patient in today's queue.
3. Open the worksheet.
4. Confirm patient, course, date, and fraction number.
5. Enter treatment values.
6. Review live calculation.
7. Record the fraction.
8. Complete DOT and MD approval when appropriate.

### Handle A Blocked Item

1. Open the item from Workflow or Tasks.
2. Change status to Blocked.
3. Enter a specific blocked reason.
4. Assign the owner who can resolve it.
5. Save.
6. Follow up from the blocked queue.

Good blocker reason: "Missing ultrasound image for Fx 4, assigned to RTT to upload evidence."

Poor blocker reason: "Need info."

### Mark An Item N/A

1. Open the item.
2. Change status or applicability to N/A.
3. Enter the reason.
4. Save.

Use N/A only when the item truly does not apply to the course.

### Generate, Sign, And Upload A Document

1. Open Documents or the patient's Documents tab.
2. Find the required document.
3. Confirm required structured fields are complete.
4. Render the document.
5. Review the preview/output.
6. Send for signature.
7. Authorized signer signs.
8. Upload to the required destination.
9. Confirm upload reference.
10. Lock the final evidence.

### Close A Course

1. Confirm final fraction is complete.
2. Complete treatment summary.
3. Confirm follow-up is scheduled.
4. Confirm billing evidence is ready.
5. Confirm all required documents are signed and uploaded.
6. Resolve audit checks.
7. Run Audit & QA review.
8. Complete final audit signoff.
9. Close the course.

## 31. Troubleshooting

### I Cannot Find A Patient

Try:

- Clear table filters.
- Search by patient reference, course reference, diagnosis, or phase.
- Check Upcoming, On Treatment, Post-Treatment, and Patients.
- Ask an administrator to confirm your access.

### I Cannot Save

Check:

- Required fields are complete.
- N/A has a reason.
- Blocked has a reason.
- Reopen has a reason.
- Your role has edit access.
- You are working in the correct patient/course.

### A Course Will Not Advance

Open Workflow and review blockers. Common reasons include:

- Required step incomplete
- Missing signature
- Missing document
- Missing imaging
- Planning not locked
- Fraction worksheet not created
- Audit evidence incomplete
- Billing evidence missing

Resolve the blocker in the owning module, then advance again.

### A Fraction Cannot Be Approved

Check:

- Required imaging evidence is linked.
- Live calculation warnings are resolved.
- Correct fraction values were entered.
- Revision request has been addressed.
- DOT or MD approval is being performed by the correct role.

### A Document Cannot Be Signed

Check:

- Required fields are complete.
- Document has been rendered.
- Reviewer has approved the content.
- The signer has permission.
- The document is not voided or locked.

### A Billing Item Is Not Ready

Check:

- Completed quantity matches treatment records.
- Required documents are linked.
- Required signatures are complete.
- Audit issues are resolved.
- Pre-auth or payer requirements are complete.

### Patient Appears In The Wrong Phase

Do not manually move the patient in an external list. Open the course, check Workflow, and update the course phase by completing or correcting the structured workflow state.

## 32. Glossary

| Term | Meaning |
|---|---|
| Patient | The person receiving care. |
| Course | One treatment plan/workflow for a patient. A patient may have more than one course. |
| Carepath | The ordered workflow steps for a course. |
| Workflow Step | A required or optional step in the Carepath. |
| Task | An actionable work item assigned to a role or user. |
| Clinical Form | A structured form used to collect clinical information. |
| Template | A master source used to generate documents. |
| Document Instance | A patient/course-specific document created from a template or upload. |
| Render | Generate the document output from structured fields. |
| Signature | Formal review and approval by an authorized role. |
| Locked Evidence | Final document or record protected from ordinary edits. |
| Fraction | One delivered radiation treatment session. |
| DOT | Depth of target. |
| OTV | On-treatment visit. |
| Physics Check | Required physics review/check for treatment quality and safety. |
| eCW | External clinical record destination used for uploaded documentation. |
| Audit Check | A closeout requirement used to verify the course is complete and defensible. |
| PHI | Patient-identifying health information that must be protected. |

## 33. Golden Rules

- Work from the patient/course record, not from outside spreadsheets.
- Update structured fields before generating documents.
- Search and filter before assuming a record is missing.
- Use Blocked and N/A carefully, with clear reasons.
- Do not sign, bill, or close work without evidence.
- Use the patient workspace when you need the full picture.
- Use Dashboard and Analytics to find problems, then fix them in the owning module.
- Keep patient information inside approved CureRays systems.
