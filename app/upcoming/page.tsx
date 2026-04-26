import { PhaseView } from "@/components/phase-view";
import { patients } from "@/lib/mock-data";

export default function UpcomingPage() {
  return <PhaseView phase="Upcoming" patients={patients} />;
}
