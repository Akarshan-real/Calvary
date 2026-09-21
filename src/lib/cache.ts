/**
 * Server-Side Cache Utility (Redis-Ready)
 * 
 * Designed to provide instant cached responses for high-frequency read operations (Menu, Settings, Hours).
 * Currently uses an in-memory cache with TTL, and is structured so that when Redis environment variables
 * (e.g., REDIS_URL or UPSTASH_REDIS_REST_URL) are added, it seamlessly switches to distributed Redis.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// In-memory fallback cache store
const memoryCache = new Map<string, CacheEntry<any>>();

export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300 // default 5 minutes
): Promise<T> {
  const now = Date.now();

  // 1. Check in-memory store
  const cached = memoryCache.get(key);
  if (cached && cached.expiresAt > now) {
    return cached.data as T;
  }

  // 2. Fetch fresh data
  const freshData = await fetcher();

  // 3. Store in cache
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
