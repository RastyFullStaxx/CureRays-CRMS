export const dynamic = 'force-dynamic';

import Link from "next/link";
import { AlertTriangle, CalendarCheck2, ExternalLink, PenLine, Plus, Radiation, ShieldCheck } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phase6PlanningActions } from "@/components/treatment-planning/phase6-planning-actions";
import {
  getPhase6GateStatuses,
  getPhase6PlanningReadiness,
  moduleSnapshot,
  patientLabel,
  responsiblePartyName,
  statusLabel,
  statusTone
} from "@/lib/services/operational-page-service";
import { mapTone } from "@/lib/status-utils";

export default function TreatmentPlanningPage() {
  const plans = moduleSnapshot.plans.map((plan) => ({
    ...plan,
    readiness: getPhase6PlanningReadiness(plan.courseId),
    gates: getPhase6GateStatuses(plan.courseId),
  }));
  const physics = plans.filter((plan) => plan.physicistReviewStatus === "READY_FOR_REVIEW").length;
  const radOnc = plans.filter((plan) => plan.radOncSignatureStatus === "READY_FOR_REVIEW").length;
  const locked = plans.filter((plan) => plan.lockedAt).length;
  const scheduled = plans.filter((plan) => plan.readiness.scheduleGenerated).length;
  const gated = plans.filter((plan) => plan.gates.imagingGateStatus.status === "BLOCKED").length;
  const clinicalValidationChecklist = plans[0]?.readiness.clinicalValidationChecklist;
  const clinicalGateBlocked = plans.filter((plan) => plan.readiness.clinicalValidationChecklist.productionUseBlocked).length;

  return (
    <PageStack>
      <PageHeader
        title="Treatment Planning"
        subtitle="Plan creation, physics review, and signature routing"
        actions={<Button disabled><Plus className="h-4 w-4" /> New Plan</Button>}
      />
      <StatGrid>
        <StatCard icon={Radiation} label="Plans in Progress" value={plans.length - locked} sub="Open planning work" />
        <StatCard icon={ShieldCheck} label="Physics Review" value={physics} sub="Physicist queue" tone="info" />
        <StatCard icon={PenLine} label="Rad Onc Signature" value={radOnc} sub="Ready to sign" tone="primary" />
        <StatCard icon={CalendarCheck2} label="Schedules" value={`${scheduled}/${plans.length}`} sub="Generated from Rx" tone="success" />
        <StatCard icon={AlertTriangle} label="Gated" value={gated} sub="Imaging or review gates" tone="warning" />
        <StatCard icon={ShieldCheck} label="Clinical Gate" value={clinicalGateBlocked} sub="Production sign-off required" tone="warning" />
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
          { key: 'readiness', label: 'Readiness', render: (row) => (
            <div className="grid gap-1">
              <Badge variant={row.readiness.missingInputs.length ? "warning" : "info"}>
                {row.readiness.status.replaceAll("_", " ")}
              </Badge>
              {row.readiness.missingInputs.length ? (
                <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                  {row.readiness.missingInputs.slice(0, 2).join(", ")}
                </span>
              ) : null}
            </div>
          )},
          { key: 'schedule', label: 'Schedule', render: (row) => (
            <span className="font-semibold text-[var(--color-text)]">
              {row.readiness.scheduledFractions}/{row.readiness.plannedFractions || row.totalFractions || 0}
            </span>
          )},
          { key: 'gates', label: 'Gates', render: (row) => (
            <div className="flex flex-wrap gap-1">
              <Badge variant={row.gates.imagingGateStatus.status === "BLOCKED" ? "warning" : "success"}>
                IMG {row.gates.imagingGateStatus.dueFractions.length}
              </Badge>
              <Badge variant={row.gates.physicsCheckDueStatus.dueFractions.length ? "warning" : "success"}>
                PHYS {row.gates.physicsCheckDueStatus.dueFractions.length}
              </Badge>
              <Badge variant={row.gates.otvDueStatus.dueFractions.length ? "warning" : "success"}>
                OTV {row.gates.otvDueStatus.dueFractions.length}
              </Badge>
            </div>
          )},
          { key: 'signoff', label: 'Sign-off', render: (row) => (
            <div className="grid gap-1">
              <Badge variant="warning">{row.readiness.clinicianSignoffStatus}</Badge>
              <span className="text-xs font-semibold text-[var(--color-text-muted)]">
                {row.readiness.clinicalValidationChecklist.referenceVersion}
              </span>
            </div>
          )},
          { key: 'physics', label: 'Physics', render: (row) => (
            <Badge variant={mapTone(statusTone(row.physicistReviewStatus))}>{statusLabel(row.physicistReviewStatus)}</Badge>
          )},
          { key: 'radOnc', label: 'Rad Onc', render: (row) => (
            <Badge variant={mapTone(statusTone(row.radOncSignatureStatus))}>{statusLabel(row.radOncSignatureStatus)}</Badge>
          )},
          { key: 'status', label: 'Status', render: (row) => (
            <Badge variant={mapTone(statusTone(row.lockedAt ? "SIGNED" : "IN_PROGRESS"))}>{row.lockedAt ? "Locked" : "In Progress"}</Badge>
          )},
          { key: 'actions', label: 'Actions', render: (row) => (
            <div className="flex flex-wrap items-center gap-2">
              {!row.readiness.scheduleGenerated ? (
                <Phase6PlanningActions courseId={row.courseId} disabled={row.readiness.missingInputs.length > 0} />
              ) : null}
              <Link href={`/patients/${row.patientId}/fraction-log`}>
                <Button type="button" size="sm" variant="secondary">
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Worksheet
                </Button>
              </Link>
            </div>
          )},
        ]}
        rows={plans}
        empty="No treatment plans are available."
        emptyDescription="Plan rows will appear after course planning data is initialized."
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
            row.readiness.status,
            row.readiness.missingInputs.join(' '),
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
      {clinicalValidationChecklist ? (
        <div className="rounded-[var(--radius-lg)] p-4" style={{ background: 'var(--color-card)', border: 'var(--border-container)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="clinical-label">Phase 6 Clinical Sign-Off Checklist</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">
                Reference {clinicalValidationChecklist.referenceVersion}
              </h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">
                Production clinical use remains blocked until each validation item has documented sign-off.
              </p>
            </div>
            <Badge variant="warning">{clinicalValidationChecklist.status}</Badge>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {clinicalValidationChecklist.items.map((item) => (
              <div key={item.id} className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-[var(--color-text)]">{item.label}</p>
                  <Badge variant="warning">{item.status}</Badge>
                </div>
                <p className="mt-2 text-xs font-bold uppercase text-[var(--color-text-muted)]">
                  {responsiblePartyName(item.ownerRole)}
                </p>
                <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">
                  {item.evidenceRequired}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
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
