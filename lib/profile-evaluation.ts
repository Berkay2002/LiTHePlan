import {
  MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
  MASTER_PROGRAM_TARGET_CREDITS,
  MASTER_PROGRAM_TERMS,
  type MasterProgramTerm,
  PROGRAM_FOCUS_TARGET_CREDITS,
} from "@/lib/profile-constants";
import type { Course } from "@/types/course";
import type { StudentProfile } from "@/types/profile";

export interface ProfileTermEvaluation {
  advancedCredits: number;
  courseCount: number;
  term: MasterProgramTerm;
  totalCredits: number;
}

export interface ProfileProgramCredit {
  credits: number;
  percentage: number;
  program: string;
}

export interface ProfileEvaluation {
  advancedCredits: number;
  advancedPercentage: number;
  basicCredits: number;
  completionPercentage: number;
  errors: string[];
  isComplete: boolean;
  isValid: boolean;
  meetsAdvancedRequirement: boolean;
  metadata: StudentProfile["metadata"];
  remainingCredits: number;
  termEvaluations: ProfileTermEvaluation[];
  topPrograms: ProfileProgramCredit[];
  totalCourses: number;
  totalCredits: number;
  warnings: string[];
}

const getCourseTerms = (course: Course): string[] => {
  if (Array.isArray(course.term)) {
    return course.term.map(String);
  }

  return [String(course.term)];
};

const getPercentage = (credits: number, targetCredits: number): number => {
  if (targetCredits <= 0) {
    return 0;
  }

  return Math.min((credits / targetCredits) * 100, 100);
};

const getProfileTermCourses = (
  profile: StudentProfile,
  term: MasterProgramTerm
): Course[] | null => {
  const terms = profile.terms as Partial<Record<MasterProgramTerm, unknown>>;
  const termCourses = terms[term];

  return Array.isArray(termCourses) ? termCourses : null;
};

export function evaluateProfile(profile: StudentProfile): ProfileEvaluation {
  const errors: string[] = [];
  const warnings: string[] = [];
  const courseIds = new Set<string>();
  const programCredits = new Map<string, number>();
  const termEvaluations: ProfileTermEvaluation[] = [];

  let totalCredits = 0;
  let advancedCredits = 0;
  let totalCourses = 0;

  for (const term of MASTER_PROGRAM_TERMS) {
    const termCourses = getProfileTermCourses(profile, term);

    if (!termCourses) {
      errors.push(`Term ${term} courses must be an array`);
      termEvaluations.push({
        advancedCredits: 0,
        courseCount: 0,
        term,
        totalCredits: 0,
      });
      continue;
    }

    let termTotalCredits = 0;
    let termAdvancedCredits = 0;

    for (const course of termCourses) {
      if (courseIds.has(course.id)) {
        errors.push(`Duplicate course found: ${course.id} (${course.name})`);
      } else {
        courseIds.add(course.id);
      }

      const courseTerms = getCourseTerms(course);
      if (!courseTerms.includes(term.toString())) {
        errors.push(
          `Course ${course.id} term (${courseTerms.join(", ")}) doesn't include profile term (${term})`
        );
      }

      totalCredits += course.credits;
      termTotalCredits += course.credits;
      totalCourses += 1;

      if (course.level === "avancerad nivå") {
        advancedCredits += course.credits;
        termAdvancedCredits += course.credits;

        const programs = [...course.programs, ...(course.orientations ?? [])];
        for (const program of programs) {
          programCredits.set(
            program,
            (programCredits.get(program) ?? 0) + course.credits
          );
        }
      }
    }

    termEvaluations.push({
      advancedCredits: termAdvancedCredits,
      courseCount: termCourses.length,
      term,
      totalCredits: termTotalCredits,
    });
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

  const topPrograms = [...programCredits.entries()]
    .sort(([, firstCredits], [, secondCredits]) => secondCredits - firstCredits)
    .map(([program, credits]) => ({
      credits,
      percentage: getPercentage(credits, PROGRAM_FOCUS_TARGET_CREDITS),
      program,
    }));
  const isValid = errors.length === 0;

  return {
    advancedCredits,
    advancedPercentage: getPercentage(
      advancedCredits,
      MASTER_PROGRAM_MIN_ADVANCED_CREDITS
    ),
    basicCredits: totalCredits - advancedCredits,
    completionPercentage: getPercentage(
      totalCredits,
      MASTER_PROGRAM_TARGET_CREDITS
    ),
    errors,
    isComplete: totalCredits === MASTER_PROGRAM_TARGET_CREDITS,
    isValid,
    meetsAdvancedRequirement:
      advancedCredits >= MASTER_PROGRAM_MIN_ADVANCED_CREDITS,
    metadata: {
      advanced_credits: advancedCredits,
      is_valid: isValid,
      total_credits: totalCredits,
    },
    remainingCredits: Math.max(0, MASTER_PROGRAM_TARGET_CREDITS - totalCredits),
    termEvaluations,
    topPrograms,
    totalCourses,
    totalCredits,
    warnings,
  };
}

export function createProfileMetadata(
  profile: StudentProfile
): StudentProfile["metadata"] {
  const evaluation = evaluateProfile(profile);

  return {
    advanced_credits: evaluation.advancedCredits,
    is_valid: evaluation.isValid,
    total_credits: evaluation.totalCredits,
  };
}

export function withEvaluatedProfileMetadata(
  profile: StudentProfile
): StudentProfile {
  return {
    ...profile,
    metadata: createProfileMetadata(profile),
  };
}
