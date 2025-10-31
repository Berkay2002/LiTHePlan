import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { UUIDSchema } from "@/lib/api-validation";
import { profileReadLimiter, getClientIP } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  // Rate limiting check (50 req/min for reads)
  const rateLimitResult = await profileReadLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded on profile by ID", {
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
    const supabase = await createClient();
    const { id: profileId } = await params;

    // Validate UUID format
    const validationResult = UUIDSchema.safeParse(profileId);
    if (!validationResult.success) {
      logger.warn("Invalid profile ID format", { requestId, profileId });

      return NextResponse.json(
        errorResponse("Invalid profile ID format", requestId),
        { status: 400 }
      );
    }

    Sentry.setContext("profile", { profileId });

    // First, try to find by profile ID
    const { data, error } = await supabase
      .from("academic_profiles")
      .select("*")
      .eq("id", profileId)
      .eq("is_public", true)
      .single();

    if (data) {
      logger.info("Profile retrieved by ID", { requestId, profileId });

      return NextResponse.json(successResponse(data.profile_data, requestId), {
        headers: {
          "Cache-Control": "public, max-age=60",
          "X-Request-ID": requestId,
        },
      });
    }

    // If not found by profile ID, check if it might be a user ID (backward compatibility)
    const { data: userProfile, error: userError } = await supabase
      .from("academic_profiles")
      .select("*")
      .eq("user_id", profileId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (userProfile) {
      logger.info("Profile found by user ID, redirecting", {
        requestId,
        userId: profileId,
        profileId: userProfile.id,
      });

      // Redirect to the proper profile ID URL
      return NextResponse.redirect(
        new URL(`/profile/${userProfile.id}`, request.url)
      );
    }

    logger.warn("Profile not found", {
      requestId,
      profileId,
      primaryError: error?.message,
      secondaryError: userError?.message,
    });

    return NextResponse.json(errorResponse("Profile not found", requestId), {
      status: 404,
    });
  } catch (error) {
    logger.error("Unexpected error in profile by ID", error, { requestId });

    Sentry.captureException(error, {
      contexts: {
        request: { requestId },
      },
    });

    return NextResponse.json(
      errorResponse("Internal server error", requestId),
      { status: 500 }
    );
  }
}
