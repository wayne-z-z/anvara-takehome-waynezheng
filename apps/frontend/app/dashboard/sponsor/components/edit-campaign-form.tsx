'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Campaign } from '@/lib/types';
import { useToast } from '@/app/components/toast';
import { updateCampaignAction, type CampaignFormState } from '../actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-[--color-primary] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[--color-primary-hover] disabled:opacity-50"
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
  const toast = useToast();
  const initialState: CampaignFormState = {};
  const [state, formAction] = useActionState(updateCampaignAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      toast.success('Campaign updated');
      onSuccess?.();
    }
  }, [state.success, router, toast, onSuccess]);

  const startDate = campaign.startDate.includes('T')
    ? campaign.startDate.slice(0, 10)
    : campaign.startDate;
  const endDate = campaign.endDate.includes('T') ? campaign.endDate.slice(0, 10) : campaign.endDate;

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={campaign.id} />
      {state.error && (
        <p
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600"
          role="alert"
        >
          {state.error}
        </p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Name *</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={campaign.name}
          className="form-input"
          aria-invalid={!!state.fieldErrors?.name}
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
          Description
        </label>
        <textarea
          name="description"
          rows={2}
          defaultValue={campaign.description ?? ''}
          className="form-input resize-y"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            Budget *
          </label>
          <input
            type="number"
            name="budget"
            required
            min="1"
            step="0.01"
            defaultValue={Number(campaign.budget)}
            className="form-input"
            aria-invalid={!!state.fieldErrors?.budget}
          />
          {state.fieldErrors?.budget && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.budget}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            Status
          </label>
          <select name="status" defaultValue={campaign.status} className="form-input">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            Start date *
          </label>
          <input
            type="date"
            name="startDate"
            required
            defaultValue={startDate}
            className="form-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            End date *
          </label>
          <input
            type="date"
            name="endDate"
            required
            min={startDate}
            defaultValue={endDate}
            className="form-input"
            aria-describedby={state.fieldErrors?.endDate ? 'endDate-error' : undefined}
            aria-invalid={!!state.fieldErrors?.endDate}
          />
          {state.fieldErrors?.endDate && (
            <p id="endDate-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.endDate}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[--color-border] pt-4">
        <SubmitButton />
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] rounded-lg border border-[--color-border] bg-[--color-background] px-4 py-2.5 text-sm font-medium text-[--color-foreground] transition-colors hover:bg-[--color-border]"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
