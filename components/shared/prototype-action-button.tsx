'use client';

import { useState, type FormEvent } from 'react';
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
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
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

const kindCopy: Record<PrototypeActionKind, { primary: string; complete: string }> = {
  create: {
    primary: 'Create draft',
    complete: 'Draft created in local prototype state.',
  },
  document: {
    primary: 'Queue document action',
    complete: 'Document action queued for this demo session.',
  },
  export: {
    primary: 'Prepare export',
    complete: 'Export prepared with PHI-safe demo redaction.',
  },
  review: {
    primary: 'Record review',
    complete: 'Review action recorded for this demo session.',
  },
  schedule: {
    primary: 'Schedule action',
    complete: 'Schedule action staged in local prototype state.',
  },
  settings: {
    primary: 'Apply setting',
    complete: 'Configuration change staged for this demo session.',
  },
  upload: {
    primary: 'Attach file',
    complete: 'File attachment staged without retaining file contents.',
  },
};

function defaultTitle(label: string) {
  return label.replace(/\s+/g, ' ').trim();
}

export function PrototypeActionButton({
  label,
  title,
  description,
  context,
  kind = 'create',
  icon = 'plus',
  variant = 'secondary',
  size = 'default',
  className,
}: PrototypeActionButtonProps) {
  const [open, setOpen] = useState(false);
  const [complete, setComplete] = useState(false);
  const [fileName, setFileName] = useState('');
  const [reference, setReference] = useState('');
  const Icon = icons[icon];
  const copy = kindCopy[kind];
  const actionTitle = title ?? defaultTitle(label);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComplete(true);
  }

  function close() {
    setOpen(false);
    setComplete(false);
    setFileName('');
  }

  function openAction() {
    setReference(`${kind.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`);
    setOpen(true);
  }

  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={openAction}>
        <Icon className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        {label}
      </Button>
      <Modal open={open} onClose={close} title={actionTitle} width={680}>
        {complete ? (
          <div className="grid gap-4">
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--color-success-soft)] text-[var(--color-success)]">
                  <CheckCircle2 className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--color-text)]">{copy.complete}</p>
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">
                    Reference {reference}. This prototype action does not persist PHI or write external files.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={close}>Done</Button>
            </div>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={submit}>
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border-soft)] bg-[var(--color-bg-elevated)] p-3">
              <p className="text-sm font-bold text-[var(--color-text)]">{description ?? 'Complete this demo workflow with locally staged prototype state.'}</p>
              {context ? (
                <p className="mt-1 text-xs font-semibold text-[var(--color-text-muted)]">{context}</p>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {kind === 'export' ? (
                <>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Export format
                    <Select defaultValue="PDF summary">
                      <option>PDF summary</option>
                      <option>CSV operational rows</option>
                      <option>Audit evidence packet</option>
                    </Select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Redaction profile
                    <Select defaultValue="Tokenized operational export">
                      <option>Tokenized operational export</option>
                      <option>Internal de-identified demo</option>
                      <option>Admin configuration only</option>
                    </Select>
                  </label>
                </>
              ) : null}

              {kind === 'upload' ? (
                <>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    File
                    <Input type="file" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Category
                    <Select defaultValue="Course evidence">
                      <option>Course evidence</option>
                      <option>Template source</option>
                      <option>Imaging support</option>
                      <option>Generated output</option>
                    </Select>
                  </label>
                </>
              ) : null}

              {kind === 'schedule' ? (
                <>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Date
                    <Input type="date" defaultValue="2026-05-06" />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Appointment type
                    <Select defaultValue="Treatment fraction">
                      <option>Treatment fraction</option>
                      <option>Simulation</option>
                      <option>Mapping</option>
                      <option>Follow-up</option>
                    </Select>
                  </label>
                </>
              ) : null}

              {kind === 'document' ? (
                <>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Template family
                    <Select defaultValue="Carepath / Preauth / Audit">
                      <option>Carepath / Preauth / Audit</option>
                      <option>Simulation / CTP order</option>
                      <option>Prescription</option>
                      <option>Fractionation log</option>
                      <option>Treatment summary</option>
                    </Select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Next state
                    <Select defaultValue="Ready for review">
                      <option>Ready for review</option>
                      <option>Render output</option>
                      <option>Send for signature</option>
                      <option>Mark uploaded to eCW</option>
                    </Select>
                  </label>
                </>
              ) : null}

              {kind === 'review' ? (
                <>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Review status
                    <Select defaultValue="Ready for review">
                      <option>Ready for review</option>
                      <option>Needs correction</option>
                      <option>Signed</option>
                      <option>Not applicable</option>
                    </Select>
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Owner
                    <Select defaultValue="Rad Onc">
                      <option>Rad Onc</option>
                      <option>Medical Physicist</option>
                      <option>RTT</option>
                      <option>Billing Staff</option>
                      <option>Admin</option>
                    </Select>
                  </label>
                </>
              ) : null}

              {kind === 'create' || kind === 'settings' ? (
                <>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Name
                    <Input defaultValue={actionTitle} />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)]">
                    Owner
                    <Select defaultValue="Admin">
                      <option>Admin</option>
                      <option>Virtual Assistant</option>
                      <option>Medical Assistant</option>
                      <option>RTT</option>
                      <option>Rad Onc</option>
                    </Select>
                  </label>
                </>
              ) : null}

              <label className="grid gap-1 text-xs font-bold text-[var(--color-text-muted)] sm:col-span-2">
                Notes
                <Textarea
                  rows={3}
                  defaultValue={fileName ? `Selected file: ${fileName}` : ''}
                  placeholder="Add PHI-safe demo notes for this action."
                />
              </label>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
              <Button type="submit">{copy.primary}</Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
