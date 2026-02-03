'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { Modal } from '@/app/components/modal';
import { EditAdSlotForm } from './edit-ad-slot-form';
import { DeleteAdSlotButton } from './delete-ad-slot-button';

interface AdSlotCardProps {
  adSlot: AdSlot;
  /** Card is animating out (delete); show exit animation. */
  isRemoving?: boolean;
  /** Called when exit animation ends (so parent can run delete and refresh). */
  onExitComplete?: (id: string) => void;
  /** When provided, delete confirm triggers this instead of form (for exit animation). */
  onRequestDelete?: (id: string) => void;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NATIVE: 'bg-green-100 text-green-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

export function AdSlotCard({
  adSlot,
  isRemoving,
  onExitComplete,
  onRequestDelete,
}: AdSlotCardProps) {
  const [editing, setEditing] = useState(false);

  const handleAnimationEnd = () => {
    if (isRemoving && onExitComplete) onExitComplete(adSlot.id);
  };

  return (
    <div
      className={`rounded-xl border border-[--color-border] bg-[--color-background] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isRemoving ? 'animate-card-exit' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-semibold">{adSlot.name}</h3>
        <span className={`rounded px-2 py-0.5 text-xs ${typeColors[adSlot.type] || 'bg-gray-100'}`}>
          {adSlot.type}
        </span>
      </div>

      {adSlot.description && (
        <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{adSlot.description}</p>
      )}

      <div className="mb-3 flex items-center justify-between">
        <span
          className={`text-sm ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
        >
          {adSlot.isAvailable ? 'Available' : 'Booked'}
        </span>
        <span className="font-semibold text-[--color-primary]">
          ${Number(adSlot.basePrice).toLocaleString()}/mo
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[--color-border] pt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-[--color-border] bg-[--color-background] px-3 py-2 text-sm font-medium text-[--color-foreground] transition-colors hover:bg-[--color-border]"
        >
          Edit
        </button>
        <DeleteAdSlotButton
          adSlotId={adSlot.id}
          adSlotName={adSlot.name}
          onSuccess={() => setEditing(false)}
          onRequestDelete={onRequestDelete}
        />
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit ad slot"
        maxWidth="max-w-lg"
      >
        <EditAdSlotForm
          adSlot={adSlot}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
