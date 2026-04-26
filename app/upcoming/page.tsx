import { PhaseView } from "@/components/phase-view";
import { carepathTasks, fractionLogEntries, generatedDocuments, patients, treatmentCourses } from "@/lib/mock-data";

export default function UpcomingPage() {
  return (
    <PhaseView
      phase="UPCOMING"
      patients={patients}
      courses={treatmentCourses}
      tasks={carepathTasks}
      documents={generatedDocuments}
      fractions={fractionLogEntries}
    />
  );
}
