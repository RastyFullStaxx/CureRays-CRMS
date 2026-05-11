import { Archive, Copy, Eye, FileText, Plus, Upload } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, WorkGrid } from "@/components/module-ui";
import { templateRows } from "@/lib/global-page-data";

export default function TemplatesPage() {
  const active = templateRows.filter((template) => template.status === "Active").length;
  const documentTemplates = templateRows.filter((template) => template.type.includes("Document")).length;
  const workflowTemplates = templateRows.filter((template) => template.type.includes("Workflow")).length;
  const clinicalForms = templateRows.filter((template) => template.type.includes("Clinical")).length;
  const needsReview = templateRows.filter((template) => template.status !== "Active").length;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Upload className="h-4 w-4" />Upload Template</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />Create Template</PrimaryButton>
      </ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Active Templates" value={active} detail="Published" icon={FileText} />
        <MetricTile label="Document Templates" value={documentTemplates} detail="Generated outputs" icon={FileText} />
        <MetricTile label="Workflow Templates" value={workflowTemplates} detail="Carepath logic" icon={Copy} tone="green" />
        <MetricTile label="Clinical Forms" value={clinicalForms} detail="Structured forms" icon={Eye} tone="purple" />
        <MetricTile label="Needs Review" value={needsReview} detail="Draft or mapping" icon={Archive} tone="orange" />
      </MetricGrid>
      <FilterBar search="Search templates by name, type, diagnosis, status, or owner..." filters={["Type", "Diagnosis", "Status", "Owner"]} />
      <WorkGrid
        main={
          <DataTable
            compact
            minWidth="1020px"
            columns={[{ header: "Template Name" }, { header: "Type" }, { header: "Diagnosis" }, { header: "Version" }, { header: "Status" }, { header: "Last Updated" }, { header: "Owner" }, { header: "Actions" }]}
            footer={<Pagination label={`Showing 1 to ${Math.min(8, templateRows.length)} of ${templateRows.length} templates`} />}
            rows={templateRows.slice(0, 8).map((template) => ({ id: template.name, cells: [<span key="name" className="block truncate font-bold text-[#0033A0]">{template.name}</span>, <Badge key="type" tone="blue">{template.type}</Badge>, template.diagnosis, template.version, <Badge key="status" tone={template.status === "Active" ? "green" : "orange"}>{template.status}</Badge>, template.updated, template.owner, <RowActions key="actions" />] }))}
          />
        }
        rail={
          <>
            <RightRailCard title="Template Details"><ListItem title={templateRows[0]?.name ?? "Template"} meta="Registry-backed source mapping" badge={<Badge tone="green">Active</Badge>} /></RightRailCard>
            <RightRailCard title="Recent Changes"><div className="space-y-2">{templateRows.slice(0, 4).map((template) => <ListItem key={template.name} title={`${template.name} updated`} meta={`${template.owner} - ${template.updated}`} />)}</div></RightRailCard>
            <RightRailCard title="Quick Actions"><QuickActions actions={[{ label: "Create Template", icon: <Plus className="h-4 w-4" /> }, { label: "Upload Template", icon: <Upload className="h-4 w-4" /> }, { label: "Duplicate", icon: <Copy className="h-4 w-4" /> }, { label: "Preview", icon: <Eye className="h-4 w-4" /> }, { label: "Archive", icon: <Archive className="h-4 w-4" /> }]} /></RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
