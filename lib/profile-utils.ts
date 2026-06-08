// lib/profile-utils.ts

import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import {
  evaluateProfile,
  withEvaluatedProfileMetadata,
} from "@/lib/profile-evaluation";
import { createEmptyTerms, type StudentProfile } from "@/types/profile";

type ProfileCourse = StudentProfile["terms"][MasterProgramTerm][number];

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
    : Number.parseInt(course.term, 10) === term;

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
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [term]: [...profile.terms[term], courseForProfile],
    },
  };

  return withEvaluatedProfileMetadata(updatedProfile);
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
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [term]: profile.terms[term].filter((course) => course.id !== courseId),
    },
  };

  return withEvaluatedProfileMetadata(updatedProfile);
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
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [fromTerm]: profile.terms[fromTerm].filter((c) => c.id !== courseId),
      [toTerm]: [...profile.terms[toTerm], updatedCourse],
    },
  };

  return withEvaluatedProfileMetadata(updatedProfile);
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
    updated_at: new Date(),
    terms: {
      ...profile.terms,
      [term]: [],
    },
  };

  return withEvaluatedProfileMetadata(updatedProfile);
}

/**
 * Clear all courses from the profile
 */
export function clearProfile(profile: StudentProfile): StudentProfile {
  const emptyTerms = createEmptyTerms();

  const updatedProfile: StudentProfile = {
    ...profile,
    updated_at: new Date(),
    terms: {
      ...emptyTerms,
    },
  };

  return withEvaluatedProfileMetadata(updatedProfile);
}

/**
 * Get profile summary statistics
 */
export function getProfileSummary(profile: StudentProfile) {
  const evaluation = evaluateProfile(profile);

  return {
    advancedCredits: evaluation.advancedCredits,
    errors: evaluation.errors,
    isComplete: evaluation.isComplete,
    meetsAdvancedRequirement: evaluation.meetsAdvancedRequirement,
    totalCourses: evaluation.totalCourses,
    totalCredits: evaluation.totalCredits,
    warnings: evaluation.warnings,
  };
}
