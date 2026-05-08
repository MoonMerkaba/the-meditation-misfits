/**
 * Soundicine URL Configuration and Utilities
 * 
 * IMPORTANT: All Soundicine links must use the correct domain
 * Base URL: https://app.samanthabushika.com/freq
 */

export const SOUNDICINE_BASE_URL = 'https://app.samanthabushika.com/freq';

export interface SoundicineParams {
  goal: string;
  minutes: number;
  beatStart: number;
  beatEnd: number;
  isoHz: number;
  noise: 'pink' | 'brown' | 'white' | 'none';
  strength: number | 'gentle' | 'medium' | 'strong';
}

/**
 * Constructs a valid Soundicine URL with the correct domain
 */
export function buildSoundicineUrl(params: SoundicineParams): string {
  const { goal, minutes, beatStart, beatEnd, isoHz, noise, strength } = params;
  
  return `${SOUNDICINE_BASE_URL}?goal=${encodeURIComponent(goal)}&minutes=${minutes}&beatStart=${beatStart}&beatEnd=${beatEnd}&isoHz=${isoHz}&noise=${noise}&strength=${strength}`;
}

/**
 * Validates if a URL is a valid Soundicine URL
 */
export function isValidSoundicineUrl(url: string): boolean {
  return url.startsWith(SOUNDICINE_BASE_URL);
}

/**
 * Fixes old/invalid Soundicine URLs to use the correct domain
 */
export function fixSoundicineUrl(url: string): string {
  // Extract query parameters from any old URL format
  const urlObj = new URL(url);
  const params = urlObj.searchParams;
  
  // Rebuild with correct base URL
  return `${SOUNDICINE_BASE_URL}?${params.toString()}`;
}
