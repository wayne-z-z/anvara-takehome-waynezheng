'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createAdSlot, updateAdSlot, deleteAdSlot } from '@/lib/api';

export type AdSlotFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function getCookieHeader(): Promise<string> {
  const headersList = await headers();
  return headersList.get('cookie') ?? '';
}

const AD_SLOT_TYPES = ['DISPLAY', 'VIDEO', 'NATIVE', 'NEWSLETTER', 'PODCAST'] as const;

export async function createAdSlotAction(
  _prevState: AdSlotFormState,
  formData: FormData
): Promise<AdSlotFormState> {
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || undefined;
  const type = formData.get('type') as string;
  const position = (formData.get('position') as string) || undefined;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;
  const basePrice = formData.get('basePrice') as string;
  const cpmFloor = (formData.get('cpmFloor') as string) || undefined;

  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!type?.trim()) fieldErrors.type = 'Type is required';
  else if (!AD_SLOT_TYPES.includes(type as (typeof AD_SLOT_TYPES)[number]))
    fieldErrors.type = 'Invalid type';
  if (!basePrice?.trim()) fieldErrors.basePrice = 'Base price is required';
  else if (Number.isNaN(Number(basePrice)) || Number(basePrice) <= 0)
    fieldErrors.basePrice = 'Base price must be a positive number';
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const cookie = await getCookieHeader();
    const data: Record<string, unknown> = {
      name: name.trim(),
      description: description?.trim(),
      type,
      position: position?.trim() || undefined,
      basePrice: Number(basePrice),
    };
    if (width && !Number.isNaN(Number(width))) data.width = Number(width);
    if (height && !Number.isNaN(Number(height))) data.height = Number(height);
    if (cpmFloor && !Number.isNaN(Number(cpmFloor))) data.cpmFloor = Number(cpmFloor);
    await createAdSlot(data, { cache: 'no-store', headers: { Cookie: cookie } });
    revalidatePath('/dashboard/publisher');
    return { success: true };
  } catch {
    return { error: 'Failed to create ad slot' };
  }
}

export async function updateAdSlotAction(
  _prevState: AdSlotFormState,
  formData: FormData
): Promise<AdSlotFormState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing ad slot id' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || undefined;
  const type = formData.get('type') as string;
  const position = (formData.get('position') as string) || undefined;
  const width = formData.get('width') as string;
  const height = formData.get('height') as string;
  const basePrice = formData.get('basePrice') as string;
  const cpmFloor = (formData.get('cpmFloor') as string) || undefined;
  const isAvailable = formData.get('isAvailable') === 'true';

  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!type?.trim()) fieldErrors.type = 'Type is required';
  if (
    basePrice !== undefined &&
    basePrice !== '' &&
    (Number.isNaN(Number(basePrice)) || Number(basePrice) <= 0)
  )
    fieldErrors.basePrice = 'Base price must be a positive number';
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const cookie = await getCookieHeader();
    const data: Record<string, unknown> = {
      name: name.trim(),
      description: description?.trim(),
      type,
      position: position?.trim() || undefined,
      isAvailable,
    };
    if (basePrice !== undefined && basePrice !== '') data.basePrice = Number(basePrice);
    if (width !== undefined && width !== '' && !Number.isNaN(Number(width)))
      data.width = Number(width);
    if (height !== undefined && height !== '' && !Number.isNaN(Number(height)))
      data.height = Number(height);
    if (cpmFloor !== undefined && cpmFloor !== '' && !Number.isNaN(Number(cpmFloor)))
      data.cpmFloor = Number(cpmFloor);
    await updateAdSlot(id, data, { cache: 'no-store', headers: { Cookie: cookie } });
    revalidatePath('/dashboard/publisher');
    return { success: true };
  } catch {
    return { error: 'Failed to update ad slot' };
  }
}

export async function deleteAdSlotAction(
  _prevState: AdSlotFormState,
  formData: FormData
): Promise<AdSlotFormState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing ad slot id' };

  try {
    const cookie = await getCookieHeader();
    await deleteAdSlot(id, { headers: { Cookie: cookie } });
    revalidatePath('/dashboard/publisher');
    return { success: true };
  } catch {
    return { error: 'Failed to delete ad slot' };
  }
}
