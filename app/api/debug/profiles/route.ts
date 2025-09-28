import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all profiles for debugging
    const { data, error } = await supabase
      .from("academic_profiles")
      .select("id, user_id, name, is_public, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      totalProfiles: data?.length || 0,
      recentProfiles: data,
      debugInfo: {
        message:
          "This endpoint shows recent profiles for debugging. Remove in production.",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
