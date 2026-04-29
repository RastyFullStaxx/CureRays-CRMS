import { FileStack } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import {
  documentRequirements,
  documentTemplates,
  internalFormTemplates,
  templateSources,
  workflowDefinitions
} from "@/lib/clinical-store";
import { carepathPhaseLabels } from "@/lib/workflow";

export default function WorkflowTemplatesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Template registry"
        title="Workflow Templates"
        description="Registry-first tracking for universal, diagnosis-specific, mapped, missing, and evolving Drive templates."
        icon={FileStack}
        stat={`${documentTemplates.length} templates`}
      />

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-glass p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-curerays-orange">Workflow definitions</p>
              <h2 className="mt-1 text-xl font-semibold text-curerays-dark-plum">Flexible workflow catalog</h2>
            </div>
            <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
              {workflowDefinitions.length} workflows
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {workflowDefinitions.map((workflow) => (
              <article key={workflow.id} className="rounded-lg border border-white/72 bg-white/54 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-curerays-dark-plum">{workflow.name}</h3>
                  <span className="rounded-full bg-white/66 px-2 py-1 text-xs font-bold text-curerays-blue">
                    {workflow.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-5 text-curerays-indigo">{workflow.description}</p>
                <p className="mt-3 text-xs font-bold uppercase text-curerays-indigo">
                  {workflow.documentRequirementIds.length} document requirements
                </p>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-glass p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-curerays-orange">Drive source map</p>
              <h2 className="mt-1 text-xl font-semibold text-curerays-dark-plum">Template source status</h2>
            </div>
            <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
              {templateSources.length} sources
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {templateSources.map((source) => (
              <article key={source.id} className="rounded-lg border border-white/72 bg-white/54 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-5 text-curerays-dark-plum">{source.name}</h3>
                  <span className="rounded-full bg-white/66 px-2 py-1 text-xs font-bold text-curerays-indigo">
                    {source.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-curerays-indigo">{source.sourceFileName}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="glass-panel rounded-glass p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-curerays-orange">Document requirements</p>
            <h2 className="mt-1 text-xl font-semibold text-curerays-dark-plum">Universal and diagnosis-specific tracking</h2>
          </div>
          <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
            Intake + AVS included
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {documentRequirements.map((requirement) => (
            <article key={requirement.id} className="rounded-lg border border-white/72 bg-white/54 p-4">
              <p className="text-xs font-bold uppercase text-curerays-indigo">
                {requirement.applicability.universal ? "Universal" : requirement.applicability.diagnosis.replaceAll("_", " ")}
              </p>
              <h3 className="mt-2 text-base font-semibold text-curerays-dark-plum">{requirement.name}</h3>
              <p className="mt-2 text-sm leading-5 text-curerays-indigo">{requirement.requiredAction}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/66 px-2 py-1 text-xs font-bold text-curerays-blue">
                  {carepathPhaseLabels[requirement.workflowPhase]}
                </span>
                <span className="rounded-full bg-white/66 px-2 py-1 text-xs font-bold text-curerays-indigo">
                  {requirement.defaultStatus.replaceAll("_", " ")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

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
      <section className="glass-panel rounded-glass p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-curerays-orange">Internal form engine</p>
            <h2 className="mt-1 text-xl font-semibold text-curerays-dark-plum">Drive templates converted to CRUD forms</h2>
          </div>
          <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-bold text-curerays-indigo">
            {internalFormTemplates.length} form definitions
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {internalFormTemplates.map((template) => (
            <article key={template.id} className="rounded-lg border border-white/72 bg-white/54 p-4">
              <p className="text-xs font-bold uppercase text-curerays-indigo">{template.protocol}</p>
              <h3 className="mt-2 text-base font-semibold text-curerays-dark-plum">{template.name}</h3>
              <p className="mt-2 text-sm leading-5 text-curerays-indigo">{template.sourceFileName}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.outputFormats.map((format) => (
                  <span key={format} className="rounded-full bg-white/66 px-2 py-1 text-xs font-bold text-curerays-blue">
                    {format}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
