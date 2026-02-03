'use client';

import { useState, type FormEvent } from 'react';
import { requestQuote } from '@/lib/api';
import { analytics } from '@/lib/analytics';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RequestQuoteModalProps {
  adSlotId: string;
  adSlotName: string;
  /** Pre-fill when user is logged in */
  defaultEmail?: string;
  defaultCompanyName?: string;
  onClose: () => void;
}

export function RequestQuoteModal({
  adSlotId,
  adSlotName,
  defaultEmail = '',
  defaultCompanyName = '',
  onClose,
}: RequestQuoteModalProps) {
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState('');
  const [budget, setBudget] = useState('');
  const [goals, setGoals] = useState('');
  const [timeline, setTimeline] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const companyTrimmed = companyName.trim();
    const emailTrimmed = email.trim();
    if (!companyTrimmed) {
      setStatus('error');
      setErrorMessage('Company name is required.');
      return;
    }
    if (!emailTrimmed) {
      setStatus('error');
      setErrorMessage('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(emailTrimmed)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      await requestQuote({
        adSlotId,
        email: emailTrimmed,
        companyName: companyTrimmed,
        message: message.trim() || undefined,
        phone: phone.trim() || undefined,
        budget: budget.trim() || undefined,
        goals: goals.trim() || undefined,
        timeline: timeline.trim() || undefined,
      });
      setStatus('success');
      analytics.quoteSubmitted(adSlotId);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-quote-title"
    >
      <div className="h-[90vh] w-full max-h-[90vh] overflow-y-auto rounded-t-2xl border border-b-0 border-[--color-border] bg-white shadow-2xl dark:bg-gray-900 sm:h-auto sm:max-h-[90vh] sm:rounded-xl sm:border-b sm:border-[--color-border]">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[--color-border] bg-white px-4 py-3 dark:bg-gray-900 sm:rounded-t-xl">
          <h2 id="request-quote-title" className="text-lg font-semibold">
            Request a Quote — {adSlotName}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded text-[--color-muted] hover:bg-gray-100 hover:text-[--color-foreground] focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="bg-white p-4 dark:bg-gray-900">
          {status === 'success' ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="font-semibold text-green-800">Quote request received</h3>
                <p className="mt-1 text-sm text-green-700">
                  We&apos;ll get back to you within 2 business days with pricing and next steps.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg bg-[--color-primary] px-4 py-3 font-medium text-white hover:opacity-90"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-[--color-muted]">
                Prefer custom pricing or have questions? Send your details and we&apos;ll follow up.
              </p>

              <div>
                <label htmlFor="quote-company" className="mb-1 block text-sm font-medium">
                  Company name *
                </label>
                <input
                  id="quote-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  className="min-h-[44px] w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                />
              </div>

              <div>
                <label htmlFor="quote-email" className="mb-1 block text-sm font-medium">
                  Email *
                </label>
                <input
                  id="quote-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="min-h-[44px] w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                />
              </div>

              <div>
                <label htmlFor="quote-phone" className="mb-1 block text-sm font-medium">
                  Phone (optional)
                </label>
                <input
                  id="quote-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="min-h-[44px] w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="quote-budget" className="mb-1 block text-sm font-medium">
                    Budget
                  </label>
                  <input
                    id="quote-budget"
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. $5,000/mo"
                    className="min-h-[44px] w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                  />
                </div>
                <div>
                  <label htmlFor="quote-timeline" className="mb-1 block text-sm font-medium">
                    Timeline
                  </label>
                  <input
                    id="quote-timeline"
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. Q2 2026"
                    className="min-h-[44px] w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quote-goals" className="mb-1 block text-sm font-medium">
                  Campaign goals
                </label>
                <input
                  id="quote-goals"
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  placeholder="e.g. Brand awareness, lead gen"
                  className="min-h-[44px] w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                />
              </div>

              <div>
                <label htmlFor="quote-message" className="mb-1 block text-sm font-medium">
                  Special requirements
                </label>
                <textarea
                  id="quote-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Custom packages, questions, etc."
                  rows={3}
                  className="w-full rounded-lg border border-[--color-border] px-3 py-2 focus:border-[--color-primary] focus:outline-none focus:ring-2 focus:ring-[--color-primary]/20"
                />
              </div>

              {status === 'error' && errorMessage && (
                <p className="text-sm text-red-600" role="alert">
                  {errorMessage}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-lg border border-[--color-border] px-4 py-3 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="flex-1 rounded-lg bg-[--color-primary] px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {status === 'loading' ? 'Sending…' : 'Request Quote'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
