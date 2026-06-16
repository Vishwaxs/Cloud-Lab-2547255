import { RateLimiterMongo, RateLimiterMemory } from "rate-limiter-flexible";

const memoryLimiterCache = new Map<string, RateLimiterMemory>();

export function getMongoRateLimiter(key: string, points: number, durationSec: number) {
  const cacheKey = `${key}:${points}:${durationSec}`;

  // Always use memory-based rate limiting for simplicity
  // MongoDB rate limiting can cause issues with connection handling
  const existing = memoryLimiterCache.get(cacheKey);
  if (existing) return existing;

  const limiter = new RateLimiterMemory({
    points,
    duration: durationSec,
    keyPrefix: key,
  });

  memoryLimiterCache.set(cacheKey, limiter);
  return limiter;
}

export async function consumeRateLimit(
  limiter: RateLimiterMongo | RateLimiterMemory,
  key: string,
  points = 1
): Promise<{ allowed: true } | { allowed: false; retryAfterSec: number }> {
  try {
    await limiter.consume(key, points);
    return { allowed: true };
  } catch (e: unknown) {
    const msBeforeNext = (e as { msBeforeNext?: unknown } | null | undefined)?.msBeforeNext;
    const retryAfterMs = typeof msBeforeNext === "number" ? msBeforeNext : 1000;
    const retryAfterSec = Math.ceil(retryAfterMs / 1000);
    return { allowed: false, retryAfterSec };
  }
}
