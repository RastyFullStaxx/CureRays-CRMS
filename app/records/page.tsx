import { Database } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PatientTable } from "@/components/patient-table";
import { RecordsSummary } from "@/components/records-summary";
import { patients } from "@/lib/mock-data";

export default function RecordsPage() {
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
        title="Central patient records"
        description="Operationally useful fields are visible here while sensitive clinical detail stays restricted."
      />
    </div>
  );
}
