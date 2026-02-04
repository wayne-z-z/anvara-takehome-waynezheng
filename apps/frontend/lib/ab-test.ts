'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_PREFIX = 'ab_';

/** Options for an A/B test: variant ids and optional weights (default 50/50). */
export interface ABTestOptions {
  /** Variant ids, e.g. ['A', 'B'] or ['A', 'B', 'C']. Default ['A', 'B']. */
  variants?: string[];
  /** Weights for each variant (same order as variants). Default [1, 1] (50/50). */
  weights?: number[];
}

/** Result of getOrAssignVariant: variant and whether we just assigned (for deferred tracking). */
export interface ABTestResult {
  variant: string;
  wasNewAssignment: boolean;
}

function getStorageKey(testId: string): string {
  return `${STORAGE_PREFIX}${testId}`;
}

/** Derive env key for debug override, e.g. cta-button-text -> NEXT_PUBLIC_AB_DEBUG_CTA_BUTTON_TEXT */
function getDebugEnvKey(testId: string): string {
  const key = testId.replace(/-/g, '_').toUpperCase();
  return `NEXT_PUBLIC_AB_DEBUG_${key}`;
}

/** Debug override: force a specific variant via env, e.g. NEXT_PUBLIC_AB_DEBUG_CTA_BUTTON_TEXT=A */
function getDebugVariant(testId: string): string | null {
  if (typeof window === 'undefined') return null;
  const envKey = getDebugEnvKey(testId);
  const value = process.env[envKey];
  if (value && typeof value === 'string' && value.trim() !== '') return value.trim();
  return null;
}

/** Weighted random: returns index into variants array. weights are normalized. */
function weightedRandomIndex(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

/**
 * Get or assign variant for a test. Persists in localStorage so the same user sees the same variant.
 * Supports debug override via NEXT_PUBLIC_AB_DEBUG_<TEST_KEY>=A|B.
 * Returns { variant, wasNewAssignment } so callers can fire ab_exposure after mount (when GA is ready).
 */
export function getOrAssignVariant(testId: string, options: ABTestOptions = {}): ABTestResult {
  const variants = options.variants ?? ['A', 'B'];
  const weights = options.weights ?? variants.map(() => 1);
  const normalizedWeights = variants.length === weights.length ? weights : variants.map(() => 1);

  if (typeof window === 'undefined') {
    return { variant: variants[0], wasNewAssignment: false };
  }

  try {
    const stored = localStorage.getItem(getStorageKey(testId));
    if (stored && variants.includes(stored)) {
      return { variant: stored, wasNewAssignment: false };
    }
  } catch {
    // ignore
  }

  const debug = getDebugVariant(testId);
  if (debug && variants.includes(debug)) {
    try {
      localStorage.setItem(getStorageKey(testId), debug);
    } catch {
      // ignore
    }
    return { variant: debug, wasNewAssignment: true };
  }

  const index = weightedRandomIndex(normalizedWeights);
  const variant = variants[index];
  try {
    localStorage.setItem(getStorageKey(testId), variant);
  } catch {
    // ignore
  }
  return { variant, wasNewAssignment: true };
}

/** Subscribe to storage changes so multiple tabs/components stay in sync (optional). */
function subscribeToStorage(testId: string, callback: () => void): () => void {
  const key = getStorageKey(testId);
  const handler = (e: StorageEvent) => {
    if (e.key === key) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

/** Cache snapshot by testId so useSyncExternalStore gets a stable reference (avoids infinite loop). */
const snapshotCache = new Map<string, ABTestResult>();
/** Stable server snapshots (getServerSnapshot must also return cached refs). */
const serverSnapshotCache = new Map<string, ABTestResult>();

function getStableSnapshot(testId: string, options: ABTestOptions): ABTestResult {
  const result = getOrAssignVariant(testId, options);
  const cached = snapshotCache.get(testId);
  // Only compare variant: React may call getSnapshot twice in one render; first call assigns
  // (wasNewAssignment: true), second call reads from storage (wasNewAssignment: false). Returning
  // different object refs causes "getSnapshot should be cached". So return same ref when variant matches.
  if (cached && cached.variant === result.variant) {
    return cached;
  }
  snapshotCache.set(testId, result);
  return result;
}

function getStableServerSnapshot(variant: string): ABTestResult {
  let cached = serverSnapshotCache.get(variant);
  if (!cached) {
    cached = { variant, wasNewAssignment: false };
    serverSnapshotCache.set(variant, cached);
  }
  return cached;
}

/**
 * Returns the variant for this test (same user = same variant).
 * Callers fire ab_exposure when the variant is shown (e.g. once per listing view).
 */
export function useABTest(testId: string, options: ABTestOptions = {}): string {
  const variants = options.variants ?? ['A', 'B'];
  const weights = options.weights ?? variants.map(() => 1);
  const normalizedWeights = variants.length === weights.length ? weights : variants.map(() => 1);
  const opts = { variants, weights: normalizedWeights };

  const defaultVariant = variants[0];
  const result = useSyncExternalStore(
    (onStoreChange) => subscribeToStorage(testId, onStoreChange),
    () => getStableSnapshot(testId, opts),
    () => getStableServerSnapshot(defaultVariant)
  );

  return result.variant;
}
