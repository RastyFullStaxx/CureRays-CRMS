import { PatientRegistryClient } from '@/components/patients/patient-registry-client';
import { patientService } from '@/lib/services/patient-service';

export default function PatientsPage() {
  return <PatientRegistryClient rows={patientService.listRegistryRows()} />;
}
