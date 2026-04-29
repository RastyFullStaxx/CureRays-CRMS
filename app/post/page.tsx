import { PhaseView } from "@/components/phase-view";
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses
} from "@/lib/clinical-store";

export default function PostPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();

  return (
    <PhaseView
      phase="POST"
      patients={patients}
      courses={treatmentCourses}
      tasks={carepathTasks}
      documents={generatedDocuments}
      fractions={fractionLogEntries}
    />
  );
}
