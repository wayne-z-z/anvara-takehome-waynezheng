'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ConfirmModal } from '@/app/components/confirm-modal';
import { useToast } from '@/app/components/toast';
import { deleteCampaignAction, type CampaignFormState } from '../actions';

const initialState: CampaignFormState = {};

function DeleteButton({ campaignName }: { campaignName: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-[44px] rounded-lg border border-red-300 bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
    >
      {pending ? 'Deleting...' : `Delete "${campaignName}"`}
    </button>
  );
}

export function DeleteCampaignButton({
  campaignId,
  campaignName,
  onSuccess,
}: {
  campaignId: string;
  campaignName: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const toast = useToast();
  const [state, formAction] = useActionState(deleteCampaignAction, initialState);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      toast.success('Campaign deleted');
      queueMicrotask(() => setConfirming(false));
      onSuccess?.();
    }
  }, [state.success, router, toast, onSuccess]);

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex min-h-[40px] items-center rounded-lg border border-red-200 bg-transparent px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
      >
        Delete
      </button>
      <ConfirmModal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Delete campaign?"
        description={`"${campaignName}" will be permanently removed. This cannot be undone.`}
        confirmSlot={
          <div className="flex flex-col items-end gap-2">
            <div className="flex shrink-0 items-center gap-3">
              <form action={formAction} className="contents">
                <input type="hidden" name="id" value={campaignId} />
                <DeleteButton campaignName={campaignName} />
              </form>
            </div>
            {state.error && (
              <p className="w-full text-sm text-red-600" role="alert">
                {state.error}
              </p>
            )}
          </div>
        }
      />
    </>
  );
}
