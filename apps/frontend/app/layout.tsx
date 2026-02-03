import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { Nav } from './components/nav';
import { Footer } from './components/footer';
import { ToastProvider } from './components/toast';

// TODO: Add ErrorBoundary wrapper for graceful error handling
// TODO: Consider adding a loading.tsx for Suspense boundaries
// TODO: Consider adding favicon and app icons

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3847';

export const metadata: Metadata = {
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
  // HINT: If using React Query, you would wrap children with QueryClientProvider here
  // See: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <ToastProvider>
          <Nav />
          <main className="mx-auto flex-1 w-full max-w-6xl p-4">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
