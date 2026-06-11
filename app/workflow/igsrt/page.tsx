import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { FractionWorksheetPanel } from '@/components/fraction-worksheet-panel';
import { getIgsrtWorkspace } from '@/lib/clinical-store';

export default function IgsrtWorkflowPage() {
  const workspace = getIgsrtWorkspace('COURSE-2401');

  return (
    <PageStack>
      <PageHeader
        title="IGSRT Tools"
        subtitle="Skin cancer workflow CRUD for simulation order, prescription, fraction log, generated documents, and audit state"
      />

      <FractionWorksheetPanel
        initialEntries={workspace.courseFractions}
        course={workspace.course}
        phases={workspace.prescription.phases}
        title="IGSRT Fractionation Worksheet"
      />
    </PageStack>
  );
}
