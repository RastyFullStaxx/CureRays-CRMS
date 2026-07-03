export type StatusTone = 'positive' | 'intermediate' | 'negative' | 'neutral';
export type BadgeVariant = StatusTone;
export type StatusTokenRole = 'solid' | 'surface' | 'border' | 'text';

export function statusToneClass(tone: StatusTone): string {
  return `is-${tone}`;
}

export function statusToneToken(tone: StatusTone, role: StatusTokenRole = 'solid'): string {
  return `var(--status-${tone}-${role})`;
}

function normalize(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

/**
 * Maps data-layer tone strings to Badge/StatusBadge variant values.
 * Used across pages to keep status color mapping consistent.
 */
export function mapTone(tone: string): StatusTone {
  const value = normalize(tone);

  if (value === 'POSITIVE') return 'positive';
  if (value === 'INTERMEDIATE') return 'intermediate';
  if (value === 'NEGATIVE') return 'negative';

  return 'neutral';
}

export function statusTone(status: string | null | undefined): StatusTone {
  const value = normalize(status);

  if ([
    'COMPLETE',
    'COMPLETED',
    'SIGNED',
    'UPLOADED',
    'EXPORTED',
    'APPROVED',
    'READY',
    'CLEAR',
    'AUDIT_READY',
  ].includes(value)) return 'positive';

  if ([
    'BLOCKED',
    'OVERDUE',
    'MISSING',
    'MISSING_FIELDS',
    'VOIDED',
    'REVISION_NEEDED',
    'NEEDS_OVERRIDE',
    'FAILED',
    'ERROR',
    'NONE',
    'MISSED',
    'CANCELLED',
  ].includes(value)) return 'negative';

  if ([
    'READY_FOR_REVIEW',
    'NEEDS_REVIEW',
    'REVIEW_REQUIRED',
    'PENDING_NEEDED',
    'PENDING_SIGNATURE',
    'PENDING',
    'ON_HOLD',
    'PAUSED',
    'RESCHEDULED',
  ].includes(value)) return 'intermediate';

  if ([
    'REVIEW',
    'CLOSEOUT_REVIEW',
    'REQUIRED',
    'DUE',
    'CLINICAL_VALIDATION_REQUIRED',
  ].includes(value)) return 'intermediate';

  return 'neutral';
}

export function phaseTone(_phase: string | null | undefined): StatusTone {
  return 'neutral';
}

export function priorityTone(priority: string | null | undefined): StatusTone {
  const value = normalize(priority);

  if (['URGENT', 'STAT', 'CRITICAL'].includes(value)) return 'negative';
  if (['HIGH', 'MEDIUM'].includes(value)) return 'intermediate';

  return 'neutral';
}
