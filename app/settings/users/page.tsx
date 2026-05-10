import { LockKeyhole, Settings, ShieldCheck, UserRoundCog } from "lucide-react";
import { DataTable } from "@/components/data-table";
import {
  ActionToolbar,
  AppPageShell,
  DetailPanel,
  FieldList,
  PageHero,
  PrimaryAction,
  SummaryCardGrid,
  SummaryMetricCard,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { pageMetrics } from "@/lib/page-layout-data";

const roles = [
  "Virtual Assistant",
  "Medical Assistant",
  "Therapist",
  "NP / PA",
  "Doctor PCP",
  "Rad Onc",
  "Physicist",
  "Billing Staff",
  "Admin"
];

export default function UsersSettingsPage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Access model"
        title="Users and Roles"
        description="Frontend placeholder for role-based access, secure session cues, and permission-aware workflow actions."
        icon={Settings}
        stat="RBAC"
        actions={<PrimaryAction>Invite User</PrimaryAction>}
      />
      <SummaryCardGrid>
        {pageMetrics.settings.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ActionToolbar searchPlaceholder="Search user, role, email, or permission" filters={["Role", "Status", "Last Login", "Signature Rights"]} />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Role Cards" description="Roles drive task queues, document routing, signatures, and audit visibility.">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {roles.map((role) => (
                  <article key={role} className="rounded-2xl border border-[#D8E4F5] bg-white p-4 shadow-[0_8px_24px_rgba(0,51,160,0.08)]">
                    <UserRoundCog className="h-5 w-5 text-[#0033A0]" aria-hidden="true" />
                    <h2 className="mt-3 text-base font-bold text-[#061A55]">{role}</h2>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#3D5A80]">
                      Placeholder role for task queues, document review, signatures, and audit visibility.
                    </p>
                  </article>
                ))}
              </section>
            </SectionCard>
            <SectionCard title="Permission Matrix" description="Backend-enforced RBAC will attach these permissions to real users.">
              <DataTable
                compact
                columns={[{ header: "Permission" }, { header: "Clinical Staff" }, { header: "Physician" }, { header: "Admin" }]}
                rows={["View patients", "Edit patients", "Generate documents", "Sign documents", "Manage templates", "Run audit"].map((permission) => ({
                  id: permission,
                  cells: [permission, "Scoped", "Scoped", "Allowed"]
                }))}
              />
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Security Posture" subtitle="Authentication boundary" actionLabel="Open access settings">
              <FieldList
                items={[
                  { label: "Auth", value: "Backend pending", tone: "warning" },
                  { label: "Audit Logs", value: "Prepared" },
                  { label: "RBAC", value: "Role-aware UI" },
                  { label: "PHI Exports", value: "Restricted" }
                ]}
              />
            </DetailPanel>
            <SectionCard title="Invite User" description="Disabled until backend auth is implemented.">
              <button
                type="button"
                disabled
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#2E1A47]/20 px-4 py-2 text-sm font-bold text-[#2E1A47]/60"
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Requires backend auth
              </button>
              <div className="mt-4 flex items-start gap-3">
                <ShieldCheck className="mt-1 h-5 w-5 text-[#0033A0]" aria-hidden="true" />
                <p className="text-sm font-semibold leading-6 text-[#3D5A80]">Prepared for backend-enforced RBAC, audit logging, and restricted actions.</p>
              </div>
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
