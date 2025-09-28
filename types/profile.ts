// types/profile.ts

import {
  MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import type { Course } from "./course";

export type StudentProfileTerms = Record<MasterProgramTerm, Course[]>;

export function createEmptyTerms(): StudentProfileTerms {
  const terms: Partial<StudentProfileTerms> = {};
  for (const term of MASTER_PROGRAM_TERMS) {
    terms[term] = [];
  }
  return terms as StudentProfileTerms;
}

/**
 * Student profile type representing a user's course selection plan
 */
export type StudentProfile = {
  /** Unique profile identifier */
  id: string;

  /** Profile name (e.g., "My Master's Plan") */
  name: string;

  /** Profile creation timestamp */
  createdAt: Date;

  /** Profile last update timestamp */
  updatedAt: Date;

  /** Courses organized by academic term */
  terms: StudentProfileTerms;

  /** Profile metadata and validation info */
  metadata: {
    totalCredits: number;
    advancedCredits: number;
    isValid: boolean;
  };
};

/**
 * Profile state interface for managing current profile state
 */
export type ProfileState = {
  /** Currently active profile or null if none */
  currentProfile: StudentProfile | null;

  /** Whether profile is in editing mode */
  isEditing: boolean;

  /** Whether there are unsaved changes */
  unsavedChanges: boolean;
};

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
 * Profile validation result type
 */
export type ProfileValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  totalCredits: number;
  advancedCredits: number;
};

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
    profileObj.createdAt instanceof Date &&
    profileObj.updatedAt instanceof Date &&
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
    createdAt: new Date(),
    updatedAt: new Date(),
    terms: emptyTerms,
    metadata: {
      totalCredits: 0,
      advancedCredits: 0,
      isValid: true,
    },
  };
}

type TermValidationContext = {
  courseIds: Set<string>;
  errors: string[];
};

type TermValidationResult = {
  advancedCredits: number;
  totalCredits: number;
};

function validateTermCourses(
  term: MasterProgramTerm,
  courses: StudentProfileTerms[MasterProgramTerm] | undefined,
  context: TermValidationContext
): TermValidationResult {
  if (!Array.isArray(courses)) {
    context.errors.push(`Term ${term} courses must be an array`);
    return { advancedCredits: 0, totalCredits: 0 };
  }

  let termAdvancedCredits = 0;
  let termTotalCredits = 0;

  for (const course of courses) {
    if (context.courseIds.has(course.id)) {
      context.errors.push(
        `Duplicate course found: ${course.id} (${course.name})`
      );
    } else {
      context.courseIds.add(course.id);
    }

    const courseTerms = Array.isArray(course.term)
      ? course.term
      : [course.term];
    if (!courseTerms.includes(term.toString())) {
      context.errors.push(
        `Course ${course.id} term (${courseTerms.join(", ")}) doesn't include profile term (${term})`
      );
    }

    termTotalCredits += course.credits;
    if (course.level === "avancerad nivå") {
      termAdvancedCredits += course.credits;
    }
  }

  return {
    advancedCredits: termAdvancedCredits,
    totalCredits: termTotalCredits,
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

  const courseIds = new Set<string>();
  let totalCredits = 0;
  let advancedCredits = 0;

  for (const term of MASTER_PROGRAM_TERMS) {
    const { advancedCredits: termAdvanced, totalCredits: termTotal } =
      validateTermCourses(term, profile.terms[term], {
        courseIds,
        errors,
      });
    totalCredits += termTotal;
    advancedCredits += termAdvanced;
  }

  if (advancedCredits < MASTER_PROGRAM_MIN_ADVANCED_CREDITS) {
    warnings.push(
      `Advanced credits (${advancedCredits}hp) is below the recommended ${MASTER_PROGRAM_MIN_ADVANCED_CREDITS}hp minimum`
    );
  }

  if (totalCredits !== MASTER_PROGRAM_TARGET_CREDITS) {
    warnings.push(
      `Total credits (${totalCredits}hp) doesn't match the ${MASTER_PROGRAM_TARGET_CREDITS}hp target`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalCredits,
    advancedCredits,
  };
}
