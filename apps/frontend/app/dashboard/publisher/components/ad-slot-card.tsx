'use client';

import { useState } from 'react';
import type { AdSlot } from '@/lib/types';
import { EditAdSlotForm } from './edit-ad-slot-form';
import { DeleteAdSlotButton } from './delete-ad-slot-button';

interface AdSlotCardProps {
  adSlot: AdSlot;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NATIVE: 'bg-green-100 text-green-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

export function AdSlotCard({ adSlot }: AdSlotCardProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-lg border-2 border-[--color-primary] p-4">
        <EditAdSlotForm
          adSlot={adSlot}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[--color-border] p-4">
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
          className="text-sm text-[--color-primary] underline hover:no-underline"
        >
          Edit
        </button>
        <DeleteAdSlotButton
          adSlotId={adSlot.id}
          adSlotName={adSlot.name}
          onSuccess={() => setEditing(false)}
        />
      </div>
    </div>
  );
}
