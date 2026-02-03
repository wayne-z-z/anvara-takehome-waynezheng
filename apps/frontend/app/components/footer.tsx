'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { subscribeNewsletter } from '@/lib/api';
import { analytics, conversions } from '@/lib/analytics';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const result = await subscribeNewsletter(trimmed);
      setStatus('success');
      setMessage(result.message);
      setEmail('');
      analytics.newsletterSignup();
      conversions.newsletterSignup();
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <footer className="mt-auto border-t border-[--color-border]">
      <div className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="text-lg font-bold text-[--color-primary]">
              Anvara
            </Link>
            <p className="mt-2 text-sm text-[--color-muted]">
              Connect with the right audiences. Sponsor campaigns and publisher ad slots in one
              place.
            </p>
          </div>

          <div className="min-w-[280px] sm:max-w-xs">
            <h3 className="text-sm font-semibold text-[--color-foreground]">
              Stay in the loop
            </h3>
            <p className="mt-1 text-sm text-[--color-muted]">
              Get updates on new inventory and tips for sponsors.
            </p>
            {status === 'success' ? (
              <p
                className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
                role="status"
              >
                {message}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <label htmlFor="newsletter-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={status === 'loading'}
                  autoComplete="email"
                  aria-describedby={message ? 'newsletter-error' : undefined}
                  aria-invalid={status === 'error'}
                  className="min-h-[44px] flex-1 rounded-lg border border-[--color-border] px-3 py-2 text-sm focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="min-h-[44px] shrink-0 rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-medium text-white hover:bg-[--color-primary-hover] disabled:opacity-50"
                >
                  {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            )}
            {status === 'error' && message && (
              <p id="newsletter-error" className="mt-2 text-sm text-red-600" role="alert">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-[--color-border] pt-6 text-center text-sm text-[--color-muted]">
          <p>© {new Date().getFullYear()} Anvara. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
