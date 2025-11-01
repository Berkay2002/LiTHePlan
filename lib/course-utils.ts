import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import type { Course } from "@/types/course";

/**
 * Utility functions for course-related styling and formatting
 */

/**
 * Get the appropriate color classes for course level badges
 */
export function getLevelColor(level: string): string {
  return level === "avancerad nivå"
    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
    : "bg-chart-2/10 text-chart-2 dark:bg-chart-2/20 dark:text-chart-2";
}

/**
 * Get the appropriate color classes for campus badges
 */
export function getCampusColor(campus: string): string {
  switch (campus) {
    case "Linköping":
      return "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent";
    case "Norrköping":
      return "bg-chart-4/10 text-chart-4 dark:bg-chart-4/20 dark:text-chart-4";
    case "Distans":
      return "bg-muted/50 text-muted-foreground dark:bg-muted dark:text-muted-foreground";
    default:
      return "bg-muted/50 text-muted-foreground dark:bg-muted dark:text-muted-foreground";
  }
}

/**
 * Format study pace for display
 */
export function formatPace(pace: string): string {
  switch (pace) {
    case "50%":
      return "Half-time";
    case "100%":
      return "Full-time";
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
export function getAvailableTerms(course: Course): MasterProgramTerm[] {
  const terms = Array.isArray(course.term) ? course.term : [course.term];

  return terms
    .map((term) => Number.parseInt(term, 10))
    .filter((term): term is MasterProgramTerm =>
      MASTER_PROGRAM_TERMS.includes(term as MasterProgramTerm)
    );
}

/**
 * Check if a course is available in a specific term
 */
export function isCourseAvailableInTerm(
  course: Course,
  term: MasterProgramTerm
): boolean {
  if (Array.isArray(course.term)) {
    return course.term.includes(term.toString());
  }
  return Number.parseInt(course.term, 10) === term;
}

/**
 * Format block(s) for display
 */
export function formatBlocks(blocks: string[]): string {
  if (!blocks || blocks.length === 0) {
    return "N/A";
  }
  if (blocks.length === 1) {
    return blocks[0];
  }
  return blocks.join(", ");
}

/**
 * Get related courses based on program overlap
 * Returns up to 6 courses that share programs with the given course
 */
export function getRelatedCourses(
  course: Course,
  allCourses: Course[],
  limit = 6
): Course[] {
  if (!allCourses || allCourses.length === 0) {
    return [];
  }

  const currentPrograms = new Set(course.programs || []);
  
  // Calculate overlap score for each course
  const coursesWithScores = allCourses
    .filter((c) => c.id !== course.id) // Exclude current course
    .map((c) => {
      const coursePrograms = new Set(c.programs || []);
      
      // Calculate intersection size (program overlap)
      const overlap = [...currentPrograms].filter((p) =>
        coursePrograms.has(p)
      ).length;
      
      // Bonus points for same level
      const levelBonus = c.level === course.level ? 1 : 0;
      
      return {
        course: c,
        score: overlap * 10 + levelBonus, // Program overlap weighted higher
      };
    })
    .filter((item) => item.score > 0) // Only keep courses with some overlap
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  return coursesWithScores.slice(0, limit).map((item) => item.course);
}
