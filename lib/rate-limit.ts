import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting utilities using Upstash Redis
 * Prevents API abuse with per-IP limits on different endpoint types
 */

// Initialize Upstash Redis client from environment variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

// Rate limiters for different endpoint types
export const coursesLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true,
  prefix: "@ratelimit/courses",
});

export const profileReadLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, "1 m"), // 50 requests per minute
  analytics: true,
  prefix: "@ratelimit/profile-read",
});

export const profileWriteLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
  prefix: "@ratelimit/profile-write",
});

export const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "1 m"), // 30 requests per minute
  analytics: true,
  prefix: "@ratelimit/auth",
});

// Type for rate limit results
export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
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
