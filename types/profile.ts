// types/profile.ts

import type { Course } from "./course";

import {
  MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";

export type StudentProfileTerms = Record<MasterProgramTerm, Course[]>;

export function createEmptyTerms(): StudentProfileTerms {
  const terms: Partial<StudentProfileTerms> = {};
  for (const term of MASTER_PROGRAM_TERMS) {
    terms[term] = [];
  }
  return terms as StudentProfileTerms;
}

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
  terms: StudentProfileTerms;

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
  | { type: "ADD_COURSE"; course: Course; term: MasterProgramTerm }
  | { type: "REMOVE_COURSE"; courseId: string; term: MasterProgramTerm }
  | { type: "CLEAR_TERM"; term: MasterProgramTerm }
  | { type: "CLEAR_PROFILE" }
  | { type: "LOAD_PROFILE"; profile: StudentProfile }
  | { type: "SAVE_PROFILE" };

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
export function isValidStudentProfile(
  profile: unknown
): profile is StudentProfile {
  if (!profile || typeof profile !== "object") {
    return false;
  }

  const profileObj = profile as Record<string, unknown>;

  return (
    typeof profileObj.id === "string" &&
    typeof profileObj.name === "string" &&
    profileObj.created_at instanceof Date &&
    profileObj.updated_at instanceof Date &&
    typeof profileObj.terms === "object" &&
    profileObj.terms !== null &&
    typeof profileObj.metadata === "object" &&
    profileObj.metadata !== null
  );
}

/**
 * Create a new empty student profile
 */
export function createEmptyProfile(name = "My Master's Plan"): StudentProfile {
  const emptyTerms = createEmptyTerms();

  return {
    id: crypto.randomUUID(),
    name,
    created_at: new Date(),
    updated_at: new Date(),
    terms: emptyTerms,
    metadata: {
      total_credits: 0,
      advanced_credits: 0,
      is_valid: true,
    },
  };
}

/**
 * Validate a student profile and return validation results
 */
export function validateProfile(
  profile: StudentProfile
): ProfileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let totalCredits = 0;
  let advancedCredits = 0;
  const courseIds = new Set<string>();

  // Validate each term
  MASTER_PROGRAM_TERMS.forEach((term) => {
    const termCourses = profile.terms[term];

    if (!Array.isArray(termCourses)) {
      errors.push(`Term ${term} courses must be an array`);
      return;
    }

    termCourses.forEach((course) => {
      // Check for duplicate courses
      if (courseIds.has(course.id)) {
        errors.push(`Duplicate course found: ${course.id} (${course.name})`);
      } else {
        courseIds.add(course.id);
      }

      // Validate course term matches profile term
      // For multi-term courses, check if the profile term is one of the available terms
      const courseTerms = Array.isArray(course.term)
        ? course.term
        : [course.term];
      if (!courseTerms.includes(term.toString())) {
        errors.push(
          `Course ${course.id} term (${courseTerms.join(", ")}) doesn't include profile term (${term})`
        );
      }

      // Calculate credits
      totalCredits += course.credits;
      if (course.level === "avancerad nivå") {
        advancedCredits += course.credits;
      }
    });
  });

  // Check advanced credits requirement (60hp minimum)
  if (advancedCredits < MASTER_PROGRAM_MIN_ADVANCED_CREDITS) {
    warnings.push(
      `Advanced credits (${advancedCredits}hp) is below the recommended ${MASTER_PROGRAM_MIN_ADVANCED_CREDITS}hp minimum`
    );
  }

  // Check total credits (90hp target)
  if (totalCredits !== MASTER_PROGRAM_TARGET_CREDITS) {
    warnings.push(
      `Total credits (${totalCredits}hp) doesn't match the ${MASTER_PROGRAM_TARGET_CREDITS}hp target`
    );
  }

  return {
    is_valid: errors.length === 0,
    errors,
    warnings,
    total_credits: totalCredits,
    advanced_credits: advancedCredits,
  };
}
