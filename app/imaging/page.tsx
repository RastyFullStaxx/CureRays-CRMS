import { Image } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { imagingAssets, imagingCategories } from "@/lib/module-data";

export default function ImagingPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Attachments and image evidence"
        title="Imaging"
        description="Image and file asset management tied to patient, course, workflow phase, and treatment fraction."
        icon={Image}
        stat={`${imagingAssets.length} assets`}
      />
      <FilterBar searchPlaceholder="Search image category, phase, course, or note" filters={["Category", "Phase", "Fraction", "Required", "Uploaded By"]} />
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <SectionCard title="Required Image Checklist" description="Categories map to document generation and audit evidence.">
          <DataTable
            columns={[{ header: "Category" }, { header: "Required" }, { header: "Status" }]}
            rows={imagingCategories.map((category) => ({
              id: category,
              cells: [category, "Protocol dependent", imagingAssets.some((asset) => asset.category === category) ? "Present" : "Missing"]
            }))}
          />
        </SectionCard>
        <SectionCard title="Image Gallery" description="Preview thumbnails will render when storage integration is configured.">
          {imagingAssets.length ? (
            <DataTable
              columns={[{ header: "Category" }, { header: "Course" }, { header: "Phase" }, { header: "Uploaded" }, { header: "Notes" }]}
              rows={imagingAssets.map((asset) => ({
                id: asset.id,
                cells: [asset.category, asset.courseId, asset.phase.replaceAll("_", " "), asset.uploadedAt ?? "Pending", asset.notes ?? ""]
              }))}
            />
          ) : (
            <EmptyState icon={Image} title="No images yet" description="Uploads will be tagged by category, phase, and fraction." />
          )}
        </SectionCard>
      </section>
    </div>
  );
}
