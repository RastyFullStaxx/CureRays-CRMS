import { PhaseView } from "@/components/phase-view";
import { patients } from "@/lib/mock-data";

export default function PostPage() {
  return <PhaseView phase="Post" patients={patients} />;
}
