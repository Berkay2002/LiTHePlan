// app/course/[courseId]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { Course } from "@/types/course";
import CoursePageClient from "./CoursePageClient";

// Revalidate every hour (ISR)
export const revalidate = 3600;

// Generate static params for all 339 courses at build time
export async function generateStaticParams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase credentials not found for generateStaticParams');
    return [];
  }

  const { createClient: createServiceClient } = await import('@supabase/supabase-js');
  const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);
  
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .order('id');

  return courses?.map((course) => ({
    courseId: course.id,
  })) || [];
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
    const supabase = await createClient();

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

    // Build comprehensive description
    const levelText = course.level === "avancerad nivå" ? "Advanced level" : "Basic level";
    const termsText = Array.isArray(course.term) ? `Term ${course.term.join(", ")}` : `Term ${course.term}`;
    const programsText = Array.isArray(course.programs) && course.programs.length > 0
      ? `Available in ${course.programs.length} program${course.programs.length > 1 ? 's' : ''}`
      : "";
    
    const description = `${course.name} (${courseId}) - ${course.credits}hp ${levelText} course at Linköping University. ${termsText}. ${programsText}. Campus: ${course.campus}. View course details and add to your academic profile using LiTHePlan.`;

    const title = `${course.name} (${courseId})`;

    return {
      title,
      description,
      keywords: [
        courseId,
        course.name,
        "Linköping University",
        "LiU course",
        course.level,
        course.campus,
        ...(Array.isArray(course.programs) ? course.programs : []),
        ...(course.huvudomrade ? [course.huvudomrade] : []),
      ],
      openGraph: {
        title: `${title} - LiTHePlan`,
        description,
        type: "website",
        images: ["/web-app-manifest-512x512.png"],
        url: `${baseUrl}/course/${courseId}`,
        siteName: "LiTHePlan",
      },
      twitter: {
        card: "summary",
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
      description: "View course details at Linköping University using LiTHePlan, an unofficial student planning tool",
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

  // Fetch all courses for related courses calculation
  const { data: allCourses } = await supabase
    .from("courses")
    .select("*")
    .order("id");

  return (
    <CoursePageClient 
      course={course as Course} 
      allCourses={(allCourses as Course[]) || []} 
    />
  );
}
