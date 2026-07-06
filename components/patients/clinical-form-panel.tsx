'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/workflow';
import { formatUiLabel } from '@/lib/ui-copy';
import type {
  ClinicalFormResponse,
  FormTemplateField,
  TemplateFieldMap,
  WorkflowItemStatus,
} from '@/lib/types';

type FieldValue = string | number | boolean | null;

type ClinicalFormPanelProps = {
  courseId: string;
  requirementId: string;
  templateId: string;
  fieldMap: TemplateFieldMap;
  requiresSignature: boolean;
  onStatusChange?: (status: WorkflowItemStatus) => void;
};

const READ_ONLY_STATUSES: WorkflowItemStatus[] = ['SIGNED', 'CLOSED'];

function allFields(fieldMap: TemplateFieldMap): FormTemplateField[] {
  return fieldMap.sections.flatMap((section) => section.fields);
}

function requiredFieldIds(fieldMap: TemplateFieldMap): string[] {
  return allFields(fieldMap).filter((field) => field.required).map((field) => field.id);
}

function isEmpty(value: FieldValue | undefined): boolean {
  return value === undefined || value === null || value === '';
}

function statusTone(status: WorkflowItemStatus) {
  if (status === 'SIGNED' || status === 'COMPLETED' || status === 'CLOSED') return 'positive' as const;
  if (status === 'BLOCKED' || status === 'OVERDUE') return 'negative' as const;
  if (status === 'READY_FOR_REVIEW') return 'intermediate' as const;
  return 'neutral' as const;
}

export function ClinicalFormPanel({
  courseId,
  requirementId,
  templateId,
  fieldMap,
  requiresSignature,
  onStatusChange,
}: ClinicalFormPanelProps) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [status, setStatus] = useState<WorkflowItemStatus>('PENDING');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<null | 'DRAFT' | 'SUBMIT' | 'SIGN'>(null);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const required = useMemo(() => requiredFieldIds(fieldMap), [fieldMap]);
  const readOnly = READ_ONLY_STATUSES.includes(status);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAttemptedSubmit(false);
    const query = new URLSearchParams({ courseId, requirementId });
    fetch(`/api/clinical-forms?${query.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { response: ClinicalFormResponse | null } | null) => {
        if (!active) return;
        const data = payload?.response ?? null;
        setValues(data?.responseData ?? {});
        const nextStatus = data?.status ?? 'PENDING';
        setStatus(nextStatus);
        onStatusChange?.(nextStatus);
      })
      .catch(() => {
        if (active) {
          setValues({});
          setStatus('PENDING');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [courseId, requirementId]);

  const missingRequired = useMemo(
    () => required.filter((id) => isEmpty(values[id])),
    [required, values],
  );

  const setValue = useCallback((id: string, value: FieldValue) => {
    setValues((current) => ({ ...current, [id]: value }));
  }, []);

  const save = useCallback(
    async (intent: 'DRAFT' | 'SUBMIT' | 'SIGN') => {
      if (intent !== 'DRAFT') {
        setAttemptedSubmit(true);
        if (missingRequired.length > 0) {
          toast.error('Complete every required field before submitting.');
          return;
        }
      }
      setSaving(intent);
      try {
        const response = await fetch('/api/clinical-forms', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId,
            requirementId,
            templateId,
            responseData: values,
            intent,
            requiredFieldIds: required,
            changeReason:
              intent === 'SIGN'
                ? 'Sign clinical form'
                : intent === 'SUBMIT'
                  ? 'Submit clinical form for review'
                  : 'Save clinical form draft',
          }),
        });
        if (!response.ok) {
          toast.error('The form could not be saved. Try again.');
          return;
        }
        const body = (await response.json()) as { response: ClinicalFormResponse };
        setStatus(body.response.status);
        setValues(body.response.responseData ?? values);
        onStatusChange?.(body.response.status);
        toast.success(
          intent === 'SIGN'
            ? 'The form was signed and locked.'
            : intent === 'SUBMIT'
              ? 'The form was submitted for review.'
              : 'Draft saved.',
        );
      } catch {
        toast.error('The form could not be saved. Try again.');
      } finally {
        setSaving(null);
      }
    },
    [courseId, missingRequired.length, onStatusChange, toast, required, requirementId, templateId, values],
  );

  if (loading) {
    return <p className="type-supporting text-[var(--color-text-muted)]">Loading form…</p>;
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="clinical-label">Structured Fields</p>
        <Badge variant={statusTone(status)}>{formatUiLabel(status)}</Badge>
      </div>

      {fieldMap.sections.map((section) => (
        <div key={section.id} className="grid gap-3">
          {fieldMap.sections.length > 1 ? (
            <p className="clinical-label text-[var(--color-text)]">{section.title}</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {section.fields.map((field) => {
              const value = values[field.id];
              const showError = attemptedSubmit && field.required && isEmpty(value);
              return (
                <label key={field.id} className={cn('grid gap-1.5', field.kind === 'textarea' && 'sm:col-span-2')}>
                  <span className="clinical-label">
                    {field.label}
                    {field.required ? <span className="text-[var(--color-error)]"> *</span> : null}
                  </span>
                  <ClinicalField
                    field={field}
                    value={value}
                    disabled={readOnly}
                    invalid={showError}
                    onChange={(next) => setValue(field.id, next)}
                  />
                  {showError ? (
                    <span className="type-label text-[var(--color-error)]">This field is required.</span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {readOnly ? (
        <p className="type-supporting text-[var(--color-text-muted)]">
          This form is signed and locked. Reopen the step to make a documented correction.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={saving !== null} onClick={() => save('DRAFT')}>
            {saving === 'DRAFT' ? 'Saving…' : 'Save Draft'}
          </Button>
          <Button variant="primary" disabled={saving !== null} onClick={() => save('SUBMIT')}>
            {saving === 'SUBMIT' ? 'Submitting…' : 'Submit for Review'}
          </Button>
          {requiresSignature ? (
            <Button variant="primary" disabled={saving !== null} onClick={() => save('SIGN')}>
              {saving === 'SIGN' ? 'Signing…' : 'Review and Sign'}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}

function ClinicalField({
  field,
  value,
  disabled,
  invalid,
  onChange,
}: {
  field: FormTemplateField;
  value: FieldValue | undefined;
  disabled: boolean;
  invalid: boolean;
  onChange: (value: FieldValue) => void;
}) {
  const invalidClass = invalid ? 'border-[var(--color-error)]' : undefined;

  if (field.options && field.options.length > 0) {
    return (
      <Select
        className={invalidClass}
        disabled={disabled}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">Select…</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    );
  }

  if (field.kind === 'textarea') {
    return (
      <Textarea
        className={invalidClass}
        rows={3}
        disabled={disabled}
        placeholder={field.placeholder}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (field.kind === 'checkbox') {
    return (
      <input
        type="checkbox"
        className="clinical-focus h-4 w-4 justify-self-start accent-[var(--color-primary)]"
        disabled={disabled}
        checked={value === true}
        onChange={(event) => onChange(event.target.checked)}
      />
    );
  }

  return (
    <Input
      className={invalidClass}
      type={field.kind === 'number' ? 'number' : field.kind === 'date' ? 'date' : 'text'}
      disabled={disabled}
      placeholder={field.placeholder}
      value={value === null || value === undefined ? '' : String(value)}
      onChange={(event) =>
        onChange(field.kind === 'number' ? (event.target.value === '' ? null : Number(event.target.value)) : event.target.value)
      }
    />
  );
}
