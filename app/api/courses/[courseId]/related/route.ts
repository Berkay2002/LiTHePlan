import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { coursesLimiter, getClientIP } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";

const CourseIdSchema = z.object({
  courseId: z.string().min(1).max(20),
});

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  const startTime = Date.now();
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  // Rate limiting check
  const rateLimitResult = await coursesLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded for related courses", {
      requestId,
      clientIP,
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
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
    const params = await context.params;
    
    // Validate course ID
    const validationResult = CourseIdSchema.safeParse(params);
    if (!validationResult.success) {
      logger.warn("Invalid course ID for related courses", {
        requestId,
        courseId: params.courseId,
        errors: validationResult.error.issues,
      });

      return NextResponse.json(
        errorResponse("Invalid course ID", requestId),
        { status: 400 }
      );
    }

    const { courseId } = validationResult.data;
    const supabase = await createClient();

    // Call PostgreSQL function with optimized composite index usage
    // Uses idx_courses_programs (GIN) and idx_courses_related_composite (btree)
    const { data: relatedCourses, error: relatedError } = await supabase.rpc(
      "get_related_courses",
      {
        p_course_id: courseId,
        p_limit: 6,
      }
    );

    if (relatedError) {
      logger.error("Failed to fetch related courses", relatedError, {
        requestId,
        courseId,
      });

      return NextResponse.json(
        errorResponse("Failed to fetch related courses", requestId),
        { status: 500 }
      );
    }

    // Transform data: convert numeric pace to percentage string for frontend
    const transformedCourses = (relatedCourses || []).map((course: {
      relevance_score?: number;
      pace?: number | string;
      [key: string]: unknown;
    }) => {
      // Remove relevance_score from response (internal scoring)
      const { relevance_score, ...courseData } = course;
      
      return {
        ...courseData,
        // Convert numeric pace (1.0, 0.5) to percentage string (100%, 50%)
        pace:
          typeof courseData.pace === "number"
            ? courseData.pace === 1 || courseData.pace === 1.0
              ? "100%"
              : "50%"
            : courseData.pace,
      };
    });

    const duration = Date.now() - startTime;

    logger.info("Related courses API completed", {
      requestId,
      duration,
      courseId,
      relatedCount: transformedCourses.length,
    });

    return NextResponse.json(
      successResponse(
        {
          courses: transformedCourses,
          algorithm: "database-function-composite-index",
        },
        requestId
      ),
      {
        headers: {
          "Cache-Control":
            "public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400",
          "X-Request-ID": requestId,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Unexpected error in related courses API", error, {
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
