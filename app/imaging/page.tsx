export const dynamic = 'force-dynamic';

import { ImagingCommandClient, type ImagingCommandRow } from '@/components/imaging/imaging-command-client';
import {
  moduleSnapshot,
  patientLabel,
  patientMrn,
  phaseLabel,
} from '@/lib/services/operational-page-service';

function modalityForCategory(category: string) {
  if (category.toLowerCase().includes('x-ray')) return 'X-ray';
  if (category.toLowerCase().includes('ultrasound')) return 'Ultrasound';
  if (category.toLowerCase().includes('isodose')) return 'Dosimetry';
  return 'Clinical Photo';
}

export default function ImagingPage() {
  const assets = moduleSnapshot.imagingAssets;
  const categories = moduleSnapshot.imagingCategories;

  const rows: ImagingCommandRow[] = assets.map((asset) => {
    const linkedFractions = moduleSnapshot.fractions.filter((fraction) => fraction.imageAssetIds?.includes(asset.id)).length;
    const modality = modalityForCategory(asset.category);

    return {
      id: asset.id,
      patientId: asset.patientId,
      patient: patientLabel(asset.patientId),
      patientRef: patientMrn(asset.patientId),
      courseId: asset.courseId,
      course: asset.courseId.replace('COURSE-', 'C'),
      name: asset.category,
      modality,
      phase: phaseLabel(asset.phase),
      uploaded: asset.uploadedAt ?? 'Queued',
      uploader: asset.uploadedByUserId ?? 'Unassigned',
      status: asset.uploadedAt ? 'Tagged' : 'Queued',
      filePath: asset.fileIdOrPath ?? 'Pending upload reference',
      notes: asset.notes ?? 'No imaging note recorded',
      linkedFractions,
      requiredForPhase: asset.phase === 'SIMULATION' ? 'Simulation evidence' : 'Planning evidence',
    };
  });

  return (
    <ImagingCommandClient
      rows={rows}
      categories={categories}
      stats={{
        total: rows.length,
        ultrasound: rows.filter((row) => row.modality === 'Ultrasound').length,
        xray: rows.filter((row) => row.modality === 'X-ray').length,
        photos: rows.filter((row) => row.modality === 'Clinical Photo').length,
        missingRequired: Math.max(categories.length - rows.length, 0),
      }}
    />
  );
}
