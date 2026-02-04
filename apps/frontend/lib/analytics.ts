'use client';

import { useEffect, useRef } from 'react';
import { sendGAEvent } from '@next/third-parties/google';

const GA_ENABLED = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const DEBUG =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_ANALYTICS_DEBUG === 'true';

declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams?: Record<string, unknown>
    ) => void;
  }
}

/** Send a custom GA4 event. No-op if GA is not configured. Never throws. */
export function trackEvent(
  event: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (DEBUG) {
    const payload = params ?? {};
    const parts = Object.entries(payload)
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}=${String(v)}`);
    const suffix = parts.length ? ` ${parts.join(' ')}` : '';
    // eslint-disable-next-line no-console
    console.log(`[Analytics] ${event}${suffix}`);
  }
  if (!GA_ENABLED) return;
  try {
    const eventParams = params ? { ...params } : undefined;
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', event, eventParams ?? {});
    } else {
      sendGAEvent({ event, ...params });
    }
  } catch {
    // Analytics must never break the app (e.g. ad blocker, gtag not loaded)
  }
}

/** User type for conversion context */
export type UserType = 'sponsor' | 'publisher' | 'guest';

/** Event names and helpers for marketplace analytics */
export const analytics = {
  /** Micro: user viewed a listing detail (client-side view) */
  listingView: (adSlotId: string, adSlotName: string, userType: UserType = 'guest') =>
    trackEvent('listing_view', {
      ad_slot_id: adSlotId,
      ad_slot_name: adSlotName,
      user_type: userType,
    }),

  /** Micro: user clicked "Book this placement" CTA */
  bookPlacementClick: (adSlotId: string, adSlotName: string) =>
    trackEvent('cta_book_click', { ad_slot_id: adSlotId, ad_slot_name: adSlotName }),

  /** Micro: user clicked "Request a quote" (button open). Pass variant for A/B test analysis. */
  requestQuoteClick: (adSlotId: string, adSlotName: string, variant?: string) =>
    trackEvent('cta_quote_click', {
      ad_slot_id: adSlotId,
      ad_slot_name: adSlotName,
      ...(variant !== undefined && { ab_variant: variant }),
    }),

  /** User submitted the request-quote form. Pass variant for A/B test analysis. */
  quoteSubmitted: (adSlotId: string, variant?: string) =>
    trackEvent('quote_submitted', { ad_slot_id: adSlotId, ...(variant !== undefined && { ab_variant: variant }) }),

  /** User submitted the newsletter signup form */
  newsletterSignup: () => trackEvent('newsletter_signup'),

  /** User created a campaign (dashboard) */
  campaignCreated: () => trackEvent('campaign_created'),

  /** User created an ad slot (dashboard) */
  adSlotCreated: () => trackEvent('ad_slot_created'),
} as const;

/** Macro-conversion events for funnel analysis */
export const conversions = {
  /** Macro: user completed booking a placement */
  placementBooked: (adSlotId: string, adSlotName: string) =>
    trackEvent('conversion_placement_booked', { ad_slot_id: adSlotId, ad_slot_name: adSlotName }),

  /** Macro: user submitted a quote request. Pass variant for A/B test analysis. */
  quoteSubmitted: (adSlotId: string, variant?: string) =>
    trackEvent('conversion_quote_submitted', { ad_slot_id: adSlotId, ...(variant !== undefined && { ab_variant: variant }) }),

  /** Macro: user completed newsletter signup */
  newsletterSignup: () => trackEvent('conversion_newsletter_signup'),
} as const;

/**
 * Fire listing_view once when the detail page has loaded and role has settled.
 * Handles client-side navigation (fires once per mount).
 */
export function useTrackListingView(
  adSlot: { id: string; name: string } | null,
  userType: UserType | null | undefined,
  roleLoading: boolean
): void {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!adSlot || hasFired.current || roleLoading) return;
    hasFired.current = true;
    analytics.listingView(adSlot.id, adSlot.name, userType ?? 'guest');
  }, [adSlot, userType, roleLoading]);
}
