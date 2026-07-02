'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/workflow';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: number | string;
  height?: number | string;
  contentClassName?: string;
  shouldClose?: () => boolean;
};

function dimension(value: number | string | undefined) {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Modal({ open, onClose, title, children, width = 480, height, contentClassName, shouldClose }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const shouldCloseRef = useRef(shouldClose);
  const titleId = useId();
  onCloseRef.current = onClose;
  shouldCloseRef.current = shouldClose;

  const requestClose = useCallback(() => {
    if (shouldCloseRef.current && !shouldCloseRef.current()) return;
    onCloseRef.current();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    const backgroundSiblings = Array.from(document.body.children)
      .filter((element) => element !== overlayRef.current)
      .map((element) => ({ element, wasInert: element.hasAttribute('inert') }));
    backgroundSiblings.forEach(({ element }) => element.setAttribute('inert', ''));

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') requestClose();
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hasAttribute('hidden'));
      if (focusable.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    window.requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousBodyOverflow;
      backgroundSiblings.forEach(({ element, wasInert }) => {
        if (!wasInert) element.removeAttribute('inert');
      });
      previouslyFocused?.focus();
    };
  }, [open, requestClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
      style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) requestClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Dialog'}
        tabIndex={-1}
        className={cn('scrollbar-soft bg-[var(--color-card)] outline-none', contentClassName)}
        style={{
          width: dimension(width),
          height: dimension(height),
          maxWidth: '90vw',
          maxHeight: '95vh',
          borderRadius: 'var(--radius-lg)',
          border: 'var(--border-container)',
          boxShadow: 'var(--shadow-card)',
          padding: 'var(--space-card)',
          overflow: height ? 'hidden' : 'auto',
        }}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h2 id={titleId} className="type-heading text-[var(--color-text)]">
              {title}
            </h2>
            <button
              type="button"
              aria-label="Close dialog"
              onClick={requestClose}
              className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-text-muted)] hover:bg-[var(--color-hover)]"
            >
              <X size={16} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body
  );
}
