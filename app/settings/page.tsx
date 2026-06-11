
import { Bell, Building2, FileText, LockKeyhole, Plug, Settings, ShieldCheck, UserCog, Workflow } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { settingsCategories } from '@/lib/services/operational-page-service';

const icons = [Building2, UserCog, Workflow, ShieldCheck, FileText, Bell, LockKeyhole, Plug];

export default function SettingsPage() {
  return (
    <PageStack>
      <PageHeader
        title="Settings"
        subtitle="Configure system preferences, security, and integrations"
      />

      <Card>
        <div className="flex flex-col">
          {settingsCategories.map((category, index) => {
            const Icon = icons[index] ?? Settings;
            return (
              <div
                key={category.title}
                className="flex w-full items-center gap-5 border-b p-5 text-left last:border-0"
                style={{
                  borderColor: 'var(--color-border-soft)',
                  background: 'transparent',
                }}
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-lg"
                  style={{
                    background: 'color-mix(in srgb, var(--color-primary) 9%, var(--color-card))',
                    color: 'var(--color-primary)',
                  }}
                >
                  <Icon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold" style={{ color: 'var(--color-text)' }}>{category.title}</span>
                  <span className="mt-1 block text-sm font-semibold leading-5" style={{ color: 'var(--color-text-muted)' }}>{category.description}</span>
                </span>
                <span className="hidden w-72 text-sm font-semibold lg:block" style={{ color: 'var(--color-text)' }}>{category.summary}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </PageStack>
  );
}
