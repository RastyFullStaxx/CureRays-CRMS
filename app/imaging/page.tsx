export const dynamic = 'force-dynamic';

import { Camera, FileImage, Image as ImageIcon, Plus, Upload } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, phaseLabel } from "@/lib/services/operational-page-service";

export default function ImagingPage() {
  const assets = moduleSnapshot.imagingAssets;
  const categories = moduleSnapshot.imagingCategories;

  return (
    <PageStack>
      <PageHeader
        title="Imaging"
        subtitle="Manage imaging assets and required categories"
        actions={
          <>
            <Button variant="secondary" disabled title="Prototype placeholder"><Upload className="h-4 w-4" /> Upload Imaging</Button>
            <Button disabled title="Prototype placeholder"><Plus className="h-4 w-4" /> New Imaging Study</Button>
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
      <DataTable
        columns={[
          { key: 'preview', label: 'Preview', render: () => (
            <span className="grid h-10 w-10 place-items-center rounded-lg" style={{ background: 'color-mix(in srgb, var(--color-primary) 9%, var(--color-card))', color: 'var(--color-primary)' }}>
              <ImageIcon className="h-5 w-5" />
            </span>
          )},
          { key: 'name', label: 'Study Name', render: (row) => (
            <span className="block truncate font-bold text-[var(--color-primary)]">{row.category}</span>
          )},
          { key: 'patientCourse', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{patientLabel(row.patientId)} / {row.courseId.replace("COURSE-", "C")}</span>
          )},
          { key: 'modality', label: 'Modality', render: (row) => (
            <Badge variant="info">{row.category.includes("X-ray") ? "X-ray" : row.category.includes("Ultrasound") ? "Ultrasound" : "Clinical Photo"}</Badge>
          )},
          { key: 'phase', label: 'Phase', render: (row) => (
            <Badge variant="info">{phaseLabel(row.phase)}</Badge>
          )},
          { key: 'uploaded', label: 'Uploaded', render: (row) => row.uploadedAt ? new Date(row.uploadedAt).toLocaleDateString() : "Pending" },
          { key: 'uploader', label: 'Uploader', render: (row) => row.uploadedByUserId ?? "Unassigned" },
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={row.uploadedAt ? "success" : "warning"}>{row.uploadedAt ? "Tagged" : "Queued"}</Badge>
          )},
        ]}
        rows={assets}
        empty="No imaging assets are available."
        emptyDescription="Tagged imaging evidence will appear after mock assets are attached to a course."
        pageSize={10}
        search={{
          placeholder: 'Search modality, category, phase, patient, uploader, or status...',
          getText: (row) => [
            row.category,
            patientLabel(row.patientId),
            row.courseId,
            phaseLabel(row.phase),
            row.uploadedByUserId,
            row.uploadedAt ? 'Tagged' : 'Queued',
          ].join(' '),
        }}
        filters={[
          { id: 'modality', label: 'Modality', getValue: (row) => row.category.includes("X-ray") ? "X-ray" : row.category.includes("Ultrasound") ? "Ultrasound" : "Clinical Photo" },
          { id: 'phase', label: 'Phase', getValue: (row) => phaseLabel(row.phase) },
          { id: 'status', label: 'Status', getValue: (row) => row.uploadedAt ? 'Tagged' : 'Queued' },
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
