export const cacheManager = {
  async clearImageCache(): Promise<boolean> {
    try {
      if ('caches' in window) {
        const deleted = await caches.delete('video-thumbnails-v1');
        console.log('Image cache cleared:', deleted);
        return deleted;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  },

  async getCacheSize(): Promise<number> {
    try {
      if ('caches' in window && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  },

  async getCachedImagesCount(): Promise<number> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('video-thumbnails-v1');
        const keys = await cache.keys();
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cached images count:', error);
      return 0;
    }
  },

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  async preloadImage(url: string): Promise<void> {
    try {
      if ('caches' in window) {
        const cache = await caches.open('video-thumbnails-v1');
        const response = await fetch(url, { mode: 'cors' });
        if (response.ok) {
          await cache.put(url, response);
        }
      }
    } catch (error) {
      console.warn('Error preloading image:', error);
    }
  }
};
