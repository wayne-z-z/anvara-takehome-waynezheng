'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  /** Short, user-friendly title */
  title: string;
  /** Optional detail or suggested next step */
  message?: string;
  /** Optional retry handler; defaults to router.refresh() */
  onRetry?: () => void;
  /** Optional secondary action (e.g. "Sign in" link when error is 401) */
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  secondaryHref,
  secondaryLabel,
}: ErrorStateProps) {
  const router = useRouter();
  const handleRetry = onRetry ?? (() => router.refresh());

  return (
    <div
      className="rounded-xl border-2 border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950/50"
      role="alert"
      aria-live="polite"
    >
      <div className="mb-3 text-4xl" aria-hidden>
        ⚠️
      </div>
      <p className="font-semibold text-red-800 dark:text-red-200">{title}</p>
      {message && <p className="mt-1 text-sm text-red-600 dark:text-red-300">{message}</p>}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-600"
          >
            {secondaryLabel}
          </Link>
        ) : (
          <button
            type="button"
            onClick={handleRetry}
            className="min-h-[44px] rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
