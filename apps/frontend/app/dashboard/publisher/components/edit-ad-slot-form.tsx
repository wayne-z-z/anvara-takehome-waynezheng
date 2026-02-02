'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { AdSlot } from '@/lib/types';
import { updateAdSlotAction, type AdSlotFormState } from '../actions';

const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;

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

export function EditAdSlotForm({
  adSlot,
  onSuccess,
  onCancel,
}: {
  adSlot: AdSlot;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const initialState: AdSlotFormState = {};
  const [state, formAction] = useActionState(updateAdSlotAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      onSuccess?.();
    }
  }, [state.success, router, onSuccess]);

  const slotWithExtras = adSlot as AdSlot & {
    position?: string;
    width?: number;
    height?: number;
    cpmFloor?: number;
  };

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-[--color-border] p-4">
      <input type="hidden" name="id" value={adSlot.id} />
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
          defaultValue={adSlot.name}
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
          defaultValue={adSlot.description ?? ''}
          className="w-full rounded border border-[--color-border] px-3 py-2"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Type *</label>
        <select
          name="type"
          required
          defaultValue={adSlot.type}
          className="w-full rounded border border-[--color-border] px-3 py-2"
        >
          {AD_SLOT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Position</label>
        <input
          type="text"
          name="position"
          defaultValue={slotWithExtras.position ?? ''}
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
            defaultValue={slotWithExtras.width ?? ''}
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Height</label>
          <input
            type="number"
            name="height"
            min="1"
            defaultValue={slotWithExtras.height ?? ''}
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
            defaultValue={Number(adSlot.basePrice)}
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
          {state.fieldErrors?.basePrice && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.basePrice}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">CPM floor</label>
          <input
            type="number"
            name="cpmFloor"
            min="0"
            step="0.01"
            defaultValue={slotWithExtras.cpmFloor ?? ''}
            className="w-full rounded border border-[--color-border] px-3 py-2"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="isAvailable"
          id="isAvailable"
          value="true"
          defaultChecked={adSlot.isAvailable}
          className="rounded border-[--color-border]"
        />
        <input type="hidden" name="isAvailable" value="false" />
        <label htmlFor="isAvailable" className="text-sm font-medium">
          Available for booking
        </label>
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
