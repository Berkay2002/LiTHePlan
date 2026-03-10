import { captureException } from "@sentry/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/api-response";
import { CourseFiltersSchema } from "@/lib/api-validation";
import { logger } from "@/lib/logger";
import { coursesLimiter, getClientIP } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";

const validateCourseFilters = (searchParams: URLSearchParams) =>
  CourseFiltersSchema.safeParse(getRawCourseFilters(searchParams));

type CourseFilters = Extract<
  ReturnType<typeof validateCourseFilters>,
  { success: true }
>["data"];
interface CourseRow {
  pace?: number | string | null;
  [key: string]: unknown;
}

const getRawCourseFilters = (searchParams: URLSearchParams) => ({
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
});

const normalizePace = (pace: CourseRow["pace"]) => {
  if (typeof pace !== "number") {
    return pace;
  }

  return pace === 1 ? "100%" : "50%";
};

const transformCourse = (course: CourseRow) => ({
  ...course,
  pace: normalizePace(course.pace),
});

const buildCoursesQuery = (
  supabase: Awaited<ReturnType<typeof createClient>>,
  filters: CourseFilters
) => {
  const { page, limit, loadAll } = filters;
  const offset = (page - 1) * limit;
  let query = supabase.from("courses").select("*", { count: "exact" });

  if (filters.level.length > 0) {
    query = query.in("level", filters.level);
  }

  if (filters.term.length > 0) {
    query = query.overlaps("term", filters.term);
  }

  if (filters.period.length > 0) {
    query = query.overlaps("period", filters.period);
  }

  if (filters.block.length > 0) {
    query = query.overlaps("block", filters.block);
  }

  if (filters.pace.length > 0) {
    query = query.in("pace", filters.pace);
  }

  if (filters.campus.length > 0) {
    query = query.in("campus", filters.campus);
  }

  if (filters.programs) {
    query = query.contains("programs", [filters.programs]);
  }

  if (filters.orientations.length > 0) {
    query = query.overlaps("orientations", filters.orientations);
  }

  if (filters.search) {
    query = query.or(
      `id.ilike.%${filters.search}%,name.ilike.%${filters.search}%,examinator.ilike.%${filters.search}%,studierektor.ilike.%${filters.search}%,programs.cs.{${filters.search}}`
    );
  }

  if (!loadAll) {
    query = query.range(offset, offset + limit - 1);
  }

  return query.order("id");
};

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
    const { searchParams } = new URL(request.url);
    const validationResult = validateCourseFilters(searchParams);
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
    const { data, error, count } = await buildCoursesQuery(supabase, filters);
    const transformedData = data?.map(transformCourse);

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

      captureException(error, {
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

    captureException(error, {
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
