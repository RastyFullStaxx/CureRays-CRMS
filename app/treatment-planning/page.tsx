'use client';
import { AlertTriangle, CheckCircle2, LockKeyhole, PenLine, Plus, Radiation, Send, ShieldCheck } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { moduleSnapshot, patientLabel, statusLabel, statusTone } from "@/lib/global-page-data";
import { mapTone } from "@/lib/status-utils";

export default function TreatmentPlanningPage() {
  const plans = moduleSnapshot.plans;
  const physics = plans.filter((plan) => plan.physicistReviewStatus === "READY_FOR_REVIEW").length;
  const radOnc = plans.filter((plan) => plan.radOncSignatureStatus === "READY_FOR_REVIEW").length;
  const locked = plans.filter((plan) => plan.lockedAt).length;

  return (
    <PageStack>
      <PageHeader
        title="Treatment Planning"
        subtitle="Plan creation, physics review, and signature routing"
        actions={<Button disabled title="Prototype placeholder"><Plus className="h-4 w-4" /> New Plan</Button>}
      />
      <StatGrid>
        <StatCard icon={Radiation} label="Plans in Progress" value={plans.length - locked} sub="Open planning work" />
        <StatCard icon={ShieldCheck} label="Physics Review" value={physics} sub="Physicist queue" tone="info" />
        <StatCard icon={PenLine} label="Rad Onc Signature" value={radOnc} sub="Ready to sign" tone="primary" />
        <StatCard icon={CheckCircle2} label="Locked Plans" value={locked} sub="Signed plans" tone="success" />
        <StatCard icon={AlertTriangle} label="Blocked" value={2} sub="Missing inputs" tone="warning" />
      </StatGrid>
      <DataTable
        columns={[
          { key: 'planId', label: 'Plan ID', render: (row) => (
            <span className="font-bold text-[var(--color-primary)]">{row.id}</span>
          )},
          { key: 'patientCourse', label: 'Patient / Course', render: (row) => (
            <span className="block truncate">{patientLabel(row.patientId)} / {row.courseId.replace("COURSE-", "C")}</span>
          )},
          { key: 'diagnosis', label: 'Diagnosis', render: (row) => (
            <Badge variant={row.diagnosisType === "Skin" ? "info" : "primary"}>{row.diagnosisType}</Badge>
          )},
          { key: 'site', label: 'Site', render: (row) => (
            <span className="block truncate">{row.site}</span>
          )},
          { key: 'energy', label: 'Energy', render: (row) => row.energy ?? "Pending" },
          { key: 'applicator', label: 'Applicator', render: (row) => row.applicatorSize ?? "Pending" },
          { key: 'doi', label: 'DOI', render: (row) => row.depthOfInvasion ?? "Pending" },
          { key: 'dose', label: 'Dose', render: (row) => row.dosePerFraction ?? "Pending" },
          { key: 'totalDose', label: 'Total Dose', render: (row) => row.totalDose ?? "Pending" },
          { key: 'fractions', label: 'Fractions', render: (row) => row.totalFractions ?? "Pending" },
          { key: 'coverage', label: 'Coverage', render: (row) => row.percentDepthDose ? `${row.percentDepthDose}%` : "Pending" },
          { key: 'physics', label: 'Physics', render: (row) => (
            <Badge variant={mapTone(statusTone(row.physicistReviewStatus))}>{statusLabel(row.physicistReviewStatus)}</Badge>
          )},
          { key: 'radOnc', label: 'Rad Onc', render: (row) => (
            <Badge variant={mapTone(statusTone(row.radOncSignatureStatus))}>{statusLabel(row.radOncSignatureStatus)}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.lockedAt ? "SIGNED" : "IN_PROGRESS"))}>{row.lockedAt ? "Locked" : "In Progress"}</Badge>
          )},
        ]}
        rows={plans}
        pageSize={10}
        search={{
          placeholder: 'Search patient, MRN, diagnosis, site, energy, or plan status...',
          getText: (row) => [
            row.id,
            patientLabel(row.patientId),
            row.courseId,
            row.diagnosisType,
            row.site,
            row.energy,
            row.applicatorSize,
            row.physicistReviewStatus,
            row.radOncSignatureStatus,
            row.lockedAt ? 'Locked' : 'In Progress',
          ].join(' '),
        }}
        filters={[
          { id: 'diagnosisType', label: 'Diagnosis' },
          { id: 'status', label: 'Status', getValue: (row) => row.lockedAt ? 'Locked' : 'In Progress' },
          { id: 'physics', label: 'Physics', getValue: (row) => statusLabel(row.physicistReviewStatus) },
          { id: 'radOnc', label: 'Rad Onc', getValue: (row) => statusLabel(row.radOncSignatureStatus) },
        ]}
      />
      <div className="grid gap-4 xl:grid-cols-3">
        {["Review Parameters", "Generate Planning Document", "Send to Physics"].map((title, index) => (
          <div key={title} className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{title}</p>
            <p className="mt-2 text-xs font-semibold leading-5" style={{ color: 'var(--color-text-muted)' }}>
              {index === 0 ? "Energy, applicator, DOI, dose, and coverage parameters." : index === 1 ? "Create plan summary from structured fields." : "Route plan to physics review queue."}
            </p>
          </div>
        ))}
      </div>
    </PageStack>
  );
}
