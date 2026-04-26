import { FileSignature, LockKeyhole } from "lucide-react";
import type { GeneratedDocument } from "@/lib/types";
import { carepathPhaseLabels, formatLastUpdated } from "@/lib/workflow";
import { DocumentStatusBadge, ResponsiblePartyBadge } from "@/components/badges";

export function DocumentLifecycleTable({ documents }: { documents: GeneratedDocument[] }) {
  return (
    <section className="glass-panel overflow-hidden rounded-glass">
      <div className="flex flex-col gap-2 border-b border-white/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-curerays-dark-plum">Document lifecycle</h3>
          <p className="mt-1 text-sm text-curerays-indigo">
            Tracks required, signed, reviewed, completed, and not-applicable documents.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/60 px-3 py-2 text-xs font-semibold text-curerays-indigo">
          <LockKeyhole className="h-3.5 w-3.5 text-curerays-plum" aria-hidden="true" />
          Template-aware preview
        </span>
      </div>

      <div className="scrollbar-soft overflow-x-auto">
        <table className="min-w-[980px] w-full border-collapse">
          <thead>
            <tr className="bg-white/42 text-left text-xs font-bold uppercase text-curerays-indigo">
              <th scope="col" className="px-5 py-3">Document</th>
              <th scope="col" className="px-5 py-3">Phase</th>
              <th scope="col" className="px-5 py-3">Owner</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3">Action</th>
              <th scope="col" className="px-5 py-3">Code</th>
              <th scope="col" className="px-5 py-3">Audit</th>
              <th scope="col" className="px-5 py-3">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/70">
            {documents.map((document) => (
              <tr key={document.id} className="bg-white/28 transition hover:bg-white/58">
                <td className="px-5 py-4 align-top">
                  <p className="flex items-center gap-2 font-semibold text-curerays-dark-plum">
                    <FileSignature className="h-4 w-4 text-curerays-blue" aria-hidden="true" />
                    {document.name}
                  </p>
                  <p className="mt-1 text-xs text-curerays-indigo">{document.assignedTo}</p>
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-curerays-dark-plum/76">
                  {carepathPhaseLabels[document.clinicalPhase]}
                </td>
                <td className="px-5 py-4 align-top">
                  <ResponsiblePartyBadge party={document.responsibleParty} />
                </td>
                <td className="px-5 py-4 align-top">
                  <DocumentStatusBadge status={document.status} />
                </td>
                <td className="px-5 py-4 align-top text-sm font-medium leading-5 text-curerays-dark-plum/76">
                  {document.requiredAction}
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-curerays-indigo">
                  {document.cptCode ?? "N/A"}
                </td>
                <td className="px-5 py-4 align-top text-sm font-semibold text-curerays-dark-plum">
                  {document.auditReady ? "Ready" : "Blocked"}
                </td>
                <td className="px-5 py-4 align-top text-xs font-semibold text-curerays-indigo">
                  {formatLastUpdated(document.lastUpdatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
