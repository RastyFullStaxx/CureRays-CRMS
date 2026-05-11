import { CheckCircle2, Eye, FileText, NotebookTabs, PenLine, Plus, RefreshCw, Route, Workflow } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, TabBar, WorkGrid } from "@/components/module-ui";
import { handJointRows } from "@/lib/page-layout-data";
import { clinicalDocumentRows, moduleSnapshot, patientLabel, patientMrn, statusLabel, statusTone } from "@/lib/global-page-data";

export default function ClinicalFormsPage() {
  const templates = moduleSnapshot.clinicalFormTemplates;
  const documents = clinicalDocumentRows;
  const missingFields = documents.filter((document) => document.status === "BLOCKED" || document.status === "NOT_STARTED").length;

  return (
    <ModulePage>
      <ModuleActions>
        <PrimaryButton><Plus className="h-4 w-4" />New Clinical Form</PrimaryButton>
      </ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Drafts" value={documents.filter((document) => document.status === "NOT_STARTED").length || 8} detail="Structured forms" icon={NotebookTabs} />
        <MetricTile label="Ready for Review" value={documents.filter((document) => document.status === "READY_FOR_REVIEW").length || 5} detail="Provider queue" icon={PenLine} tone="purple" />
        <MetricTile label="Signed" value={documents.filter((document) => document.signedAt).length} detail="Completed" icon={CheckCircle2} tone="green" />
        <MetricTile label="Missing Fields" value={missingFields || 4} detail="Need completion" icon={FileText} tone="orange" />
        <MetricTile label="Existing Documents" value={documents.length} detail="Editable through fields" icon={RefreshCw} />
      </MetricGrid>
      <FilterBar search="Search form, document, patient, MRN, status, or reviewer..." filters={["Form Type", "Phase", "Status", "Assigned Staff", "Signature"]} />
      <TabBar tabs={["Existing Patient Documents", "Form Templates", "Drafts", "Pending Signature", "Completed"]} />
      <WorkGrid
        main={
          <>
            <DataTable
              compact
              minWidth="1180px"
              columns={[
                { header: "Document Name" },
                { header: "Patient" },
                { header: "MRN" },
                { header: "Form Type" },
                { header: "Phase" },
                { header: "Status" },
                { header: "Last Updated" },
                { header: "Assigned Staff" },
                { header: "Actions" }
              ]}
              footer={<Pagination label={`Showing 1 to ${documents.length} of ${documents.length} existing documents`} />}
              rows={documents.map((document) => ({
                id: document.id,
                cells: [
                  <span key="title" className="block truncate font-bold text-[#0033A0]">{document.title}</span>,
                  <span key="patient" className="block truncate">{patientLabel(document.patientId)}</span>,
                  patientMrn(document.patientId),
                  document.formType,
                  <Badge key="phase" tone="blue">{document.phase}</Badge>,
                  <Badge key="status" tone={statusTone(document.status)}>{statusLabel(document.status)}</Badge>,
                  document.generatedAt ?? "Pending",
                  document.assignedStaff,
                  <div key="actions" className="flex flex-wrap gap-1.5">
                    <SecondaryButton><Eye className="h-3.5 w-3.5" />Open</SecondaryButton>
                    <SecondaryButton><PenLine className="h-3.5 w-3.5" />Edit Fields</SecondaryButton>
                    <SecondaryButton><RefreshCw className="h-3.5 w-3.5" />Update</SecondaryButton>
                  </div>
                ]
              }))}
            />
            <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
              <div className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
                <h2 className="text-base font-bold text-[#061A55]">Structured Field Editor</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {["Patient Name", "DOS", "Laterality", "Exam Type", "Performed By", "Narrative Note"].map((field, index) => (
                    <label key={field} className={index === 5 ? "sm:col-span-2" : ""}>
                      <span className="text-xs font-bold text-[#3D5A80]">{field}</span>
                      <span className="mt-1 block rounded-lg border border-[#D8E4F5] bg-[#F8FBFF] px-3 py-2 text-xs font-semibold text-[#061A55]">{index === 5 ? "Structured note content updates the preview before document regeneration." : "Mapped field value"}</span>
                    </label>
                  ))}
                </div>
                <DataTable
                  compact
                  minWidth="720px"
                  columns={[{ header: "Zone" }, { header: "JS Narrowing" }, { header: "Osteophytes" }, { header: "Sclerosis" }, { header: "Decision" }]}
                  rows={handJointRows.slice(0, 5).map((joint, index) => ({ id: joint, cells: [joint, `${index % 3}`, `${(index + 1) % 3}`, "0-2", index % 2 ? "Include" : "Exclude"] }))}
                />
              </div>
              <div className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
                <h2 className="text-base font-bold text-[#061A55]">Live Document Preview</h2>
                <div className="mt-4 min-h-[360px] rounded-lg border border-[#D8E4F5] bg-[#F8FBFF] p-5 text-xs font-semibold leading-6 text-[#2B2F5F]">
                  <p className="text-center text-sm font-bold text-[#061A55]">Hand Arthritis X-ray Mapping Note</p>
                  <p className="mt-4">Structured fields render into the mapped note preview. Staff confirm updates before generating a new document version.</p>
                  <div className="mt-4 rounded-lg border border-[#D8E4F5] bg-white p-3">Preview {"->"} Confirm Update {"->"} Generate/Update Document {"->"} Save Version {"->"} Route for Signature</div>
                </div>
              </div>
            </section>
          </>
        }
        rail={
          <>
            <RightRailCard title="Form Summary">
              <div className="space-y-2">
                <ListItem title="Structured edit flow" meta="Fields update previews, not raw document text" badge={<Badge tone="green">Mapped</Badge>} />
                <ListItem title="Existing documents" meta={`${documents.length} can be reopened through fields`} />
              </div>
            </RightRailCard>
            <RightRailCard title="Missing Field Queue">
              <div className="space-y-2">
                {documents.slice(0, 3).map((document) => <ListItem key={document.id} title={document.title} meta={`${patientLabel(document.patientId)} - ${document.phase}`} badge={<Badge tone="orange">Fields</Badge>} />)}
              </div>
            </RightRailCard>
            <RightRailCard title="Form Templates">
              <div className="space-y-2">
                {templates.map((template) => <ListItem key={template.id} title={template.name} meta={`${template.diagnosisType} - ${template.schema.length} sections`} />)}
              </div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[
                { label: "Edit Fields", meta: "Open structured editor", icon: <PenLine className="h-4 w-4" /> },
                { label: "Preview", meta: "Validate mapped output", icon: <Eye className="h-4 w-4" /> },
                { label: "Route for Signature", meta: "Send provider review", icon: <Route className="h-4 w-4" /> },
                { label: "View Versions", meta: "Document history", icon: <Workflow className="h-4 w-4" /> }
              ]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
