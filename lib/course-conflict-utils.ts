// lib/course-conflict-utils.ts

import { Course } from '@/types/course';
import { StudentProfile } from '@/types/profile';

/**
 * Extracts course IDs that cannot be combined with a given course from its notes
 */
export function extractConflictingCourses(notes: string | null | undefined): string[] {
  if (!notes) return [];
  
  // Match patterns like:
  // "The course may not be included in a degree together with: TSBK02, TSBK35"
  // "Kursen får ej ingå i examen tillsammans med: TNK110"
  const englishPattern = /The course may not be included in a degree together with:\s*([A-Z0-9, ]+)/i;
  const swedishPattern = /Kursen får ej ingå i examen tillsammans med:\s*([A-Z0-9, ]+)/i;
  
  const englishMatch = notes.match(englishPattern);
  const swedishMatch = notes.match(swedishPattern);
  
  const match = englishMatch || swedishMatch;
  if (!match) return [];
  
  // Extract course codes, split by comma and clean up
  const courseIds = match[1]
    .split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0);
  
  return courseIds;
}

/**
 * Checks if a course conflicts with any courses already in the profile
 */
export function findCourseConflicts(
  newCourse: Course,
  currentProfile: StudentProfile
): { conflictingCourse: Course; conflictingCourseId: string }[] {
  const newCourseConflicts = extractConflictingCourses(newCourse.notes);
  const conflicts: { conflictingCourse: Course; conflictingCourseId: string }[] = [];
  
  // Check each term in the profile
  ([7, 8, 9] as const).forEach(term => {
    const termCourses = currentProfile.terms[term];
    termCourses.forEach(existingCourse => {
      // Check if new course conflicts with existing course
      if (newCourseConflicts.includes(existingCourse.id)) {
        conflicts.push({
          conflictingCourse: existingCourse,
          conflictingCourseId: existingCourse.id
        });
      }
      
      // Also check if existing course conflicts with new course
      const existingCourseConflicts = extractConflictingCourses(existingCourse.notes);
      if (existingCourseConflicts.includes(newCourse.id)) {
        conflicts.push({
          conflictingCourse: existingCourse,
          conflictingCourseId: existingCourse.id
        });
      }
    });
  });
  
  // Remove duplicates
  return conflicts.filter((conflict, index, arr) => 
    arr.findIndex(c => c.conflictingCourseId === conflict.conflictingCourseId) === index
  );
}

/**
 * Checks if two specific courses conflict with each other
 */
export function doCoursesConflict(courseA: Course, courseB: Course): boolean {
  const courseAConflicts = extractConflictingCourses(courseA.notes);
  const courseBConflicts = extractConflictingCourses(courseB.notes);
  
  return courseAConflicts.includes(courseB.id) || courseBConflicts.includes(courseA.id);
}

/**
 * Gets all courses that a given course conflicts with (from all available courses)
 */
export function getAllConflictingCourses(
  targetCourse: Course,
  allCourses: Course[]
): Course[] {
  const targetConflicts = extractConflictingCourses(targetCourse.notes);
  
  return allCourses.filter(course => {
    if (course.id === targetCourse.id) return false;
    
    // Check if target course conflicts with this course
    if (targetConflicts.includes(course.id)) return true;
    
    // Check if this course conflicts with target course
    const courseConflicts = extractConflictingCourses(course.notes);
    return courseConflicts.includes(targetCourse.id);
  });
}