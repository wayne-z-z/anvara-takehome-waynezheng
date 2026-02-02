'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createCampaignAction, type CampaignFormState } from '../actions';

const initialState: CampaignFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[--color-primary] px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Create Campaign'}
    </button>
  );
}

export function CreateCampaignForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createCampaignAction, initialState);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onSuccess?.();
    }
  }, [state.success, router, onSuccess]);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-[--color-border] p-4">
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
          className="w-full rounded border border-[--color-border] px-3 py-2"
          aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
        />
        {state.fieldErrors?.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.name}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Description</label>
        <textarea
          name="description"
          rows={2}
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
            className="w-full rounded border border-[--color-border] px-3 py-2"
            aria-describedby={state.fieldErrors?.budget ? 'budget-error' : undefined}
          />
          {state.fieldErrors?.budget && (
            <p id="budget-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.budget}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select name="status" className="w-full rounded border border-[--color-border] px-3 py-2">
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
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded border border-[--color-border] px-3 py-2"
            aria-describedby={state.fieldErrors?.startDate ? 'startDate-error' : undefined}
          />
          {state.fieldErrors?.startDate && (
            <p id="startDate-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.startDate}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">End date *</label>
          <input
            type="date"
            name="endDate"
            required
            min={startDate || undefined}
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
      </div>
    </form>
  );
}
