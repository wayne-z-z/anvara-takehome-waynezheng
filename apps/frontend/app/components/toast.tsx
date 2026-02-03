'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ToastType = 'success' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), TOAST_DURATION_MS);
  }, [removeToast]);

  const value = useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastList />
    </ToastContext.Provider>
  );
}

function ToastList() {
  const context = useContext(ToastContext);
  if (!context) return null;
  const { toasts, removeToast } = context;
  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-0 top-0 z-[100] flex flex-col gap-2 p-4 md:right-4 md:top-4"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast-in pointer-events-auto flex min-w-[280px] max-w-[90vw] items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          role="status"
        >
          <span
            className={
              t.type === 'success'
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }
            aria-hidden
          >
            {t.type === 'success' ? '✓' : '!'}
          </span>
          <p className="flex-1 text-sm font-medium">
            {t.message}
          </p>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="min-h-[44px] min-w-[44px] rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      success: () => {},
      error: () => {},
    };
  }
  return {
    success: (message: string) => ctx.addToast(message, 'success'),
    error: (message: string) => ctx.addToast(message, 'error'),
  };
}
