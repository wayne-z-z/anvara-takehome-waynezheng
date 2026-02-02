'use client';

import { useRouter } from 'next/navigation';

interface ErrorStateProps {
  /** Short, user-friendly title */
  title: string;
  /** Optional detail or suggested next step */
  message?: string;
  /** Optional retry handler; defaults to router.refresh() */
  onRetry?: () => void;
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  const router = useRouter();
  const handleRetry = onRetry ?? (() => router.refresh());

  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 p-6 text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="mb-3 text-4xl" aria-hidden>
        ⚠️
      </div>
      <p className="font-semibold text-red-800">{title}</p>
      {message && <p className="mt-1 text-sm text-red-600">{message}</p>}
      <button
        type="button"
        onClick={handleRetry}
        className="mt-4 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
