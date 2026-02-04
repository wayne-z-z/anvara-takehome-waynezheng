'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useToast } from '@/app/components/toast';
import { analytics } from '@/lib/analytics';
import { createAdSlotAction, type AdSlotFormState } from '../actions';

const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;
const initialState: AdSlotFormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg bg-[--color-primary] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[--color-primary-hover] disabled:opacity-50"
    >
      {pending ? 'Saving...' : 'Create Ad Slot'}
    </button>
  );
}

export function CreateAdSlotForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [state, formAction] = useActionState(createAdSlotAction, initialState);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      toast.success('Ad slot created');
      analytics.adSlotCreated();
      onSuccess?.();
    }
  }, [state.success, router, toast, onSuccess]);

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-[--color-border] bg-[--color-background] p-5 shadow-sm"
    >
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
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
          Description
        </label>
        <textarea name="description" rows={2} className="form-input resize-y" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">Type *</label>
        <select
          name="type"
          required
          className="form-input"
          aria-invalid={!!state.fieldErrors?.type}
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
        <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
          Position
        </label>
        <input type="text" name="position" className="form-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            Width
          </label>
          <input type="number" name="width" min="1" className="form-input" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            Height
          </label>
          <input type="number" name="height" min="1" className="form-input" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            Base price *
          </label>
          <input
            type="number"
            name="basePrice"
            required
            min="0"
            step="0.01"
            className="form-input"
            aria-invalid={!!state.fieldErrors?.basePrice}
            aria-describedby={state.fieldErrors?.basePrice ? 'basePrice-error' : undefined}
          />
          {state.fieldErrors?.basePrice && (
            <p id="basePrice-error" className="mt-1 text-sm text-red-600">
              {state.fieldErrors.basePrice}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[--color-foreground]">
            CPM floor
          </label>
          <input type="number" name="cpmFloor" min="0" step="0.01" className="form-input" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 border-t border-[--color-border] pt-4">
        <SubmitButton />
      </div>
    </form>
  );
}
