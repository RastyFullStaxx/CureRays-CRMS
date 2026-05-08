# CureRays Workflow Model

The workflow engine uses detailed internal phases while the dashboard preserves the simpler chart-rounds phase model.

## Dashboard Phases

- Upcoming
- On Treatment
- Post

These are filtered views of patient/course state. Patients should not be manually moved between tabs.

## Detailed Internal Phases

- Consultation
- Chart Prep
- Simulation
- Planning
- On-Treatment
- Post-Tx
- Audit
- Closed

## Status Values

- Not Started
- Pending
- In Progress
- Ready for Review
- Signed
- Uploaded
- Completed
- N/A
- Blocked
- Overdue
- Closed

Items marked N/A must include a reason before the state is saved.

## Canonical Carepath Steps

0. Carepath Preauth
1. Image Guidance Order
2. Simulation Order
3. Simulation Note
4. Construct Treatment Device Note
5. Clinical Treatment Planning Note
6. Special Physics Consult Note
7. Orthovoltage Radiation Prescription
8. Fractionation Log
9. Special Treatment Procedure
10. OTV / Treatment Management Notes
11. Weekly Physics Chart Check Note
12. In-Vivo Dosimetry Note
13. Treatment Summary
14. Carepath Audit Note Sign

When a course is created, the app selects the correct workflow template by diagnosis/protocol, creates the applicable steps, assigns default roles, creates initial tasks, and creates or links the patient/course file folder placeholder.
