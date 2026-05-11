import { Bell, Building2, ChevronRight, FileText, LockKeyhole, Plug, Settings, ShieldCheck, UserCog, Workflow } from "lucide-react";
import { ListItem, ModulePage, RightRailCard, WorkGrid } from "@/components/module-ui";
import { settingsCategories } from "@/lib/global-page-data";

const icons = [Building2, UserCog, Workflow, ShieldCheck, FileText, Bell, LockKeyhole, Plug];

export default function SettingsPage() {
  return (
    <ModulePage>
      <WorkGrid
        main={
          <section className="overflow-hidden rounded-lg border border-[#D8E4F5] bg-white shadow-[0_8px_24px_rgba(0,51,160,0.055)]">
            {settingsCategories.map((category, index) => {
              const Icon = icons[index] ?? Settings;
              return (
                <button key={category.title} type="button" className="flex w-full items-center gap-5 border-b border-[#E7EEF8] p-5 text-left transition last:border-0 hover:bg-[#F8FBFF]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#EAF1FF] text-[#0033A0]"><Icon className="h-6 w-6" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-[#061A55]">{category.title}</span>
                    <span className="mt-1 block text-sm font-semibold leading-5 text-[#3D5A80]">{category.description}</span>
                  </span>
                  <span className="hidden w-72 text-sm font-semibold text-[#2B2F5F] lg:block">{category.summary}</span>
                  <ChevronRight className="h-5 w-5 shrink-0 text-[#0033A0]" />
                </button>
              );
            })}
          </section>
        }
        rail={
          <>
            <RightRailCard title="System Information">
              <div className="space-y-3 text-sm font-semibold text-[#2B2F5F]">
                <p className="text-xl font-bold text-[#0033A0]">CureRays</p>
                <p>Organization: CureRays Radiation Medicine</p>
                <p>Address: 300 Sierra College Drive, Suite 150</p>
                <p>Phone: (530) 802-6400</p>
                <p>Time Zone: America/Los_Angeles</p>
                <p>Date Format: MM/DD/YYYY</p>
              </div>
            </RightRailCard>
            <RightRailCard title="Recent Changes">
              <div className="space-y-2">
                <ListItem title="Workflow rule modified" meta="by Dr. Sarah Johnson - May 6, 2026" />
                <ListItem title="Password policy updated" meta="by System - May 6, 2026" />
                <ListItem title="Email notifications updated" meta="by Iris Lim - May 5, 2026" />
                <ListItem title="MFA enforcement enabled" meta="by Dr. Sarah Johnson - May 4, 2026" />
              </div>
            </RightRailCard>
          </>
        }
      />
    </ModulePage>
  );
}
