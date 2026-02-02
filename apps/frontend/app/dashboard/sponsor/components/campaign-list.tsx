import type { ReactNode } from 'react';
import type { Campaign } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';
import { CampaignCard } from './campaign-card';

interface CampaignListProps {
  campaigns: Campaign[];
  error: string | null;
  /** Optional CTA for empty state (e.g. Create Campaign button) */
  emptyAction?: ReactNode;
}

export function CampaignList({ campaigns, error, emptyAction }: CampaignListProps) {
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
