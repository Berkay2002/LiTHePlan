'use client';

import type { Course } from "@/types/course";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface CourseOverviewProps {
  course: Course;
}

/**
 * SEO-optimized course overview component
 * Generates 150-200 word description from course metadata for better search indexing
 */
export function CourseOverview({ course }: CourseOverviewProps) {
  // Extract prerequisite information from notes if available
  const prerequisiteMatch = course.notes?.match(/(?:prerequisite|förutsättning|required?(?:ments)?)[s]?:?\s*([^.]+)/i);
  const prerequisiteText = prerequisiteMatch 
    ? `Prerequisites: ${prerequisiteMatch[1].trim()}.`
    : "No specific prerequisites stated.";

  // Build program context
  const programCount = course.programs.length;
  const topProgramsArray = course.programs.slice(0, 3);
  const topPrograms = topProgramsArray.join(", ");
  const programText = programCount > 0
    ? `This course is part of ${programCount} program${programCount > 1 ? 's' : ''} including ${topPrograms}${programCount > topProgramsArray.length ? ', and others' : ''}.`
    : "";

  // Format examination methods for readability
  const examinationMapping: Record<string, string> = {
    'TEN': 'written examination',
    'LAB': 'laboratory work',
    'PROJ': 'project work',
    'SEM': 'seminars',
    'UPG': 'assignments'
  };

  const examinationMethods = course.examination
    .map(exam => examinationMapping[exam] || exam.toLowerCase())
    .join(", ") || "various assessment methods";

  // Format term and block information
  const termsText = `term ${course.term.join(", ")}`;
  const blocksText = `block ${course.block.join(", ")}`;

  // Build subject area context
  const subjectText = course.huvudomrade
    ? `The course covers ${course.huvudomrade.toLowerCase()} and provides essential knowledge in this field.`
    : "";

  // Build examiner context
  const examinerText = course.examinator
    ? `Taught by ${course.examinator}, this course provides comprehensive instruction and guidance.`
    : "";

  // Determine level context
  const levelContext = course.level === "avancerad nivå"
    ? "This advanced-level course is designed for master's students seeking specialized knowledge."
    : "This basic-level course provides foundational knowledge for undergraduate studies.";

  // Build orientation context if available
  const orientationText = course.orientations && course.orientations.length > 0
    ? `Students in ${course.orientations.slice(0, 2).join(" and ")} specializations will find this course particularly relevant.`
    : "";

  return (
    <Card className="bg-background border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BookOpen className="h-5 w-5 text-primary" />
          Course Overview
        </CardTitle>
        <CardDescription>
          Comprehensive information about this course
        </CardDescription>
      </CardHeader>
      <CardContent className="prose prose-sm dark:prose-invert max-w-none">
        <p className="text-foreground leading-relaxed">
          <strong>{course.name} ({course.id})</strong> is a {course.credits}hp {course.level} course 
          offered at Linköping University's {course.campus} campus. {levelContext} {programText}
        </p>
        
        <p className="text-foreground leading-relaxed">
          {subjectText} The course is assessed through {examinationMethods}. 
          Students can take this course during {termsText}, typically in {blocksText}, 
          at a study pace of {course.pace}.
        </p>

        <p className="text-foreground leading-relaxed">
          {prerequisiteText} {orientationText} {examinerText}
        </p>
      </CardContent>
    </Card>
  );
}
