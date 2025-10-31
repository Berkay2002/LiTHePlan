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
  const timeRequired = course.pace === "100%" 
    ? "P1M" // 1 month full-time (assuming one block period)
    : "P2M"; // 2 months half-time
  
  // Build description from course metadata
  const termsText = Array.isArray(course.term) 
    ? `Available in term ${course.term.join(", ")}` 
    : `Available in term ${course.term}`;
  const blocksText = Array.isArray(course.block) 
    ? `block ${course.block.join(", ")}` 
    : `block ${course.block}`;
  
  const description = `${course.name} is a ${course.credits}hp ${course.level} course at Linköping University. ${termsText}, ${blocksText}. Campus: ${course.campus}. Study pace: ${course.pace}.`;

  const schema = {
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
      "alternateName": "LiU",
      "url": "https://www.liu.se",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "SE",
        "addressLocality": course.campus === "Linköping" ? "Linköping" : "Norrköping"
      }
    },
    "educationalCredentialAwarded": `${course.credits} Swedish university credits (hp)`,
    "educationalLevel": educationalLevel,
    "numberOfCredits": {
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "Swedish university credits",
      "value": course.credits
    },
    "timeRequired": timeRequired,
    "availableLanguage": "sv", // Courses taught in Swedish
    "inLanguage": "sv",
    "teaches": course.huvudomrade || "Engineering", // Main subject area
    "courseWorkload": course.pace,
    "hasCourseInstance": Array.isArray(course.term) ? course.term.map(term => ({
      "@type": "CourseInstance",
      "courseMode": course.campus === "Distans" ? "online" : "onsite",
      "location": {
        "@type": "Place",
        "name": course.campus === "Linköping" ? "Linköping Campus" : 
                course.campus === "Norrköping" ? "Norrköping Campus" : 
                "Distance Learning"
      },
      "courseSchedule": {
        "@type": "Schedule",
        "repeatCount": 1,
        "description": `Term ${term}`
      }
    })) : [{
      "@type": "CourseInstance",
      "courseMode": course.campus === "Distans" ? "online" : "onsite",
      "location": {
        "@type": "Place",
        "name": course.campus === "Linköping" ? "Linköping Campus" : 
                course.campus === "Norrköping" ? "Norrköping Campus" : 
                "Distance Learning"
      },
      "courseSchedule": {
        "@type": "Schedule",
        "repeatCount": 1,
        "description": `Term ${course.term}`
      }
    }]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
