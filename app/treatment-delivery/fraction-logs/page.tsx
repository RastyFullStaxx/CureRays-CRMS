import { FractionLogCommandClient } from "@/components/treatment-delivery/fraction-log-command-client";
import { PageStack } from "@/components/shared/page-stack";
import { getFractionLogRegistryRows } from "@/lib/services/fraction-log-registry-service";

export default function TreatmentDeliveryFractionLogsPage() {
  const rows = getFractionLogRegistryRows();

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <FractionLogCommandClient rows={rows} />
    </PageStack>
  );
}
