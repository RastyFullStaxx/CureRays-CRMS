import { PhaseView } from "@/components/phase-view";
import { carepathTasks, fractionLogEntries, generatedDocuments, patients, treatmentCourses } from "@/lib/mock-data";

export default function PostPage() {
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
