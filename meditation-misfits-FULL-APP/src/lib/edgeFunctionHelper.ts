/**
 * Edge Function Helper
 * 
 * Wraps supabase.functions.invoke() with standardized error handling.
 * - Detects HTML responses (non-JSON)
 * - Handles null/undefined data
 * - Converts technical error messages to user-friendly alternatives
 * - Catches FunctionsFetchError and 2xx status code issues
 */

import { supabase } from './supabase';

// User-friendly error messages mapped to technical patterns
const FRIENDLY_ERRORS: Record<string, string> = {
  'FunctionsFetchError': 'Something went wrong. Please try again in a moment.',
  '2xx': 'Something went wrong. Please try again in a moment.',
  'status code': 'Something went wrong. Please try again in a moment.',
  'edge function': 'Something went wrong. Please try again in a moment.',
  'Failed to fetch': 'Unable to connect. Please check your internet connection.',
  'NetworkError': 'Unable to connect. Please check your internet connection.',
  'TypeError': 'Something went wrong. Please try again.',
  'CORS': 'Something went wrong. Please try again.',
  'timeout': 'The request took too long. Please try again.',
  'AbortError': 'The request was cancelled. Please try again.',
  'non_2xx': 'Our service is momentarily busy. Please try again shortly.',
  'relay': 'Our service is momentarily busy. Please try again shortly.',
  'boot': 'Our service is starting up. Please try again in a few seconds.',
};

/**
 * Converts a raw error message into a user-friendly one.
 */
function friendlyMessage(rawMessage: string): string {
  if (!rawMessage) return 'Something went wrong. Please try again.';
  
  const lower = rawMessage.toLowerCase();
  
  for (const [pattern, friendly] of Object.entries(FRIENDLY_ERRORS)) {
    if (lower.includes(pattern.toLowerCase())) {
      return friendly;
    }
  }
  
  // If it looks like HTML, it's not a real error message
  if (rawMessage.includes('<html') || rawMessage.includes('<!DOCTYPE') || rawMessage.includes('<body')) {
    return 'Something went wrong. Please try again in a moment.';
  }
  
  // If it's a very long message, it's probably a stack trace
  if (rawMessage.length > 200) {
    return 'Something went wrong. Please try again.';
  }
  
  return rawMessage;
}

/**
 * Check if a value looks like HTML instead of JSON data
 */
function isHtmlResponse(value: unknown): boolean {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.startsWith('<') || trimmed.startsWith('<!DOCTYPE');
  }
  return false;
}

export interface EdgeFunctionResult<T = any> {
  data: T | null;
  error: string | null;
}

/**
 * Safely invoke a Supabase edge function with comprehensive error handling.
 * 
 * @param functionName - The name of the edge function to call
 * @param body - Optional request body
 * @returns { data, error } where error is a user-friendly string or null
 * 
 * @example
 * const { data, error } = await invokeEdgeFunction('list-reflections');
 * if (error) {
 *   toast.error(error); // Shows user-friendly message
 *   return;
 * }
 * // data is safe to use
 * setReflections(data.reflections);
 */
export async function invokeEdgeFunction<T = any>(
  functionName: string,
  body?: Record<string, any>
): Promise<EdgeFunctionResult<T>> {
  try {
    const options: any = {};
    if (body !== undefined) {
      options.body = body;
    }

    const { data, error } = await supabase.functions.invoke(functionName, options);

    // Case 1: Supabase client returned an error object
    if (error) {
      const rawMsg = error.message || error.toString() || 'Unknown error';
      return { data: null, error: friendlyMessage(rawMsg) };
    }

    // Case 2: Data is HTML instead of JSON (edge function returned an error page)
    if (isHtmlResponse(data)) {
      console.warn(`Edge function "${functionName}" returned HTML instead of JSON`);
      return { data: null, error: 'Something went wrong. Please try again in a moment.' };
    }

    // Case 3: Data is null or undefined
    if (data === null || data === undefined) {
      // Some functions legitimately return empty - don't treat as error
      return { data: null, error: null };
    }

    // Case 4: Data contains its own error field (some edge functions return { error: "..." })
    if (typeof data === 'object' && data.error && typeof data.error === 'string') {
      return { data: null, error: friendlyMessage(data.error) };
    }

    // Case 5: Data contains ok: false pattern
    if (typeof data === 'object' && data.ok === false && data.message) {
      return { data: null, error: friendlyMessage(data.message) };
    }

    // Success
    return { data: data as T, error: null };

  } catch (err: any) {
    // Case 6: Network error, CORS, or other fetch-level failure
    console.error(`Edge function "${functionName}" threw:`, err);
    const rawMsg = err?.message || err?.toString() || 'Unknown error';
    return { data: null, error: friendlyMessage(rawMsg) };
  }
}

/**
 * Convenience: invoke with no body
 */
export async function invokeEdgeFn<T = any>(
  functionName: string
): Promise<EdgeFunctionResult<T>> {
  return invokeEdgeFunction<T>(functionName);
}

/**
 * Helper to safely access nested data from edge function responses.
 * Returns defaultValue if any part of the path is null/undefined.
 * 
 * @example
 * const reflections = safeGet(data, 'reflections', []);
 * const streak = safeGet(data, 'current_streak', 0);
 */
export function safeGet<T>(obj: any, key: string, defaultValue: T): T {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const value = obj[key];
  if (value === null || value === undefined) return defaultValue;
  return value as T;
}
