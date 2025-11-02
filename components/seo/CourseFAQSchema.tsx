'use client';

import type { Course } from "@/types/course";

interface CourseFAQSchemaProps {
  course: Course;
}

/**
 * FAQ schema for course pages
 * Enables rich snippets and featured snippets in Google search results
 */
export function CourseFAQSchema({ course }: CourseFAQSchemaProps) {

  // Format examination methods for answer
  const examinationMapping: Record<string, string> = {
    'TEN': 'written examination',
    'LAB': 'laboratory work',
    'PROJ': 'project work',
    'SEM': 'seminars',
    'UPG': 'assignments'
  };

  const examinationMethods = Array.isArray(course.examination)
    ? course.examination.map(exam => examinationMapping[exam] || exam).join(", ")
    : "various assessment methods";

  // Build program list
  const programCount = Array.isArray(course.programs) ? course.programs.length : 0;
  const programList = Array.isArray(course.programs) ? course.programs.join(", ") : "";

  // Format term and period
  const termsText = Array.isArray(course.term) ? course.term.join(", ") : course.term;
  const periodsText = Array.isArray(course.period) ? course.period.join(", ") : course.period;
  const blocksText = Array.isArray(course.block) ? course.block.join(", ") : course.block;

  // Build course overview answer
  const levelText = course.level === "avancerad nivå" ? "advanced level" : "basic level";
  const courseOverview = `${course.name} (${course.id}) is a ${course.credits} Swedish university credits (hp) ${levelText} course offered at Linköping University. The course covers ${course.huvudomrade || 'engineering topics'} and is assessed through ${examinationMethods}.`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is ${course.name} (${course.id})?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": courseOverview
        }
      },
      ...(course.examinator ? [{
        "@type": "Question",
        "name": `Who teaches ${course.id}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${course.examinator} is the course examiner for ${course.name}.`
        }
      }] : []),
      {
        "@type": "Question",
        "name": `When is ${course.id} offered?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": [
            `${course.name} is offered during term ${termsText}`,
            periodsText ? `in period ${periodsText}` : '',
            blocksText ? `block ${blocksText}` : '',
            `at ${course.campus} campus`
          ].filter(Boolean).join(', ') + '.'
        }
      },
      {
        "@type": "Question",
        "name": `How many credits is ${course.id}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${course.name} is worth ${course.credits} Swedish university credits (hp).`
        }
      },
      ...(programCount > 0 ? [{
        "@type": "Question",
        "name": `What programs include ${course.id}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `This course is available in ${programCount} program${programCount > 1 ? 's' : ''}: ${programList}.`
        }
      }] : []),
      {
        "@type": "Question",
        "name": `What is the examination format for ${course.id}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${course.name} is assessed through ${examinationMethods}.`
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
