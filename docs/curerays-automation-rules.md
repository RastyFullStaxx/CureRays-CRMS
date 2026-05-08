# CureRays Automation Rules

These rules should be implemented as real backend/state logic when persistence and integrations are ready. The current frontend pass exposes service boundaries and placeholders.

1. New course created:
   - Select workflow template by diagnosis.
   - Create applicable Carepath workflow steps 0-14.
   - Assign default responsible roles.
   - Create initial tasks.
   - Create or link patient/course file folder placeholder.

2. Consult completed:
   - Create chart prep tasks.
   - Prepare Carepath Preauth.
   - Prepare Image Guidance Order.
   - Prepare Simulation Order.

3. Simulation Order signed:
   - Allow simulation scheduling.
   - Update related workflow status.

4. Simulation appointment completed:
   - Create Simulation Note task.
   - Create Planning tasks for Device Note, Clinical Treatment Planning Note, Prescription, and Physics review when needed.

5. Planning requirements signed/complete:
   - Allow move to On-Treatment.
   - Create Fractionation Log.
   - Create treatment schedule/fraction records if available.

6. Each fraction recorded:
   - Update cumulative dose.
   - Update fractionation progress.
   - Check OTV due.
   - Check weekly physics check due.
   - Check image guidance completion.

7. Final fraction completed:
   - Move course to Post-Tx.
   - Create Treatment Summary task.
   - Create follow-up scheduling task.
   - Begin audit readiness checks.

8. Treatment Summary, billing, follow-up, documents, signatures, and images complete:
   - Mark audit ready.
   - Create final Carepath Audit Sign task.

9. Final audit signed:
   - Close course.
   - Lock final documents.
   - Record audit log.

## Chart Rounds Sync

The old chart rounds spreadsheet becomes Patients/Registry and Dashboard state. A future chartRoundsSyncService should read/write the master sheet, update phase/status, preserve filter views, and avoid manually moving patients between tabs.
