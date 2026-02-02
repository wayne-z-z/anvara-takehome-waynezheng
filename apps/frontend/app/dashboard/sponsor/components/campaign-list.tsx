import type { ReactNode } from 'react';
import type { Campaign } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';
import { Pagination } from '@/app/components/pagination';
import { CampaignCard } from './campaign-card';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  basePath: string;
}

interface CampaignListProps {
  campaigns: Campaign[];
  error: string | null;
  /** Optional CTA for empty state */
  emptyAction?: ReactNode;
  /** Optional pagination (show "Showing X–Y of Z" and Prev/Next) */
  pagination?: PaginationMeta;
}

export function CampaignList({ campaigns, error, emptyAction, pagination }: CampaignListProps) {
  if (error) {
    return (
      <ErrorState
        title="Unable to load campaigns"
        message="Please check your connection and try again."
      />
    );
  }

  if (campaigns.length === 0) {
    return (
      <EmptyState
        icon="📢"
        title="No campaigns yet"
        description="Create your first campaign to reach your audience and start booking ad slots."
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
      {pagination && (
        <Pagination
          page={pagination.page}
          limit={pagination.limit}
          total={pagination.total}
          basePath={pagination.basePath}
        />
      )}
    </div>
  );
}
