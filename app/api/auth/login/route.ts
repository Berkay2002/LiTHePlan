import { addBreadcrumb, captureException } from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, successResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";
import { authLimiter, getClientIP } from "@/lib/rate-limit";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email/username or password.";
const LoginRequestSchema = z.object({
  identifier: z.string().trim().min(1).max(320),
  password: z.string().min(1).max(1024),
});

const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeIdentifier = (value: string) => value.trim();
const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

async function resolveLoginEmail(identifier: string): Promise<string | null> {
  if (isEmail(identifier)) {
    return normalizeEmail(identifier);
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("profiles")
    .select("email")
    .eq("username", identifier)
    .maybeSingle();

  if (error || !data?.email) {
    return null;
  }

  return normalizeEmail(data.email);
}

export async function POST(request: NextRequest) {
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  const rateLimitResult = await authLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded on login route", {
      requestId,
      clientIP,
    });

    return NextResponse.json(errorResponse("Too many requests", requestId), {
      status: 429,
      headers: {
        "X-RateLimit-Limit": String(rateLimitResult.limit),
        "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        "X-RateLimit-Reset": String(rateLimitResult.reset),
      },
    });
  }

  try {
    const body = await request.json();
    const validationResult = LoginRequestSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn("Invalid login payload", {
        requestId,
        issues: validationResult.error.issues,
      });

      return NextResponse.json(
        errorResponse("Invalid login payload", requestId),
        { status: 400 }
      );
    }

    const { identifier, password } = validationResult.data;
    const normalizedIdentifier = normalizeIdentifier(identifier);

    addBreadcrumb({
      category: "auth",
      message: "Resolving login identifier",
      level: "info",
    });

    const email = await resolveLoginEmail(normalizedIdentifier);
    if (!email) {
      logger.warn("Login failed due to invalid credentials", {
        requestId,
        identifierType: isEmail(normalizedIdentifier) ? "email" : "username",
      });

      return NextResponse.json(
        errorResponse(INVALID_CREDENTIALS_MESSAGE, requestId),
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.warn("Login failed due to invalid credentials", {
        requestId,
        identifierType: isEmail(normalizedIdentifier) ? "email" : "username",
        errorCode: error.code,
      });

      return NextResponse.json(
        errorResponse(INVALID_CREDENTIALS_MESSAGE, requestId),
        { status: 401 }
      );
    }

    logger.info("Login successful", {
      requestId,
      identifierType: isEmail(normalizedIdentifier) ? "email" : "username",
    });

    return NextResponse.json(successResponse({ ok: true }, requestId));
  } catch (error) {
    logger.error("Unexpected error in login route", error, {
      requestId,
    });

    captureException(error, {
      tags: { flow: "auth-login" },
      contexts: {
        request: { requestId },
      },
    });

    return NextResponse.json(
      errorResponse("Authentication unavailable", requestId),
      { status: 500 }
    );
  }
}
