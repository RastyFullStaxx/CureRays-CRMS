import { CheckCircle2, Eye, FileCheck2, FileText, PenLine, Plus, RefreshCw, Upload } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, TabBar, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, phaseLabel, statusLabel, statusTone } from "@/lib/global-page-data";

export default function DocumentsPage() {
  const documents = moduleSnapshot.documents;
  const generated = moduleSnapshot.generatedDocuments;
  const pending = documents.filter((document) => ["READY_FOR_REVIEW", "PENDING"].includes(document.status)).length;
  const signed = documents.filter((document) => document.signedAt).length;
  const uploaded = documents.filter((document) => document.uploadedToEcwAt).length;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Upload className="h-4 w-4" />Upload Document</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />Create from Template</PrimaryButton>
      </ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Total Documents" value={documents.length} detail="All records" icon={FileText} />
        <MetricTile label="Ready for Review" value={pending} detail="Needs check" icon={Eye} tone="purple" />
        <MetricTile label="Pending Signatures" value={generated.filter((document) => document.signReviewState === "READY_FOR_SIGNATURE").length} detail="Signature queue" icon={PenLine} tone="orange" />
        <MetricTile label="Completed/Signed" value={signed} detail="Locked evidence" icon={CheckCircle2} tone="green" />
        <MetricTile label="Uploaded/eCW" value={uploaded} detail="External upload" icon={Upload} />
      </MetricGrid>
      <FilterBar search="Search document, patient, course, category, signature, or eCW status..." filters={["Category", "Status", "Phase", "Uploader", "Date Range"]} />
      <TabBar tabs={["All Documents", "Ready for Review", "Pending Signatures", "Completed", "Uploaded/eCW"]} />
      <WorkGrid
        main={
          <DataTable
            compact
            minWidth="1120px"
            columns={[{ header: "Document" }, { header: "Patient / Course" }, { header: "Category" }, { header: "Phase" }, { header: "Status" }, { header: "Version" }, { header: "Updated" }, { header: "Signature" }, { header: "eCW" }, { header: "Actions" }]}
            footer={<Pagination label={`Showing 1 to ${documents.length} of ${documents.length} documents`} />}
            rows={documents.map((document) => ({
              id: document.id,
              cells: [
                <span key="doc" className="block truncate font-bold text-[#0033A0]">{document.title}</span>,
                <span key="patient" className="block truncate">{patientLabel(document.patientId)} / {document.courseId.replace("COURSE-", "C")}</span>,
                document.category,
                <Badge key="phase" tone="blue">{phaseLabel(document.category)}</Badge>,
                <Badge key="status" tone={statusTone(document.status)}>{statusLabel(document.status)}</Badge>,
                `v${document.version}`,
                document.generatedAt ?? "Pending",
                document.signedAt ? <Badge key="signed" tone="green">Signed</Badge> : <Badge key="sig" tone="orange">Pending</Badge>,
                document.uploadedToEcwAt ? <Badge key="ecw" tone="green">Uploaded</Badge> : <Badge key="ecw2" tone="slate">Not Sent</Badge>,
                <RowActions key="actions" />
              ]
            }))}
          />
        }
        rail={
          <>
            <RightRailCard title="Document Storage">
              <div className="space-y-2"><ListItem title="Generated outputs" meta="DOCX, PDF, XLSX, PPTX" /><ListItem title="Version control" meta="New versions saved after regeneration" /></div>
            </RightRailCard>
            <RightRailCard title="Recent Activity">
              <div className="space-y-2">{generated.slice(0, 5).map((document) => <ListItem key={document.id} title={document.name} meta={`${document.assignedTo} - ${document.lastUpdatedAt}`} badge={<Badge tone={statusTone(document.status)}>{statusLabel(document.status)}</Badge>} />)}</div>
            </RightRailCard>
            <RightRailCard title="Signature Queue">
              <div className="space-y-2">{generated.filter((document) => document.signReviewState !== "SIGNED").slice(0, 4).map((document) => <ListItem key={document.id} title={document.name} meta={document.requiredAction} badge={<Badge tone="orange">Sign</Badge>} />)}</div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[
                { label: "Request Signature", icon: <PenLine className="h-4 w-4" /> },
                { label: "Preview Document", icon: <Eye className="h-4 w-4" /> },
                { label: "View Versions", icon: <FileCheck2 className="h-4 w-4" /> },
                { label: "Regenerate", icon: <RefreshCw className="h-4 w-4" /> }
              ]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
