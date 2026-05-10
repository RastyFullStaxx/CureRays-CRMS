import { Image } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { imagingAssets, imagingCategories } from "@/lib/module-data";
import { pageMetrics, viewTabs } from "@/lib/page-layout-data";

export default function ImagingPage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Attachments and image evidence"
        title="Imaging"
        description="Image and file asset management tied to patient, course, workflow phase, and treatment fraction."
        icon={Image}
        stat={`${imagingAssets.length} assets`}
        actions={<PrimaryAction>Upload Images</PrimaryAction>}
      />
      <SummaryCardGrid>
        {pageMetrics.imaging.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.imaging} />
      <ActionToolbar
        searchPlaceholder="Search image category, phase, course, or note"
        filters={["Category", "Phase", "Fraction", "Required Only", "Uploaded By"]}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Image Gallery" description="Gallery cards will render thumbnails after storage integration is configured.">
              {imagingAssets.length ? (
                <DataTable
                  compact
                  minWidth="980px"
                  columns={[{ header: "Category" }, { header: "Course" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Status" }, { header: "Notes" }]}
                  rows={imagingAssets.map((asset) => ({
                    id: asset.id,
                    cells: [
                      <span key="category" className="font-semibold">{asset.category}</span>,
                      asset.courseId,
                      asset.phase.replaceAll("_", " "),
                      asset.uploadedAt ?? "Pending",
                      asset.uploadedAt ? "Tagged" : "Upload queued",
                      asset.notes ?? ""
                    ]
                  }))}
                />
              ) : (
                <EmptyState icon={Image} title="No images yet" description="Uploads will be tagged by category, phase, and fraction." />
              )}
            </SectionCard>
            <SectionCard title="Upload Queue" description="Drawer-ready placeholder for classifying incoming clinical images.">
              <div className="grid gap-3 md:grid-cols-3">
                {["Drag/drop intake", "Select patient/course", "Tag phase/fraction"].map((step) => (
                  <div key={step} className="rounded-xl border border-[#D8E4F5] bg-[#F8FBFF] p-4">
                    <p className="text-sm font-bold text-[#061A55]">{step}</p>
                    <p className="mt-2 text-xs font-semibold leading-5 text-[#3D5A80]">Placeholder action for the future upload drawer.</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </>
        }
        rail={
          <>
            <SectionCard title="Required Image Checklist" description="Categories map to planning, document generation, and audit evidence.">
              <DataTable
                compact
                columns={[{ header: "Category" }, { header: "Status" }]}
                rows={imagingCategories.map((category) => ({
                  id: category,
                  cells: [
                    category,
                    imagingAssets.some((asset) => asset.category === category) ? "Present" : "Missing"
                  ]
                }))}
              />
            </SectionCard>
            <DetailPanel title="Selected Asset" subtitle="Image detail drawer placeholder" actionLabel="Open image detail">
              <FieldList
                items={[
                  { label: "Patient", value: "Patient #P-10321" },
                  { label: "Category", value: imagingAssets[0]?.category ?? "Inked Target" },
                  { label: "Linked Step", value: "Simulation Note" },
                  { label: "Audit Trail", value: "Upload tracked" }
                ]}
              />
            </DetailPanel>
          </>
        }
      />
    </AppPageShell>
  );
}
