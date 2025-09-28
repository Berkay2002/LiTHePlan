import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const supabase = await createClient();

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);

    // Pagination parameters
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "50"); // Default 50 courses per request
    const offset = (page - 1) * limit;

    // Check if we need all courses (for initial load with filters, etc.)
    const loadAll = searchParams.get("loadAll") === "true";

    let query = supabase.from("courses").select("*", { count: "exact" });

    // Apply filters (matches your existing FilterState interface)
    const level = searchParams.getAll("level");
    if (level.length > 0) {
      query = query.in("level", level);
    }

    const term = searchParams.getAll("term");
    if (term.length > 0) {
      query = query.overlaps("term", term);
    }

    const period = searchParams.getAll("period");
    if (period.length > 0) {
      query = query.overlaps("period", period);
    }

    const block = searchParams.getAll("block");
    if (block.length > 0) {
      query = query.overlaps("block", block);
    }

    const pace = searchParams.getAll("pace");
    if (pace.length > 0) {
      query = query.in("pace", pace);
    }

    const campus = searchParams.getAll("campus");
    if (campus.length > 0) {
      query = query.in("campus", campus);
    }

    const programs = searchParams.get("programs");
    if (programs) {
      query = query.contains("programs", [programs]);
    }

    const orientations = searchParams.getAll("orientations");
    if (orientations.length > 0) {
      query = query.overlaps("orientations", orientations);
    }

    const search = searchParams.get("search");
    if (search) {
      query = query.or(`id.ilike.%${search}%,name.ilike.%${search}%`);
    }

    // Apply pagination only if not loading all
    if (!loadAll) {
      query = query.range(offset, offset + limit - 1);
    }

    const { data, error, count } = await query.order("id");

    console.log(
      `⚡ Courses API completed in ${Date.now() - startTime}ms - ${loadAll ? "All" : `${data?.length || 0}`} courses`
    );

    if (error) {
      console.error("Database error:", error);
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
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: loadAll ? false : offset + limit < (count || 0),
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
