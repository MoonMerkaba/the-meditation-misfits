// Audio preloading system with caching, progress tracking, and smart prioritization

export interface PreloadProgress {
  total: number;
  loaded: number;
  failed: number;
  percentage: number;
  currentFile: string;
  phase: 'priority' | 'remaining' | 'complete';
}

export interface CachedAudio {
  url: string;
  buffer: ArrayBuffer;
  blob: Blob;
  filename: string;
}

class AudioPreloader {
  private cache: Map<string, CachedAudio> = new Map();
  private preloadPromise: Promise<void> | null = null;
  private progressCallback: ((progress: PreloadProgress) => void) | null = null;

  setProgressCallback(callback: (progress: PreloadProgress) => void) {
    this.progressCallback = callback;
  }

  async preloadWithPriority(
    priorityUrls: string[],
    remainingUrls: string[]
  ): Promise<void> {
    if (this.preloadPromise) return this.preloadPromise;

    this.preloadPromise = this.loadFilesWithPriority(priorityUrls, remainingUrls);
    return this.preloadPromise;
  }

  async preloadAll(urls: string[]): Promise<void> {
    if (this.preloadPromise) return this.preloadPromise;

    this.preloadPromise = this.loadFiles(urls, 'remaining');
    return this.preloadPromise;
  }

  private async loadFilesWithPriority(
    priorityUrls: string[],
    remainingUrls: string[]
  ): Promise<void> {
    // Load priority files first
    await this.loadFiles(priorityUrls, 'priority');
    
    // Then load remaining files
    await this.loadFiles(remainingUrls, 'remaining');
  }

  private async loadFiles(
    urls: string[],
    phase: 'priority' | 'remaining'
  ): Promise<void> {
    const total = urls.length;
    let loaded = 0;
    let failed = 0;

    for (const url of urls) {
      const filename = url.split('/').pop() || '';
      
      this.notifyProgress({ 
        total, 
        loaded, 
        failed, 
        percentage: (loaded / total) * 100, 
        currentFile: filename,
        phase 
      });

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();

        this.cache.set(url, { url, buffer, blob, filename });
        loaded++;
        console.log(`✓ Preloaded (${phase}): ${filename}`);
      } catch (error) {
        console.error(`Failed to preload ${filename}:`, error);
        failed++;
      }

      this.notifyProgress({ 
        total, 
        loaded, 
        failed, 
        percentage: (loaded / total) * 100, 
        currentFile: filename,
        phase: loaded + failed === total ? 'complete' : phase
      });
    }
  }

  private notifyProgress(progress: PreloadProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }

  getCached(url: string): CachedAudio | undefined {
    return this.cache.get(url);
  }

  isPreloaded(url: string): boolean {
    return this.cache.has(url);
  }

  getAllCached(): CachedAudio[] {
    return Array.from(this.cache.values());
  }

  clearCache() {
    this.cache.clear();
    this.preloadPromise = null;
  }
}

export const audioPreloader = new AudioPreloader();
