import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting utilities using Upstash Redis
 * Prevents API abuse with per-IP limits on different endpoint types
 */

const isRedisConfigured =
  !!process.env.UPSTASH_REDIS_REST_URL &&
  !!process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = isRedisConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })
  : undefined;

const noopLimiter = {
  limit: async () => ({
    success: true,
    limit: 0,
    remaining: 0,
    reset: 0,
  }),
};

function createLimiter(
  window: Parameters<typeof Ratelimit.slidingWindow>,
  prefix: string
) {
  if (!redis) {
    return noopLimiter;
  }
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(...window),
    analytics: true,
    prefix,
  });
}

// Rate limiters for different endpoint types
export const coursesLimiter = createLimiter([100, "1 m"], "@ratelimit/courses");
export const profileReadLimiter = createLimiter(
  [50, "1 m"],
  "@ratelimit/profile-read"
);
export const profileWriteLimiter = createLimiter(
  [10, "1 m"],
  "@ratelimit/profile-write"
);
export const authLimiter = createLimiter([30, "1 m"], "@ratelimit/auth");

// Type for rate limit results
export interface RateLimitResult {
  limit: number;
  remaining: number;
  reset: number;
  success: boolean;
}

/**
 * Get client IP address from request headers
 * Handles proxied requests (Vercel, Cloudflare, etc.)
 */
export function getClientIP(headers: Headers): string {
  // Check common proxy headers in order of reliability
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback to a default if no IP found (shouldn't happen in production)
  return "unknown";
}
