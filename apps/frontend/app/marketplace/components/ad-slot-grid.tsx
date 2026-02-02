'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdSlots } from '@/lib/api';
import type { AdSlot } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NATIVE: 'bg-green-100 text-green-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

function AdSlotCardSkeleton() {
  return (
    <div className="rounded-lg border border-[--color-border] p-4">
      <div className="mb-2 flex items-start justify-between">
        <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="mb-3 h-4 w-full animate-pulse rounded bg-gray-200" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function AdSlotGrid() {
  const [adSlots, setAdSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(() => {
    setError(null);
    setLoading(true);
    getAdSlots()
      .then(setAdSlots)
      .catch(() => setError('Failed to load ad slots'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    queueMicrotask(() => loadSlots());
  }, [loadSlots]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <AdSlotCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load marketplace"
        message="Please check your connection and try again."
        onRetry={loadSlots}
      />
    );
  }

  if (adSlots.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No ad slots available"
        description="Check back later—publishers are adding new inventory regularly."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <Link
          key={slot.id}
          href={`/marketplace/${slot.id}`}
          className="block rounded-lg border border-[--color-border] p-4 transition-shadow hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between">
            <h3 className="font-semibold">{slot.name}</h3>
            <span
              className={`rounded px-2 py-0.5 text-xs ${typeColors[slot.type] || 'bg-gray-100'}`}
            >
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <p className="mb-2 text-sm text-[--color-muted]">by {slot.publisher.name}</p>
          )}

          {slot.description && (
            <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{slot.description}</p>
          )}

          <div className="flex items-center justify-between">
            <span
              className={`text-sm ${slot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
            >
              {slot.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="font-semibold text-[--color-primary]">
              ${Number(slot.basePrice).toLocaleString()}/mo
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
