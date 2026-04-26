import { PhaseView } from "@/components/phase-view";
import { patients } from "@/lib/mock-data";

export default function OnTreatmentPage() {
  return <PhaseView phase="On Treatment" patients={patients} />;
}
