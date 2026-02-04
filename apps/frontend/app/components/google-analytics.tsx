'use client';

import { useEffect } from 'react';

/**
 * Loads the GA4 gtag.js script. The inline script in layout already defined
 * dataLayer and gtag and called gtag('config', gaId). This just loads the
 * external script so gtag commands are sent to GA4.
 */
export function GoogleAnalyticsScript({ gaId }: { gaId: string }) {
  useEffect(() => {
    if (!gaId || typeof window === 'undefined') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);
  }, [gaId]);

  return null;
}
