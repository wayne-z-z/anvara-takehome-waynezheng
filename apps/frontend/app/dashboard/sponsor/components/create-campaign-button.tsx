'use client';

import { useState } from 'react';
import { CreateCampaignForm } from './create-campaign-form';

export function CreateCampaignButton() {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">New Campaign</h2>
        <CreateCampaignForm onSuccess={() => setShowForm(false)} />
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="text-sm text-[--color-muted] underline hover:no-underline"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setShowForm(true)}
      className="rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      Create Campaign
    </button>
  );
}
