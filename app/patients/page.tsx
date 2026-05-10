import { PatientsRegistry } from "@/components/patients/patients-registry";
import { carepathTasks, patients, treatmentCourses } from "@/lib/clinical-store";

export default function PatientsPage() {
  return <PatientsRegistry patients={patients} courses={treatmentCourses} tasks={carepathTasks} />;
}
