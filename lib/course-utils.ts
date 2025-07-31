import { Course } from "@/types/course";

/**
 * Utility functions for course-related styling and formatting
 */

/**
 * Get the appropriate color classes for course level badges
 */
export function getLevelColor(level: string): string {
  return level === 'avancerad nivå' 
    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
}

/**
 * Get the appropriate color classes for campus badges
 */
export function getCampusColor(campus: string): string {
  switch (campus) {
    case 'Linköping':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'Norrköping':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'Distans':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

/**
 * Format study pace for display
 */
export function formatPace(pace: string): string {
  switch (pace) {
    case '50%':
      return 'Half-time';
    case '100%':
      return 'Full-time';
    default:
      return pace;
  }
} 

/**
 * Check if a course is available in multiple terms
 */
export function isMultiTermCourse(course: Course): boolean {
  return Array.isArray(course.term) && course.term.length > 1;
}

/**
 * Get available terms for a course
 */
export function getAvailableTerms(course: Course): (7 | 8 | 9)[] {
  if (Array.isArray(course.term)) {
    return course.term;
  }
  return [course.term];
}

/**
 * Check if a course is available in a specific term
 */
export function isCourseAvailableInTerm(course: Course, term: 7 | 8 | 9): boolean {
  if (Array.isArray(course.term)) {
    return course.term.includes(term);
  }
  return course.term === term;
} 