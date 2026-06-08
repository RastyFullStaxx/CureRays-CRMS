import { Radiation } from 'lucide-react';
import { PageStack } from '@/components/shared/page-stack';
import { PageHeader } from '@/components/shared/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getIgsrtWorkspace } from '@/lib/clinical-store';

export default function IgsrtWorkflowPage() {
  const workspace = getIgsrtWorkspace('COURSE-2401');

  return (
    <PageStack>
      <PageHeader
        title="IGSRT Tools"
        subtitle="Skin cancer workflow CRUD for simulation order, prescription, fraction log, generated documents, and audit state"
      />

      <Card>
        <div className="mb-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>Workflow Automation</p>
          <h2 className="mt-1 font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>IGSRT Workspace</h2>
        </div>
        <div className="space-y-3">
          {workspace && typeof workspace === 'object' ? (
            Object.entries(workspace).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-3"
                style={{
                  padding: '10px 12px',
                  border: '1px solid var(--color-border-soft)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-bg)',
                }}
              >
                <span className="font-semibold" style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text)' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
              No workspace data available for this course.
            </p>
          )}
        </div>
      </Card>
    </PageStack>
  );
}
