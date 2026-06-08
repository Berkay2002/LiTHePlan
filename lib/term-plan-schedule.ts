import type { Course } from "@/types/course";

export const STUDY_PERIODS = [1, 2] as const;
export const STUDY_BLOCKS = [1, 2, 3, 4] as const;

export type StudyPeriod = (typeof STUDY_PERIODS)[number];
export type StudyBlock = (typeof STUDY_BLOCKS)[number];

type RuntimeScheduleValue = readonly string[] | string | number | null;

export type SchedulableCourse = Omit<Course, "block" | "period"> & {
  block: RuntimeScheduleValue;
  period: RuntimeScheduleValue;
};

export interface ScheduleConflictInfo {
  conflictDetails: {
    blockConflicts: StudyBlock[];
    conflictingCourses: string[];
  };
  conflictType: "block" | "time";
  courseId: string;
}

export interface BlockOccupancy<TCourse extends SchedulableCourse = Course> {
  block: StudyBlock;
  conflict: boolean;
  courseCount: number;
  courses: Array<{ course: TCourse; isHalfPace: boolean }>;
}

export interface TermPlanPeriodSchedule<
  TCourse extends SchedulableCourse = Course,
> {
  blockOccupancy: BlockOccupancy<TCourse>[];
  conflictBlocks: StudyBlock[];
  conflicts: Map<string, ScheduleConflictInfo>;
  courses: TCourse[];
  credits: number;
  period: StudyPeriod;
}

export interface TermPlanSchedule<TCourse extends SchedulableCourse = Course> {
  periods: Record<StudyPeriod, TermPlanPeriodSchedule<TCourse>>;
  totalCredits: number;
}

const isStudyBlock = (value: number): value is StudyBlock =>
  STUDY_BLOCKS.includes(value as StudyBlock);

const normalizeScheduleValues = (value: RuntimeScheduleValue): string[] => {
  if (value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [String(value)];
};

const parseStudyBlock = (
  value: string | number | undefined
): StudyBlock | null => {
  if (value === undefined) {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return isStudyBlock(parsed) ? parsed : null;
};

export const courseAppearsInPeriod = (
  course: SchedulableCourse,
  period: StudyPeriod
): boolean =>
  normalizeScheduleValues(course.period).includes(String(period)) ||
  course.pace === "50%";

export const getCourseBlocksForPeriod = (
  course: SchedulableCourse,
  period: StudyPeriod
): StudyBlock[] => {
  const blockValues = normalizeScheduleValues(course.block);

  if (course.pace === "50%" && blockValues.length > 1) {
    const periodBlock = parseStudyBlock(blockValues[period - 1]);
    return periodBlock === null ? [] : [periodBlock];
  }

  return blockValues
    .map((block) => parseStudyBlock(block))
    .filter((block): block is StudyBlock => block !== null);
};

export const getCoursesForPeriod = <TCourse extends SchedulableCourse>(
  courses: readonly TCourse[],
  period: StudyPeriod
): TCourse[] =>
  courses.filter((course) => courseAppearsInPeriod(course, period));

export const getPeriodCredits = (
  courses: readonly SchedulableCourse[]
): number =>
  courses.reduce(
    (sum, course) =>
      sum + (course.pace === "50%" ? course.credits / 2 : course.credits),
    0
  );

export const getBlockOccupancy = <TCourse extends SchedulableCourse>(
  courses: readonly TCourse[],
  period: StudyPeriod
): BlockOccupancy<TCourse>[] => {
  const occupancy = new Map<
    StudyBlock,
    Array<{ course: TCourse; isHalfPace: boolean }>
  >(STUDY_BLOCKS.map((block) => [block, []]));

  for (const course of courses) {
    for (const block of getCourseBlocksForPeriod(course, period)) {
      occupancy.get(block)?.push({
        course,
        isHalfPace: course.pace === "50%",
      });
    }
  }

  return STUDY_BLOCKS.map((block) => {
    const blockCourses = occupancy.get(block) ?? [];
    return {
      block,
      conflict: blockCourses.length > 1,
      courseCount: blockCourses.length,
      courses: blockCourses,
    };
  });
};

export const getPeriodScheduleConflicts = <TCourse extends SchedulableCourse>(
  courses: readonly TCourse[],
  period: StudyPeriod
): Map<string, ScheduleConflictInfo> => {
  const conflicts = new Map<string, ScheduleConflictInfo>();
  const periodCourses = getCoursesForPeriod(courses, period);

  for (const course of periodCourses) {
    const courseBlocks = getCourseBlocksForPeriod(course, period);
    const blockConflicts = new Set<StudyBlock>();
    const conflictingCourses = new Set<string>();

    for (const otherCourse of periodCourses) {
      if (otherCourse.id === course.id) {
        continue;
      }

      const otherBlocks = getCourseBlocksForPeriod(otherCourse, period);
      for (const block of courseBlocks) {
        if (otherBlocks.includes(block)) {
          blockConflicts.add(block);
          conflictingCourses.add(otherCourse.id);
        }
      }
    }

    if (blockConflicts.size > 0) {
      conflicts.set(course.id, {
        conflictDetails: {
          blockConflicts: Array.from(blockConflicts),
          conflictingCourses: Array.from(conflictingCourses),
        },
        conflictType: "block",
        courseId: course.id,
      });
    }
  }

  return conflicts;
};

export const createTermPlanSchedule = <TCourse extends SchedulableCourse>(
  courses: readonly TCourse[]
): TermPlanSchedule<TCourse> => {
  const periods = Object.fromEntries(
    STUDY_PERIODS.map((period) => {
      const periodCourses = getCoursesForPeriod(courses, period);
      const blockOccupancy = getBlockOccupancy(periodCourses, period);

      return [
        period,
        {
          blockOccupancy,
          conflictBlocks: blockOccupancy
            .filter((block) => block.conflict)
            .map((block) => block.block),
          conflicts: getPeriodScheduleConflicts(periodCourses, period),
          courses: periodCourses,
          credits: getPeriodCredits(periodCourses),
          period,
        },
      ];
    })
  ) as Record<StudyPeriod, TermPlanPeriodSchedule<TCourse>>;

  return {
    periods,
    totalCredits: courses.reduce((sum, course) => sum + course.credits, 0),
  };
};
