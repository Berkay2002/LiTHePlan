import { useCallback, useEffect, useState } from "react";
import type { Course } from "@/types/course";
import { logger } from "@/lib/logger";

export interface UseCoursesResult {
  courses: Course[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  } | null;
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// Simple in-memory cache
const coursesCache = new Map<
  string,
  {
    data: Course[];
    timestamp: number;
    pagination: UseCoursesResult["pagination"];
  }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useCourses(
  options: {
    loadAll?: boolean;
    page?: number;
    limit?: number;
    enableCache?: boolean;
  } = {}
): UseCoursesResult {
  const { loadAll = true, page = 1, limit = 50, enableCache = true } = options;

  const [courses, setCourses] = useState<Course[]>([]);
  const [pagination, setPagination] =
    useState<UseCoursesResult["pagination"]>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildCacheKey = useCallback(
    (loadAll: boolean, page: number, limit: number) =>
      `courses-${loadAll ? "all" : `${page}-${limit}`}`,
    []
  );

  const fetchCourses = useCallback(async () => {
    const cacheKey = buildCacheKey(loadAll, page, limit);

    // Check cache first
    if (enableCache && coursesCache.has(cacheKey)) {
      const cached = coursesCache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        logger.info("📦 Using cached courses data");
        setCourses(cached.data);
        setPagination(cached.pagination);
        setLoading(false);
        return;
      }
      // Cache expired, remove it
      coursesCache.delete(cacheKey);
    }

    setLoading(true);
    setError(null);

    try {
      const url = new URL("/api/courses", window.location.origin);
      if (loadAll) {
        url.searchParams.set("loadAll", "true");
      } else {
        url.searchParams.set("page", page.toString());
        url.searchParams.set("limit", limit.toString());
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data: CoursesResponse = await response.json();

      setCourses(data.courses);
      setPagination(data.pagination);

      // Cache the result
      if (enableCache) {
        coursesCache.set(cacheKey, {
          data: data.courses,
          pagination: data.pagination,
          timestamp: Date.now(),
        });
        logger.info(`💾 Cached ${data.courses.length} courses`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      logger.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [loadAll, page, limit, enableCache, buildCacheKey]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
    pagination,
  };
}