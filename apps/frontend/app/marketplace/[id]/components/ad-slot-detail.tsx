'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdSlot } from '@/lib/api';
import { authClient } from '@/auth-client';
import { RequestQuoteModal } from './request-quote-modal';

interface AdSlot {
  id: string;
  name: string;
  description?: string;
  type: string;
  basePrice: number;
  isAvailable: boolean;
  publisher?: {
    id: string;
    name: string;
    website?: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface RoleInfo {
  role: 'sponsor' | 'publisher' | null;
  sponsorId?: string;
  publisherId?: string;
  name?: string;
}

const typeColors: Record<string, string> = {
  DISPLAY: 'bg-blue-100 text-blue-700',
  VIDEO: 'bg-red-100 text-red-700',
  NEWSLETTER: 'bg-purple-100 text-purple-700',
  PODCAST: 'bg-orange-100 text-orange-700',
};

interface Props {
  id: string;
}

export function AdSlotDetail({ id }: Props) {
  const [adSlot, setAdSlot] = useState<AdSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roleInfo, setRoleInfo] = useState<RoleInfo | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    // Fetch ad slot
    getAdSlot(id)
      .then(setAdSlot)
      .catch(() => setError('Failed to load ad slot details'))
      .finally(() => setLoading(false));

    // Check user session and fetch role
    authClient
      .getSession()
      .then(({ data }) => {
        if (data?.user) {
          const sessionUser = data.user as User;
          setUser(sessionUser);

          // Fetch role info from backend
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/auth/role/${sessionUser.id}`
          )
            .then((res) => res.json())
            .then((data) => setRoleInfo(data))
            .catch(() => setRoleInfo(null))
            .finally(() => setRoleLoading(false));
        } else {
          setRoleLoading(false);
        }
      })
      .catch(() => setRoleLoading(false));
  }, [id]);

  const handleBooking = async () => {
    if (!roleInfo?.sponsorId || !adSlot) return;

    setBooking(true);
    setBookingError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/book`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sponsorId: roleInfo.sponsorId,
            message: message || undefined,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to book placement');
      }

      setBookingSuccess(true);
      setAdSlot({ ...adSlot, isAvailable: false });
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to book placement');
    } finally {
      setBooking(false);
    }
  };

  const handleUnbook = async () => {
    if (!adSlot) return;

    setBookingError(null);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291'}/api/ad-slots/${adSlot.id}/unbook`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const msg = data?.error || (response.status === 403 ? 'Only the publisher can reset this listing.' : 'Failed to reset booking');
        throw new Error(msg);
      }

      setBookingSuccess(false);
      setAdSlot({ ...adSlot, isAvailable: true });
      setMessage('');
    } catch (err) {
      setBookingError(err instanceof Error ? err.message : 'Failed to reset booking');
    }
  };

  const canUnbook = Boolean(adSlot?.publisher && roleInfo?.publisherId && adSlot.publisher.id === roleInfo.publisherId);

  if (loading) {
    return <div className="py-12 text-center text-[--color-muted]">Loading...</div>;
  }

  if (error || !adSlot) {
    return (
      <div className="space-y-4">
        <Link href="/marketplace" className="text-[--color-primary] hover:underline">
          ← Back to Marketplace
        </Link>
        <div className="rounded border border-red-200 bg-red-50 p-4 text-red-600">
          {error || 'Ad slot not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/marketplace"
        className="inline-flex min-h-[44px] items-center text-sm font-medium text-[--color-primary] hover:underline"
      >
        ← Back to Marketplace
      </Link>

      <div className="rounded-xl border border-[--color-border] bg-[--color-background] shadow-sm">
        <div className="p-6 md:p-8">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[--color-foreground] md:text-3xl">
                {adSlot.name}
              </h1>
              {adSlot.publisher && (
                <p className="mt-1 text-[--color-muted]">
                  by {adSlot.publisher.name}
                  {adSlot.publisher.website && (
                    <>
                      {' '}
                      ·{' '}
                      <a
                        href={adSlot.publisher.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[--color-primary] hover:underline"
                      >
                        {adSlot.publisher.website}
                      </a>
                    </>
                  )}
                </p>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${typeColors[adSlot.type] || 'bg-gray-100 text-gray-700'}`}
            >
              {adSlot.type}
            </span>
          </div>

          {adSlot.description && (
            <p className="mb-6 text-[--color-muted] leading-relaxed">{adSlot.description}</p>
          )}

          {/* Value prop: why book */}
          <div className="mb-6 flex flex-wrap gap-4 text-sm text-[--color-muted]">
            <span className="flex items-center gap-1.5">✓ Direct partnership</span>
            <span className="flex items-center gap-1.5">✓ Clear pricing</span>
            <span className="flex items-center gap-1.5">✓ No hidden fees</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[--color-border] py-5">
            <div>
              <span
                className={`inline-flex items-center gap-2 text-sm font-medium ${adSlot.isAvailable ? 'text-green-600' : 'text-[--color-muted]'}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${adSlot.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}
                  aria-hidden
                />
                {adSlot.isAvailable ? 'Available — reserve your spot' : 'Currently Booked'}
              </span>
              {!adSlot.isAvailable && !bookingSuccess && canUnbook && (
                <button
                  onClick={handleUnbook}
                  className="ml-3 text-sm text-[--color-primary] underline hover:no-underline"
                >
                  Reset listing
                </button>
              )}
            </div>
            {bookingError && !adSlot.isAvailable && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                {bookingError}
              </p>
            )}
            <div className="rounded-lg border-2 border-[--color-primary]/20 bg-[--color-primary]/5 px-5 py-3 text-right">
              <p className="text-2xl font-bold text-[--color-primary] md:text-3xl">
                ${Number(adSlot.basePrice).toLocaleString()}
              </p>
              <p className="text-sm font-medium text-[--color-muted]">per month</p>
            </div>
          </div>

        {adSlot.isAvailable && !bookingSuccess && (
          <div className="border-t border-[--color-border] pt-6">
            <h2 className="mb-1 text-lg font-semibold text-[--color-foreground]">
              Book or get a quote
            </h2>
            <p className="mb-5 text-sm text-[--color-muted]">
              Secure this placement or request custom pricing. We&apos;ll connect you with the publisher.
            </p>

            {roleLoading ? (
              <div className="py-4 text-center text-[--color-muted]">Loading...</div>
            ) : roleInfo?.role === 'sponsor' && roleInfo?.sponsorId ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[--color-muted]">
                    Your Company
                  </label>
                  <p className="text-[--color-foreground]">{roleInfo.name || user?.name}</p>
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="mb-1 block text-sm font-medium text-[--color-muted]"
                  >
                    Message to Publisher (optional)
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the publisher about your campaign goals..."
                    className="w-full rounded-lg border border-[--color-border] bg-[--color-background] px-3 py-2 text-[--color-foreground] placeholder:text-[--color-muted] focus:border-[--color-primary] focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
                    rows={3}
                  />
                </div>
                {bookingError && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                    {bookingError}
                  </p>
                )}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleBooking}
                    disabled={booking}
                    className="min-h-[48px] flex-1 rounded-lg bg-[--color-primary] px-5 py-3 text-base font-semibold text-white shadow-md transition-[transform,box-shadow] hover:bg-[--color-primary-hover] hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
                  >
                    {booking ? 'Booking...' : 'Book this placement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuoteModal(true)}
                    className="min-h-[48px] flex-1 rounded-lg border-2 border-[--color-border] bg-[--color-background] px-5 py-3 text-base font-semibold text-[--color-foreground] transition-colors hover:border-[--color-primary] hover:bg-[--color-primary]/5"
                  >
                    Request a quote
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[--color-muted]">
                  {user
                    ? 'Only sponsors can book directly. Request a quote for custom pricing or questions.'
                    : 'Sign in as a sponsor to book, or request a quote for custom pricing.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full min-h-[48px] rounded-lg bg-indigo-600 px-5 py-3 text-base font-semibold text-white shadow-md transition-[transform,box-shadow] hover:bg-indigo-700 hover:shadow-lg active:scale-[0.98]"
                >
                  Request a quote
                </button>
              </div>
            )}
          </div>
        )}

        {showQuoteModal && (
          <RequestQuoteModal
            adSlotId={adSlot.id}
            adSlotName={adSlot.name}
            defaultEmail={user?.email ?? ''}
            defaultCompanyName={roleInfo?.name ?? user?.name ?? ''}
            onClose={() => setShowQuoteModal(false)}
          />
        )}

        {bookingSuccess && (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-800">Placement Booked!</h3>
            <p className="mt-1 text-sm text-green-700">
              Your request has been submitted. The publisher will be in touch soon.
            </p>
            {canUnbook && (
              <button
                onClick={handleUnbook}
                className="mt-3 text-sm text-green-700 underline hover:text-green-800"
              >
                Remove Booking (reset for testing)
              </button>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
