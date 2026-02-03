'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { AdSlot } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';
import { Pagination } from '@/app/components/pagination';
import { useToast } from '@/app/components/toast';
import { AdSlotCard } from './ad-slot-card';
import { deleteAdSlotAction } from '../actions';

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
  const router = useRouter();
  const toast = useToast();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [removingSlots, setRemovingSlots] = useState<AdSlot[]>([]);

  const onRequestDelete = useCallback((id: string) => {
    const slot = adSlots.find((s) => s.id === id);
    if (slot) {
      setRemovingSlots((prev) => [...prev, slot]);
      setRemovingIds((prev) => new Set(prev).add(id));
    }
  }, [adSlots]);

  const onExitComplete = useCallback(
    async (id: string) => {
      const formData = new FormData();
      formData.set('id', id);
      await deleteAdSlotAction({}, formData);
      toast.success('Ad slot deleted');
      router.refresh();
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRemovingSlots((prev) => prev.filter((s) => s.id !== id));
    },
    [router, toast]
  );

  if (error) {
    return (
      <ErrorState
        title="Unable to load ad slots"
        message="Please check your connection and try again."
      />
    );
  }

  const visibleSlots = adSlots.filter((s) => !removingIds.has(s.id));
  const allShowing = [...visibleSlots, ...removingSlots];

  if (allShowing.length === 0) {
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
        {allShowing.map((slot) => (
          <AdSlotCard
            key={slot.id}
            adSlot={slot}
            isRemoving={removingIds.has(slot.id)}
            onExitComplete={onExitComplete}
            onRequestDelete={onRequestDelete}
          />
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
