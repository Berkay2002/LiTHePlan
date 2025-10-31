import { Ratelimit } from "@upstash/ratelimit";
import Redis from "ioredis";

/**
 * Rate limiting utilities using Redis and Upstash Ratelimit
 * Prevents API abuse with per-IP limits on different endpoint types
 */

// Initialize Redis client from environment variable
const redis = new Redis(process.env.REDIS_URL as string);

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
 * Rate limit check for API routes
 * @param identifier - Usually IP address from request
 * @param limiter - Which rate limiter to use
 * @returns Rate limit result with success status and metadata
 */
export async function rateLimit(
  identifier: string,
  limiter: Ratelimit
): Promise<RateLimitResult> {
  const result = await limiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
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
