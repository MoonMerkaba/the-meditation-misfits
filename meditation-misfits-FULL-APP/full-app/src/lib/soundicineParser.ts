// Utility to detect and parse Soundicine URLs from text

export const SOUNDICINE_BASE_URL = 'https://app.samanthabushika.com/freq';

export interface SoundicineLink {
  url: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Detects Soundicine URLs in text (both correct and incorrect domains)
 */
export function detectSoundicineLinks(text: string): SoundicineLink[] {
  const links: SoundicineLink[] = [];
  
  // Match URLs that look like Soundicine links
  const urlRegex = /https?:\/\/[^\s]+\/freq\?[^\s]*/g;
  let match;
  
  while ((match = urlRegex.exec(text)) !== null) {
    links.push({
      url: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }
  
  return links;
}

/**
 * Fixes incorrect Soundicine URLs to use the correct domain
 */
export function fixSoundicineUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    // Build correct URL with all parameters
    const correctUrl = new URL(SOUNDICINE_BASE_URL);
    params.forEach((value, key) => {
      correctUrl.searchParams.set(key, value);
    });
    
    return correctUrl.toString();
  } catch (e) {
    return url;
  }
}
