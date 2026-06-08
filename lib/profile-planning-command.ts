import { findCourseConflicts } from "@/lib/course-conflict-utils";
import { getAvailableTerms, isMultiTermCourse } from "@/lib/course-utils";
import {
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
} from "@/lib/profile-constants";
import { isCourseInProfile } from "@/lib/profile-utils";
import type { Course } from "@/types/course";
import type { StudentProfile } from "@/types/profile";

export interface CourseProfileConflict {
  conflictingCourse: Course;
  conflictingCourseId: string;
}

export type CourseProfilePlanningDecision =
  | { courseId: string; type: "already-in-profile" }
  | {
      conflicts: CourseProfileConflict[];
      course: Course;
      type: "conflict-resolution-required";
    }
  | {
      availableTerms: MasterProgramTerm[];
      course: Course;
      type: "term-selection-required";
    }
  | { course: Course; term: MasterProgramTerm; type: "ready-to-add" }
  | { course: Course; type: "invalid-term" };

export interface CourseProfileActionState {
  availableTerms: MasterProgramTerm[];
  conflicts: CourseProfileConflict[];
  isPinned: boolean;
  wouldHaveConflicts: boolean;
}

const getPrimaryCourseTerm = (course: Course): string | undefined =>
  course.term.at(0);

export function getDefaultCourseProfileTerm(
  course: Course
): MasterProgramTerm | null {
  const primaryTerm = getPrimaryCourseTerm(course);

  if (!primaryTerm) {
    return null;
  }

  const parsedTerm = Number.parseInt(primaryTerm, 10);

  if (
    !(
      Number.isInteger(parsedTerm) &&
      MASTER_PROGRAM_TERMS.includes(parsedTerm as MasterProgramTerm)
    )
  ) {
    return null;
  }

  return parsedTerm as MasterProgramTerm;
}

export function getCourseProfileActionState(
  profile: StudentProfile | null,
  course: Course
): CourseProfileActionState {
  const conflicts = profile ? findCourseConflicts(course, profile) : [];

  return {
    availableTerms: getAvailableTerms(course),
    conflicts,
    isPinned: profile ? isCourseInProfile(profile, course.id) : false,
    wouldHaveConflicts: conflicts.length > 0,
  };
}

export function planCourseProfileAdd(
  profile: StudentProfile | null,
  course: Course
): CourseProfilePlanningDecision {
  if (profile && isCourseInProfile(profile, course.id)) {
    return {
      courseId: course.id,
      type: "already-in-profile",
    };
  }

  const conflicts = profile ? findCourseConflicts(course, profile) : [];

  if (conflicts.length > 0) {
    return {
      conflicts,
      course,
      type: "conflict-resolution-required",
    };
  }

  return planCourseProfileAddAfterConflictResolution(course);
}

export function planCourseProfileAddAfterConflictResolution(
  course: Course
): Extract<
  CourseProfilePlanningDecision,
  { type: "invalid-term" | "ready-to-add" | "term-selection-required" }
> {
  const availableTerms = getAvailableTerms(course);

  if (isMultiTermCourse(course) && availableTerms.length > 1) {
    return {
      availableTerms,
      course,
      type: "term-selection-required",
    };
  }

  const defaultTerm = getDefaultCourseProfileTerm(course);

  if (defaultTerm === null) {
    return {
      course,
      type: "invalid-term",
    };
  }

  return {
    course,
    term: defaultTerm,
    type: "ready-to-add",
  };
}
