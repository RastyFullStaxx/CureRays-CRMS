import { Database } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";
import { RecordsSummary } from "@/components/records-summary";
import {
  carepathTasks,
  fractionLogEntries,
  generatedDocuments,
  operationalPatients,
  operationalTreatmentCourses
} from "@/lib/clinical-store";

export default function RecordsPage() {
  const patients = operationalPatients();
  const treatmentCourses = operationalTreatmentCourses();

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Master index"
        title="Master Records"
        description="The controlled operational index for CureRays patients. Every workflow page should derive from these records instead of duplicating spreadsheet rows."
        icon={Database}
        stat={`${patients.length} records`}
      />
      <RecordsSummary patients={patients} />
      <PatientTable
        patients={patients}
        courses={treatmentCourses}
        tasks={carepathTasks}
        documents={generatedDocuments}
        fractions={fractionLogEntries}
        title="Central patient records"
        description="Master records now include active course, diagnosis workflow, document progress, and audit readiness signals."
      />
    </div>
  );
}
