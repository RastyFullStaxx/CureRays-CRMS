'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
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
};

function dimension(value: number | string | undefined) {
  return typeof value === 'number' ? `${value}px` : value;
}

export function Modal({ open, onClose, title, children, width = 480, height, contentClassName }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'var(--color-overlay)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={cn('bg-[var(--color-card)]', contentClassName)}
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
            <h2 className="font-heading font-bold text-[var(--color-text)]" style={{ fontSize: 18 }}>
              {title}
            </h2>
            <button
              onClick={onClose}
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
