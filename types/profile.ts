// types/profile.ts

import {
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
 * Student profile interface representing a user's course selection plan
 */
export interface StudentProfile {
  /** Profile creation timestamp */
  created_at: Date;
  /** Unique profile identifier */
  id: string;

  /** Profile metadata and validation info */
  metadata: {
    total_credits: number;
    advanced_credits: number;
    is_valid: boolean;
  };

  /** Profile name (e.g., "My Master's Plan") */
  name: string;

  /** Courses organized by academic term */
  terms: StudentProfileTerms;

  /** Profile last update timestamp */
  updated_at: Date;
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
  advanced_credits: number;
  errors: string[];
  is_valid: boolean;
  total_credits: number;
  warnings: string[];
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
