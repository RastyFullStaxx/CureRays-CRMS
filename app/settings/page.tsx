import { Settings } from "lucide-react";
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
  ViewTabs,
  WorkspaceGrid
} from "@/components/layout/page-layout";
import { SectionCard } from "@/components/section-card";
import { pageMetrics, settingsAreas, viewTabs } from "@/lib/page-layout-data";

export default function SettingsPage() {
  return (
    <AppPageShell>
      <PageHero
        eyebrow="Administration"
        title="Settings"
        description="Configuration placeholders for workflows, templates, dropdowns, storage, notifications, security, diagnosis protocols, and billing code mappings."
        icon={Settings}
        stat={`${settingsAreas.length} areas`}
        actions={<PrimaryAction>Save Configuration</PrimaryAction>}
      />
      <SummaryCardGrid>
        {pageMetrics.settings.map((metric) => (
          <SummaryMetricCard key={metric.label} {...metric} />
        ))}
      </SummaryCardGrid>
      <ViewTabs tabs={viewTabs.settings} />
      <ActionToolbar
        searchPlaceholder="Search settings, templates, roles, dropdowns, storage, or notifications"
        filters={["Users", "Templates", "Storage", "Security", "Billing Codes"]}
      />
      <WorkspaceGrid
        main={
          <>
            <SectionCard title="Configuration Areas" description="Admin controls edit metadata, not hardcoded page logic.">
              <DataTable
                compact
                columns={[{ header: "Area" }, { header: "Purpose" }, { header: "Status" }]}
                rows={settingsAreas.map((setting) => ({
                  id: setting,
                  cells: [
                    <span key="setting" className="font-semibold">{setting}</span>,
                    "Configurable system metadata",
                    "Placeholder"
                  ]
                }))}
              />
            </SectionCard>
            <SectionCard title="Role Permissions Matrix" description="Future RBAC settings align with clinical workflow roles.">
              <DataTable
                compact
                minWidth="820px"
                columns={[{ header: "Permission" }, { header: "Clinical Staff" }, { header: "Physician" }, { header: "Admin" }]}
                rows={["View patients", "Edit patients", "Generate documents", "Sign documents", "Run audit", "Manage templates"].map((permission) => ({
                  id: permission,
                  cells: [permission, "Role-based", "Role-based", "Allowed"]
                }))}
              />
            </SectionCard>
          </>
        }
        rail={
          <>
            <DetailPanel title="Settings Help" subtitle="Configuration detail placeholder" actionLabel="Open selected area">
              <FieldList
                items={[
                  { label: "Selected", value: "Workflow Templates" },
                  { label: "Diagnosis", value: "Skin / Arthritis / Dupuytren's" },
                  { label: "Storage", value: "Drive stub", tone: "warning" },
                  { label: "Security", value: "Audit logging on" }
                ]}
              />
            </DetailPanel>
            <SectionCard title="File Storage Settings" description="Integration boundary for templates, generated files, and Drive sync.">
              <div className="space-y-3 text-sm font-semibold text-[#3D5A80]">
                <p>Template library location: configurable.</p>
                <p>Patient file root: configurable.</p>
                <p>Generated document location: pending Drive integration.</p>
              </div>
            </SectionCard>
          </>
        }
      />
    </AppPageShell>
  );
}
