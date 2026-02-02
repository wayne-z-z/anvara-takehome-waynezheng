'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createCampaign, updateCampaign, deleteCampaign } from '@/lib/api';

export type CampaignFormState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function getCookieHeader(): Promise<string> {
  const headersList = await headers();
  return headersList.get('cookie') ?? '';
}

export async function createCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || undefined;
  const budget = formData.get('budget') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = (formData.get('status') as string) || 'DRAFT';
  const targetCategories =
    (formData.get('targetCategories') as string)?.split(',').filter(Boolean) ?? [];
  const targetRegions = (formData.get('targetRegions') as string)?.split(',').filter(Boolean) ?? [];

  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (!budget?.trim()) fieldErrors.budget = 'Budget is required';
  else if (Number.isNaN(Number(budget)) || Number(budget) <= 0)
    fieldErrors.budget = 'Budget must be a positive number';
  if (!startDate?.trim()) fieldErrors.startDate = 'Start date is required';
  if (!endDate?.trim()) fieldErrors.endDate = 'End date is required';
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    fieldErrors.endDate = 'End date must be on or after start date';
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const cookie = await getCookieHeader();
    await createCampaign(
      {
        name: name.trim(),
        description: description?.trim(),
        budget: Number(budget),
        startDate,
        endDate,
        status,
        targetCategories,
        targetRegions,
      },
      { cache: 'no-store', headers: { Cookie: cookie } }
    );
    revalidatePath('/dashboard/sponsor');
    return { success: true };
  } catch {
    return { error: 'Failed to create campaign' };
  }
}

export async function updateCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing campaign id' };

  const name = formData.get('name') as string;
  const description = (formData.get('description') as string) || undefined;
  const budget = formData.get('budget') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const status = formData.get('status') as string;

  const fieldErrors: Record<string, string> = {};
  if (!name?.trim()) fieldErrors.name = 'Name is required';
  if (
    budget !== undefined &&
    budget !== null &&
    budget !== '' &&
    (Number.isNaN(Number(budget)) || Number(budget) <= 0)
  )
    fieldErrors.budget = 'Budget must be a positive number';
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
    fieldErrors.endDate = 'End date must be on or after start date';
  }
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    const cookie = await getCookieHeader();
    const data: Record<string, unknown> = {
      name: name?.trim(),
      description: description?.trim(),
      status,
    };
    if (budget !== undefined && budget !== '') data.budget = Number(budget);
    if (startDate) data.startDate = startDate;
    if (endDate) data.endDate = endDate;
    await updateCampaign(id, data, { cache: 'no-store', headers: { Cookie: cookie } });
    revalidatePath('/dashboard/sponsor');
    return { success: true };
  } catch {
    return { error: 'Failed to update campaign' };
  }
}

export async function deleteCampaignAction(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const id = formData.get('id') as string;
  if (!id) return { error: 'Missing campaign id' };

  try {
    const cookie = await getCookieHeader();
    await deleteCampaign(id, { headers: { Cookie: cookie } });
    revalidatePath('/dashboard/sponsor');
    return { success: true };
  } catch {
    return { error: 'Failed to delete campaign' };
  }
}
