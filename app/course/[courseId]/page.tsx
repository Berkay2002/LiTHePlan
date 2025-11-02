// app/course/[courseId]/page.tsx

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CoursePageSkeleton } from "@/components/course/CoursePageSkeleton";
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

    // Build comprehensive description with examiner for better CTR
    const levelText =
      course.level === "avancerad nivå" ? "Advanced level" : "Basic level";
    const termsText = `Term ${course.term.join(", ")}`;
    const programsText =
      course.programs.length > 0
        ? `Available in ${course.programs.length} program${course.programs.length > 1 ? "s" : ""}`
        : "";
    const examinationText =
      course.examination.length > 0
        ? `Examination: ${course.examination.join(", ")}`
        : "";
    const examinerText = course.examinator
      ? `Taught by ${course.examinator}`
      : "";

    // Build description from non-empty fragments to avoid double periods
    const descriptionFragments = [
      `${course.name} (${courseId}) - ${course.credits}hp ${levelText} course at Linköping University`,
      termsText,
      programsText,
      `Campus: ${course.campus}`,
      examinationText,
      examinerText,
      "Plan your degree with LiTHePlan.",
    ].filter(Boolean);
    const description = descriptionFragments.join(" ");

    const title = `${course.name} (${courseId}) | ${course.credits}hp ${levelText}`;

    // Enhanced keywords as comma-separated string for optimal SEO
    // Supports exact match queries like "Molecular Environmental Toxicology NBIC60"
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
      ...(course.huvudomrade ? [course.huvudomrade] : []),
      ...course.examination,
      ...course.term.map((t: string) => `term ${t}`),
      ...(course.examinator
        ? [course.examinator, `${course.examinator} courses`]
        : []), // Support examiner-based searches
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

  // ISR + Suspense: Static course shell prerendered, revalidated every hour
  // ProfileProvider streams user-specific data with Suspense
  // Related courses fetched client-side via API (/api/courses/[courseId]/related)
  return (
    <Suspense fallback={<CoursePageSkeleton />}>
      <CoursePageClient course={course as Course} />
    </Suspense>
  );
}
