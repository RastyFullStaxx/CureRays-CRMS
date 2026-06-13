import { FractionLogCommandClient } from "@/components/treatment-delivery/fraction-log-command-client";
import { PageStack } from "@/components/shared/page-stack";
import { getFractionLogRegistryRows } from "@/lib/services/fraction-log-registry-service";

export default function TreatmentDeliveryFractionLogsPage() {
  const rows = getFractionLogRegistryRows();

  return (
    <PageStack>
      <FractionLogCommandClient rows={rows} />
    </PageStack>
  );
}
