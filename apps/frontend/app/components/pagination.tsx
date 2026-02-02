'use client';

import Link from 'next/link';

interface PaginationProps {
  /** Current page (1-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Base path for links (e.g. /dashboard/sponsor). Query param ?page= is appended */
  basePath: string;
}

export function Pagination({ page, limit, total, basePath }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-[--color-muted]">
        Showing {start}&ndash;{end} of {total} results
      </p>
      <nav aria-label="Pagination" className="flex items-center gap-2">
        {prevPage != null ? (
          <Link
            href={`${basePath}?page=${prevPage}`}
            className="rounded-lg border border-[--color-border] px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-lg border border-[--color-border] px-3 py-2 text-sm font-medium text-[--color-muted]"
          >
            Previous
          </span>
        )}
        <span className="px-2 text-sm text-[--color-muted]">
          Page {page} of {totalPages}
        </span>
        {nextPage != null ? (
          <Link
            href={`${basePath}?page=${nextPage}`}
            className="rounded-lg border border-[--color-border] px-3 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[--color-primary] focus:ring-offset-2"
          >
            Next
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-lg border border-[--color-border] px-3 py-2 text-sm font-medium text-[--color-muted]"
          >
            Next
          </span>
        )}
      </nav>
    </div>
  );
}
