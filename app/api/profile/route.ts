import * as Sentry from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { ProfileDataSchema, UUIDSchema } from "@/lib/api-validation";
import { logger } from "@/lib/logger";
import {
  getClientIP,
  profileReadLimiter,
  profileWriteLimiter,
} from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  // Rate limiting check (10 req/min for writes)
  const rateLimitResult = await profileWriteLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded on profile write", {
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

    // Auth check
    Sentry.addBreadcrumb({
      category: "auth",
      message: "Checking user authentication",
      level: "info",
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      logger.warn("Unauthorized profile creation attempt", { requestId });

      return NextResponse.json(errorResponse("Unauthorized", requestId), {
        status: 401,
      });
    }

    Sentry.setUser({ id: user.id, email: user.email });

    // Parse and validate request body
    const body = await request.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json(
        errorResponse("Profile data required", requestId),
        { status: 400 }
      );
    }

    Sentry.addBreadcrumb({
      category: "validation",
      message: "Validating profile data",
      level: "info",
    });

    const validationResult = ProfileDataSchema.safeParse(profile);
    if (!validationResult.success) {
      logger.warn("Invalid profile data", {
        requestId,
        userId: user.id,
        errors: validationResult.error.issues,
      });

      return NextResponse.json(
        errorResponse("Invalid profile data", requestId),
        { status: 400 }
      );
    }

    const validatedProfile = validationResult.data;

    // Calculate profile size for logging
    const coursesCount = Object.values(validatedProfile.terms).reduce(
      (sum, termCourses) => sum + termCourses.length,
      0
    );

    Sentry.addBreadcrumb({
      category: "database",
      message: "Saving profile to database",
      level: "info",
    });

    // Save to database
    const { data, error } = await supabase
      .from("academic_profiles")
      .insert({
        user_id: user.id,
        name: validatedProfile.name || "My Course Profile",
        profile_data: validatedProfile,
        is_public: true,
      })
      .select("id")
      .single();

    const duration = Date.now() - startTime;

    if (error) {
      logger.error("Database error saving profile", error, {
        requestId,
        userId: user.id,
        duration,
      });

      Sentry.captureException(error, {
        contexts: {
          request: { requestId, userId: user.id, duration },
        },
      });

      return NextResponse.json(
        errorResponse("Failed to save profile", requestId),
        { status: 500 }
      );
    }

    logger.info("Profile created successfully", {
      requestId,
      userId: user.id,
      profileId: data.id,
      coursesCount,
      duration,
    });

    return NextResponse.json(successResponse({ id: data.id }, requestId));
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Unexpected error in profile creation", error, {
      requestId,
      duration,
    });

    Sentry.captureException(error, {
      contexts: {
        request: { requestId, duration },
      },
    });

    return NextResponse.json(
      errorResponse("Internal server error", requestId),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  // Rate limiting check (50 req/min for reads)
  const rateLimitResult = await profileReadLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded on profile read", {
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
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");
    const userId = searchParams.get("userId");

    // Validate IDs if provided
    if (profileId && !UUIDSchema.safeParse(profileId).success) {
      return NextResponse.json(
        errorResponse("Invalid profile ID format", requestId),
        { status: 400 }
      );
    }

    if (userId && !UUIDSchema.safeParse(userId).success) {
      return NextResponse.json(
        errorResponse("Invalid user ID format", requestId),
        { status: 400 }
      );
    }

    if (profileId) {
      // Get specific profile by ID
      const { data, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("id", profileId)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        logger.warn("Profile not found", { requestId, profileId });

        return NextResponse.json(
          errorResponse("Profile not found", requestId),
          { status: 404 }
        );
      }

      logger.info("Profile retrieved by ID", { requestId, profileId });

      return NextResponse.json(successResponse(data.profile_data, requestId), {
        headers: {
          "Cache-Control": "public, max-age=60",
          "X-Request-ID": requestId,
        },
      });
    }

    if (userId) {
      // Get all profiles for a user (requires authentication)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || user.id !== userId) {
        logger.warn("Unauthorized profile access attempt", {
          requestId,
          userId,
        });

        return NextResponse.json(errorResponse("Unauthorized", requestId), {
          status: 401,
        });
      }

      const { data, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        logger.error("Database error fetching user profiles", error, {
          requestId,
          userId,
        });

        return NextResponse.json(
          errorResponse("Failed to fetch profiles", requestId),
          { status: 500 }
        );
      }

      logger.info("User profiles retrieved", {
        requestId,
        userId,
        count: data.length,
      });

      return NextResponse.json(
        successResponse(
          data.map((p) => p.profile_data),
          requestId
        ),
        {
          headers: {
            "Cache-Control": "private, max-age=60",
            "X-Request-ID": requestId,
          },
        }
      );
    }

    return NextResponse.json(
      errorResponse("Missing 'id' or 'userId' parameter", requestId),
      { status: 400 }
    );
  } catch (error) {
    logger.error("Unexpected error in profile GET", error, { requestId });

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
