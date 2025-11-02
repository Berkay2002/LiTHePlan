import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

// Revalidate sitemap every hour (ISR)
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech";

  try {
    // Use service role client for sitemap generation (no cookies needed)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!(supabaseUrl && supabaseServiceKey)) {
      console.warn(
        "Supabase credentials not found for sitemap generation, returning homepage only"
      );
      return [
        {
          url: baseUrl,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 1.0,
        },
      ];
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch public profiles updated in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: profiles } = await supabase
      .from("academic_profiles")
      .select("id, updated_at")
      .eq("is_public", true)
      .gte("updated_at", thirtyDaysAgo.toISOString())
      .order("updated_at", { ascending: false });

    // Fetch all courses for course detail pages
    const { data: courses } = await supabase
      .from("courses")
      .select("id, updated_at")
      .order("id");

    // Homepage entry
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];

    // Course detail pages (all 339 courses)
    const coursePages: MetadataRoute.Sitemap =
      courses?.map((course) => ({
        url: `${baseUrl}/course/${course.id}`,
        lastModified: course.updated_at
          ? new Date(course.updated_at)
          : new Date(),
        changeFrequency: "monthly",
        priority: 0.8,
      })) || [];

    // Public profile pages (last 30 days only)
    const profilePages: MetadataRoute.Sitemap =
      profiles?.map((profile) => ({
        url: `${baseUrl}/profile/${profile.id}`,
        lastModified: new Date(profile.updated_at),
        changeFrequency: "weekly",
        priority: 0.6,
      })) || [];

    return [...staticPages, ...coursePages, ...profilePages];
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to just homepage if database query fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
    ];
  }
}
