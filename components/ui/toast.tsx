'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import type { StatusTone } from '@/lib/status-utils';

type ToastType = StatusTone;

type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
};

const ToastContext = createContext<ToastContextValue>({
  toast: { success: () => {}, error: () => {}, warning: () => {}, info: () => {} },
});

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, ReactNode> = {
  positive: <CheckCircle2 size={16} className="text-[var(--status-positive-text)]" />,
  negative: <XCircle size={16} className="text-[var(--status-negative-text)]" />,
  intermediate: <AlertTriangle size={16} className="text-[var(--status-intermediate-text)]" />,
  neutral: <Info size={16} className="text-[var(--status-neutral-text)]" />,
};

const bgClasses: Record<ToastType, string> = {
  positive: 'border-[var(--status-positive-border)] bg-[var(--status-positive-surface)]',
  negative: 'border-[var(--status-negative-border)] bg-[var(--status-negative-surface)]',
  intermediate: 'border-[var(--status-intermediate-border)] bg-[var(--status-intermediate-surface)]',
  neutral: 'border-[var(--status-neutral-border)] bg-[var(--status-neutral-surface)]',
};

let toastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toast = {
    success: (msg: string) => addToast('positive', msg),
    error: (msg: string) => addToast('negative', msg),
    warning: (msg: string) => addToast('intermediate', msg),
    info: (msg: string) => addToast('neutral', msg),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[99999] flex flex-col gap-2" style={{ maxWidth: 360 }}>
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-center gap-3 rounded-[var(--radius-md)] border px-4 py-3 type-body shadow-lg ${bgClasses[t.type]}`}
              style={{ color: 'var(--color-text)' }}
            >
              {icons[t.type]}
              <span className="flex-1">{t.message}</span>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
