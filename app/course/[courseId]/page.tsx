// app/course/[courseId]/page.tsx

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Course } from "@/types/course";
import { createClient } from "@/utils/supabase/server";
import CoursePageClient from "./CoursePageClient";

// ISR: Revalidate every hour for fresh course data
export const revalidate = 3600;

// Generate static params for all 339 courses at build time
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!(supabaseUrl && supabaseServiceKey)) {
    console.warn("Supabase credentials not found for generateStaticParams");
    return [];
  }

  const { createClient: createServiceClient } = await import(
    "@supabase/supabase-js"
  );
  const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

  const { data: courses } = await supabase
    .from("courses")
    .select("id")
    .order("id");

  return (
    courses?.map((course) => ({
      courseId: course.id,
    })) || []
  );
}

// Generate dynamic metadata for each course page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://litheplan.tech";

  try {
    const { courseId } = await params;

    // Use read-only client for metadata (no cookies needed)
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    const { data: course } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (!course) {
      return {
        title: "Course Not Found",
        description: "This course does not exist in our database.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    // Build SEO-optimized description using English terminology
    // Avoid generic "is a" pattern - use keyword-dense, action-oriented language
    const levelText =
      course.level === "avancerad nivå" 
        ? "second-cycle" 
        : "first-cycle";
    const shortLevelText =
      course.level === "avancerad nivå" ? "Advanced level" : "Basic level";
    
    // Feature subject area (huvudomrade) prominently - key for competitor ranking
    const subjectArea = course.huvudomrade 
      ? course.huvudomrade.split(",")[0].trim() // Use primary subject area only
      : "Engineering";
    
    // Use top 2-3 program/orientation names instead of count for keyword density
    const allPrograms = [...course.programs, ...(course.orientations || [])];
    const topPrograms = allPrograms.slice(0, 2); // Limit to 2 for description length
    
    // Build keyword-rich description (target 150-160 chars)
    // Pattern: "[Name] ([Code]) - [Credits]hp [cycle] course, [Subject]. [Campus]. [Programs]"
    // Avoids generic "is a" while maintaining keyword density
    const baseParts = [
      `${course.name} (${courseId})`,
      `${course.credits}hp ${levelText} course`,
      subjectArea,
    ];
    
    const additionalParts = [
      `${course.campus} campus`,
      topPrograms.length > 0 ? topPrograms.join(", ") : null,
    ].filter(Boolean);
    
    // Build description with smart truncation
    let description = `${baseParts.join(" - ")}. ${additionalParts.join(". ")}`;
    
    // Enforce 150-160 character optimal length for SERP snippets
    if (description.length > 160) {
      // Truncate programs first if needed
      if (topPrograms.length > 0) {
        description = `${baseParts.join(" - ")}. ${course.campus} campus`;
      }
      // Still too long? Truncate subject area
      if (description.length > 160) {
        description = `${course.name} (${courseId}) - ${course.credits}hp ${levelText} course. ${course.campus} campus`;
      }
      // Final truncation if still needed
      if (description.length > 160) {
        description = description.substring(0, 157) + "...";
      }
    }
    
    // Add examiner if we have room and it fits
    if (description.length < 140 && course.examinator) {
      const withExaminer = `${description}. ${course.examinator}`;
      if (withExaminer.length <= 160) {
        description = withExaminer;
      }
    }

    const title = `${courseId} ${course.name} - LiTHePlan`;

    // Enhanced keywords - add orientations (specializations) and study director
    // Supports exact match queries like "Molecular Environmental Toxicology NBIC60"
    // and specialization searches like "Computer Graphics courses LiU"
    const keywordsArray = [
      courseId,
      course.name,
      `${course.name} ${courseId}`, // Combined course name + code for queries like "Advanced Programming TSEA26"
      "Linköping University",
      "Linköpings universitet",
      "LiU",
      "LiU course",
      "course planning",
      "master's program",
      course.level,
      course.campus,
      `${course.credits}hp`,
      ...course.programs,
      ...(course.orientations || []), // High-value specialization keywords
      ...(course.huvudomrade ? [course.huvudomrade] : []),
      ...course.examination,
      ...course.term.map((t: string) => `term ${t}`),
      ...(course.examinator
        ? [course.examinator, `${course.examinator} courses`]
        : []),
      ...(course.studierektor ? [course.studierektor] : []), // Study director as secondary authority signal
    ];

    // Convert to comma-separated string
    const keywords = keywordsArray.join(", ");

    return {
      title,
      description,
      keywords,
      openGraph: {
        title: `${title} - LiTHePlan`,
        description,
        type: "article",
        images: ["/web-app-manifest-512x512.png"],
        url: `${baseUrl}/course/${courseId}`,
        siteName: "LiTHePlan",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} - LiTHePlan`,
        description,
        images: ["/web-app-manifest-512x512.png"],
      },
      alternates: {
        canonical: `${baseUrl}/course/${courseId}`,
      },
    };
  } catch (error) {
    console.error("Error generating course metadata:", error);

    return {
      title: "Course Details",
      description:
        "View course details at Linköping University using LiTHePlan, an unofficial student planning tool",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();

  // Fetch course data
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error || !course) {
    notFound();
  }

  // ISR: Static course shell prerendered, revalidated every hour
  // Course data is fetched server-side, so no Suspense needed
  // ProfileProvider handles user-specific data client-side
  // Related courses fetched client-side via API (/api/courses/[courseId]/related)
  return <CoursePageClient course={course as Course} />;
}
