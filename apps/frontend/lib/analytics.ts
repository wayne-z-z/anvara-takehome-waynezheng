'use client';

import { sendGAEvent } from '@next/third-parties/google';

const GA_ENABLED = typeof window !== 'undefined' && !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/** Send a custom GA4 event. No-op if GA is not configured. Never throws. */
export function trackEvent(
  event: string,
  params?: Record<string, string | number | boolean | undefined>
): void {
  if (!GA_ENABLED) return;
  try {
    sendGAEvent({ event, ...params });
  } catch {
    // Analytics must never break the app (e.g. ad blocker, gtag not loaded)
  }
}

/** Event names and helpers for marketplace analytics */
export const analytics = {
  /** User clicked "Book this placement" on an ad slot detail */
  bookPlacementClick: (adSlotId: string, adSlotName: string) =>
    trackEvent('cta_book_click', { ad_slot_id: adSlotId, ad_slot_name: adSlotName }),

  /** User clicked "Request a quote" (button open) */
  requestQuoteClick: (adSlotId: string, adSlotName: string) =>
    trackEvent('cta_quote_click', { ad_slot_id: adSlotId, ad_slot_name: adSlotName }),

  /** User submitted the request-quote form */
  quoteSubmitted: (adSlotId: string) => trackEvent('quote_submitted', { ad_slot_id: adSlotId }),

  /** User submitted the newsletter signup form */
  newsletterSignup: () => trackEvent('newsletter_signup'),

  /** User created a campaign (dashboard) */
  campaignCreated: () => trackEvent('campaign_created'),

  /** User created an ad slot (dashboard) */
  adSlotCreated: () => trackEvent('ad_slot_created'),
} as const;
