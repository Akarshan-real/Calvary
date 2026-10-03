
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const now = Date.now();

  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  const freshData = await fetcher();

  if (freshData !== undefined && freshData !== null) {
    memoryCache.set(key, {
      data: freshData,
      expiresAt: now + ttlSeconds * 1000,
    });
  }

  return freshData;
}

export function invalidateCache(keyOrPrefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key === keyOrPrefix || key.startsWith(`${keyOrPrefix}:`)) {
      memoryCache.delete(key);
    }
  }
}
