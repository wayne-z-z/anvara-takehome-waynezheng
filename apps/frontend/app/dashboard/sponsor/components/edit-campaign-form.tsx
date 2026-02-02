'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Campaign } from '@/lib/types';
import { updateCampaignAction, type CampaignFormState } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[--color-primary] px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}

export function EditCampaignForm({
  campaign,
  onSuccess,
  onCancel,
}: {
  campaign: Campaign;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const initialState: CampaignFormState = {};
  const [state, formAction] = useActionState(updateCampaignAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onSuccess?.();
    }
  }, [state.success, router, onSuccess]);

  const startDate = campaign.startDate.includes('T')
    ? campaign.startDate.slice(0, 10)
    : campaign.startDate;
  const endDate = campaign.endDate.includes('T') ? campaign.endDate.slice(0, 10) : campaign.endDate;

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-[--color-border] p-4">
      <input type="hidden" name="id" value={campaign.id} />
      {state.error && (
        <p className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div>
        <label className="mb-1 block text-sm font-medium">Name *</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={campaign.name}
          className="w-full rounded border border-[--color-border] px-3 py-2"
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={campaign.description ?? ''}
          className="w-full rounded border border-[--color-border] px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Budget *</label>
          <input
            type="number"
            name="budget"
            required
            min="1"
            step="0.01"
            defaultValue={Number(campaign.budget)}
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
          {state.fieldErrors?.budget && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.budget}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue={campaign.status}
            className="w-full rounded border border-[--color-border] px-3 py-2"
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Start date *</label>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={startDate}
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">End date *</label>
          <input
            type="date"
            name="endDate"
            required
            min={startDate}
            defaultValue={endDate}
            className="w-full rounded border border-[--color-border] px-3 py-2"
            aria-describedby={state.fieldErrors?.endDate ? 'endDate-error' : undefined}
          />
          {state.fieldErrors?.endDate && (
            <p id="endDate-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.endDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <SubmitButton />
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
