'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { AdSlot } from '@/lib/types';
import { useToast } from '@/app/components/toast';
import { updateAdSlotAction, type AdSlotFormState } from '../actions';

const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;

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
  const toast = useToast();
  const initialState: AdSlotFormState = {};
  const [state, formAction] = useActionState(updateAdSlotAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      toast.success('Ad slot updated');
      onSuccess?.();
    }
  }, [state.success, router, toast, onSuccess]);

  const slotWithExtras = adSlot as AdSlot & {
    position?: string;
    width?: number;
    height?: number;
    cpmFloor?: number;
  };

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={adSlot.id} />
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
          defaultValue={adSlot.name}
          className="form-input"
          aria-invalid={!!state.fieldErrors?.name}
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name}</p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Description</label>
        <textarea
          name="description"
          rows={2}
          defaultValue={adSlot.description ?? ''}
          className="form-input resize-y"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Type *</label>
        <select name="type" required defaultValue={adSlot.type} className="form-input">
          {AD_SLOT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Position</label>
        <input
          type="text"
          name="position"
          defaultValue={slotWithExtras.position ?? ''}
          className="form-input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Width</label>
          <input
            type="number"
            name="width"
            min="1"
            defaultValue={slotWithExtras.width ?? ''}
            className="form-input"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Height</label>
          <input
            type="number"
            name="height"
            min="1"
            defaultValue={slotWithExtras.height ?? ''}
            className="form-input"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Base price *</label>
          <input
            type="number"
            name="basePrice"
            required
            min="0"
            step="0.01"
            defaultValue={Number(adSlot.basePrice)}
            className="form-input"
            aria-invalid={!!state.fieldErrors?.basePrice}
          />
          {state.fieldErrors?.basePrice && (
            <p className="mt-1 text-sm text-red-600">{state.fieldErrors.basePrice}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">CPM floor</label>
          <input
            type="number"
            name="cpmFloor"
            min="0"
            step="0.01"
            defaultValue={slotWithExtras.cpmFloor ?? ''}
            className="form-input"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          name="isAvailable"
          id="isAvailable"
          value="true"
          defaultChecked={adSlot.isAvailable}
          className="h-4 w-4 rounded border-[--color-border] text-[--color-primary] focus:ring-2 focus:ring-[--color-primary]/20"
        />
        <input type="hidden" name="isAvailable" value="false" />
        <label htmlFor="isAvailable" className="text-sm font-medium text-[--color-foreground]">
          Available for booking
        </label>
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
