import type { Course } from "@/types/course";

export interface ConflictInfo {
  courseId: string;
  conflictType: "block" | "time";
  conflictDetails: {
    blockConflicts: number[];
    conflictingCourses: string[];
  };
}

export function detectCourseConflicts(
  courses: Course[],
  targetCourse: Course,
  currentPeriod: 1 | 2
): ConflictInfo | null {
  const conflicts: ConflictInfo = {
    courseId: targetCourse.id,
    conflictType: "block",
    conflictDetails: {
      blockConflicts: [],
      conflictingCourses: [],
    },
  };

  // Get target course blocks for the current period
  let targetBlocks: number[];
  const is50Percent = targetCourse.pace === "50%";

  if (is50Percent && Array.isArray(targetCourse.block)) {
    targetBlocks = [Number.parseInt(targetCourse.block[currentPeriod - 1])];
  } else {
    targetBlocks = Array.isArray(targetCourse.block)
      ? targetCourse.block.map((b) => Number.parseInt(b))
      : [Number.parseInt(targetCourse.block)];
  }

  // Check for conflicts with other courses in the same period
  const periodCourses = courses.filter((course) => {
    if (course.id === targetCourse.id) return false; // Don't compare with self

    // Check if course appears in this period
    const courseInPeriod =
      (Array.isArray(course.period)
        ? course.period.includes(currentPeriod.toString())
        : course.period === currentPeriod.toString()) || course.pace === "50%";
    return courseInPeriod;
  });

  for (const otherCourse of periodCourses) {
    let otherBlocks: number[];
    const otherIs50Percent = otherCourse.pace === "50%";

    if (otherIs50Percent && Array.isArray(otherCourse.block)) {
      otherBlocks = [Number.parseInt(otherCourse.block[currentPeriod - 1])];
    } else {
      otherBlocks = Array.isArray(otherCourse.block)
        ? otherCourse.block.map((b) => Number.parseInt(b))
        : [Number.parseInt(otherCourse.block)];
    }

    // Check for block overlaps
    const overlappingBlocks = targetBlocks.filter((block) =>
      otherBlocks.includes(block)
    );

    if (overlappingBlocks.length > 0) {
      conflicts.conflictDetails.blockConflicts.push(...overlappingBlocks);
      conflicts.conflictDetails.conflictingCourses.push(otherCourse.id);
    }
  }

  // Remove duplicates
  conflicts.conflictDetails.blockConflicts = [
    ...new Set(conflicts.conflictDetails.blockConflicts),
  ];
  conflicts.conflictDetails.conflictingCourses = [
    ...new Set(conflicts.conflictDetails.conflictingCourses),
  ];

  return conflicts.conflictDetails.blockConflicts.length > 0 ? conflicts : null;
}

export function getConflictBorderClass(hasConflict: boolean): string {
  return hasConflict ? "border-destructive border-2 shadow-destructive/20 shadow-md" : "";
}

export function getAllPeriodConflicts(
  courses: Course[],
  period: 1 | 2
): Map<string, ConflictInfo> {
  const conflictMap = new Map<string, ConflictInfo>();

  // Filter courses for this period
  const periodCourses = courses.filter(
    (course) =>
      (Array.isArray(course.period)
        ? course.period.includes(period.toString())
        : course.period === period.toString()) || course.pace === "50%"
  );

  // Check each course for conflicts
  for (const course of periodCourses) {
    const conflict = detectCourseConflicts(periodCourses, course, period);
    if (conflict) {
      conflictMap.set(course.id, conflict);
    }
  }

  return conflictMap;
}
