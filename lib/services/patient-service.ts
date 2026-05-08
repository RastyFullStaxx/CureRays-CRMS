import { operationalPatients } from "@/lib/clinical-store";

export const patientService = {
  listRegistryPatients() {
    return operationalPatients();
  }
};
