import { Camera, FileImage, Image as ImageIcon, Plus, Upload } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, QuickActions, RightRailCard, RowActions, SecondaryButton, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, phaseLabel } from "@/lib/global-page-data";

export default function ImagingPage() {
  const assets = moduleSnapshot.imagingAssets;
  const categories = moduleSnapshot.imagingCategories;

  return (
    <ModulePage>
      <ModuleActions>
        <SecondaryButton><Upload className="h-4 w-4" />Upload Imaging</SecondaryButton>
        <PrimaryButton><Plus className="h-4 w-4" />New Imaging Study</PrimaryButton>
      </ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Total Assets" value={assets.length} detail="Tagged records" icon={ImageIcon} />
        <MetricTile label="Ultrasound" value={assets.filter((asset) => asset.category.toLowerCase().includes("ultrasound")).length} detail="US/IGSRT" icon={FileImage} tone="green" />
        <MetricTile label="X-ray" value={assets.filter((asset) => asset.category.toLowerCase().includes("x-ray")).length} detail="Mapping" icon={Camera} tone="purple" />
        <MetricTile label="Clinical Photos" value={assets.filter((asset) => asset.category.toLowerCase().includes("lesion")).length} detail="Skin evidence" icon={ImageIcon} tone="orange" />
        <MetricTile label="Missing Required" value={Math.max(categories.length - assets.length, 0)} detail="Asset gaps" icon={Upload} tone="red" />
      </MetricGrid>
      <FilterBar search="Search modality, category, phase, patient, uploader, or status..." filters={["Modality", "Phase", "Patient", "Date", "Uploader", "Status"]} />
      <WorkGrid
        main={
          <>
            <DataTable
              compact
              minWidth="1060px"
              columns={[{ header: "Preview" }, { header: "Study Name" }, { header: "Patient / Course" }, { header: "Modality" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Uploader" }, { header: "Status" }, { header: "Actions" }]}
              footer={<Pagination label={`Showing 1 to ${assets.length} of ${assets.length} assets`} />}
              rows={assets.map((asset) => ({
                id: asset.id,
                cells: [
                  <span key="preview" className="grid h-10 w-10 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]"><ImageIcon className="h-5 w-5" /></span>,
                  <span key="name" className="block truncate font-bold text-[#0033A0]">{asset.category}</span>,
                  <span key="patient" className="block truncate">{patientLabel(asset.patientId)} / {asset.courseId.replace("COURSE-", "C")}</span>,
                  asset.category.includes("X-ray") ? "X-ray" : asset.category.includes("Ultrasound") ? "Ultrasound" : "Clinical Photo",
                  <Badge key="phase" tone="blue">{phaseLabel(asset.phase)}</Badge>,
                  asset.uploadedAt ?? "Pending",
                  asset.uploadedByUserId ?? "Unassigned",
                  <Badge key="status" tone={asset.uploadedAt ? "green" : "orange"}>{asset.uploadedAt ? "Tagged" : "Queued"}</Badge>,
                  <RowActions key="actions" />
                ]
              }))}
            />
            <section className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
              {categories.slice(0, 10).map((category) => (
                <div key={category} className="rounded-lg border border-[#D8E4F5] bg-white p-3 shadow-[0_8px_18px_rgba(0,51,160,0.04)]">
                  <p className="line-clamp-2 text-xs font-bold text-[#061A55]">{category}</p>
                  <p className="mt-2 text-[11px] font-semibold text-[#3D5A80]">{assets.some((asset) => asset.category === category) ? "Present" : "Required gap"}</p>
                </div>
              ))}
            </section>
          </>
        }
        rail={
          <>
            <RightRailCard title="Imaging Summary">
              <div className="space-y-2"><ListItem title="Required categories" meta={`${categories.length} tracked`} /><ListItem title="Storage used" meta="12.4 GB of 100 GB" /></div>
            </RightRailCard>
            <RightRailCard title="Recent Uploads">
              <div className="space-y-2">{assets.slice(0, 5).map((asset) => <ListItem key={asset.id} title={asset.category} meta={`${patientLabel(asset.patientId)} - ${asset.uploadedByUserId}`} icon={<ImageIcon className="h-4 w-4" />} />)}</div>
            </RightRailCard>
            <RightRailCard title="Required Asset Gaps">
              <div className="space-y-2">{categories.filter((category) => !assets.some((asset) => asset.category === category)).slice(0, 5).map((category) => <ListItem key={category} title={category} meta="Missing required image" badge={<Badge tone="orange">Gap</Badge>} />)}</div>
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[{ label: "Upload New Study", icon: <Upload className="h-4 w-4" /> }, { label: "Create Imaging Study", icon: <Plus className="h-4 w-4" /> }, { label: "Link Existing Images", icon: <FileImage className="h-4 w-4" /> }]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
