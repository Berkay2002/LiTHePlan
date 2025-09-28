import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: profileId } = await params;

    // First, try to find by profile ID
    const { data, error } = await supabase
      .from("academic_profiles")
      .select("*")
      .eq("id", profileId)
      .eq("is_public", true)
      .single();

    if (data) {
      return NextResponse.json(data.profile_data);
    }

    // If not found by profile ID, check if it might be a user ID (for backward compatibility)
    const { data: userProfile, error: userError } = await supabase
      .from("academic_profiles")
      .select("*")
      .eq("user_id", profileId)
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (userProfile) {
      // Redirect to the proper profile ID URL
      return NextResponse.redirect(
        new URL(`/profile/${userProfile.id}`, request.url)
      );
    }

    const debugDetails = {
      databaseError: error?.message,
      userProfileError: userError?.message,
    };

    return NextResponse.json(
      {
        error: "Profile not found",
        details:
          "This profile may not exist, may not be public, or may have been deleted.",
        ...(process.env.NODE_ENV !== "production"
          ? { debug: debugDetails }
          : {}),
      },
      { status: 404 }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
