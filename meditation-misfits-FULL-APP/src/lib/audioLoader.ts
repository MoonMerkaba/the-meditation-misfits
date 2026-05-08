// Audio loader utility with error handling and retry logic

export interface AudioLoadResult {
  success: boolean;
  url: string;
  error?: string;
  retries?: number;
}

export interface AudioTestResult {
  filename: string;
  url: string;
  accessible: boolean;
  error?: string;
  loadTime?: number;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

/**
 * Load audio with retry mechanism
 */
export async function loadAudioWithRetry(
  url: string,
  maxRetries: number = MAX_RETRIES
): Promise<AudioLoadResult> {
  let retries = 0;
  
  while (retries <= maxRetries) {
    try {
      const result = await testAudioUrl(url);
      
      if (result.accessible) {
        return {
          success: true,
          url,
          retries
        };
      }
      
      if (retries < maxRetries) {
        await delay(RETRY_DELAY * (retries + 1));
        retries++;
        continue;
      }
      
      return {
        success: false,
        url,
        error: result.error || 'Audio file not accessible',
        retries
      };
    } catch (error) {
      if (retries < maxRetries) {
        await delay(RETRY_DELAY * (retries + 1));
        retries++;
        continue;
      }
      
      return {
        success: false,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
        retries
      };
    }
  }
  
  return {
    success: false,
    url,
    error: 'Max retries exceeded',
    retries
  };
}

/**
 * Test if audio URL is accessible
 */
export async function testAudioUrl(url: string): Promise<AudioTestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const loadTime = Date.now() - startTime;
    
    if (response.ok) {
      return {
        filename: url.split('/').pop() || '',
        url,
        accessible: true,
        loadTime
      };
    }
    
    return {
      filename: url.split('/').pop() || '',
      url,
      accessible: false,
      error: `HTTP ${response.status}: ${response.statusText}`
    };
  } catch (error) {
    return {
      filename: url.split('/').pop() || '',
      url,
      accessible: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Test multiple audio URLs
 */
export async function testAudioFiles(urls: string[]): Promise<AudioTestResult[]> {
  const results = await Promise.all(urls.map(url => testAudioUrl(url)));
  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
