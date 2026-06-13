export const dynamic = 'force-dynamic';

import { AlertTriangle, CalendarCheck2, PenLine, Radiation, ShieldCheck } from "lucide-react";
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { PrototypeActionButton } from '@/components/shared/prototype-action-button';
import { SerializedDataTable, type SerializedTableRow } from '@/components/shared/serialized-data-table';
import { Badge } from '@/components/ui/badge';
import {
  getPhase6GateStatuses,
  getPhase6PlanningReadiness,
  moduleSnapshot,
  patientLabel,
  responsiblePartyName,
  statusLabel,
  statusTone
} from "@/lib/services/operational-page-service";

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
  const rows: SerializedTableRow[] = plans.map((plan) => ({
    id: plan.id,
    planId: plan.id,
    patientCourse: `${patientLabel(plan.patientId)} / ${plan.courseId.replace("COURSE-", "C")}`,
    diagnosis: plan.diagnosisType,
    diagnosisTone: plan.diagnosisType === "Skin" ? "info" : "primary",
    site: plan.site,
    energy: plan.energy ?? "Pending",
    applicator: plan.applicatorSize ?? "Pending",
    doi: plan.depthOfInvasion ?? "Pending",
    dose: plan.dosePerFraction ?? "Pending",
    totalDose: plan.totalDose ?? "Pending",
    fractions: plan.totalFractions ?? "Pending",
    coverage: plan.percentDepthDose ? `${plan.percentDepthDose}%` : "Pending",
    readiness: plan.readiness.status.replaceAll("_", " "),
    readinessTone: plan.readiness.missingInputs.length ? "warning" : "info",
    readinessNotes: plan.readiness.missingInputs.slice(0, 2).join(", ") || "Complete",
    schedule: `${plan.readiness.scheduledFractions}/${plan.readiness.plannedFractions || plan.totalFractions || 0}`,
    gates: `IMG ${plan.gates.imagingGateStatus.dueFractions.length}, PHYS ${plan.gates.physicsCheckDueStatus.dueFractions.length}, OTV ${plan.gates.otvDueStatus.dueFractions.length}`,
    signoff: `${plan.readiness.clinicianSignoffStatus} (${plan.readiness.clinicalValidationChecklist.referenceVersion})`,
    physics: statusLabel(plan.physicistReviewStatus),
    physicsTone: statusTone(plan.physicistReviewStatus),
    radOnc: statusLabel(plan.radOncSignatureStatus),
    radOncTone: statusTone(plan.radOncSignatureStatus),
    status: plan.lockedAt ? "Locked" : "In Progress",
    statusTone: statusTone(plan.lockedAt ? "SIGNED" : "IN_PROGRESS"),
    worksheetHref: `/patients/${plan.patientId}?tab=fractions`,
    scheduleDescription: plan.readiness.missingInputs.length
      ? `Planning schedule is blocked by ${plan.readiness.missingInputs.slice(0, 2).join(", ")}.`
      : "Generate the demo schedule from prescription, clinical gates, and fraction cadence.",
  }));

  return (
    <PageStack>
      <PageHeader
        title="Treatment Planning"
        subtitle="Plan creation, physics review, and signature routing"
        actions={<PrototypeActionButton label="New Plan" icon="plus" kind="create" variant="primary" description="Stage a treatment plan with prescription, review, and schedule gates." />}
      />
      <StatGrid>
        <StatCard icon={Radiation} label="Plans in Progress" value={plans.length - locked} sub="Open planning work" />
        <StatCard icon={ShieldCheck} label="Physics Review" value={physics} sub="Physicist queue" tone="info" />
        <StatCard icon={PenLine} label="Rad Onc Signature" value={radOnc} sub="Ready to sign" tone="primary" />
        <StatCard icon={CalendarCheck2} label="Schedules" value={`${scheduled}/${plans.length}`} sub="Generated from Rx" tone="success" />
        <StatCard icon={AlertTriangle} label="Gated" value={gated} sub="Imaging or review gates" tone="warning" />
        <StatCard icon={ShieldCheck} label="Clinical Gate" value={clinicalGateBlocked} sub="Production sign-off required" tone="warning" />
      </StatGrid>
      <SerializedDataTable
        columns={[
          { key: 'planId', label: 'Plan ID', kind: 'primary' },
          { key: 'patientCourse', label: 'Patient / Course' },
          { key: 'diagnosis', label: 'Diagnosis', kind: 'status', toneKey: 'diagnosisTone' },
          { key: 'site', label: 'Site', kind: 'longText' },
          { key: 'energy', label: 'Energy' },
          { key: 'applicator', label: 'Applicator' },
          { key: 'doi', label: 'DOI' },
          { key: 'dose', label: 'Dose' },
          { key: 'totalDose', label: 'Total Dose' },
          { key: 'fractions', label: 'Fractions' },
          { key: 'coverage', label: 'Coverage' },
          { key: 'readiness', label: 'Readiness', kind: 'status', toneKey: 'readinessTone' },
          { key: 'readinessNotes', label: 'Missing Inputs', kind: 'longText' },
          { key: 'schedule', label: 'Schedule' },
          { key: 'gates', label: 'Gates', kind: 'longText' },
          { key: 'signoff', label: 'Sign-off', kind: 'longText' },
          { key: 'physics', label: 'Physics', kind: 'status', toneKey: 'physicsTone' },
          { key: 'radOnc', label: 'Rad Onc', kind: 'status', toneKey: 'radOncTone' },
          { key: 'status', label: 'Status', kind: 'status' },
          {
            key: 'actions',
            label: 'Actions',
            kind: 'actions',
            actions: [
              { label: 'Schedule', icon: 'calendar', kind: 'schedule', descriptionKey: 'scheduleDescription' },
              { label: 'Worksheet', hrefKey: 'worksheetHref' },
            ],
          },
        ]}
        rows={rows}
        empty="No treatment plans are available."
        emptyDescription="Plan rows will appear after course planning data is initialized."
        pageSize={10}
        search={{
          placeholder: 'Search patient, MRN, diagnosis, site, energy, or plan status...',
          keys: ['planId', 'patientCourse', 'diagnosis', 'site', 'energy', 'applicator', 'readiness', 'readinessNotes', 'physics', 'radOnc', 'status'],
        }}
        filters={[
          { id: 'diagnosis', label: 'Diagnosis' },
          { id: 'status', label: 'Status' },
          { id: 'physics', label: 'Physics' },
          { id: 'radOnc', label: 'Rad Onc' },
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
