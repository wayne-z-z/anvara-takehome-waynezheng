// Utility helpers for the API

/** Safely extract a single route/query param as string; returns '' if missing or invalid. */
export function getParam(param: unknown): string {
  if (typeof param === 'string') return param;
  if (Array.isArray(param) && typeof param[0] === 'string') return param[0];
  return '';
}

/** Format a number as currency. */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });
  return formatter.format(amount);
}

/** Calculate percentage change between two values. */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/** Parse pagination params from query; returns page, limit, and skip for DB. */
export function parsePagination(query: { page?: string; limit?: string }): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(query.page ?? '', 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit ?? '', 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper to build filter object from query params
export const buildFilters = (
  query: Record<string, unknown>,
  allowedFields: string[]
): Record<string, unknown> => {
  const filters: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (query[field] !== undefined) {
      filters[field] = query[field];
    }
  }

  return filters;
};

/** Clamp a number between min and max (inclusive). */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Format a date for display; returns fallback for invalid dates. */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString();
}
