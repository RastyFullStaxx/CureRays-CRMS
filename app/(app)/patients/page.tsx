import { PatientRegistryClient } from '@/components/patients/patient-registry-client';
import { patientService } from '@/lib/services/patient-service';
import { hydrateClinicalStoreFromDatabase } from '@/lib/server/database-hydration';

export default async function PatientsPage() {
  const usePrismaStore = (process.env.CURERAYS_PERSISTENCE_MODE ?? "").trim().toLowerCase() === "prisma";

  await hydrateClinicalStoreFromDatabase({
    force: usePrismaStore
  });
  return <PatientRegistryClient rows={patientService.listRegistryRows()} />;
}
