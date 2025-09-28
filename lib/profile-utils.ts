// lib/profile-utils.ts

import {
  createEmptyProfile,
  createEmptyTerms,
  type StudentProfile,
  type StudentProfileTerms,
  validateProfile,
} from "@/types/profile";

import {
  MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import { logger } from "@/lib/logger";

type ProfileCourse = StudentProfile["terms"][MasterProgramTerm][number];

// Re-export createEmptyProfile for convenience
export { createEmptyProfile };

const PROFILE_STORAGE_KEY = "student_profile";

export function normalizeProfileData(raw: unknown): StudentProfile | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const record = raw as Record<string, unknown>;
  if (typeof record.id !== "string" || typeof record.name !== "string") {
    return null;
  }

  const terms = record.terms as StudentProfileTerms | undefined;
  if (!terms) {
    return null;
  }

  const metadataRecord = (record.metadata as Record<string, unknown>) ?? {};
  const createdAtValue = record.createdAt ?? record.created_at;
  const updatedAtValue = record.updatedAt ?? record.updated_at;

  const normalized: StudentProfile = {
    id: record.id,
    name: record.name,
    terms,
    createdAt: new Date(
      typeof createdAtValue === "string" ? createdAtValue : Date.now()
    ),
    updatedAt: new Date(
      typeof updatedAtValue === "string" ? updatedAtValue : Date.now()
    ),
    metadata: {
      totalCredits:
        typeof metadataRecord.totalCredits === "number"
          ? metadataRecord.totalCredits
          : typeof metadataRecord.total_credits === "number"
            ? metadataRecord.total_credits
            : 0,
      advancedCredits:
        typeof metadataRecord.advancedCredits === "number"
          ? metadataRecord.advancedCredits
          : typeof metadataRecord.advanced_credits === "number"
            ? metadataRecord.advanced_credits
            : 0,
      isValid:
        typeof metadataRecord.isValid === "boolean"
          ? metadataRecord.isValid
          : typeof metadataRecord.is_valid === "boolean"
            ? metadataRecord.is_valid
            : true,
    },
  };

  return normalized;
}

/**
 * Save profile to localStorage
 */
export function saveProfileToStorage(profile: StudentProfile): void {
  try {
    const profileData = {
      ...profile,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
  } catch (error) {
    logger.error("Failed to save profile to localStorage:", error);
  }
}

/**
 * Load profile from localStorage
 */
export function loadProfileFromStorage(): StudentProfile | null {
  try {
    const profileData = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!profileData) {
      return null;
    }

    const parsed = JSON.parse(profileData);
    return normalizeProfileData(parsed);
  } catch (error) {
    logger.error("Failed to load profile from localStorage:", error);
    return null;
  }
}

/**
 * Clear profile from localStorage
 */
export function clearProfileFromStorage(): void {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    logger.error("Failed to clear profile from localStorage:", error);
  }
}

/**
 * Check if a course is already in the profile
 */
export function isCourseInProfile(
  profile: StudentProfile,
  courseId: string
): boolean {
  return MASTER_PROGRAM_TERMS.some((term) =>
    profile.terms[term].some((course) => course.id === courseId)
  );
}

/**
 * Get the term where a course is located in the profile
 */
export function getCourseTermInProfile(
  profile: StudentProfile,
  courseId: string
): MasterProgramTerm | null {
  for (const term of MASTER_PROGRAM_TERMS) {
    if (profile.terms[term].some((course) => course.id === courseId)) {
      return term;
    }
  }
  return null;
}

/**
 * Add a course to a specific term in the profile
 */
export function addCourseToProfile(
  profile: StudentProfile,
  course: ProfileCourse,
  term: MasterProgramTerm
): StudentProfile {
  // Check if course is already in profile
  if (isCourseInProfile(profile, course.id)) {
    throw new Error(`Course ${course.id} is already in the profile`);
  }

  // Validate course is available in target term
  const isAvailableInTerm = Array.isArray(course.term)
    ? course.term.includes(term.toString())
    : Number.parseInt(course.term) === term;

  if (!isAvailableInTerm) {
    const availableTerms = Array.isArray(course.term)
      ? course.term.join(", ")
      : course.term;
    throw new Error(
      `Course ${course.id} is not available in term ${term}. Available in: ${availableTerms}`
    );
  }

  // Create a copy of the course with the selected term
  const courseForProfile = {
    ...course,
    term, // Set the specific term this course is being added to
  };

  const updatedProfile: StudentProfile = {
    ...profile,
    updatedAt: new Date(),
    terms: {
      ...profile.terms,
      [term]: [...profile.terms[term], courseForProfile],
    },
  };

  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    totalCredits: validation.totalCredits,
    advancedCredits: validation.advancedCredits,
    isValid: validation.isValid,
  };

  return updatedProfile;
}

/**
 * Remove a course from the profile
 */
export function removeCourseFromProfile(
  profile: StudentProfile,
  courseId: string
): StudentProfile {
  const term = getCourseTermInProfile(profile, courseId);
  if (!term) {
    throw new Error(`Course ${courseId} not found in profile`);
  }

  const updatedProfile: StudentProfile = {
    ...profile,
    updatedAt: new Date(),
    terms: {
      ...profile.terms,
      [term]: profile.terms[term].filter((course) => course.id !== courseId),
    },
  };

  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    totalCredits: validation.totalCredits,
    advancedCredits: validation.advancedCredits,
    isValid: validation.isValid,
  };

  return updatedProfile;
}

/**
 * Move a course from one term to another
 */
export function moveCourseInProfile(
  profile: StudentProfile,
  courseId: string,
  fromTerm: MasterProgramTerm,
  toTerm: MasterProgramTerm
): StudentProfile {
  // Find the course in the from term
  const course = profile.terms[fromTerm].find((c) => c.id === courseId);
  if (!course) {
    throw new Error(`Course ${courseId} not found in term ${fromTerm}`);
  }

  // For validation, we need to check if the course has an original_term property
  // or use the course's current term info. Courses can be offered in any of the
  // three master's terms (7, 8, or 9), so restrict the move only to that range.
  if (!MASTER_PROGRAM_TERMS.includes(toTerm)) {
    throw new Error(
      `Can only move courses to terms 7, 8 or 9. Target term ${toTerm} is not allowed.`
    );
  }

  // Create updated course with new term
  const updatedCourse = { ...course, term: toTerm };

  const updatedProfile: StudentProfile = {
    ...profile,
    updatedAt: new Date(),
    terms: {
      ...profile.terms,
      [fromTerm]: profile.terms[fromTerm].filter((c) => c.id !== courseId),
      [toTerm]: [...profile.terms[toTerm], updatedCourse],
    },
  };

  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    totalCredits: validation.totalCredits,
    advancedCredits: validation.advancedCredits,
    isValid: validation.isValid,
  };

  return updatedProfile;
}

/**
 * Clear all courses from a specific term
 */
export function clearTermInProfile(
  profile: StudentProfile,
  term: MasterProgramTerm
): StudentProfile {
  const updatedProfile: StudentProfile = {
    ...profile,
    updatedAt: new Date(),
    terms: {
      ...profile.terms,
      [term]: [],
    },
  };

  // Update metadata
  const validation = validateProfile(updatedProfile);
  updatedProfile.metadata = {
    totalCredits: validation.totalCredits,
    advancedCredits: validation.advancedCredits,
    isValid: validation.isValid,
  };

  return updatedProfile;
}

/**
 * Clear all courses from the profile
 */
export function clearProfile(profile: StudentProfile): StudentProfile {
  const emptyTerms = createEmptyTerms();

  const updatedProfile: StudentProfile = {
    ...profile,
    updatedAt: new Date(),
    terms: {
      ...emptyTerms,
    },
    metadata: {
      totalCredits: 0,
      advancedCredits: 0,
      isValid: true,
    },
  };

  return updatedProfile;
}

/**
 * Get profile summary statistics
 */
export function getProfileSummary(profile: StudentProfile) {
  const validation = validateProfile(profile);

  return {
    totalCourses: MASTER_PROGRAM_TERMS.reduce(
      (sum, term) => sum + profile.terms[term].length,
      0
    ),
    totalCredits: validation.totalCredits,
    advancedCredits: validation.advancedCredits,
    isComplete: validation.totalCredits === MASTER_PROGRAM_TARGET_CREDITS,
    meetsAdvancedRequirement:
      validation.advancedCredits >= MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
    errors: validation.errors,
    warnings: validation.warnings,
  };
}
