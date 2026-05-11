import { AlertTriangle, CheckCircle2, LockKeyhole, PenLine, Plus, Radiation, Send, ShieldCheck } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Badge, FilterBar, ListItem, MetricGrid, MetricTile, ModuleActions, ModulePage, Pagination, PrimaryButton, ProgressRing, QuickActions, RightRailCard, RowActions, WorkGrid } from "@/components/module-ui";
import { moduleSnapshot, patientLabel, statusLabel, statusTone } from "@/lib/global-page-data";

export default function TreatmentPlanningPage() {
  const plans = moduleSnapshot.plans;
  const physics = plans.filter((plan) => plan.physicistReviewStatus === "READY_FOR_REVIEW").length;
  const radOnc = plans.filter((plan) => plan.radOncSignatureStatus === "READY_FOR_REVIEW").length;
  const locked = plans.filter((plan) => plan.lockedAt).length;

  return (
    <ModulePage>
      <ModuleActions><PrimaryButton><Plus className="h-4 w-4" />New Plan</PrimaryButton></ModuleActions>
      <MetricGrid columns={5}>
        <MetricTile label="Plans in Progress" value={plans.length - locked} detail="Open planning work" icon={Radiation} />
        <MetricTile label="Physics Review" value={physics} detail="Physicist queue" icon={ShieldCheck} />
        <MetricTile label="Rad Onc Signature" value={radOnc} detail="Ready to sign" icon={PenLine} tone="purple" />
        <MetricTile label="Locked Plans" value={locked} detail="Signed plans" icon={CheckCircle2} tone="green" />
        <MetricTile label="Blocked" value={2} detail="Missing inputs" icon={AlertTriangle} tone="orange" />
      </MetricGrid>
      <FilterBar search="Search patient, MRN, diagnosis, site, energy, or plan status..." filters={["Diagnosis", "Site", "Energy", "Phase", "Physicist", "Status"]} />
      <WorkGrid
        main={
          <>
            <DataTable
              compact
              minWidth="1120px"
              columns={[
                { header: "Plan ID" },
                { header: "Patient / Course" },
                { header: "Diagnosis" },
                { header: "Site" },
                { header: "Energy" },
                { header: "Applicator" },
                { header: "DOI" },
                { header: "Dose" },
                { header: "Fractions" },
                { header: "Coverage" },
                { header: "Physics" },
                { header: "Rad Onc" },
                { header: "Status" },
                { header: "Actions" }
              ]}
              footer={<Pagination label={`Showing 1 to ${plans.length} of ${plans.length} plans`} />}
              rows={plans.map((plan) => ({
                id: plan.id,
                cells: [
                  <span key="plan" className="font-bold text-[#0033A0]">{plan.id}</span>,
                  <span key="patient" className="block truncate">{patientLabel(plan.patientId)} / {plan.courseId.replace("COURSE-", "C")}</span>,
                  plan.diagnosisType,
                  <span key="site" className="block truncate">{plan.site}</span>,
                  plan.energy ?? "Pending",
                  plan.applicatorSize ?? "Pending",
                  plan.depthOfInvasion ?? "Pending",
                  plan.dosePerFraction ?? "Pending",
                  plan.totalFractions ?? "Pending",
                  plan.percentDepthDose ? `${plan.percentDepthDose}%` : "Pending",
                  <Badge key="physics" tone={statusTone(plan.physicistReviewStatus)}>{statusLabel(plan.physicistReviewStatus)}</Badge>,
                  <Badge key="rad" tone={statusTone(plan.radOncSignatureStatus)}>{statusLabel(plan.radOncSignatureStatus)}</Badge>,
                  <Badge key="status" tone={plan.lockedAt ? "green" : "blue"}>{plan.lockedAt ? "Locked" : "In Progress"}</Badge>,
                  <RowActions key="actions" />
                ]
              }))}
            />
            <section className="grid gap-4 xl:grid-cols-3">
              {["Review Parameters", "Generate Planning Document", "Send to Physics"].map((title, index) => (
                <div key={title} className="rounded-lg border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
                  <p className="text-sm font-bold text-[#061A55]">{title}</p>
                  <p className="mt-2 text-xs font-semibold leading-5 text-[#3D5A80]">{index === 0 ? "Energy, applicator, DOI, dose, and coverage parameters." : index === 1 ? "Create plan summary from structured fields." : "Route plan to physics review queue."}</p>
                </div>
              ))}
            </section>
          </>
        }
        rail={
          <>
            <RightRailCard title="Planning Summary">
              <div className="flex justify-center"><ProgressRing value={80} label="complete" /></div>
            </RightRailCard>
            <RightRailCard title="Review Queue">
              <div className="space-y-2">
                {plans.map((plan) => <ListItem key={plan.id} title={plan.id} meta={`${patientLabel(plan.patientId)} - ${plan.site}`} badge={<Badge tone={statusTone(plan.physicistReviewStatus)}>{statusLabel(plan.physicistReviewStatus)}</Badge>} />)}
              </div>
            </RightRailCard>
            <RightRailCard title="Blockers">
              <ListItem title="Required images incomplete" meta="Planning documents need image evidence" badge={<Badge tone="orange">2</Badge>} />
            </RightRailCard>
            <RightRailCard title="Quick Actions">
              <QuickActions actions={[{ label: "Open Plan", icon: <Radiation className="h-4 w-4" /> }, { label: "Send to Physics", icon: <Send className="h-4 w-4" /> }, { label: "Lock Plan", icon: <LockKeyhole className="h-4 w-4" /> }]} />
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
