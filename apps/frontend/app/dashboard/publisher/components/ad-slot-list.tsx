import type { ReactNode } from 'react';
import type { AdSlot } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';
import { AdSlotCard } from './ad-slot-card';

interface AdSlotListProps {
  adSlots: AdSlot[];
  error: string | null;
  /** Optional CTA for empty state (e.g. Create Ad Slot button) */
  emptyAction?: ReactNode;
}

export function AdSlotList({ adSlots, error, emptyAction }: AdSlotListProps) {
  if (error) {
    return (
      <ErrorState
        title="Unable to load ad slots"
        message="Please check your connection and try again."
      />
    );
  }

  if (adSlots.length === 0) {
    return (
      <EmptyState
        icon="📺"
        title="No ad slots yet"
        description="Create your first ad slot to start earning. Sponsors can discover and book your inventory."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <AdSlotCard key={slot.id} adSlot={slot} />
      ))}
    </div>
  );
}
