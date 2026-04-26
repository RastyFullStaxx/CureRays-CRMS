import { FileStack } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { documentTemplates } from "@/lib/mock-data";
import { carepathPhaseLabels } from "@/lib/workflow";

export default function WorkflowTemplatesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Template registry"
        title="Workflow Templates"
        description="Templates define which documents and data fields may apply to different diagnosis workflows."
        icon={FileStack}
        stat={`${documentTemplates.length} templates`}
      />
      <section className="grid gap-4 md:grid-cols-2">
        {documentTemplates.map((template) => (
          <article key={template.id} className="glass-panel rounded-glass p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-curerays-orange">{template.version}</p>
                <h2 className="mt-2 text-xl font-semibold text-curerays-dark-plum">{template.name}</h2>
              </div>
              <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
                {template.status}
              </span>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-curerays-indigo">
              <p><span className="font-semibold text-curerays-dark-plum">Diagnosis:</span> {template.diagnosis.replaceAll("_", " ")}</p>
              <p><span className="font-semibold text-curerays-dark-plum">Protocol:</span> {template.protocol}</p>
              <p><span className="font-semibold text-curerays-dark-plum">Phase:</span> {carepathPhaseLabels[template.category]}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.requiredFields.map((field) => (
                <span key={field} className="rounded-full bg-white/58 px-3 py-1 text-xs font-semibold text-curerays-indigo">
                  {field}
                </span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
