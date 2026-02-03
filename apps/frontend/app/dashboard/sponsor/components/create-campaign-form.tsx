'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/app/components/toast';
import { analytics } from '@/lib/analytics';
import { createCampaignAction, type CampaignFormState } from '../actions';

const initialState: CampaignFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-[--color-primary] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[--color-primary-hover] disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Create Campaign'}
    </button>
  );
}

export function CreateCampaignForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [state, formAction] = useActionState(createCampaignAction, initialState);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (state.success) {
      router.refresh();
      toast.success('Campaign created');
      analytics.campaignCreated();
      onSuccess?.();
    }
  }, [state.success, router, toast, onSuccess]);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm">
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Name *</label>
        <input
          type="text"
          name="name"
          required
          className="form-input"
          aria-invalid={!!state.fieldErrors?.name}
          aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.name}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Description</label>
        <textarea name="description" rows={2} className="form-input resize-y" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Budget *</label>
          <input
            type="number"
            name="budget"
            required
            min="1"
            step="0.01"
            className="form-input"
            aria-invalid={!!state.fieldErrors?.budget}
            aria-describedby={state.fieldErrors?.budget ? 'budget-error' : undefined}
          />
          {state.fieldErrors?.budget && (
            <p id="budget-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.budget}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Status</label>
          <select name="status" className="form-input">
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Start date *</label>
          <input
            type="date"
            name="startDate"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="form-input"
            aria-invalid={!!state.fieldErrors?.startDate}
            aria-describedby={state.fieldErrors?.startDate ? 'startDate-error' : undefined}
          />
          {state.fieldErrors?.startDate && (
            <p id="startDate-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.startDate}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">End date *</label>
          <input
            type="date"
            name="endDate"
            required
            min={startDate || undefined}
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
      </div>
    </form>
  );
}
