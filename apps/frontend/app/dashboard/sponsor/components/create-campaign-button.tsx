'use client';

import { useState } from 'react';
import { Modal } from '@/app/components/modal';
import { CreateCampaignForm } from './create-campaign-form';

export function CreateCampaignButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="min-h-[44px] rounded-lg bg-[--color-primary] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-[--color-primary-hover] hover:shadow-md active:scale-[0.98]"
      >
        Create Campaign
      </button>
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="New campaign"
        maxWidth="max-w-lg"
      >
        <CreateCampaignForm onSuccess={() => setShowForm(false)} />
      </Modal>
    </>
  );
}
