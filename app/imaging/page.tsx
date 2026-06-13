export const dynamic = 'force-dynamic';

import { Camera, FileImage, Image as ImageIcon, Upload } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { moduleSnapshot, patientLabel, phaseLabel } from "@/lib/services/operational-page-service";

export default function ImagingPage() {
  const assets = moduleSnapshot.imagingAssets;
  const categories = moduleSnapshot.imagingCategories;
  const rows: SerializedTableRow[] = assets.map((asset) => {
    const modality = asset.category.includes("X-ray") ? "X-ray" : asset.category.includes("Ultrasound") ? "Ultrasound" : "Clinical Photo";
    return {
      id: asset.id,
      preview: "Image",
      name: asset.category,
      patientCourse: `${patientLabel(asset.patientId)} / ${asset.courseId.replace("COURSE-", "C")}`,
      modality,
      phase: phaseLabel(asset.phase),
      uploaded: asset.uploadedAt ?? "",
      uploader: asset.uploadedByUserId ?? "Unassigned",
      status: asset.uploadedAt ? "Tagged" : "Queued",
      statusTone: asset.uploadedAt ? "green" : "orange",
    };
  });

  return (
    <PageStack>
      <PageHeader
        title="Imaging"
        subtitle="Manage imaging assets and required categories"
        actions={
          <>
            <PrototypeActionButton label="Upload Imaging" icon="upload" kind="upload" description="Stage imaging evidence with category and phase metadata." />
            <PrototypeActionButton label="New Imaging Study" icon="plus" kind="create" variant="primary" description="Create a prototype imaging study record linked to a course phase." />
          </>
        }
      />
      <StatGrid>
        <StatCard icon={ImageIcon} label="Total Assets" value={assets.length} sub="Tagged records" />
        <StatCard icon={FileImage} label="Ultrasound" value={assets.filter((asset) => asset.category.toLowerCase().includes("ultrasound")).length} sub="US/IGSRT" tone="success" />
        <StatCard icon={Camera} label="X-ray" value={assets.filter((asset) => asset.category.toLowerCase().includes("x-ray")).length} sub="Mapping" tone="primary" />
        <StatCard icon={ImageIcon} label="Clinical Photos" value={assets.filter((asset) => asset.category.toLowerCase().includes("lesion")).length} sub="Skin evidence" tone="warning" />
        <StatCard icon={Upload} label="Missing Required" value={Math.max(categories.length - assets.length, 0)} sub="Asset gaps" tone="error" />
      </StatGrid>
      <SerializedDataTable
        columns={[
          { key: 'preview', label: 'Preview', kind: 'icon' },
          { key: 'name', label: 'Study Name', kind: 'primary' },
          { key: 'patientCourse', label: 'Patient / Course' },
          { key: 'modality', label: 'Modality', kind: 'badge', variant: 'info' },
          { key: 'phase', label: 'Phase', kind: 'badge', variant: 'info' },
          { key: 'uploaded', label: 'Uploaded', kind: 'date' },
          { key: 'uploader', label: 'Uploader' },
          { key: 'status', label: 'Status', kind: 'status' },
        ]}
        rows={rows}
        empty="No imaging assets are available."
        emptyDescription="Tagged imaging evidence will appear after assets are attached to a course."
        pageSize={10}
        search={{
          placeholder: 'Search modality, category, phase, patient, uploader, or status...',
          keys: ['name', 'patientCourse', 'modality', 'phase', 'uploader', 'status'],
        }}
        filters={[
          { id: 'modality', label: 'Modality' },
          { id: 'phase', label: 'Phase' },
          { id: 'status', label: 'Status' },
        ]}
      />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {categories.slice(0, 10).map((category) => (
          <div key={category} className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border-soft)', background: 'var(--color-card)', boxShadow: 'var(--shadow-card)' }}>
            <p className="line-clamp-2 text-xs font-bold" style={{ color: 'var(--color-text)' }}>{category}</p>
            <p className="mt-2 text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              {assets.some((asset) => asset.category === category) ? "Present" : "Required gap"}
            </p>
          </div>
        ))}
      </div>
    </PageStack>
  );
}
