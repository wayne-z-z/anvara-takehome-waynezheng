'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { createAdSlotAction, type AdSlotFormState } from '../actions';

const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;
const initialState: AdSlotFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-[--color-primary] px-4 py-2 text-white disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Create Ad Slot'}
    </button>
  );
}

export function CreateAdSlotForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState(createAdSlotAction, initialState);

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
      <div>
        <label className="mb-1 block text-sm font-medium">Type *</label>
        <select
          name="type"
          required
          className="w-full rounded border border-[--color-border] px-3 py-2"
          aria-describedby={state.fieldErrors?.type ? 'type-error' : undefined}
        >
          {AD_SLOT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {state.fieldErrors?.type && (
          <p id="type-error" className="mt-1 text-sm text-red-600">
            {state.fieldErrors.type}
          </p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Position</label>
        <input
          type="text"
          name="position"
          className="w-full rounded border border-[--color-border] px-3 py-2"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Width</label>
          <input
            type="number"
            name="width"
            min="1"
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Height</label>
          <input
            type="number"
            name="height"
            min="1"
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Base price *</label>
          <input
            type="number"
            name="basePrice"
            required
            min="0"
            step="0.01"
            className="w-full rounded border border-[--color-border] px-3 py-2"
            aria-describedby={state.fieldErrors?.basePrice ? 'basePrice-error' : undefined}
          />
          {state.fieldErrors?.basePrice && (
            <p id="basePrice-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.basePrice}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">CPM floor</label>
          <input
            type="number"
            name="cpmFloor"
            min="0"
            step="0.01"
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <SubmitButton />
      </div>
    </form>
  );
}
