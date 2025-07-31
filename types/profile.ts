// types/profile.ts

import { Course } from './course';

/**
 * Student profile interface representing a user's course selection plan
 */
export interface StudentProfile {
  /** Unique profile identifier */
  id: string;
  
  /** Profile name (e.g., "My Master's Plan") */
  name: string;
  
  /** Profile creation timestamp */
  created_at: Date;
  
  /** Profile last update timestamp */
  updated_at: Date;
  
  /** Courses organized by academic term */
  terms: {
    7: Course[];
    8: Course[];
    9: Course[];
  };
  
  /** Profile metadata and validation info */
  metadata: {
    total_credits: number;
    advanced_credits: number;
    is_valid: boolean;
  };
}

/**
 * Profile state interface for managing current profile state
 */
export interface ProfileState {
  /** Currently active profile or null if none */
  current_profile: StudentProfile | null;
  
  /** Whether profile is in editing mode */
  is_editing: boolean;
  
  /** Whether there are unsaved changes */
  unsaved_changes: boolean;
}

/**
 * Pinboard operation types for type safety
 */
export type PinboardOperation = 
  | { type: 'ADD_COURSE'; course: Course; term: 7 | 8 | 9 }
  | { type: 'REMOVE_COURSE'; courseId: string; term: 7 | 8 | 9 }
  | { type: 'CLEAR_TERM'; term: 7 | 8 | 9 }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'LOAD_PROFILE'; profile: StudentProfile }
  | { type: 'SAVE_PROFILE' };

/**
 * Profile validation result interface
 */
export interface ProfileValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  total_credits: number;
  advanced_credits: number;
}

/**
 * Type guard to validate if an object conforms to the StudentProfile interface
 */
export function isValidStudentProfile(profile: unknown): profile is StudentProfile {
  if (!profile || typeof profile !== 'object') {
    return false;
  }
  
  const profileObj = profile as Record<string, unknown>;
  
  return (
    typeof profileObj.id === 'string' &&
    typeof profileObj.name === 'string' &&
    profileObj.created_at instanceof Date &&
    profileObj.updated_at instanceof Date &&
    typeof profileObj.terms === 'object' &&
    profileObj.terms !== null &&
    typeof profileObj.metadata === 'object' &&
    profileObj.metadata !== null
  );
}

/**
 * Create a new empty student profile
 */
export function createEmptyProfile(name: string = "My Master's Plan"): StudentProfile {
  return {
    id: crypto.randomUUID(),
    name,
    created_at: new Date(),
    updated_at: new Date(),
    terms: {
      7: [],
      8: [],
      9: []
    },
    metadata: {
      total_credits: 0,
      advanced_credits: 0,
      is_valid: true
    }
  };
}

/**
 * Validate a student profile and return validation results
 */
export function validateProfile(profile: StudentProfile): ProfileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  let totalCredits = 0;
  let advancedCredits = 0;
  const courseIds = new Set<string>();
  
  // Validate each term
  [7, 8, 9].forEach(term => {
    const termCourses = profile.terms[term as keyof typeof profile.terms];
    
    if (!Array.isArray(termCourses)) {
      errors.push(`Term ${term} courses must be an array`);
      return;
    }
    
    termCourses.forEach(course => {
      // Check for duplicate courses
      if (courseIds.has(course.id)) {
        errors.push(`Duplicate course found: ${course.id} (${course.name})`);
      } else {
        courseIds.add(course.id);
      }
      
      // Validate course term matches profile term
      // For multi-term courses, check if the profile term is one of the available terms
      const courseTerms = Array.isArray(course.term) ? course.term : [course.term];
      if (!courseTerms.includes(term as 7 | 8 | 9)) {
        errors.push(`Course ${course.id} term (${courseTerms.join(', ')}) doesn't include profile term (${term})`);
      }
      
      // Calculate credits
      totalCredits += course.credits;
      if (course.level === 'avancerad nivå') {
        advancedCredits += course.credits;
      }
    });
  });
  
  // Check advanced credits requirement (30hp minimum)
  if (advancedCredits < 30) {
    warnings.push(`Advanced credits (${advancedCredits}hp) is below the recommended 30hp minimum`);
  }
  
  // Check total credits (90hp target)
  if (totalCredits !== 90) {
    warnings.push(`Total credits (${totalCredits}hp) doesn't match the 90hp target`);
  }
  
  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    total_credits: totalCredits,
    advanced_credits: advancedCredits
  };
} 