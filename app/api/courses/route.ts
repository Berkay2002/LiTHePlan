import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type Pagination = {
  limit: number;
  offset: number;
  page: number;
};

const DEFAULT_LIMIT = 50;

function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Number.parseInt(
    searchParams.get("limit") ?? String(DEFAULT_LIMIT),
    10
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const { limit, offset, page } = parsePagination(searchParams);
    const loadAll = searchParams.get("loadAll") === "true";

    let query = supabase.from("courses").select("*", { count: "exact" });

    const arrayFilters = [
      { key: "level", apply: (values: string[]) => query.in("level", values) },
      {
        key: "term",
        apply: (values: string[]) => query.overlaps("term", values),
      },
      {
        key: "period",
        apply: (values: string[]) => query.overlaps("period", values),
      },
      {
        key: "block",
        apply: (values: string[]) => query.overlaps("block", values),
      },
      { key: "pace", apply: (values: string[]) => query.in("pace", values) },
      {
        key: "campus",
        apply: (values: string[]) => query.in("campus", values),
      },
      {
        key: "orientations",
        apply: (values: string[]) => query.overlaps("orientations", values),
      },
    ] as const;

    for (const { key, apply } of arrayFilters) {
      const values = searchParams.getAll(key);
      if (values.length > 0) {
        query = apply(values);
      }
    }

    const programs = searchParams.get("programs");
    if (programs) {
      query = query.contains("programs", [programs]);
    }

    const search = searchParams.get("search");
    if (search) {
      query = query.or(
        `id.ilike.%${search}%,name.ilike.%${search}%,examinator.ilike.%${search}%,studierektor.ilike.%${search}%,programs.cs.{${search}}`
      );
    }

    if (!loadAll) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query.order("id");

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      courses: data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        hasMore: loadAll ? false : offset + limit < (count ?? 0),
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
