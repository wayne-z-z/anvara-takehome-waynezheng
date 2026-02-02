'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { deleteAdSlotAction, type AdSlotFormState } from '../actions';

const initialState: AdSlotFormState = {};

function DeleteButton({ slotName }: { slotName: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : `Delete "${slotName}"`}
    </button>
  );
}

export function DeleteAdSlotButton({
  adSlotId,
  adSlotName,
  onSuccess,
}: {
  adSlotId: string;
  adSlotName: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(deleteAdSlotAction, initialState);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      queueMicrotask(() => setConfirming(false));
      onSuccess?.();
    }
  }, [state.success, router, onSuccess]);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-sm text-red-600 underline hover:no-underline"
      >
        Delete
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[--color-muted]">Delete this ad slot? This cannot be undone.</p>
      <form action={formAction} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={adSlotId} />
        <DeleteButton slotName={adSlotName} />
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded border px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
