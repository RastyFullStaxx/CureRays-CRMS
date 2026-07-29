'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarDays,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  PenLine,
  PlayCircle,
  Plus,
  RefreshCw,
  Settings,
  Upload,
  WalletCards,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';

type PrototypeActionKind =
  | 'create'
  | 'document'
  | 'export'
  | 'review'
  | 'schedule'
  | 'settings'
  | 'upload';

type PrototypeActionIcon =
  | 'calendar'
  | 'check'
  | 'download'
  | 'eye'
  | 'file'
  | 'pen'
  | 'play'
  | 'plus'
  | 'refresh'
  | 'settings'
  | 'upload'
  | 'wallet';

export type PrototypeActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

type PrototypeActionButtonProps = {
  label: string;
  title?: string;
  description?: string;
  context?: string;
  kind?: PrototypeActionKind;
  icon?: PrototypeActionIcon;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'default' | 'sm';
  className?: string;
  href?: string;
  action?: (details: { notes: string }) => Promise<PrototypeActionResult>;
  requireNotes?: boolean;
};

const icons = {
  calendar: CalendarDays,
  check: CheckCircle2,
  download: Download,
  eye: Eye,
  file: FileText,
  pen: PenLine,
  play: PlayCircle,
  plus: Plus,
  refresh: RefreshCw,
  settings: Settings,
  upload: Upload,
  wallet: WalletCards,
};

export function PrototypeActionButton({
  label,
  title,
  description,
  context,
  icon = 'plus',
  variant = 'secondary',
  size = 'default',
  className,
  href,
  action,
  requireNotes = false,
}: PrototypeActionButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<PrototypeActionResult>();
  const [submitting, setSubmitting] = useState(false);
  const Icon = icons[icon];

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action) return;
    if (requireNotes && !notes.trim()) {
      setResult({ ok: false, message: 'Add a reason before completing this action.' });
      return;
    }
    setSubmitting(true);
    setResult(undefined);
    try {
      setResult(await action({ notes: notes.trim() }));
    } catch (actionError) {
      setResult({
        ok: false,
        message: actionError instanceof Error ? actionError.message : 'The action could not be completed.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  function close() {
    setOpen(false);
    setNotes('');
    setResult(undefined);
  }

  function openAction() {
    if (href) {
      router.push(href);
      return;
    }
    if (action) setOpen(true);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={openAction}
        disabled={!href && !action}
        aria-label={!href && !action ? `${label}. Unavailable in this pilot.` : label}
      >
        <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {label}
      </Button>
      {action ? (
        <Modal open={open} onClose={close} title={title ?? label} width={520}>
          {result?.ok ? (
            <div className="grid gap-4" role="status" aria-live="polite">
              <div className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--status-positive-border)] bg-[var(--status-positive-surface)] p-4 text-[var(--status-positive-text)]">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <p className="type-body">{result.message}</p>
              </div>
              <div className="flex justify-end">
                <Button type="button" onClick={close}>Done</Button>
              </div>
            </div>
          ) : (
            <form className="grid gap-4" onSubmit={submit}>
              {description || context ? (
                <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
                  {description ? <p className="type-body text-[var(--color-text)]">{description}</p> : null}
                  {context ? <p className="mt-1 type-supporting text-[var(--color-text-muted)]">{context}</p> : null}
                </div>
              ) : null}
              {requireNotes ? (
                <label className="grid gap-1 type-supporting text-[var(--color-text-muted)]">
                  Reason (required)
                  <Textarea
                    rows={3}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add a PHI-safe reason."
                  />
                </label>
              ) : null}
              {result && !result.ok ? (
                <p role="alert" className="type-meta text-[var(--status-negative-text)]">{result.message}</p>
              ) : null}
              <div className="flex flex-wrap justify-end gap-2">
                <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : label}</Button>
              </div>
            </form>
          )}
        </Modal>
      ) : null}
    </>
  );
}
