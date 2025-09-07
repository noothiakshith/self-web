const CACHE_KEY = 'files';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function setCache<T>(data: T): void {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cacheItem));
}

export function getCache<T>(): T | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  const cacheItem: CacheItem<T> = JSON.parse(cached);
  const now = Date.now();

  // Check if cache is expired
  if (now - cacheItem.timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }

  return cacheItem.data;
}

export function updateCache<T>(updater: (data: T) => T): void {
  const cached = getCache<T>();
  if (cached) {
    const updated = updater(cached);
    setCache(updated);
  }
}

export function invalidateCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
