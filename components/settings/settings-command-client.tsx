'use client';

import { useMemo, useState } from 'react';
import { Bell, Building2, CheckCircle2, FileText, LockKeyhole, Plug, Settings, ShieldCheck, UserCog, Workflow } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { StatGrid } from '@/components/shared/stat-grid';
import { StatCard } from '@/components/shared/stat-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/workflow';

export type SettingsCategory = {
  title: string;
  description: string;
  summary: string;
};

type SettingsCommandClientProps = {
  categories: SettingsCategory[];
};

type ChangeRecord = {
  id: string;
  category: string;
  summary: string;
  mode: string;
};

const icons = [Building2, UserCog, Workflow, ShieldCheck, FileText, Bell, LockKeyhole, Plug];

function categoryMode(title: string) {
  if (title.includes('Access')) return 'Security';
  if (title.includes('Workflow')) return 'Automation';
  if (title.includes('Document')) return 'Templates';
  if (title.includes('Notification')) return 'Escalation';
  if (title.includes('Compliance')) return 'Audit';
  if (title.includes('Integration')) return 'Connection';
  if (title.includes('Clinical')) return 'Clinical';
  return 'Clinic';
}

function defaultPrimaryValue(category: SettingsCategory) {
  const [label, value] = category.summary.split(':').map((part) => part.trim());
  return value ? `${label}: ${value}` : category.summary;
}

export function SettingsCommandClient({ categories }: SettingsCommandClientProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [primaryValue, setPrimaryValue] = useState(defaultPrimaryValue(categories[0]));
  const [policyMode, setPolicyMode] = useState(categoryMode(categories[0].title));
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [notes, setNotes] = useState('Reviewed for prototype demo. No production external configuration was changed.');
  const [changes, setChanges] = useState<ChangeRecord[]>([]);

  const selected = categories[selectedIndex];
  const activeCount = categories.length;
  const guardedCount = categories.filter((category) =>
    ['User & Access Settings', 'Security & Compliance', 'Integration Settings'].includes(category.title),
  ).length;
  const automationCount = categories.filter((category) =>
    category.title.includes('Workflow') || category.title.includes('Notification') || category.title.includes('Document'),
  ).length;
  const appliedCount = changes.length;

  const preview = useMemo(() => {
    return [
      `Category: ${selected.title}`,
      `Mode: ${policyMode}`,
      `Primary value: ${primaryValue}`,
      `Approval: ${requiresApproval ? 'Admin review required' : 'Prototype-only local change'}`,
    ].join(' | ');
  }, [policyMode, primaryValue, requiresApproval, selected.title]);

  function selectCategory(index: number) {
    const next = categories[index];
    setSelectedIndex(index);
    setPrimaryValue(defaultPrimaryValue(next));
    setPolicyMode(categoryMode(next.title));
    setRequiresApproval(['User & Access Settings', 'Security & Compliance', 'Integration Settings'].includes(next.title));
    setNotes('Reviewed for prototype demo. No production external configuration was changed.');
  }

  function applyChange() {
    setChanges((current) => [
      {
        id: `CFG-${Date.now().toString(36).toUpperCase()}`,
        category: selected.title,
        summary: primaryValue,
        mode: policyMode,
      },
      ...current,
    ].slice(0, 6));
  }

  return (
    <PageStack className="scrollbar-soft overflow-y-auto pb-1 pr-1">
      <PageHeader
        title="Settings"
        subtitle="Configure prototype policies, security posture, workflow defaults, and integration readiness"
      />

      <StatGrid>
        <StatCard icon={Settings} label="Config Areas" value={activeCount} sub="Admin categories" tone="primary" />
        <StatCard icon={ShieldCheck} label="Guarded Areas" value={guardedCount} sub="Security sensitive" tone="warning" />
        <StatCard icon={Workflow} label="Automation Areas" value={automationCount} sub="Workflow-facing" tone="info" />
        <StatCard icon={CheckCircle2} label="Staged Changes" value={appliedCount} sub="This demo session" tone={appliedCount ? 'success' : 'primary'} />
      </StatGrid>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(320px,0.72fr)_minmax(0,1.28fr)]">
        <Card className="min-w-0 self-start">
          <div className="mb-4">
            <p className="clinical-label">Configuration Areas</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">
              Review before changing settings
            </h2>
          </div>
          <div className="scrollbar-soft grid max-h-[calc(100dvh-260px)] min-h-[620px] gap-2 overflow-y-auto pr-1">
            {categories.map((category, index) => {
              const Icon = icons[index] ?? Settings;
              const active = index === selectedIndex;
              return (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => selectCategory(index)}
                  className={cn(
                    'clinical-focus flex w-full items-start gap-3 rounded-[var(--radius-md)] border p-3 text-left transition',
                    active
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
                      : 'border-[var(--color-border-soft)] bg-[var(--color-bg)] hover:border-[var(--color-primary)]/35',
                  )}
                >
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)]"
                    style={{
                      background: 'color-mix(in srgb, var(--color-primary) 9%, var(--color-card))',
                      color: 'var(--color-primary)',
                    }}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-[var(--color-text)]">{category.title}</span>
                    <span className="mt-1 block line-clamp-2 text-xs font-semibold text-[var(--color-text-muted)]">{category.description}</span>
                  </span>
                  <Badge variant={active ? 'primary' : 'default'}>{categoryMode(category.title)}</Badge>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="min-w-0 self-start">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="clinical-label">Selected Setting</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-[var(--color-text)]">{selected.title}</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-muted)]">{selected.description}</p>
            </div>
            <Badge variant={requiresApproval ? 'warning' : 'info'}>
              {requiresApproval ? 'Admin review' : 'Prototype local'}
            </Badge>
          </div>

          <div className="mt-4 grid gap-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <label className="grid gap-1">
                <span className="clinical-label">Primary Configuration</span>
                <Input value={primaryValue} onChange={(event) => setPrimaryValue(event.target.value)} />
              </label>
              <label className="grid gap-1">
                <span className="clinical-label">Operating Mode</span>
                <Select value={policyMode} onChange={(event) => setPolicyMode(event.target.value)}>
                  <option>Clinic</option>
                  <option>Security</option>
                  <option>Automation</option>
                  <option>Clinical</option>
                  <option>Templates</option>
                  <option>Escalation</option>
                  <option>Audit</option>
                  <option>Connection</option>
                </Select>
              </label>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <label className="clinical-muted-surface flex items-start gap-3 p-3">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(event) => setRequiresApproval(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
                />
                <span>
                  <span className="block text-sm font-bold text-[var(--color-text)]">Require admin approval</span>
                  <span className="mt-1 block text-xs font-semibold text-[var(--color-text-muted)]">
                    Keeps security, integration, and workflow-impacting changes visible for demo review.
                  </span>
                </span>
              </label>
              <div className="clinical-muted-surface p-3">
                <p className="clinical-label">Current Summary</p>
                <p className="mt-2 text-sm font-bold text-[var(--color-text)]">{selected.summary}</p>
              </div>
            </div>

            <label className="grid gap-1">
              <span className="clinical-label">Change Reason / Notes</span>
              <Textarea rows={5} value={notes} onChange={(event) => setNotes(event.target.value)} />
            </label>

            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3">
              <p className="clinical-label">Staged Preview</p>
              <p className="mt-2 text-sm font-bold leading-6 text-[var(--color-text)]">{preview}</p>
              <p className="mt-1 text-xs font-semibold leading-5 text-[var(--color-text-muted)]">{notes}</p>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => selectCategory(selectedIndex)}>
                Reset
              </Button>
              <Button type="button" onClick={applyChange}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Stage Change
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="clinical-label">Demo Change Ledger</p>
            <h2 className="mt-1 font-heading text-base font-bold text-[var(--color-text)]">Local staged configuration changes</h2>
          </div>
          <Badge variant="info">No external writes</Badge>
        </div>
        <div className="grid gap-2">
          {changes.length ? changes.map((change) => (
            <div key={change.id} className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-3 md:grid-cols-[150px_minmax(0,1fr)_140px]">
              <span className="text-xs font-bold text-[var(--color-primary)]">{change.id}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-[var(--color-text)]">{change.category}</span>
                <span className="mt-1 block truncate text-xs font-semibold text-[var(--color-text-muted)]">{change.summary}</span>
              </span>
              <Badge variant="success">{change.mode}</Badge>
            </div>
          )) : (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg)] p-4 text-sm font-semibold text-[var(--color-text-muted)]">
              No settings changes have been staged in this demo session.
            </div>
          )}
        </div>
      </Card>
    </PageStack>
  );
}
