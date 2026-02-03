'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

/** Modal for confirm/cancel; caller provides the confirm action (e.g. submit button) via confirmSlot. Renders via portal to document.body so it is never affected by parent transforms (fixes flashing when hovering cards). */
export function ConfirmModal({
  open,
  onClose,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmSlot,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmSlot: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const content = (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        tabIndex={-1}
      />
      <div className="animate-modal-in relative z-10 w-full max-w-md rounded-xl border border-[--color-border] bg-[--color-background] p-6 shadow-2xl">
        <h2 id="confirm-title" className="text-lg font-semibold text-[--color-foreground]">
          {title}
        </h2>
        <p id="confirm-desc" className="mt-2 text-sm text-[--color-muted]">
          {description}
        </p>
        <div className="mt-6 flex flex-nowrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] shrink-0 rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-sm font-medium text-[--color-foreground] transition-colors hover:bg-[--color-border]"
          >
            {cancelLabel}
          </button>
          {confirmSlot}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
