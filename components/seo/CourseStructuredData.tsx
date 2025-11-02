'use client';

import type { Course } from "@/types/course";

interface CourseStructuredDataProps {
  course: Course;
}

export default function CourseStructuredData({ course }: CourseStructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://litheplan.tech';

  // Convert Swedish level to Schema.org educationalLevel
  const educationalLevel = course.level === "avancerad nivå"
    ? "Advanced Level (Master's)"
    : "Basic Level (Bachelor's)";

  // Calculate time required based on pace and credits
  // Most LiU courses are one study period (approximately 1-2 months)
  const timeRequired = course.pace === "100%"
    ? "P1M" // 1 month full-time
    : "P2M"; // 2 months half-time

  // Build comprehensive description
  const termsText = Array.isArray(course.term)
    ? `Available in term ${course.term.join(", ")}`
    : `Available in term ${course.term}`;
  const blocksText = Array.isArray(course.block)
    ? `block ${course.block.join(", ")}`
    : `block ${course.block}`;

  const description = `${course.name} (${course.id}) is a ${course.credits}hp ${course.level} course at Linköping University. ${termsText}, ${blocksText}. Campus: ${course.campus}. Study pace: ${course.pace}.`;

  // Extract prerequisites from notes if present
  const prerequisitesMatch = course.notes?.match(/(?:prerequisite|förutsättning|require)[s]?:?\s*([^.]+)/i);
  const prerequisites = prerequisitesMatch ? prerequisitesMatch[1].trim() : undefined;

  // Map Swedish examination types to English for better SEO
  const examinationMapping: Record<string, string> = {
    'TEN': 'Written examination',
    'LAB': 'Laboratory work',
    'PROJ': 'Project work',
    'SEM': 'Seminar',
    'UPG': 'Assignment'
  };

  const assessmentMethods = Array.isArray(course.examination)
    ? course.examination.map(exam => examinationMapping[exam] || exam)
    : [];

  // Breadcrumb structured data
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Courses",
        "item": `${baseUrl}/#courses`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${course.name} (${course.id})`,
        "item": `${baseUrl}/course/${course.id}`
      }
    ]
  };

  // Enhanced course schema with comprehensive metadata
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `${baseUrl}/course/${course.id}`,
    "courseCode": course.id,
    "name": course.name,
    "description": description,
    "provider": {
      "@type": "EducationalOrganization",
      "@id": "https://www.liu.se",
      "name": "Linköping University",
      "alternateName": ["LiU", "Linköpings universitet"],
      "url": "https://www.liu.se",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "SE",
        "addressLocality": course.campus === "Linköping" ? "Linköping" :
                           course.campus === "Norrköping" ? "Norrköping" : undefined
      }
    },
    "educationalCredentialAwarded": `${course.credits} Swedish university credits (hp)`,
    "educationalLevel": educationalLevel,
    "numberOfCredits": {
      "@type": "StructuredValue",
      "value": course.credits,
      "unitText": "hp"
    },
    "timeRequired": timeRequired,
    "availableLanguage": ["sv", "en"],
    "inLanguage": "sv",
    "teaches": course.huvudomrade || "Engineering",
    "courseWorkload": course.pace,
    ...(prerequisites && { "coursePrerequisites": prerequisites }),
    ...(assessmentMethods.length > 0 && { "assessmentMethod": assessmentMethods }),
    ...(course.examinator && {
      "instructor": {
        "@type": "Person",
        "name": course.examinator,
        "jobTitle": "Course Examiner"
      }
    }),
    "offers": {
      "@type": "Offer",
      "category": "Educational",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "0",
        "priceCurrency": "SEK",
        "description": "Free tuition for Swedish and EU students"
      }
    },
    "hasCourseInstance": Array.isArray(course.term) ? course.term.map(term => ({
      "@type": "CourseInstance",
      "courseMode": course.campus === "Distans" ? "online" : "onsite",
      "location": course.campus !== "Distans" ? {
        "@type": "Place",
        "name": course.campus === "Linköping" ? "Linköping Campus" :
                course.campus === "Norrköping" ? "Norrköping Campus" :
                "Distance Learning",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "SE",
          "addressLocality": course.campus === "Linköping" ? "Linköping" : "Norrköping"
        }
      } : undefined,
      "courseSchedule": {
        "@type": "Schedule",
        "repeatCount": 1,
        "description": `Term ${term}, Period ${course.period.join(", ")}, Block ${course.block.join(", ")}`
      }
    })) : [{
      "@type": "CourseInstance",
      "courseMode": course.campus === "Distans" ? "online" : "onsite",
      "location": course.campus !== "Distans" ? {
        "@type": "Place",
        "name": course.campus === "Linköping" ? "Linköping Campus" :
                course.campus === "Norrköping" ? "Norrköping Campus" :
                "Distance Learning",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "SE",
          "addressLocality": course.campus === "Linköping" ? "Linköping" : "Norrköping"
        }
      } : undefined,
      "courseSchedule": {
        "@type": "Schedule",
        "repeatCount": 1,
        "description": `Term ${course.term}, Period ${course.period}, Block ${course.block}`
      }
    }],
    ...(course.programs.length > 0 && {
      "isPartOf": course.programs.map(program => ({
        "@type": "EducationalOccupationalProgram",
        "name": program,
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Linköping University"
        }
      }))
    }),
    "url": `${baseUrl}/course/${course.id}`,
    "identifier": course.id
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
    </>
  );
}
