import { Settings } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";

const settings = [
  "Locations",
  "Staff / Providers",
  "Workflow Templates",
  "Document Templates",
  "Clinical Form Templates",
  "CPT / Billing Code Master",
  "Diagnosis / Protocol Settings",
  "Dropdown Values",
  "Notification Rules",
  "File Storage Settings",
  "Security Settings"
];

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Administration"
        title="Settings"
        description="Configuration placeholders for workflows, templates, dropdowns, storage, notifications, security, diagnosis protocols, and billing code mappings."
        icon={Settings}
        stat={`${settings.length} areas`}
      />
      <SectionCard title="Configuration Areas" description="Admin controls will edit metadata, not hardcoded page logic.">
        <DataTable
          columns={[{ header: "Area" }, { header: "Purpose" }, { header: "Status" }]}
          rows={settings.map((setting) => ({
            id: setting,
            cells: [
              <span key="setting" className="font-semibold">{setting}</span>,
              "Configurable system metadata",
              "Placeholder"
            ]
          }))}
        />
      </SectionCard>
    </div>
  );
}
