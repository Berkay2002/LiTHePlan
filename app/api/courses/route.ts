import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { CourseFiltersSchema } from "@/lib/api-validation";
import { coursesLimiter, getClientIP } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import * as Sentry from "@sentry/nextjs";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = logger.generateRequestId();
  const clientIP = getClientIP(request.headers);

  // Rate limiting check
  const rateLimitResult = await coursesLimiter.limit(clientIP);
  if (!rateLimitResult.success) {
    logger.warn("Rate limit exceeded", {
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
    const supabase = await createClient();

    // Get and validate query parameters
    const { searchParams } = new URL(request.url);

    // Convert searchParams to object for validation
    const rawFilters = {
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "50",
      loadAll: searchParams.get("loadAll") || "false",
      level: searchParams.getAll("level"),
      term: searchParams.getAll("term"),
      period: searchParams.getAll("period"),
      block: searchParams.getAll("block"),
      pace: searchParams.getAll("pace"),
      campus: searchParams.getAll("campus"),
      orientations: searchParams.getAll("orientations"),
      programs: searchParams.get("programs") || undefined,
      search: searchParams.get("search") || undefined,
    };

    // Validate filters with Zod
    const validationResult = CourseFiltersSchema.safeParse(rawFilters);
    if (!validationResult.success) {
      logger.warn("Invalid course filters", {
        requestId,
        errors: validationResult.error.issues,
      });

      return NextResponse.json(
        errorResponse("Invalid filter parameters", requestId),
        { status: 400 }
      );
    }

    const filters = validationResult.data;
    const { page, limit, loadAll } = filters;
    const offset = (page - 1) * limit;

    let query = supabase.from("courses").select("*", { count: "exact" });

    // Apply filters
    const { level, term, period, block, pace, campus, programs, orientations, search } = filters;

    if (level.length > 0) {
      query = query.in("level", level);
    }

    if (term.length > 0) {
      query = query.overlaps("term", term);
    }

    if (period.length > 0) {
      query = query.overlaps("period", period);
    }

    if (block.length > 0) {
      query = query.overlaps("block", block);
    }

    if (pace.length > 0) {
      query = query.in("pace", pace);
    }

    if (campus.length > 0) {
      query = query.in("campus", campus);
    }

    if (programs) {
      query = query.contains("programs", [programs]);
    }

    if (orientations.length > 0) {
      query = query.overlaps("orientations", orientations);
    }

    if (search) {
      query = query.or(
        `id.ilike.%${search}%,name.ilike.%${search}%,examinator.ilike.%${search}%,studierektor.ilike.%${search}%,programs.cs.{${search}}`
      );
    }

    // Apply pagination only if not loading all
    if (!loadAll) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query.order("id");

    // Transform data to match frontend types
    const transformedData = data?.map((course) => ({
      ...course,
      // Convert numeric pace (1.0, 0.5) to percentage string (100%, 50%)
      pace: typeof course.pace === 'number'
        ? course.pace === 1 || course.pace === 1.0 ? '100%' : '50%'
        : course.pace,
    }));

    const duration = Date.now() - startTime;

    logger.info("Courses API request completed", {
      requestId,
      duration,
      coursesReturned: transformedData?.length || 0,
      totalCourses: count || 0,
      loadAll,
      filtersApplied: Object.keys(filters).filter(
        (k) => k !== "page" && k !== "limit" && k !== "loadAll"
      ).length,
    });

    if (error) {
      logger.error("Database error in courses API", error, {
        requestId,
        duration,
      });

      Sentry.captureException(error, {
        contexts: {
          request: { requestId, duration },
        },
      });

      return NextResponse.json(
        errorResponse("Failed to fetch courses", requestId),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          courses: transformedData,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
            hasMore: loadAll ? false : offset + limit < (count || 0),
          },
        },
        requestId
      ),
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=600",
          "X-Request-ID": requestId,
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Unexpected error in courses API", error, {
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
