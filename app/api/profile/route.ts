import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ✨ Lightning fast auth check (2-3ms)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profile } = await request.json();

    if (!profile) {
      return NextResponse.json(
        { error: "Profile data required" },
        { status: 400 }
      );
    }

    // Save to database
    const { data, error } = await supabase
      .from("academic_profiles")
      .insert({
        /* biome-ignore lint/style/useNamingConvention: Database columns use snake_case. */
        user_id: user.id,
        name: profile.name || "My Course Profile",
        /* biome-ignore lint/style/useNamingConvention: Database columns use snake_case. */
        profile_data: profile,
        /* biome-ignore lint/style/useNamingConvention: Database columns use snake_case. */
        is_public: true,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to save profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data.id });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (profileId) {
      // Get specific profile by ID
      const { data, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("id", profileId)
        .eq("is_public", true)
        .single();

      if (error || !data) {
        return NextResponse.json(
          { error: "Profile not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(data.profile_data);
    }
    if (userId) {
      // Get all profiles for a user (requires authentication)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user || user.id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { data, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch profiles" },
          { status: 500 }
        );
      }

      return NextResponse.json(data.map((p) => p.profile_data));
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
