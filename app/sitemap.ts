import { createClient } from "@supabase/supabase-js";
import type { MetadataRoute } from "next";

// Revalidate sitemap once per day (ISR)
// Course data is relatively static, no need for hourly updates
export const revalidate = 86400; // 24 hours

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech";

  try {
    // Use public anon key for reading public course data
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!(supabaseUrl && supabaseAnonKey)) {
      console.warn(
        "Supabase credentials not found for sitemap generation, returning static pages only"
      );
      return getStaticPages(baseUrl);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Static pages
    const staticPages: MetadataRoute.Sitemap = getStaticPages(baseUrl);

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

    // Fallback to static pages if database query fails
    return getStaticPages(baseUrl);
  }
}

// Helper function for static pages
function getStaticPages(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
