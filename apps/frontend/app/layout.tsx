import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { GoogleAnalyticsScript } from './components/google-analytics';
import { Nav } from './components/nav';
import { Footer } from './components/footer';
import { ToastProvider } from './components/toast';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3847';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Anvara — Sponsorship Marketplace',
    template: '%s | Anvara',
  },
  description:
    'Sponsorship marketplace connecting sponsors with publishers. Reach your audience. List ad slots, run campaigns, connect.',
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Anvara',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Sponsorship marketplace connecting sponsors with publishers. Reach your audience.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Anvara — Sponsorship Marketplace',
    description:
      'Sponsorship marketplace connecting sponsors with publishers. Reach your audience.',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  const gtagInline = gaId
    ? `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId.replace(/'/g, "\\'")}');`
    : '';

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        {gaId && (
          <script dangerouslySetInnerHTML={{ __html: gtagInline }} />
        )}
        <ToastProvider>
          <Nav />
          <main className="mx-auto flex-1 w-full max-w-6xl p-4">{children}</main>
          <Footer />
        </ToastProvider>
        {gaId ? <GoogleAnalyticsScript gaId={gaId} /> : null}
      </body>
    </html>
  );
}
