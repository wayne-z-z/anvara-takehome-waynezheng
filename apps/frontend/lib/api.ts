// Simple API client with error response parsing

import type { Campaign, AdSlot, Placement, DashboardStats } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4291';

/** Error thrown by API client; includes HTTP status for callers to show specific messages (e.g. 401 → sign in). */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Parse JSON error body when present; otherwise return status text or generic message. */
async function getErrorMessage(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      return body.error ?? body.message ?? (res.statusText || 'API request failed');
    } catch {
      return res.statusText || 'API request failed';
    }
  }
  return res.statusText || 'API request failed';
}

export async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: options?.credentials ?? 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
  if (!res.ok) {
    const message = await getErrorMessage(res);
    throw new ApiError(message, res.status);
  }
  return res.json() as Promise<T>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Campaigns
export const getCampaigns = (sponsorId?: string, options?: RequestInit) =>
  api<Campaign[]>(sponsorId ? `/api/campaigns?sponsorId=${sponsorId}` : '/api/campaigns', options);
export const getCampaignsPaginated = (page: number, limit: number, options?: RequestInit) =>
  api<PaginatedResponse<Campaign>>(`/api/campaigns?page=${page}&limit=${limit}`, options);
export const getCampaign = (id: string) => api<Campaign>(`/api/campaigns/${id}`);
export const createCampaign = (data: Record<string, unknown>, options?: RequestInit) =>
  api<Campaign>('/api/campaigns', { method: 'POST', body: JSON.stringify(data), ...options });
export const updateCampaign = (id: string, data: Record<string, unknown>, options?: RequestInit) =>
  api<Campaign>(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data), ...options });
export const deleteCampaign = (id: string, options?: RequestInit) =>
  fetch(`${API_URL}/api/campaigns/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    ...options,
  }).then(async (res) => {
    if (!res.ok) throw new ApiError(await getErrorMessage(res), res.status);
    return undefined;
  });

// Ad Slots
export const getAdSlots = (publisherId?: string, options?: RequestInit) =>
  api<AdSlot[]>(
    publisherId ? `/api/ad-slots?publisherId=${publisherId}` : '/api/ad-slots',
    options
  );
export const getAdSlotsPaginated = (page: number, limit: number, options?: RequestInit) =>
  api<PaginatedResponse<AdSlot>>(`/api/ad-slots?page=${page}&limit=${limit}`, options);
export const getAdSlot = (id: string, options?: RequestInit) =>
  api<AdSlot>(`/api/ad-slots/${id}`, options);
export const createAdSlot = (data: Record<string, unknown>, options?: RequestInit) =>
  api<AdSlot>('/api/ad-slots', { method: 'POST', body: JSON.stringify(data), ...options });
export const updateAdSlot = (id: string, data: Record<string, unknown>, options?: RequestInit) =>
  api<AdSlot>(`/api/ad-slots/${id}`, { method: 'PUT', body: JSON.stringify(data), ...options });
export const deleteAdSlot = (id: string, options?: RequestInit) =>
  fetch(`${API_URL}/api/ad-slots/${id}`, {
    method: 'DELETE',
    credentials: 'include',
    ...options,
  }).then(async (res) => {
    if (!res.ok) throw new ApiError(await getErrorMessage(res), res.status);
    return undefined;
  });

// Placements
export const getPlacements = () => api<Placement[]>('/api/placements');
export const createPlacement = (data: Record<string, unknown>) =>
  api<Placement>('/api/placements', { method: 'POST', body: JSON.stringify(data) });

// Dashboard
export const getStats = () => api<DashboardStats>('/api/dashboard/stats');

// Quotes (dummy endpoint)
export interface RequestQuotePayload {
  adSlotId: string;
  email: string;
  companyName: string;
  message?: string;
  phone?: string;
  budget?: string;
  goals?: string;
  timeline?: string;
}

export async function requestQuote(
  data: RequestQuotePayload
): Promise<{ success: true; quoteId: string }> {
  const res = await fetch(`${API_URL}/api/quotes/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const body = (await res.json()) as { success: boolean; quoteId?: string; error?: string };
  if (!res.ok || !body.success) {
    throw new Error(body.error ?? 'Request failed');
  }
  return { success: true, quoteId: body.quoteId ?? '' };
}

// Newsletter (dummy endpoint)
export async function subscribeNewsletter(
  email: string
): Promise<{ success: true; message: string }> {
  const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = (await res.json()) as { success: boolean; message?: string; error?: string };
  if (!res.ok || !data.success) {
    throw new Error(data.error ?? 'Subscription failed');
  }
  return { success: true, message: data.message ?? 'Thanks for subscribing!' };
}
