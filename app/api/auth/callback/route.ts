import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { authLimiter, getClientIP } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  // Rate limiting check (30 req/min to prevent auth abuse)
  const rateLimitResult = await authLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded on auth callback", {
      requestId,
      clientIP,
    });

    return NextResponse.redirect(
      new URL("/auth/auth-code-error?reason=rate_limit", request.url)
    );
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    Sentry.addBreadcrumb({
      category: "auth",
      message: "Starting code exchange for session",
      level: "info",
    });

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      logger.info("Auth code exchange successful", {
        requestId,
        nextPath: next,
      });

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }

    logger.error("Auth code exchange failed", error, {
      requestId,
      errorCode: error.code,
    });

    Sentry.captureException(error, {
      tags: { flow: "auth-callback" },
      contexts: {
        request: { requestId },
      },
    });
  } else {
    logger.warn("Auth callback called without code parameter", { requestId });
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
