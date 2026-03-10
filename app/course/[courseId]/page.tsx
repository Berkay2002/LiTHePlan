// app/course/[courseId]/page.tsx

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Course } from "@/types/course";
import { createClient } from "@/utils/supabase/server";
import CoursePageClient from "./CoursePageClient";

// ISR: Revalidate every hour for fresh course data
export const revalidate = 3600;

const COURSE_NOT_FOUND_METADATA: Metadata = {
  title: "Course Not Found",
  description: "This course does not exist in our database.",
  robots: {
    index: false,
    follow: false,
  },
};

const COURSE_METADATA_FALLBACK: Metadata = {
  title: "Course Details",
  description:
    "View course details at Linköping University using LiTHePlan, an unofficial student planning tool",
  robots: {
    index: false,
    follow: false,
  },
};

const getLevelText = (level: Course["level"]) =>
  level === "avancerad nivå" ? "second-cycle" : "first-cycle";

function buildCourseDescription(course: Course, courseId: string) {
  const levelText = getLevelText(course.level);
  const subjectArea = course.huvudomrade
    ? course.huvudomrade.split(",")[0].trim()
    : "Engineering";
  const allPrograms = [...course.programs, ...(course.orientations ?? [])];
  const topPrograms = allPrograms.slice(0, 2);
  const baseParts = [
    `${course.name} (${courseId})`,
    `${course.credits}hp ${levelText} course`,
    subjectArea,
  ];
  const additionalParts = [
    `${course.campus} campus`,
    topPrograms.length > 0 ? topPrograms.join(", ") : null,
  ].filter((value): value is string => value !== null);

  let description = `${baseParts.join(" - ")}. ${additionalParts.join(". ")}`;

  if (description.length > 160) {
    if (topPrograms.length > 0) {
      description = `${baseParts.join(" - ")}. ${course.campus} campus`;
    }

    if (description.length > 160) {
      description = `${course.name} (${courseId}) - ${course.credits}hp ${levelText} course. ${course.campus} campus`;
    }

    if (description.length > 160) {
      description = `${description.substring(0, 157)}...`;
    }
  }

  if (description.length < 140 && course.examinator) {
    const withExaminer = `${description}. ${course.examinator}`;
    if (withExaminer.length <= 160) {
      return withExaminer;
    }
  }

  return description;
}

function buildCourseKeywords(course: Course, courseId: string) {
  return [
    courseId,
    course.name,
    `${course.name} ${courseId}`,
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
    ...(course.orientations ?? []),
    ...(course.huvudomrade ? [course.huvudomrade] : []),
    ...course.examination,
    ...course.term.map((term: string) => `term ${term}`),
    ...(course.examinator
      ? [course.examinator, `${course.examinator} courses`]
      : []),
    ...(course.studierektor ? [course.studierektor] : []),
  ].join(", ");
}

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

    const courseData = course as Course | null;

    if (!courseData) {
      return COURSE_NOT_FOUND_METADATA;
    }

    const description = buildCourseDescription(courseData, courseId);
    const title = `${courseId} ${courseData.name} - LiTHePlan`;
    const keywords = buildCourseKeywords(courseData, courseId);

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
    return COURSE_METADATA_FALLBACK;
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
