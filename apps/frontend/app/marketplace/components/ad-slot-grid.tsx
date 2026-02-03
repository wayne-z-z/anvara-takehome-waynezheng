'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdSlots, ApiError } from '@/lib/api';
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
    <div className="rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
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

  const [errorKind, setErrorKind] = useState<'auth' | 'server' | null>(null);

  const loadSlots = useCallback(() => {
    setError(null);
    setErrorKind(null);
    setLoading(true);
    getAdSlots()
      .then((slots) => {
        setAdSlots(slots);
        setErrorKind(null);
      })
      .catch((err) => {
        setAdSlots([]);
        const isAuth = err instanceof ApiError && err.status === 401;
        setErrorKind(isAuth ? 'auth' : 'server');
        setError(isAuth ? 'Sign in required' : 'Failed to load ad slots');
      })
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
    const isAuth = errorKind === 'auth';
    return (
      <ErrorState
        title={isAuth ? 'Sign in to view the marketplace' : 'Unable to load marketplace'}
        message={
          isAuth
            ? 'You need to sign in to browse ad slots.'
            : 'Please check your connection and try again. If the problem persists, the service may be temporarily unavailable.'
        }
        onRetry={isAuth ? undefined : loadSlots}
        secondaryHref={isAuth ? '/login' : undefined}
        secondaryLabel={isAuth ? 'Sign in' : undefined}
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
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {adSlots.map((slot) => (
        <Link
          key={slot.id}
          href={`/marketplace/${slot.id}`}
          className="group block rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[--color-primary]/30 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2"
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-[--color-foreground] group-hover:text-[--color-primary]">
              {slot.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[slot.type] || 'bg-gray-100 text-gray-700'}`}
            >
              {slot.type}
            </span>
          </div>

          {slot.publisher && (
            <p className="mb-2 text-sm text-[--color-muted]">by {slot.publisher.name}</p>
          )}

          {slot.description && (
            <p className="mb-4 line-clamp-2 text-sm text-[--color-muted]">{slot.description}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[--color-border] pt-4">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${slot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${slot.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
                aria-hidden
              />
              {slot.isAvailable ? 'Available' : 'Booked'}
            </span>
            <span className="text-lg font-bold text-[--color-primary]">
              ${Number(slot.basePrice).toLocaleString()}
              <span className="text-sm font-normal text-[--color-muted]">/mo</span>
            </span>
          </div>
          <p className="mt-3 text-center text-sm font-medium text-[--color-primary] group-hover:underline">
            View details →
          </p>
        </Link>
      ))}
    </div>
  );
}
