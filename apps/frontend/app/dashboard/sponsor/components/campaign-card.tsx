'use client';

import { useState } from 'react';
import type { Campaign } from '@/lib/types';
import { Modal } from '@/app/components/modal';
import { EditCampaignForm } from './edit-campaign-form';
import { DeleteCampaignButton } from './delete-campaign-button';

interface CampaignCardProps {
  campaign: Campaign;
  /** Card is animating out (delete); show exit animation. */
  isRemoving?: boolean;
  /** Called when exit animation ends (so parent can run delete and refresh). */
  onExitComplete?: (id: string) => void;
  /** When provided, delete confirm triggers this instead of form (for exit animation). */
  onRequestDelete?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
};

export function CampaignCard({
  campaign,
  isRemoving,
  onExitComplete,
  onRequestDelete,
}: CampaignCardProps) {
  const [editing, setEditing] = useState(false);

  const progress =
    campaign.budget > 0 ? (Number(campaign.spent) / Number(campaign.budget)) * 100 : 0;

  const handleAnimationEnd = () => {
    if (isRemoving && onExitComplete) onExitComplete(campaign.id);
  };

  return (
    <div
      className={`rounded-xl border border-[--color-border] bg-[--color-background] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${isRemoving ? 'animate-card-exit' : ''}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-semibold">{campaign.name}</h3>
        <span
          className={`rounded px-2 py-0.5 text-xs ${statusColors[campaign.status] || 'bg-gray-100'}`}
        >
          {campaign.status}
        </span>
      </div>

      {campaign.description && (
        <p className="mb-3 text-sm text-[--color-muted] line-clamp-2">{campaign.description}</p>
      )}

      <div className="mb-2">
        <div className="flex justify-between text-sm">
          <span className="text-[--color-muted]">Budget</span>
          <span>
            ${Number(campaign.spent).toLocaleString()} / ${Number(campaign.budget).toLocaleString()}
          </span>
        </div>
        <div className="mt-1 h-1.5 rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-[--color-primary]"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="mb-3 text-xs text-[--color-muted]">
        {new Date(campaign.startDate).toLocaleDateString()} -{' '}
        {new Date(campaign.endDate).toLocaleDateString()}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-[--color-border] pt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex min-h-[40px] items-center rounded-lg border border-[--color-border] bg-[--color-background] px-3 py-2 text-sm font-medium text-[--color-foreground] transition-colors hover:bg-[--color-border]"
        >
          Edit
        </button>
        <DeleteCampaignButton
          campaignId={campaign.id}
          campaignName={campaign.name}
          onRequestDelete={onRequestDelete}
        />
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit campaign"
        maxWidth="max-w-lg"
      >
        <EditCampaignForm
          campaign={campaign}
          onSuccess={() => setEditing(false)}
          onCancel={() => setEditing(false)}
        />
      </Modal>
    </div>
  );
}
