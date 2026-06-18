import { PatientRegistryClient } from '@/components/patients/patient-registry-client';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';
import { patientService } from '@/lib/services/patient-service';

export default async function TodayPage() {
  const persistenceMode = (process.env.CURERAYS_PATIENT_REPOSITORY ?? process.env.CURERAYS_PERSISTENCE_MODE ?? '')
    .trim()
    .toLowerCase();
  const usePrismaStore = persistenceMode === 'prisma' || persistenceMode === 'prisma-ready';

  await hydrateClinicalStoreFromDatabase({
    force: usePrismaStore,
  });

  const rows = patientService
    .listRegistryRows()
    .filter((row) => row.openTasks > 0 || row.pendingDocuments > 0 || row.flags > 0);

  return (
    <PatientRegistryClient
      rows={rows}
      title="Today"
      subtitle="Patient records that need action today. Open the patient, then complete the work inside the record."
      showAddPatient={false}
      empty="No patient records need action today."
    />
  );
}
