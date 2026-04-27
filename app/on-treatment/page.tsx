import { PhaseView } from "@/components/phase-view";
import { carepathTasks, fractionLogEntries, generatedDocuments, patients, treatmentCourses } from "@/lib/clinical-store";

export default function OnTreatmentPage() {
  return (
    <PhaseView
      phase="ON_TREATMENT"
      patients={patients}
      courses={treatmentCourses}
      tasks={carepathTasks}
      documents={generatedDocuments}
      fractions={fractionLogEntries}
    />
  );
}
