'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { Campaign } from '@/lib/types';
import { ErrorState } from '@/app/components/error-state';
import { EmptyState } from '@/app/components/empty-state';
import { Pagination } from '@/app/components/pagination';
import { useToast } from '@/app/components/toast';
import { CampaignCard } from './campaign-card';
import { deleteCampaignAction } from '../actions';

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
  const router = useRouter();
  const toast = useToast();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [removingCampaigns, setRemovingCampaigns] = useState<Campaign[]>([]);

  const onRequestDelete = useCallback(
    (id: string) => {
      const campaign = campaigns.find((c) => c.id === id);
      if (campaign) {
        setRemovingCampaigns((prev) => [...prev, campaign]);
        setRemovingIds((prev) => new Set(prev).add(id));
      }
    },
    [campaigns]
  );

  const onExitComplete = useCallback(
    async (id: string) => {
      const formData = new FormData();
      formData.set('id', id);
      await deleteCampaignAction({}, formData);
      toast.success('Campaign deleted');
      router.refresh();
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setRemovingCampaigns((prev) => prev.filter((c) => c.id !== id));
    },
    [router, toast]
  );

  if (error) {
    return (
      <ErrorState
        title="Unable to load campaigns"
        message="Please check your connection and try again."
      />
    );
  }

  const visibleCampaigns = campaigns.filter((c) => !removingIds.has(c.id));
  const allShowing = [...visibleCampaigns, ...removingCampaigns];

  if (allShowing.length === 0) {
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
        {allShowing.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            isRemoving={removingIds.has(campaign.id)}
            onExitComplete={onExitComplete}
            onRequestDelete={onRequestDelete}
          />
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
