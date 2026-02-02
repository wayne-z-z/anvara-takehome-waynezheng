import type { ReactNode } from 'react';
import type { AdSlot } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';
import { Pagination } from '@/app/components/pagination';
import { AdSlotCard } from './ad-slot-card';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  basePath: string;
}

interface AdSlotListProps {
  adSlots: AdSlot[];
  error: string | null;
  /** Optional CTA for empty state */
  emptyAction?: ReactNode;
  /** Optional pagination */
  pagination?: PaginationMeta;
}

export function AdSlotList({ adSlots, error, emptyAction, pagination }: AdSlotListProps) {
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
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adSlots.map((slot) => (
          <AdSlotCard key={slot.id} adSlot={slot} />
        ))}
      </div>
      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          basePath={pagination.basePath}
        />
      )}
    </div>
  );
}
