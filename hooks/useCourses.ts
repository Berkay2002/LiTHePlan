import { useCallback, useEffect, useState } from "react";
import type { Course } from "@/types/course";

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
const CACHE_DURATION_MINUTES = 5;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const CACHE_DURATION_MS =
  CACHE_DURATION_MINUTES * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND; // 5 minutes

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
      if (Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        console.log("📦 Using cached courses data");
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

      const json = await response.json();

      // Handle both old and new API response formats
      const data: CoursesResponse = json.data || json;

      setCourses(data.courses);
      setPagination(data.pagination);

      // Cache the result
      if (enableCache && data.courses) {
        coursesCache.set(cacheKey, {
          data: data.courses,
          pagination: data.pagination,
          timestamp: Date.now(),
        });
        console.log(`💾 Cached ${data.courses.length} courses`);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching courses:", err);
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
