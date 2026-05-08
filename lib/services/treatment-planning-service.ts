import { getTreatmentPlans } from "@/lib/module-data";

export const treatmentPlanningService = {
  listPlans() {
    return getTreatmentPlans();
  },
  calculateDoseToDepth(dosePerFraction: number, percentDepthDose: number) {
    return Math.round(dosePerFraction * (percentDepthDose / 100));
  }
};
